import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Login = ({ onSwitchToRegister }) => {
    const { login, loading } = useAuth();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        const result = await login(data);
        if (!result.success) {
            toast.error(result.message);
        } else {
            navigate('/dashboard'); // ⬅️ redirect ke dashboard
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md mx-auto"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        NIK
                    </label>
                    <input
                        type="text"
                        {...register('nik', { required: 'NIK harus diisi' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Masukkan NIK"
                    />
                    {errors.nik && (
                        <p className="mt-1 text-sm text-red-600">{errors.nik.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        {...register('password', { required: 'Password harus diisi' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Masukkan Password"
                    />
                    {errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                    {loading ? 'Loading...' : 'Login'}
                </button>

                <div className="text-center">
                    <button
                        type="button"
                        onClick={onSwitchToRegister}
                        className="text-sm text-blue-600 hover:text-blue-500"
                    >
                        Belum punya akun? Daftar disini
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default Login;
