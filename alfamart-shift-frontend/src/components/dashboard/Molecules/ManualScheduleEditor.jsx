import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useSchedule } from '@/context/ScheduleContext';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Swal from 'sweetalert2';

const ManualScheduleEditor = ({ month, year, storeId, onChange }) => {
    const [employees, setEmployees] = useState([]);
    const [schedules, setSchedules] = useState({});
    const { scheduleAPI } = useSchedule();
    const [shiftOptions, setShiftOptions] = useState([]);
    const [showOnlyEmpty, setShowOnlyEmpty] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const daysInMonth = new Date(year, month, 0).getDate();

    useEffect(() => {
        const fetchShiftOptions = async () => {
            try {
                const res = await scheduleAPI.getShiftTypes();
                setShiftOptions(res.data || []);
            } catch (err) {
                toast.error('❌ Gagal mengambil shift');
                console.error(err);
            }
        };
        fetchShiftOptions();
    }, []);

    useEffect(() => {
        const fetchEmployeesAndSchedules = async () => {
            setIsLoading(true);
            try {
                const empRes = await scheduleAPI.getEmployees();
                const employeeList = empRes.data?.data || [];
                setEmployees(employeeList);

                const scheduleRes = await scheduleAPI.getSchedules({
                    store_id: storeId,
                    year,
                    month
                });

                const scheduleList = scheduleRes.data || scheduleRes || [];

                const initial = {};
                employeeList.forEach(emp => {
                    initial[emp.id] = {};
                    for (let d = 1; d <= daysInMonth; d++) {
                        initial[emp.id][d] = '';
                    }
                });

                scheduleList.forEach(({ employee_id, day, shift_code }) => {
                    const d = parseInt(day);
                    if (!initial[employee_id]) return;
                    initial[employee_id][d] = shift_code;
                });

                setSchedules(initial);
            } catch (err) {
                toast.error('❌ Gagal mengambil data karyawan/jadwal');
                console.error(err);
            } finally {
                setIsLoading(false); // ✅ Selesai loading
            }
        };

        if (storeId) fetchEmployeesAndSchedules();
    }, [month, year, storeId]);

    // Notify parent jika ada perubahan
    useEffect(() => {
        if (!onChange) return;

        const payload = [];

        for (const empId in schedules) {
            for (let day = 1; day <= daysInMonth; day++) {
                const shift = schedules[empId][day];
                if (shift) {
                    payload.push({
                        employee_id: empId,
                        day,
                        shift_code: shift
                    });
                }
            }
        }

        onChange(payload);
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

    const handleReset = async (empId, empName) => {
        const confirm = await Swal.fire({
            title: `Reset jadwal ${empName}?`,
            text: "Semua isian jadwal akan dihapus dari database.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, reset',
            cancelButtonText: 'Batal'
        });

        if (!confirm.isConfirmed) return;

        try {
            await scheduleAPI.resetSchedule({
                employee_id: empId,
                store_id: storeId,
                month,
                year
            });

            // Kosongkan di state frontend
            setSchedules(prev => ({
                ...prev,
                [empId]: Object.fromEntries(
                    Array.from({ length: daysInMonth }, (_, i) => [i + 1, ''])
                )
            }));

            Swal.fire('✅ Sukses', 'Jadwal telah dihapus.', 'success');
        } catch (err) {
            Swal.fire('❌ Gagal', 'Tidak dapat menghapus jadwal.', 'error');
            console.error(err);
        }
    };

    const filteredEmployees = employees
        .filter(emp => emp.store?.id === Number(storeId))
        .filter(emp => {
            if (!showOnlyEmpty) return true;

            const empSchedule = schedules[emp.id] || {};
            const isFilled = Object.values(empSchedule).some(v => v);
            return !isFilled;
        });

    return (
        <div className="space-y-4 relative z-10">
            <h2 className="font-semibold text-lg">
                Input Jadwal Manual - {new Date(year, month - 1).toLocaleString('id-ID', { month: 'long' })} {year}
            </h2>

            <div className="flex items-center gap-3">
                <label className="text-sm flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={showOnlyEmpty}
                        onChange={() => setShowOnlyEmpty(prev => !prev)}
                    />
                    Hanya tampilkan karyawan yang belum diisi jadwal
                </label>
            </div>

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
                        {isLoading || employees.length === 0 || shiftOptions.length === 0 ? (
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
                            filteredEmployees.map(emp => (
                                <tr key={emp.id} className="border-t hover:bg-gray-50">
                                    <td className="p-2 text-left font-medium">
                                        {emp.name}
                                        <button
                                            onClick={() => handleReset(emp.id, emp.name)}
                                            className="ml-2 text-xs text-red-600 underline"
                                        >
                                            Reset
                                        </button>
                                    </td>
                                    {Array.from({ length: daysInMonth }, (_, i) => {
                                        const day = i + 1;
                                        return (
                                            <td
                                                key={day}
                                                className={`p-1 ${!schedules[emp.id]?.[day] ? 'bg-red-50' : ''}`}
                                            >
                                                <select
                                                    value={schedules[emp.id]?.[day] || ''}
                                                    onChange={e => handleChange(emp.id, day, e.target.value)}
                                                    className="w-16 text-sm text-center border border-gray-300 rounded-md bg-white appearance-none pr-6"
                                                >
                                                    <option value="">-</option>
                                                    {shiftOptions
                                                        .filter(shift =>
                                                            shift.gender_restriction !== 'male_only' || emp.gender === 'male'
                                                        )
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
