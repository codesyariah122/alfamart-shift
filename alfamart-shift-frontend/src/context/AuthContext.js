import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '@/config/api';

const AuthContext = createContext();

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                loading: false,
            };
        case 'LOGOUT':
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                loading: false,
            };
        case 'SET_LOADING':
            return {
                ...state,
                loading: action.payload,
            };
        default:
            return state;
    }
};
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: true,
    });
    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        if (token && user) {
            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {
                    token,
                    user: JSON.parse(user),
                },
            });
        } else {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, []);
    const login = async (credentials) => {
        const { isAdmin, ...loginData } = credentials;

        try {
            dispatch({ type: 'SET_LOADING', payload: true });

            const endpoint = isAdmin ? '/admin/login' : '/login';
            const response = await api.post(endpoint, loginData);

            const { token } = response.data.data;
            const user = isAdmin
                ? response.data.data.user    // dari admin login
                : response.data.data.employee; // dari employee login

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('isAdmin', isAdmin); // simpan info role

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {
                    user,
                    token,
                },
            });

            return { success: true, data: response.data };
        } catch (error) {
            console.error('Login error:', error.response?.data);
            dispatch({ type: 'SET_LOADING', payload: false });

            return {
                success: false,
                message: error.response?.data?.message || 'Login failed',
            };
        }
    };

    // const register = async (userData) => {
    //     try {
    //         console.log('Sending register data:', userData); // ← Tambah ini
    //         const response = await api.post('/register', userData);
    //         return { success: true, data: response.data };
    //     } catch (error) {
    //         console.log('Register error response:', error.response?.data); // ← Tambah ini
    //         return {
    //             success: false,
    //             message: error.response?.data?.message || 'Registration failed',
    //             errors: error.response?.data?.errors,
    //         };
    //     }
    // };
    const checkNik = async (nik) => {
        try {
            const response = await api.post('/check-nik', { nik });
            return {
                success: true,
                data: response.data?.data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'NIK tidak valid',
            };
        }
    };


    // Lebih defensif
    const register = async (userData) => {
        try {
            // console.log('Sending register data:', userData);
            const response = await api.post('/register', userData);

            // Cek apakah response.data.status atau apapun indikator sukses dari backend
            const isActuallySuccess = response.data?.success === true || response.status === 201;

            if (!isActuallySuccess) {
                return {
                    success: false,
                    message: response.data?.message || 'Registrasi gagal',
                    errors: response.data?.errors,
                };
            }

            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            console.log('Register error response:', error.response?.data);
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed',
                errors: error.response?.data?.errors,
            };
        }
    };


    // Tambahkan fungsi ini di dalam AuthProvider
    const setPassword = async ({ email, password }) => {
        try {
            const response = await api.post('/set-password', { email, password });
            return {
                success: true,
                message: response.data?.message || 'Password berhasil disimpan!',
                nik: response.data?.nik,
            };
        } catch (error) {
            console.error('Set password error:', error.response?.data);
            return {
                success: false,
                message: error.response?.data?.message || 'Gagal menyimpan password',
                errors: error.response?.data?.errors,
            };
        }
    };

    const forgotPassword = async (email) => {
        try {
            const response = await api.post('/forgot-password', { email });
            return {
                success: true,
                message: response.data?.message || 'Link reset password sudah dikirim ke email.',
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Email tidak ditemukan.',
            };
        }
    };

    const setNewPassword = async ({ token, password }) => {
        try {
            const response = await api.post('/set-new-password', { token, password });
            return {
                success: true,
                message: response.data?.message || 'Password berhasil diubah',
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Gagal mengubah password',
            };
        }
    };

    const changePassword = async ({ old_password, password, password_confirmation }) => {
        try {
            const response = await api.post('/auth/change-password', {
                old_password,
                password,
                password_confirmation,
            });
            return {
                success: true,
                message: response.data?.message || 'Password berhasil diubah',
            };
        } catch (error) {
            console.error('Change password error:', error.response?.data);
            return {
                success: false,
                message: error.response?.data?.message || 'Gagal mengubah password',
                errors: error.response?.data?.errors,
            };
        }
    };



    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch({ type: 'LOGOUT' });
    };
    return (
        <AuthContext.Provider
            value={{
                ...state,
                login,
                checkNik,
                register,
                logout,
                setPassword,
                forgotPassword,
                setNewPassword,
                changePassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
