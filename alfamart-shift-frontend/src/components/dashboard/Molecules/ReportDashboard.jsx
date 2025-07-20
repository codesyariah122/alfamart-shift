import React, { useEffect, useState } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { useSchedule } from '@/context/ScheduleContext';
import * as XLSX from 'xlsx';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ReportDashboard = () => {
    const { scheduleAPI } = useSchedule();
    const [data, setData] = useState(null);
    const [filter, setFilter] = useState('');
    const [filteredEmployees, setFilteredEmployees] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const result = await scheduleAPI.getShiftSummary();
                setData(result);
                setFilteredEmployees(result.per_employee);
            } catch (err) {
                console.error('❌ Error loading shift summary:', err.message);
            }
        };

        loadData();
    }, [scheduleAPI]);

    useEffect(() => {
        if (!data) return;
        const filtered = data.per_employee.filter(item =>
            item.nik.toString().includes(filter) ||
            item.name.toLowerCase().includes(filter.toLowerCase())
        );
        setFilteredEmployees(filtered);
    }, [filter, data]);

    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(filteredEmployees);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Shift Report');
        XLSX.writeFile(wb, 'shift-report.xlsx');
    };

    if (!data) {
        return (
            <div className="space-y-6">
                {/* Filter & Button Skeleton */}
                <div className="flex items-center justify-between mb-4">
                    <Skeleton height={36} width={256} />
                    <Skeleton height={36} width={120} />
                </div>

                {/* Table Skeleton */}
                <div className="overflow-x-auto border rounded-md">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 border"><Skeleton /></th>
                                <th className="px-4 py-2 border"><Skeleton /></th>
                                <th className="px-4 py-2 border"><Skeleton /></th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...Array(5)].map((_, i) => (
                                <tr key={i} className="border-b">
                                    <td className="px-4 py-2 border"><Skeleton /></td>
                                    <td className="px-4 py-2 border"><Skeleton /></td>
                                    <td className="px-4 py-2 border"><Skeleton /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Chart Skeletons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded shadow">
                        <Skeleton height={24} width={180} className="mb-2" />
                        <Skeleton height={200} />
                    </div>
                    <div className="bg-white p-4 rounded shadow">
                        <Skeleton height={24} width={160} className="mb-2" />
                        <Skeleton height={200} />
                    </div>
                    <div className="bg-white p-4 rounded shadow md:col-span-2">
                        <Skeleton height={24} width={180} className="mb-2" />
                        <Skeleton height={180} />
                    </div>
                </div>
            </div>
        );
    }


    const employeeChart = {
        labels: data.per_employee.map(item => `Emp ${item.nik}`),
        datasets: [{
            label: 'Total Shift per Karyawan',
            data: data.per_employee.map(item => item.total_shifts),
            backgroundColor: '#4f46e5',
        }]
    };

    const dailyChart = {
        labels: data.per_date.map(item => item.schedule_date),
        datasets: [{
            label: 'Shift Harian',
            data: data.per_date.map(item => item.total_shifts),
            backgroundColor: '#10b981',
        }]
    };

    const storeChart = {
        labels: data.per_store.map(item => item.store_name),
        datasets: [{
            label: 'Shift per Toko',
            data: data.per_store.map(item => item.total_shifts),
            backgroundColor: '#f59e0b',
        }]
    };

    return (
        <div className="space-y-10">
            {/* Filter & Export */}
            <div className="flex items-center justify-between mb-4">
                <input
                    type="text"
                    placeholder="Filter karyawan berdasarkan ID..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="border px-3 py-2 rounded-md w-64 text-sm"
                />
                <button
                    onClick={exportToExcel}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm"
                >
                    Export Excel
                </button>
            </div>

            {/* Table Report */}
            <div className="overflow-x-auto border rounded-md">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 border">NIK</th>
                            <th className="px-4 py-2 border">Nama</th>
                            <th className="px-4 py-2 border">Total Shift</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.map((item, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-2 border">{item.nik}</td>
                                <td className="px-4 py-2 border">{item.name || '-'}</td>
                                <td className="px-4 py-2 border">{item.total_shifts}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded shadow">
                    <h3 className="text-base font-semibold mb-2">Total Shift per Karyawan</h3>
                    <Bar data={employeeChart} height={200} />
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h3 className="text-base font-semibold mb-2">Shift Harian</h3>
                    <Line data={dailyChart} height={200} />
                </div>
                <div className="bg-white p-4 rounded shadow md:col-span-2">
                    <h3 className="text-base font-semibold mb-2">Shift per Toko</h3>
                    <Pie data={storeChart} height={180} />
                </div>
            </div>
        </div>
    );
};

export default ReportDashboard;
