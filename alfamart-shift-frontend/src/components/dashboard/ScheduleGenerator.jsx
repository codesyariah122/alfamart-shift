// ScheduleGenerator.jsx - Final version
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSchedule } from '@/context/ScheduleContext';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ManualScheduleEditor } from './Molecules';

const ScheduleGenerator = ({ onClose }) => {
    const { scheduleAPI } = useSchedule();
    const { user } = useAuth();
    console.log(user)
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm({
        defaultValues: {
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
        }
    });
    const [manualSchedules, setManualSchedules] = useState([]);

    const [generationType, setGenerationType] = useState('auto');
    const [autoSubType, setAutoSubType] = useState('monthly');
    const [weeklyPattern, setWeeklyPattern] = useState({
        monday: { P: 3, S: 2, M: 1, O: 1 },
        tuesday: { P: 2, S: 3, M: 2, O: 1 },
        wednesday: { P: 3, S: 3, M: 0, O: 1 },
        thursday: { P: 2, S: 2, M: 2, O: 1 },
        friday: { P: 3, S: 2, M: 2, O: 1 },
        saturday: { P: 3, S: 2, M: 1, O: 1 },
        sunday: { P: 0, S: 0, M: 0, O: 4 },
    });
    const [shiftOptions, setShiftOptions] = useState([]);

    const month = watch('month');
    const year = watch('year');

    const generationOptions = [
        { id: 'auto', title: 'Otomatis', icon: '🤖', description: 'Generate otomatis sesuai aturan' },
        { id: 'manual', title: 'Manual', icon: '✋', description: 'Isi jadwal secara manual' },
        { id: 'hybrid', title: 'Hybrid', icon: '⚖️', description: 'Manual lalu auto-fill' }
    ];

    const autoSubOptions = [
        { id: 'daily', title: 'Per Hari', description: 'Generate harian' },
        { id: 'weekly', title: 'Per Minggu', description: 'Generate mingguan' },
        { id: 'monthly', title: 'Per Bulan', description: 'Generate bulanan' },
        { id: 'custom', title: 'Custom Range', description: 'Tentukan rentang' }
    ];

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

    const shiftCodes = shiftOptions.map(shift => shift.shift_code);
    const onSubmit = async (formData) => {
        const isAuto = generationType === 'auto';
        const isWeekly = autoSubType === 'weekly';
        const isCustomRange = ['daily', 'custom', 'weekly'].includes(autoSubType);

        const finalGenerationType = isAuto && isWeekly
            ? 'weekly'
            : generationType === 'hybrid'
                ? 'hybrid'
                : generationType;

        // ⛔ CEK JIKA MANUAL & TIDAK ADA ISIAN
        if (generationType === 'manual') {
            if (manualSchedules.length === 0) {
                toast.error('❌ Jadwal belum diisi');
                return;
            }

            try {
                // console.log('🟡 Payload:', manualSchedules);
                await scheduleAPI.saveManualSchedule({
                    store_id: user.store_id,
                    created_by: user.id,
                    month: Number(formData.month),
                    year: Number(formData.year),
                    schedules: manualSchedules,
                });

                toast.success('✅ Jadwal manual berhasil disimpan!');
                onClose();
                return;
            } catch (err) {
                console.error(err);
                toast.error('❌ Gagal simpan jadwal manual.');
                return;
            }
        }

        // ✅ UNTUK MODE AUTO / HYBRID
        const payload = {
            store_id: user.store_id,
            generation_type: finalGenerationType,
        };

        if (isAuto) {
            if (autoSubType === 'monthly') {
                payload.month = Number(formData.month);
                payload.year = Number(formData.year);
            } else if (isCustomRange) {
                payload.from = formData.startDate;
                payload.to = formData.endDate;
            }

            if (isWeekly) {
                payload.weekly_pattern = weeklyPattern;
            }
        } else {
            payload.month = Number(formData.month);
            payload.year = Number(formData.year);
        }

        try {
            const res = await scheduleAPI.generateSchedule(payload);
            console.log('✅ Jadwal berhasil:', res);
            toast.success('✅ Jadwal berhasil dibuat!');
            onClose();
        } catch (err) {
            console.error('❌ Gagal:', err);
            toast.error('❌ Gagal generate jadwal.');
        }
    };


    return (
        <div className="space-y-6">
            {/* Pilihan Jenis Generator */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {generationOptions.map(opt => (
                    <motion.div
                        key={opt.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setGenerationType(opt.id)}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${generationType === opt.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                        <div className="text-center">
                            <div className="text-3xl mb-2">{opt.icon}</div>
                            <h3 className="font-semibold text-gray-900 mb-1">{opt.title}</h3>
                            <p className="text-sm text-gray-600">{opt.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {generationType === 'manual' && (
                <ManualScheduleEditor
                    month={month}
                    year={year}
                    storeId={user.store_id}
                    onChange={setManualSchedules}
                />
            )}


            {/* Keterangan khusus mode Hybrid */}
            {generationType === 'hybrid' && (
                <div className="text-sm text-blue-600 mt-2">
                    💡 Mode <strong>Hybrid</strong> akan mengisi otomatis hanya pada tanggal yang belum diisi secara manual.
                </div>
            )}

            {/* Sub Pilihan Otomatis */}
            {generationType === 'auto' && (
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-3">Pilih Tipe Otomatis:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {autoSubOptions.map(opt => (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => setAutoSubType(opt.id)}
                                className={`p-2 rounded-lg text-sm border transition-all ${autoSubType === opt.id
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-100'
                                    }`}
                            >
                                <div className="font-medium">{opt.title}</div>
                                <div className="text-xs opacity-80">{opt.description}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Per Bulan */}
            {(autoSubType === 'monthly' || generationType !== 'auto') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bulan</label>
                        <select
                            {...register('month', { required: 'Bulan harus dipilih' })}
                            className="w-full px-3 py-2 border rounded-lg"
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(0, i).toLocaleString('id-ID', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                        {errors.month && <p className="text-sm text-red-600">{errors.month.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
                        <input
                            type="number"
                            {...register('year', { required: 'Tahun harus diisi', min: 2024, max: 2030 })}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                        {errors.year && <p className="text-sm text-red-600">{errors.year.message}</p>}
                    </div>
                </div>
            )}

            {/* Input Range Tanggal untuk Daily / Weekly / Custom */}
            {generationType === 'auto' && ['daily', 'weekly', 'custom'].includes(autoSubType) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
                        <input
                            type="date"
                            {...register('startDate', { required: 'Wajib diisi' })}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                        {errors.startDate && <p className="text-sm text-red-600">{errors.startDate.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Selesai</label>
                        <input
                            type="date"
                            {...register('endDate', { required: 'Wajib diisi' })}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                        {errors.endDate && <p className="text-sm text-red-600">{errors.endDate.message}</p>}
                    </div>
                </div>
            )}

            {/* Weekly Pattern Editor */}
            {generationType === 'auto' && autoSubType === 'weekly' && (
                <div className="overflow-x-auto border rounded-lg p-3">
                    <h4 className="font-semibold mb-2 text-gray-700">Atur Jumlah Shift per Hari:</h4>
                    <table className="min-w-full text-sm text-center">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2">Hari</th>
                                {shiftCodes.map(shift => (
                                    <th key={shift} className="p-2">{shift}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(weeklyPattern).map(([day, shifts]) => (
                                <tr key={day} className="border-t">
                                    <td className="capitalize p-2 text-left">{day}</td>
                                    {shiftCodes.map(code => (
                                        <td key={code} className="p-1">
                                            <input
                                                type="number"
                                                min={0}
                                                value={shifts[code]}
                                                onChange={e => {
                                                    const updated = { ...weeklyPattern };
                                                    updated[day][code] = parseInt(e.target.value) || 0;
                                                    setWeeklyPattern({ ...updated });
                                                }}
                                                className="w-16 px-1 py-1 border rounded text-center"
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tombol Aksi */}
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
    );
};

export default ScheduleGenerator;
