import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';

const ScheduleGenerator = ({ onClose }) => {
    const [generationType, setGenerationType] = useState('auto');
    const [autoSubType, setAutoSubType] = useState('monthly');
    const [employees, setEmployees] = useState([
        { id: 1, name: 'Ahmad Saputra', gender: 'male' },
        { id: 2, name: 'Siti Nurhaliza', gender: 'female' },
        { id: 3, name: 'Budi Santoso', gender: 'male' },
        { id: 4, name: 'Dewi Kartika', gender: 'female' },
        { id: 5, name: 'Andi Wijaya', gender: 'male' },
        { id: 6, name: 'Rina Sari', gender: 'female' },
        { id: 7, name: 'Joko Susilo', gender: 'male' },
        { id: 8, name: 'Maya Indah', gender: 'female' },
        { id: 9, name: 'Dani Pratama', gender: 'male' },
        { id: 10, name: 'Fitri Handayani', gender: 'female' },
    ]);
    const [scheduleData, setScheduleData] = useState({});
    const [daysInMonth, setDaysInMonth] = useState(31);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            startDate: 1,
            endDate: 31,
        },
    });

    const watchedMonth = watch('month');
    const watchedYear = watch('year');

    useEffect(() => {
        if (watchedMonth && watchedYear) {
            const days = new Date(watchedYear, watchedMonth, 0).getDate();
            setDaysInMonth(days);
        }
    }, [watchedMonth, watchedYear]);

    const generationOptions = [
        {
            id: 'auto',
            title: 'Otomatis',
            description: 'Sistem akan membuat jadwal secara otomatis berdasarkan aturan',
            icon: '🤖',
        },
        {
            id: 'manual',
            title: 'Manual',
            description: 'Buat jadwal secara manual sesuai kebutuhan',
            icon: '✋',
        },
        {
            id: 'hybrid',
            title: 'Hybrid',
            description: 'Mulai dengan manual, lalu auto-fill sisanya',
            icon: '⚖️',
        },
    ];

    const autoSubOptions = [
        { id: 'daily', title: 'Per Hari', description: 'Generate jadwal harian' },
        { id: 'weekly', title: 'Per Minggu', description: 'Generate jadwal mingguan' },
        { id: 'monthly', title: 'Per Bulan', description: 'Generate jadwal bulanan' },
        { id: 'custom', title: 'Custom Range', description: 'Tentukan rentang tanggal' },
    ];

    const shiftCodes = {
        'P': 'Pagi',
        'S': 'Siang',
        'M': 'Malam',
        'O': 'Off/Libur'
    };

    const generateDayNumbers = () => {
        return Array.from({ length: daysInMonth }, (_, i) => i + 1);
    };

    const handleShiftChange = (employeeId, day, shift) => {
        setScheduleData(prev => ({
            ...prev,
            [employeeId]: {
                ...prev[employeeId],
                [day]: shift
            }
        }));
    };

    const generateAutoSchedule = () => {
        const newSchedule = {};

        // Initialize schedule for all employees
        employees.forEach(employee => {
            newSchedule[employee.id] = {};
        });

        // Generate schedule for each day
        for (let day = 1; day <= daysInMonth; day++) {
            const shuffledEmployees = [...employees].sort(() => Math.random() - 0.5);

            // Separate male and female employees
            const males = shuffledEmployees.filter(emp => emp.gender === 'male');
            const females = shuffledEmployees.filter(emp => emp.gender === 'female');

            // Assign shifts based on requirements: 3 pagi, 3 siang, 2 malam, 2 libur
            let shiftAssignments = [];

            // Assign night shifts only to males (2 people)
            const nightShiftMales = males.slice(0, 2);
            nightShiftMales.forEach(emp => {
                shiftAssignments.push({ id: emp.id, shift: 'M' });
            });

            // Remaining employees (8 people) for P, S, O
            const remainingEmployees = shuffledEmployees.filter(emp =>
                !nightShiftMales.find(nightEmp => nightEmp.id === emp.id)
            );

            // Assign 3 pagi, 3 siang, 2 libur from remaining 8 people
            const morningShift = remainingEmployees.slice(0, 3);
            const afternoonShift = remainingEmployees.slice(3, 6);
            const offShift = remainingEmployees.slice(6, 8);

            morningShift.forEach(emp => {
                shiftAssignments.push({ id: emp.id, shift: 'P' });
            });

            afternoonShift.forEach(emp => {
                shiftAssignments.push({ id: emp.id, shift: 'S' });
            });

            offShift.forEach(emp => {
                shiftAssignments.push({ id: emp.id, shift: 'O' });
            });

            // Apply assignments to schedule
            shiftAssignments.forEach(assignment => {
                newSchedule[assignment.id][day] = assignment.shift;
            });
        }

        setScheduleData(newSchedule);
    };

    const fillEmptyWithAuto = () => {
        const newSchedule = { ...scheduleData };

        // For each day, check if we need to fill empty cells
        for (let day = 1; day <= daysInMonth; day++) {
            const dayAssignments = [];
            const emptyEmployees = [];

            // Check current assignments and find empty cells
            employees.forEach(employee => {
                if (!newSchedule[employee.id]) newSchedule[employee.id] = {};

                if (newSchedule[employee.id][day]) {
                    dayAssignments.push({ id: employee.id, shift: newSchedule[employee.id][day] });
                } else {
                    emptyEmployees.push(employee);
                }
            });

            // If there are empty cells, fill them while maintaining daily distribution
            if (emptyEmployees.length > 0) {
                // Count current shift assignments
                const currentShiftCounts = {
                    P: dayAssignments.filter(a => a.shift === 'P').length,
                    S: dayAssignments.filter(a => a.shift === 'S').length,
                    M: dayAssignments.filter(a => a.shift === 'M').length,
                    O: dayAssignments.filter(a => a.shift === 'O').length
                };

                // Calculate needed shifts
                const neededShifts = [];
                const targetCounts = { P: 3, S: 3, M: 2, O: 2 };

                Object.entries(targetCounts).forEach(([shift, target]) => {
                    const needed = target - currentShiftCounts[shift];
                    for (let i = 0; i < needed; i++) {
                        neededShifts.push(shift);
                    }
                });

                // Shuffle empty employees and assign shifts
                const shuffledEmpty = [...emptyEmployees].sort(() => Math.random() - 0.5);

                shuffledEmpty.forEach((employee, index) => {
                    if (index < neededShifts.length) {
                        let assignedShift = neededShifts[index];

                        // Ensure females don't get night shift
                        if (employee.gender === 'female' && assignedShift === 'M') {
                            // Find alternative shift for female
                            const alternatives = neededShifts.filter((s, i) => i > index && s !== 'M');
                            if (alternatives.length > 0) {
                                assignedShift = alternatives[0];
                                // Swap with the alternative
                                const altIndex = neededShifts.indexOf(assignedShift, index + 1);
                                neededShifts[altIndex] = 'M';
                            } else {
                                assignedShift = 'P'; // Default to morning if no alternatives
                            }
                        }

                        newSchedule[employee.id][day] = assignedShift;
                    }
                });
            }
        }

        setScheduleData(newSchedule);
    };

    const renderManualSchedule = () => {
        const days = generateDayNumbers();

        return (
            <div className="bg-white border-2 border-red-500 rounded-lg p-4 overflow-x-auto">
                <h4 className="font-medium text-gray-900 mb-4">Manual Schedule Input</h4>

                <table className="w-full border-collapse">
                    {/* Header */}
                    <thead>
                        <tr className="border-b-2 border-red-500">
                            <th className="border-r-2 border-red-500 p-2 text-left font-medium text-gray-700 bg-red-50 min-w-[150px]">
                                Nama
                            </th>
                            {days.map(day => (
                                <th key={day} className="border-r-2 border-red-500 p-2 text-center text-sm font-medium text-gray-600 bg-red-50 min-w-[40px]">
                                    {day}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* Employee rows */}
                    <tbody>
                        {employees.map((employee, index) => (
                            <tr key={employee.id} className={index < employees.length - 1 ? "border-b-2 border-red-500" : ""}>
                                <td className="border-r-2 border-red-500 p-2 font-medium text-gray-800 bg-red-50">
                                    <div className="flex flex-col">
                                        <span className="text-sm">{employee.name}</span>
                                        <span className="text-xs text-gray-500">
                                            ({employee.gender === 'male' ? 'Laki-laki' : 'Perempuan'})
                                        </span>
                                    </div>
                                </td>
                                {days.map(day => (
                                    <td key={day} className="border-r-2 border-red-500 p-1 text-center">
                                        <select
                                            value={scheduleData[employee.id]?.[day] || ''}
                                            onChange={(e) => handleShiftChange(employee.id, day, e.target.value)}
                                            className="w-full text-center text-sm border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">-</option>
                                            <option value="P">P</option>
                                            <option value="S">S</option>
                                            {employee.gender === 'male' && <option value="M">M</option>}
                                            <option value="O">O</option>
                                        </select>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Legend */}
                <div className="mt-4 p-3 bg-gray-50 rounded border">
                    <h5 className="font-medium text-gray-700 mb-2">Keterangan Kode:</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        {Object.entries(shiftCodes).map(([code, description]) => (
                            <div key={code} className="flex items-center gap-1">
                                <span className="font-mono font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">{code}</span>
                                <span className="text-gray-600">= {description}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const onSubmit = async (data) => {
        const payload = {
            ...data,
            generation_type: generationType,
            auto_sub_type: autoSubType,
            schedule_data: scheduleData,
            employees: employees,
        };

        console.log('Schedule payload:', payload);

        // Simulate API call
        setTimeout(() => {
            alert('Jadwal berhasil di-generate!');
            onClose();
        }, 1000);
    };

    return (
        <div className="space-y-6">
            {/* Generation Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {generationOptions.map((option) => (
                    <motion.div
                        key={option.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${generationType === option.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                        onClick={() => setGenerationType(option.id)}
                    >
                        <div className="text-center">
                            <div className="text-3xl mb-2">{option.icon}</div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                                {option.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {option.description}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Auto Generation Sub-options */}
            {generationType === 'auto' && (
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-3">Pilih Tipe Otomatis:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {autoSubOptions.map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => setAutoSubType(option.id)}
                                className={`p-2 rounded-lg text-sm border transition-all ${autoSubType === option.id
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-100'
                                    }`}
                            >
                                <div className="font-medium">{option.title}</div>
                                <div className="text-xs opacity-80">{option.description}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {/* Date Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bulan
                        </label>
                        <select
                            {...register('month', { required: 'Bulan harus dipilih' })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(0, i).toLocaleString('id-ID', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                        {errors.month && (
                            <p className="text-sm text-red-600">{errors.month.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tahun
                        </label>
                        <input
                            type="number"
                            {...register('year', {
                                required: 'Tahun harus diisi',
                                min: { value: 2024, message: 'Tahun minimal 2024' },
                                max: { value: 2030, message: 'Tahun maksimal 2030' }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.year && (
                            <p className="text-sm text-red-600">{errors.year.message}</p>
                        )}
                    </div>
                </div>

                {/* Custom Date Range for Auto Custom */}
                {generationType === 'auto' && autoSubType === 'custom' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tanggal Mulai
                            </label>
                            <input
                                type="number"
                                min="1"
                                max={daysInMonth}
                                {...register('startDate', {
                                    required: 'Tanggal mulai harus diisi',
                                    min: { value: 1, message: 'Tanggal minimal 1' },
                                    max: { value: daysInMonth, message: `Tanggal maksimal ${daysInMonth}` }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.startDate && (
                                <p className="text-sm text-red-600">{errors.startDate.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tanggal Selesai
                            </label>
                            <input
                                type="number"
                                min="1"
                                max={daysInMonth}
                                {...register('endDate', {
                                    required: 'Tanggal selesai harus diisi',
                                    min: { value: 1, message: 'Tanggal minimal 1' },
                                    max: { value: daysInMonth, message: `Tanggal maksimal ${daysInMonth}` }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.endDate && (
                                <p className="text-sm text-red-600">{errors.endDate.message}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Manual/Hybrid Schedule Input */}
                {(generationType === 'manual' || generationType === 'hybrid') && (
                    <div className="space-y-4">
                        {generationType === 'hybrid' && (
                            <div className="flex gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                                <button
                                    type="button"
                                    onClick={fillEmptyWithAuto}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                >
                                    🤖 Auto-Fill Empty Cells
                                </button>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-green-800">
                                        Mode Hybrid - Langkah 1: Input Manual
                                    </span>
                                    <span className="text-xs text-green-600">
                                        Isi jadwal sesuai kebutuhan, lalu klik "Auto-Fill Empty Cells" untuk mengisi sisanya
                                    </span>
                                </div>
                            </div>
                        )}

                        {renderManualSchedule()}

                        {/* Additional Manual Controls */}
                        <div className="flex gap-2 text-sm">
                            <button
                                type="button"
                                onClick={() => setScheduleData({})}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                            >
                                🗑️ Clear All
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const newSchedule = { ...scheduleData };
                                    employees.forEach(emp => {
                                        if (!newSchedule[emp.id]) newSchedule[emp.id] = {};
                                        for (let day = 1; day <= daysInMonth; day++) {
                                            if (!newSchedule[emp.id][day]) {
                                                newSchedule[emp.id][day] = 'P';
                                            }
                                        }
                                    });
                                    setScheduleData(newSchedule);
                                }}
                                className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                            >
                                📝 Fill Empty with P
                            </button>
                        </div>
                    </div>
                )}

                {/* Rules */}
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Aturan Generate Jadwal:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• <strong></strong> Toko 24 Jam</li>
                        <li>• <strong>Per Hari:</strong> 3 orang shift pagi, 3 orang shift siang, 2 orang shift malam, 2 orang libur</li>
                        <li>• <strong>Total:</strong> 10 karyawan (8 laki-laki, 2 perempuan)</li>
                        <li>• <strong>Perempuan:</strong> tidak mendapat shift malam (kecuali manual)</li>
                        <li>• <strong>Shift Malam:</strong> hanya untuk karyawan laki-laki</li>
                        <li>• <strong>Sebelum libur:</strong> masuk pagi, misal tanggal 1 masuk pagi tanggal 2 libur</li>
                        <li>• <strong>setelah libur:</strong> perempuan setelah libur masuk siang, sedangkan laki laki masuk malam</li>
                        <li>• <strong>jam kerja:</strong> 6 hari kerja 1 hari libur</li>
                        <li>• <strong>Distribusi:</strong> otomatis acak setiap hari dengan mempertahankan jumlah per shift</li>
                        <br></br>
                        <li><strong></strong>Aturan Generate Jadwal toko reguler :</li>
                        <li>• <strong>Per Hari:</strong>2 orang shift pagi, 2 orang shift siang, 1/2 orang libur</li>
                        <li>• <strong>Total:</strong>5/6 karyawan </li>
                        <li>• <strong>Sebelum libur:</strong> masuk pagi, misal tanggal 1 masuk pagi tanggal 2 libur</li>
                        <li>• <strong>setelah libur:</strong> perempuan dan laki laki masuk siang</li>
                        <li>• <strong>jam kerja:</strong> 6 hari kerja 1 hari libur</li>
                        <li>• <strong>Distribusi:</strong> otomatis acak setiap hari dengan mempertahankan jumlah per shift</li>
                    </ul>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit(onSubmit)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
                    >
                        Generate Jadwal
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScheduleGenerator;
