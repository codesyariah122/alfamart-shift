import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useSchedule } from '@/context/ScheduleContext';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ManualScheduleEditor = ({ month, year, storeId, onChange }) => {
    const [employees, setEmployees] = useState([]);
    const [schedules, setSchedules] = useState({});
    const { scheduleAPI } = useSchedule();
    const [shiftOptions, setShiftOptions] = useState([]);

    const daysInMonth = new Date(year, month, 0).getDate();

    useEffect(() => {
        const fetchShiftOptions = async () => {
            try {
                const res = await scheduleAPI.getShiftTypes();
                const shifts = res.data || [];
                setShiftOptions(shifts);
            } catch (err) {
                toast.error('❌ Gagal ambil shift');
                console.error(err);
            }
        };

        fetchShiftOptions();
    }, []);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await scheduleAPI.getEmployees({ store_id: storeId });
                const list = res.data?.data || [];
                setEmployees(list);

                // Init kosong
                const initial = {};
                list.forEach(emp => {
                    initial[emp.id] = {};
                    for (let d = 1; d <= daysInMonth; d++) {
                        initial[emp.id][d] = '';
                    }
                });
                setSchedules(initial);
            } catch (err) {
                toast.error('❌ Gagal ambil karyawan');
                console.error(err);
            }
        };

        fetchEmployees();
    }, [month, year, storeId]);

    // Update parent tiap kali data berubah
    useEffect(() => {
        const payload = [];

        for (const empId in schedules) {
            for (let day = 1; day <= daysInMonth; day++) {
                const shift = schedules[empId][day];
                if (shift) {
                    payload.push({
                        employee_id: empId,
                        day,
                        shift_code: shift,
                    });
                }
            }
        }

        onChange?.(payload);
    }, [schedules]);

    const handleChange = (empId, day, value) => {
        setSchedules(prev => ({
            ...prev,
            [empId]: {
                ...prev[empId],
                [day]: value
            }
        }));
    };

    return (
        <div className="space-y-4">
            <h2 className="font-semibold text-lg">
                Input Jadwal Manual - {new Date(year, month - 1).toLocaleString('id-ID', { month: 'long' })} {year}
            </h2>

            <div className="overflow-auto border rounded">
                <table className="min-w-full text-sm text-center">
                    <thead className="bg-gray-100 sticky top-0 z-10">
                        <tr>
                            <th className="p-2 text-left">Nama Karyawan</th>
                            {Array.from({ length: daysInMonth }, (_, i) => (
                                <th key={i + 1} className="p-2">{i + 1}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {employees.length === 0 || shiftOptions.length === 0 ? (
                            [...Array(3)].map((_, rowIdx) => (
                                <tr key={rowIdx} className="border-t">
                                    <td className="p-2"><Skeleton width={120} /></td>
                                    {Array.from({ length: daysInMonth }, (_, i) => (
                                        <td key={i} className="p-1">
                                            <Skeleton height={30} />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            employees.map(emp => (
                                <tr key={emp.id} className="border-t hover:bg-gray-50">
                                    <td className="p-2 text-left font-medium">{emp.name}</td>
                                    {Array.from({ length: daysInMonth }, (_, i) => {
                                        const day = i + 1;
                                        return (
                                            <td key={day} className="p-1">
                                                <select
                                                    value={schedules[emp.id]?.[day] || ''}
                                                    onChange={e => handleChange(emp.id, day, e.target.value)}
                                                    className="w-16 h-auto text-sm text-center border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none bg-[url('data:image/svg+xml;utf8,<svg fill=\'%23667\' height=\'18\' viewBox=\'0 0 24 24\' width=\'18\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/></svg>')] bg-no-repeat bg-[right_0.4rem_center] pr-6"
                                                >
                                                    <option value="">-</option>
                                                    {shiftOptions
                                                        .filter(shift => shift.gender_restriction !== 'male_only' || emp.gender === 'male')
                                                        .map(shift => (
                                                            <option key={shift.id} value={shift.shift_code}>
                                                                {shift.shift_code}
                                                            </option>
                                                        ))}
                                                </select>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))
                        )}
                    </tbody>

                </table>
            </div>
        </div>
    );
};

export default ManualScheduleEditor;
