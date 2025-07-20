import React, { useEffect, useState } from 'react';
import { Input } from './ui/input';
import Skeleton from 'react-loading-skeleton';
import toast from 'react-hot-toast';
import 'react-loading-skeleton/dist/skeleton.css';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';
import { useAuth, useEmployees } from '@/context';

const EmployeeManagement = () => {
    const {
        employees,
        stores,
        loading,
        addEmployee,
        updateEmployee,
        deleteEmployee
    } = useEmployees();
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const [filtered, setFiltered] = useState([]);
    const [editing, setEditing] = useState(null);
    // Tambahkan store_id di form
    const [form, setForm] = useState({ store_id: '', name: '', nik: '', gender: '', email: '', phone: '' });
    const { user } = useAuth();



    useEffect(() => {
        setFiltered(employees);
    }, [employees]);

    useEffect(() => {
        const result = employees.filter(e =>
            e.name.toLowerCase().includes(search.toLowerCase()) ||
            e.nik?.includes(search)
        );
        setFiltered(result);
    }, [search, employees]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.store_id) {
            toast.error('Pilih toko dulu');
            return;
        }

        setSubmitting(true);
        try {
            if (editing) {
                await updateEmployee(editing.id, form);
            } else {
                await addEmployee(form);
            }
            setForm({ store_id: '', name: '', nik: '', gender: '', email: '', phone: '' });
            setEditing(null);
        } catch (err) {
            console.error('Error menyimpan data', err);
            toast.error('❌ Error menyimpan data karyawan');
        } finally {
            toast.success('✅ Data karyawan berhasil disimpan!');
            setSubmitting(false);
        }
    };

    const handleEdit = (employee) => {
        setForm({
            store_id: employee.store?.id || '',
            nik: employee.nik,
            name: employee.name,
            email: employee.email || '',
            phone: employee.phone || '',
            gender: employee.gender,
        });
        setEditing(employee);
    };

    const handleDelete = (id, name) => {
        Swal.fire({
            title: 'Yakin ingin menghapus?',
            text: `Data karyawan "${name}" akan dihapus secara permanen.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteEmployee(id);
                    Swal.fire('Berhasil!', 'Data karyawan telah dihapus.', 'success');
                } catch (error) {
                    Swal.fire('Gagal!', 'Terjadi kesalahan saat menghapus data.', 'error');
                }
            }
        });
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Kelola Data Karyawan</h2>

            <div className="mb-4 flex flex-col sm:flex-row items-center gap-2">
                <Input
                    type="text"
                    placeholder="Cari nama atau NIK..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:w-80"
                />
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-lg space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {/* Store select */}
                    <div className="flex flex-col">
                        <label className="mb-1 text-sm font-medium text-gray-700">Toko</label>
                        <select
                            value={form.store_id}
                            onChange={(e) => setForm({ ...form, store_id: e.target.value })}
                            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        >
                            <option value="">Pilih Toko</option>
                            {stores.map(store => (
                                <option key={store.id} value={store.id}>
                                    {store.store_name} ({store.store_code})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Nama */}
                    <div className="flex flex-col">
                        <label className="mb-1 text-sm font-medium text-gray-700">Nama</label>
                        <input
                            type="text"
                            placeholder="Masukkan nama"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col">
                        <label className="mb-1 text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            placeholder="Masukkan email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    {/* No. HP */}
                    <div className="flex flex-col">
                        <label className="mb-1 text-sm font-medium text-gray-700">No. HP</label>
                        <input
                            type="text"
                            placeholder="Masukkan nomor HP"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* NIK */}
                    <div className="flex flex-col">
                        <label className="mb-1 text-sm font-medium text-gray-700">NIK</label>
                        <input
                            type="text"
                            placeholder="Masukkan NIK"
                            value={form.nik}
                            onChange={(e) => setForm({ ...form, nik: e.target.value })}
                            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    {/* Gender */}
                    <div className="flex flex-col">
                        <label className="mb-1 text-sm font-medium text-gray-700">Gender</label>
                        <select
                            value={form.gender}
                            onChange={(e) => setForm({ ...form, gender: e.target.value })}
                            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            <option value="">Pilih Gender</option>
                            <option value="male">Laki-laki</option>
                            <option value="female">Perempuan</option>
                        </select>
                    </div>
                </div>

                {/* Tombol Submit */}
                <div className="text-right">
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200"
                        disabled={submitting}
                    >
                        {submitting ? 'Menyimpan...' : editing ? 'Update' : 'Tambah'} Karyawan
                    </button>
                </div>
            </form>

            {loading ? (
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="grid grid-cols-5 gap-2">
                            <Skeleton height={30} />
                            <Skeleton height={30} />
                            <Skeleton height={30} />
                            <Skeleton height={30} />
                            <Skeleton height={30} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full border text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 border">Nama</th>
                                <th className="p-2 border">NIK</th>
                                <th className="p-2 border">Gender</th>
                                <th className="p-2 border">Status</th>
                                <th className="p-2 border">Toko</th>
                                <th className="p-2 border">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(emp => (
                                <tr key={emp.id} className="hover:bg-gray-50">
                                    <td className="p-2 border">{emp.name}</td>
                                    <td className="p-2 border">{emp.nik}</td>
                                    <td className="p-2 border capitalize">{emp.gender}</td>
                                    <td className="p-2 border capitalize">{emp.status}</td>
                                    <td className="p-2 border">{emp.store?.name || '-'} ({emp.store?.code || '*'})</td>
                                    <td className="flex justify-center gap-2 p-2 border space-x-2">
                                        <button
                                            onClick={() => handleEdit(emp)}
                                            className="inline-flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                            Edit
                                        </button>
                                        {user?.id !== emp.id && (
                                            <button
                                                onClick={() => handleDelete(emp.id, emp.name)}
                                                className="inline-flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                                Hapus
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {submitting && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
                    <div className="bg-white px-6 py-4 rounded shadow-lg text-center">
                        <span className="text-lg font-semibold text-gray-700">Menyimpan data karyawan...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeManagement;
