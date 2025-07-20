import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/solid';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useSettings } from '@/context/SettingsContext';

const ShiftSettings = () => {
    const { fetchShifts, addShift, deleteShift } = useSettings();
    const [shifts, setShifts] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        shift_code: '',
        shift_name: '',
        start_time: '',
        end_time: '',
        gender_restriction: 'none'
    });
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchShifts().then(data => {
            setShifts(data);
            setLoading(false);
        });
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        setSubmitting(true); // start loading
        try {
            await addShift(form);
            Swal.fire('Berhasil', 'Shift berhasil disimpan.', 'success');
            resetForm();
            const data = await fetchShifts();
            setShifts(data);
        } catch (err) {
            console.error('❌ Gagal simpan shift:', err);
            Swal.fire('Gagal', 'Terjadi kesalahan.', 'error');
        } finally {
            setSubmitting(false); // end loading
        }
    };


    const handleEdit = (shift) => {
        setSelected(shift);
        setForm({
            shift_code: shift.shift_code || '',
            shift_name: shift.shift_name || '',
            start_time: shift.start_time?.slice(0, 5) || '',
            end_time: shift.end_time?.slice(0, 5) || '',
            gender_restriction: shift.gender_restriction || 'none',
        });
    };

    const handleDelete = async (shift) => {
        const confirm = await Swal.fire({
            title: 'Yakin?',
            text: `Hapus shift ${shift.shift_name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal'
        });

        if (confirm.isConfirmed) {
            try {
                await deleteShift(shift.id);
                Swal.fire('Terhapus', 'Shift berhasil dihapus.', 'success');
                const data = await fetchShifts();
                setShifts(data);
            } catch (err) {
                console.error('❌ Gagal hapus shift:', err);
                Swal.fire('Gagal', 'Terjadi kesalahan saat menghapus.', 'error');
            }
        }
    };

    const resetForm = () => {
        setForm({
            shift_code: '',
            shift_name: '',
            start_time: '',
            end_time: '',
            gender_restriction: 'none',
        });
        setSelected(null);
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Pengaturan Shift</h2>

            <div className="overflow-x-auto rounded shadow mb-6">
                <table className="min-w-[700px] w-full text-sm text-left border border-gray-200">
                    <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3 border">Code</th>
                            <th className="px-4 py-3 border">Nama Shift</th>
                            <th className="px-4 py-3 border">Mulai</th>
                            <th className="px-4 py-3 border">Selesai</th>
                            <th className="px-4 py-3 border">Gender</th>
                            <th className="px-4 py-3 border">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-800">
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <tr key={i}>
                                    {[...Array(6)].map((_, j) => (
                                        <td key={j} className="px-4 py-2 border"><Skeleton /></td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            shifts.map((shift) => (
                                <tr key={shift.id} className="hover:bg-gray-100 transition">
                                    <td className="px-4 py-2 border">{shift.shift_code}</td>
                                    <td className="px-4 py-2 border">{shift.shift_name}</td>
                                    <td className="px-4 py-2 border">{shift.start_time}</td>
                                    <td className="px-4 py-2 border">{shift.end_time}</td>
                                    <td className="px-4 py-2 border">{shift.gender_restriction}</td>
                                    <td className="px-4 py-2 border text-center">
                                        <div className="flex gap-2 justify-center">
                                            <button
                                                className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                                                onClick={() => handleEdit(shift)}
                                            >
                                                <PencilSquareIcon className="w-4 h-4" />
                                                Edit
                                            </button>
                                            <button
                                                className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                                                onClick={() => handleDelete(shift)}
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                                Hapus
                                            </button>
                                        </div>

                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-2">
                    {selected ? 'Edit Shift' : 'Tambah Shift Baru'}
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-1">Kode Shift</label>
                        <input
                            type="text"
                            name="shift_code"
                            value={form.shift_code}
                            onChange={handleChange}
                            className="input w-full mb-2"
                        />
                    </div>

                    <div>
                        <label className="block mb-1">Nama Shift</label>
                        <input
                            type="text"
                            name="shift_name"
                            value={form.shift_name}
                            onChange={handleChange}
                            className="input w-full mb-2"
                        />
                    </div>

                    <div>
                        <label className="block mb-1">Jam Mulai</label>
                        <input
                            type="time"
                            name="start_time"
                            value={form.start_time}
                            onChange={handleChange}
                            className="input w-full mb-2"
                        />
                    </div>

                    <div>
                        <label className="block mb-1">Jam Selesai</label>
                        <input
                            type="time"
                            name="end_time"
                            value={form.end_time}
                            onChange={handleChange}
                            className="input w-full mb-2"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block mb-1">Gender Restriction</label>
                        <select
                            name="gender_restriction"
                            value={form.gender_restriction}
                            onChange={handleChange}
                            className="input w-full mb-3"
                        >
                            <option value="none">Tanpa Restriksi</option>
                            <option value="male_only">Laki-laki Saja</option>
                            <option value="female_only">Perempuan Saja</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        className={`btn bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2 ${submitting ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                <svg
                                    className="w-4 h-4 animate-spin"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v8H4z"
                                    ></path>
                                </svg>
                                <span>Menyimpan...</span>
                            </>
                        ) : (
                            'Simpan Shift'
                        )}
                    </button>

                    {selected && (
                        <button
                            className="btn bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                            onClick={resetForm}
                        >
                            Batal
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShiftSettings;
