import { useSettings } from '@/context/SettingsContext';
import Swal from 'sweetalert2';
import { useState, useEffect } from 'react';
import { monthNames } from '@/commons'

const ResetSchedule = () => {
    const { resetSchedule, fetchStores, stores } = useSettings();
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [storeId, setStoreId] = useState('');

    useEffect(() => {
        fetchStores();
    }, []);

    const handleReset = async () => {

        if (!storeId) {
            Swal.fire('Oops!', 'Pilih toko terlebih dahulu.', 'warning');
            return;
        }

        const result = await Swal.fire({
            title: 'Reset semua jadwal?',
            html: `Akan menghapus seluruh jadwal bulan <b>${monthNames[month - 1]}/${year}</b> untuk toko terpilih.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, reset!',
            cancelButtonText: 'Batal',
        });

        if (result.isConfirmed) {
            try {
                await resetSchedule({ store_id: storeId, month, year });
                Swal.fire('Berhasil', 'Semua jadwal telah direset.', 'success');
            } catch (error) {
                Swal.fire('Gagal', 'Terjadi kesalahan saat mereset jadwal.', 'error');
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <div>
                    <label className="text-sm font-medium">Toko</label>
                    <select
                        className="border px-3 py-2 rounded w-full"
                        value={storeId}
                        onChange={(e) => setStoreId(e.target.value)}
                    >
                        <option value="">Pilih Toko</option>
                        {stores.map(store => (
                            <option key={store.id} value={store.id}>
                                {store.store_name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium">Bulan</label>
                    <select
                        className="border px-3 py-2 rounded w-full"
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                    >
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {i + 1}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium">Tahun</label>
                    <input
                        type="number"
                        className="border px-3 py-2 rounded w-full"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                    />
                </div>
            </div>
            <button
                className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
                onClick={handleReset}
            >
                Reset Jadwal
            </button>
        </div>
    );
};

export default ResetSchedule;
