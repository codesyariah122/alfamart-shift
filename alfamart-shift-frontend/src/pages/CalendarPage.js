// src/pages/SchedulePage.jsx
import React, { useEffect, useState } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import { useSchedule } from '@/context/ScheduleContext';
import { ScheduleCalendar } from '@/components/dashboard';

const CalendarPage = () => {
    const { scheduleAPI } = useSchedule();
    const today = new Date();

    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchSchedule = async () => {
        try {
            setLoading(true);
            const result = await scheduleAPI.getSchedulesByMonth(year, month);
            setData(result.data);
        } catch (err) {
            console.error('Failed to fetch schedule:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedule();
    }, [year, month]);

    return (
        <div className="p-6 space-y-4">
            <a
                href="http://localhost:3000/dashboard"
                className="inline-flex items-center bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 w-fit"
            >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Kembali ke Dashboard
            </a>
            <h1 className="text-2xl font-bold">Kalender Jadwal Shift</h1>

            {/* Filter */}
            <div className="flex gap-4">
                <div>
                    <label>Bulan</label>
                    <select
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        className="border p-2 rounded"
                    >
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i} value={i}>
                                {new Date(0, i).toLocaleString('id-ID', { month: 'long' })}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Tahun</label>
                    <input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="border p-2 rounded"
                    />
                </div>

                <button
                    onClick={fetchSchedule}
                    className="ml-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    🔁 Refresh
                </button>
            </div>

            {/* Kalender */}
            {loading ? <p>Loading...</p> : data && <ScheduleCalendar data={data} />}
        </div>
    );
};

export default CalendarPage;
