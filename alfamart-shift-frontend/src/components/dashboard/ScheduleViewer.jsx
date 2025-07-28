import React, { useEffect, useState } from 'react';
import { useSchedule, useAuth } from '@/context';
import clsx from 'clsx';

const ScheduleViewer = () => {
    const { scheduleAPI } = useSchedule();
    const { user } = useAuth();
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [data, setData] = useState(null);
    const [createdBy, setCreatedBy] = useState(null);
    const [loading, setLoading] = useState(false);
    const [stores, setStores] = useState([]);
    const [selectedStoreId, setSelectedStoreId] = useState(
        user?.role === 'admin' ? '' : user?.role === 'cos' ? user?.store_id || '' : user?.store_id || ''
    );
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const [loadingStore, setLoadingStore] = useState(true);

    const fetchSchedule = async () => {
        try {
            if (!selectedStoreId) return;
            setLoading(true);
            const result = await scheduleAPI.getScheduleLists({
                store_id: selectedStoreId,
                year,
                month: month + 1,
            });

            // console.log('Fetched schedule data:', JSON.stringify(result.data, null, 2));
            setData(result.data);
            setCreatedBy(result.created_by);
        } catch (err) {
            console.error('Failed to fetch schedule:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.store_id && !selectedStoreId) {
            setSelectedStoreId(user.store_id);
        }
    }, [user, selectedStoreId]);

    useEffect(() => {
        if (selectedStoreId) {
            fetchSchedule();
        }
    }, [year, month, selectedStoreId]);

    useEffect(() => {
        const fetchStores = async () => {
            setLoadingStore(true);
            try {
                const data = await scheduleAPI.getStores();
                let storeList = data.data || [];
                if (user?.role === 'cos') {
                    // Hanya store milik user COS
                    storeList = storeList.filter(store => store.id === user?.store_id);
                } else if (user?.role !== 'admin') {
                    // Employee biasa
                    storeList = storeList.filter(store => store.id === user?.store_id);
                }
                setStores(storeList);
            } catch (err) {
                console.error(err.message);
            } finally {
                setLoadingStore(false);
            }
        };

        fetchStores();
    }, [user]);

    const getShiftColor = (code) => {
        switch (code) {
            case 'P': return 'bg-green-100 text-green-800';
            case 'S': return 'bg-yellow-100 text-yellow-800';
            case 'M': return 'bg-red-100 text-red-800';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="space-y-6">
            {/* Filter */}
            <div className="flex gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Store</label>
                    <select
                        value={selectedStoreId}
                        onChange={(e) => setSelectedStoreId(e.target.value)}
                        className="border rounded p-2"
                        disabled={loadingStore || user?.role !== 'admin'} // hanya admin bisa pilih store
                    >
                        <option value="">{loadingStore ? 'Memuat Store...' : 'Pilih Store'}</option>
                        {!loadingStore && stores.map(store => (
                            <option key={store.id} value={store.id}>
                                {store.store_name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Bulan</label>
                    <select
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        className="border rounded p-2"
                    >
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i} value={i}>
                                {new Date(0, i).toLocaleString('id-ID', { month: 'long' })}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Tahun</label>
                    <input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="border rounded p-2"
                    />
                </div>

                <button
                    onClick={fetchSchedule}
                    className="ml-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    🔁 Refresh
                </button>
            </div>

            {/* Tabel Jadwal */}
            {loading ? (
                <p className="text-center text-gray-600">Memuat data jadwal...</p>
            ) : (
                <div className="overflow-auto border rounded shadow-sm">
                    {createdBy && (
                        <div className="text-sm text-gray-600 italic">
                            Jadwal ini dibuat oleh: <span className="font-semibold text-gray-800">{createdBy}</span>
                        </div>
                    )}
                    <table className="min-w-full text-sm text-center border-collapse">
                        <thead className="bg-gray-100 sticky top-0 z-10">
                            <tr>
                                <th className="border px-3 py-2 text-left bg-white sticky left-0 z-20">Nama</th>
                                {dayNumbers.map(day => (
                                    <th key={day} className="border px-2 py-2">{day}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data && typeof data === 'object' &&
                                Object.values(data).map(({ employee, schedule }) => (
                                    <tr key={employee.id} className="hover:bg-gray-50">
                                        <td className="border px-3 py-2 text-left bg-white sticky left-0 z-10">
                                            {employee.name}
                                        </td>
                                        {dayNumbers.map(day => {
                                            const shiftCode = schedule?.[day]?.shift?.shift_code || '-';
                                            return (
                                                <td
                                                    key={day}
                                                    className={clsx(
                                                        'border px-2 py-1 font-semibold rounded',
                                                        getShiftColor(shiftCode)
                                                    )}
                                                    title={schedule?.[day]?.shift?.shift_name || 'Tidak ada shift'}
                                                >
                                                    {shiftCode}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ScheduleViewer;
