import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/config/api'; // pastikan path sesuai

const EmployeeContext = createContext();

export const useEmployees = () => {
    const context = useContext(EmployeeContext);
    if (!context) {
        throw new Error('useEmployees must be used within an EmployeeProvider');
    }
    return context;
};

export const EmployeeProvider = ({ children }) => {
    const [employees, setEmployees] = useState([]);
    const [stores, setStores] = useState([]); // store state
    const [loading, setLoading] = useState(false);

    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/employees');
            setEmployees(res.data?.data?.data || []);
        } catch (err) {
            console.error(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStores = useCallback(async () => {
        try {
            const res = await api.get('/list-stores');
            setStores(res.data?.data || []);
        } catch (error) {
            console.error(error.message);
            // Jika mau, bisa panggil toast di sini, tapi lebih baik di UI component supaya context tidak tergantung UI lib
        }
    }, []);

    const addEmployee = async (form) => {
        const res = await api.post('/employees', form);
        if (res.status !== 200 && res.status !== 201) throw new Error('Gagal menambah karyawan');
        await fetchEmployees();
    };

    const updateEmployee = async (id, form) => {
        const res = await api.put(`/employees/${id}`, form);
        if (res.status !== 200) throw new Error('Gagal memperbarui data karyawan');
        await fetchEmployees();
    };

    const deleteEmployee = async (id) => {
        const res = await api.delete(`/employees/${id}`);
        if (res.status !== 200) throw new Error('Gagal menghapus karyawan');
        await fetchEmployees();
    };

    const resetEmployeePassword = async (nik) => {
        try {
            const res = await api.post(`/employees/reset-password`, { nik });
            if (res.status !== 200 && res.status !== 201) throw new Error('Gagal reset password');
            return res.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Terjadi kesalahan saat reset password');
        }
    };


    useEffect(() => {
        fetchEmployees();
        fetchStores();
    }, [fetchEmployees, fetchStores]);

    return (
        <EmployeeContext.Provider
            value={{
                employees,
                stores,
                loading,
                fetchEmployees,
                fetchStores,
                addEmployee,
                updateEmployee,
                deleteEmployee,
                resetEmployeePassword,
            }}
        >
            {children}
        </EmployeeContext.Provider>
    );
};
