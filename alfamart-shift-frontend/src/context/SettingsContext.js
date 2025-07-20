import React, { createContext, useContext, useState } from 'react';
import api from '@/config/api'; // pakai instance bawaan kamu

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [stores, setStores] = useState([]);

    const updateStore = async (data) => {
        setLoading(true);
        await api.post('/settings/store', data);
        setLoading(false);
    };

    const fetchStores = async () => {
        try {
            const res = await api.get('/stores');
            if (res.data.success) {
                setStores(res.data.data);
            }
        } catch (error) {
            console.error('❌ Error fetching stores:', error);
        }
    };

    const fetchShifts = async () => {
        const res = await api.get('/shifts');
        return res.data.data;
    };

    const addShift = async (shift) => {
        await api.post('/shifts', shift);
    };
    const deleteShift = async (id) => {
        await api.delete(`/shifts/${id}`);
    };

    const resetSchedule = async (payload) => {
        await api.put('/schedules/reset-all', payload);
    };

    const changePassword = async (data) => {
        await api.post('/auth/change-password', data);
    };

    const resetEmployeePassword = async (employeeId) => {
        await api.post(`/employees/${employeeId}/reset-password`);
    };

    return (
        <SettingsContext.Provider
            value={{
                updateStore,
                fetchStores,
                stores,
                fetchShifts,
                addShift,
                deleteShift,
                resetSchedule,
                changePassword,
                resetEmployeePassword,
                loading,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
