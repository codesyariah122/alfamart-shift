import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { useSchedule } from '../context/ScheduleContext';
import {
    CalendarDaysIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    MagnifyingGlassIcon,
    ArrowDownTrayIcon,
    UserIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const ViewSchedule = ({ onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const {
        currentMonth,
        scheduleAPI,
        changeMonth,
        refreshCurrentMonth,
        getCurrentMonthKey
    } = useSchedule();

    const { year, month } = getCurrentMonthKey();

    // Fetch schedules for current month
    const {
        data: schedules,
        isLoading,
        error,
        refetch
    } = useQuery(
        ['schedules', year, month],
        () => scheduleAPI.getSchedulesByMonth(year, month),
        {
            refetchOnWindowFocus: false,
            staleTime: 2 * 60 * 1000, // 2 minutes
            cacheTime: 5 * 60 * 1000, // 5 minutes
        }
    );

    // Fetch employees
    const { data: employees } = useQuery(
        'employees',
        scheduleAPI.getEmployees,
        {
            staleTime: 10 * 60 * 1000, // 10 minutes
        }
    );

    // Shift code configuration
    const shiftConfig = {
        'P': { name: 'Pagi', color: 'bg-yellow-100 text-yellow-800', time: '07:00-15:00' },
        'S': { name: 'Siang', color: 'bg-blue-100 text-blue-800', time: '15:00-23:00' },
        'M': { name: 'Malam', color: 'bg-purple-100 text-purple-800', time: '23:00-07:00' },
        'O': { name: 'Off', color: 'bg-gray-100 text-gray-800', time: 'Libur' }
    };

    // Filter employees based on search
    const filteredEmployees = (employees || [])
        .filter(emp => !searchTerm || emp.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name));

    // Get days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Get schedule for specific employee and date
    const getScheduleForDay = (employeeId, day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const schedule = schedules?.find(s => s.employee_id === employeeId && s.date === dateStr);
        return schedule?.shift_code || '';
    };

    // Navigation functions
    const goToPreviousMonth = () => {
        const newMonth = new Date(year, month - 1, 1);
        changeMonth(newMonth);
    };

    const goToNextMonth = () => {
        const newMonth = new Date(year, month + 1, 1);
        changeMonth(newMonth);
    };

    const goToToday = () => {
        const today = new Date();
        changeMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    };

    // Export function
    const exportSchedule = () => {
        if (!schedules || schedules.length === 0) {
            alert('Tidak ada data untuk di-export');
            return;
        }

        const csvData = [];

        // Header row
        const headers = ['Nama Karyawan', ...monthDays.map(day => `Tgl ${day}`)];
        csvData.push(headers.join(','));

        // Data rows
        filteredEmployees.forEach(employee => {
            const row = [employee.name];
            monthDays.forEach(day => {
                const shiftCode = getScheduleForDay(employee.id, day);
                row.push(shiftCode || '-');
            });
            csvData.push(row.join(','));
        });

        const csvString = csvData.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `jadwal_${currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Check if schedule exists for current month
    const hasScheduleData = schedules && schedules.length > 0;
    const scheduleInfo = schedules?.[0]?.generated_at ? {
        generatedAt: new Date(schedules[0].generated_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        generatedBy: schedules[0].generated_by || 'System'
    } : null;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-lg text-gray-600">Memuat jadwal...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-8">
                <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Gagal memuat jadwal
                </h3>
                <p className="text-gray-600 mb-4">
                    {error.message || 'Terjadi kesalahan saat memuat jadwal'}
                </p>
                <button
                    onClick={() => refetch()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                >
                    Coba Lagi
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
                {/* Month Navigation */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={goToPreviousMonth}
                        className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                        <ChevronLeftIcon className="h-5 w-5" />
                    </button>

                    <h2 className="text-2xl font-bold text-gray-900 min-w-[200px] text-center">
                        {currentMonth.toLocaleDateString('id-ID', {
                            month: 'long',
                            year: 'numeric'
                        })}
                    </h2>

                    <button
                        onClick={goToNextMonth}
                        className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                        <ChevronRightIcon className="h-5 w-5" />
                    </button>

                    <button
                        onClick={goToToday}
                        className="px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm"
                    >
                        Hari Ini
                    </button>
                </div>

                {/* Search, Refresh and Export */}
                <div className="flex gap-3">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari karyawan..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48"
                        />
                    </div>

                    <button
                        onClick={refreshCurrentMonth}
                        className="p-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                        title="Refresh Data"
                    >
                        <ArrowPathIcon className="h-5 w-5 text-gray-600" />
                    </button>

                    <button
                        onClick={exportSchedule}
                        disabled={!hasScheduleData}
                        className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        Export
                    </button>
                </div>
            </motion.div>

            {/* Schedule Info */}
            {scheduleInfo && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="bg-blue-50 rounded-2xl p-4 border border-blue-200"
                >
                    <div className="flex items-center gap-2 text-blue-800">
                        <CalendarDaysIcon className="h-5 w-5" />
                        <span className="text-sm">
                            Jadwal dibuat pada: <strong>{scheduleInfo.generatedAt}</strong> oleh {scheduleInfo.generatedBy}
                        </span>
                    </div>
                </motion.div>
            )}

            {/* No Schedule Warning */}
            {!hasScheduleData && !isLoading && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200"
                >
                    <div className="flex items-center gap-2 text-yellow-800">
                        <ExclamationTriangleIcon className="h-5 w-5" />
                        <span className="text-sm">
                            Belum ada jadwal untuk bulan ini. Silakan generate jadwal terlebih dahulu.
                        </span>
                    </div>
                </motion.div>
            )}

            {/* Legend */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-50 rounded-2xl p-4"
            >
                <h3 className="text-sm font-medium text-gray-700 mb-3">Keterangan Shift:</h3>
                <div className="flex flex-wrap gap-4">
                    {Object.entries(shiftConfig).map(([code, config]) => (
                        <div key={code} className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>
                                {code}
                            </span>
                            <span className="text-sm text-gray-600">
                                {config.name} ({config.time})
                            </span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Calendar Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        {/* Header dengan tanggal */}
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 min-w-[120px]">
                                    Nama Karyawan
                                </th>
                                {monthDays.map(day => {
                                    const isToday = new Date().getDate() === day &&
                                        new Date().getMonth() === month &&
                                        new Date().getFullYear() === year;
                                    return (
                                        <th key={day} className={`px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[40px] ${isToday ? 'bg-blue-100' : ''}`}>
                                            {day}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>

                        {/* Body dengan data karyawan */}
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredEmployees.map((employee, employeeIndex) => (
                                <motion.tr
                                    key={employee.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: employeeIndex * 0.05 }}
                                    className="hover:bg-gray-50 transition-colors duration-200"
                                >
                                    {/* Nama karyawan */}
                                    <td className="sticky left-0 bg-white px-4 py-3 border-r border-gray-200">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-8 w-8">
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                                    <span className="text-white font-medium text-xs">
                                                        {employee.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {employee.name}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {employee.employee_id}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Shift untuk setiap hari */}
                                    {monthDays.map(day => {
                                        const shiftCode = getScheduleForDay(employee.id, day);
                                        const config = shiftCode ? shiftConfig[shiftCode] : null;
                                        const isToday = new Date().getDate() === day &&
                                            new Date().getMonth() === month &&
                                            new Date().getFullYear() === year;

                                        return (
                                            <td key={day} className={`px-2 py-3 text-center ${isToday ? 'bg-blue-50' : ''}`}>
                                                {shiftCode && (
                                                    <span
                                                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${config?.color} cursor-pointer`}
                                                        title={`${config?.name} (${config?.time})`}
                                                    >
                                                        {shiftCode}
                                                    </span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {filteredEmployees.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                    >
                        <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Tidak ada karyawan ditemukan
                        </h3>
                        <p className="text-gray-500">
                            {searchTerm ? 'Coba ubah kata kunci pencarian' : 'Belum ada data karyawan'}
                        </p>
                    </motion.div>
                )}
            </motion.div>

            {/* Summary */}
            {filteredEmployees.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4"
                >
                    <div className="flex flex-wrap gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-blue-600" />
                            <span className="text-gray-600">Total Karyawan:</span>
                            <span className="font-medium">{filteredEmployees.length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CalendarDaysIcon className="h-4 w-4 text-purple-600" />
                            <span className="text-gray-600">Hari dalam bulan:</span>
                            <span className="font-medium">{daysInMonth}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-600">Total Jadwal:</span>
                            <span className="font-medium">
                                {schedules?.length || 0}
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default ViewSchedule;
