import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useSettings } from '@/context/SettingsContext';

const StoreSettings = () => {
    const { stores, fetchStores, updateStore } = useSettings();
    const [selectedStore, setSelectedStore] = useState(null);
    const [form, setForm] = useState({ name: '', logo: '' });

    useEffect(() => {
        fetchStores();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            await updateStore(form);
            Swal.fire('Berhasil', 'Pengaturan toko berhasil disimpan.', 'success');
            fetchStores();
        } catch (error) {
            console.error('❌ Error saving store:', error);
            Swal.fire('Gagal', 'Terjadi kesalahan saat menyimpan.', 'error');
        }
    };

    const handleEdit = (store) => {
        setSelectedStore(store);
        setForm({
            store_code: store.store_code || '',
            store_name: store.store_name || '',
            store_type: store.store_type || '',
            address: store.address || '',
            phone: store.phone || '',
            off_days_per_month: store.off_days_per_month || '',
            whatsapp_number: store.whatsapp_number || '',
        });
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Daftar Toko</h2>
            <div className="overflow-x-auto rounded shadow mb-6">
                <table className="min-w-[1000px] w-full text-sm text-left border border-gray-200">
                    <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3 border">Kode</th>
                            <th className="px-4 py-3 border">Nama Toko</th>
                            <th className="px-4 py-3 border">Tipe</th>
                            <th className="px-4 py-3 border">Alamat</th>
                            <th className="px-4 py-3 border">No. Telp</th>
                            <th className="px-4 py-3 border">WhatsApp</th>
                            <th className="px-4 py-3 border">Libur/Bulan</th>
                            <th className="px-4 py-3 border">Karyawan</th>
                            <th className="px-4 py-3 border">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-800">
                        {stores.map((store) => (
                            <tr key={store.id} className="hover:bg-gray-100 transition">
                                <td className="px-4 py-2 border">{store.store_code}</td>
                                <td className="px-4 py-2 border">{store.store_name}</td>
                                <td className="px-4 py-2 border uppercase">{store.store_type}</td>
                                <td className="px-4 py-2 border">{store.address}</td>
                                <td className="px-4 py-2 border">{store.phone}</td>
                                <td className="px-4 py-2 border">{store.whatsapp_number}</td>
                                <td className="px-4 py-2 border text-center">{store.off_days_per_month}</td>
                                <td className="px-4 py-2 border text-center">{store.employees?.length || 0}</td>
                                <td className="px-4 py-2 border text-center">
                                    <button
                                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                                        onClick={() => handleEdit(store)}
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>


            {selectedStore && (
                <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-2">Edit Toko: {selectedStore.name}</h3>
                    <label className="block mb-1">Kode Toko</label>
                    <input
                        type="text"
                        name="store_code"
                        value={form.store_code}
                        onChange={handleChange}
                        className="input w-full mb-3"
                    />

                    <label className="block mb-1">Nama Toko</label>
                    <input
                        type="text"
                        name="store_name"
                        value={form.store_name}
                        onChange={handleChange}
                        className="input w-full mb-3"
                    />

                    <label className="block mb-1">Tipe Toko</label>
                    <select
                        name="store_type"
                        value={form.store_type}
                        onChange={handleChange}
                        className="input w-full mb-3"
                    >
                        <option value="">Pilih Tipe</option>
                        <option value="24h">24 Jam</option>
                        <option value="normal">Normal</option>
                    </select>

                    <label className="block mb-1">Alamat</label>
                    <input
                        type="text"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        className="input w-full mb-3"
                    />

                    <label className="block mb-1">Telepon</label>
                    <input
                        type="text"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="input w-full mb-3"
                    />

                    <label className="block mb-1">Hari Libur per Bulan</label>
                    <input
                        type="number"
                        name="off_days_per_month"
                        value={form.off_days_per_month}
                        onChange={handleChange}
                        className="input w-full mb-3"
                    />

                    <label className="block mb-1">Nomor WhatsApp</label>
                    <input
                        type="text"
                        name="whatsapp_number"
                        value={form.whatsapp_number}
                        onChange={handleChange}
                        className="input w-full mb-3"
                    />


                    <button
                        className="btn bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        onClick={handleSubmit}
                    >
                        Simpan Pengaturan
                    </button>
                </div>
            )}
        </div>
    );
};

export default StoreSettings;
