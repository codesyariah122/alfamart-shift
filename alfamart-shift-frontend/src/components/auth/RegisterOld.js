import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Register = ({ onSwitchToLogin }) => {
    const { register: registerUser, loading } = useAuth();
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError, // ← Tambah ini untuk set error manual
        clearErrors, // ← Tambah ini untuk clear error
    } = useForm();

    const onSubmit = async (data) => {
        // Clear previous errors
        clearErrors();

        const result = await registerUser(data);

        if (!result.success) {
            // Handle general error
            toast.error(result.message);

            // Handle specific field errors
            if (result.errors) {
                Object.keys(result.errors).forEach(field => {
                    const errorMessage = result.errors[field][0]; // Ambil error pertama

                    // Set error di form untuk field yang bermasalah
                    setError(field, {
                        type: 'server',
                        message: errorMessage
                    });

                    // Tampilkan toast untuk error yang umum
                    if (field === 'nik') {
                        toast.error(`NIK: ${errorMessage}`);
                    } else if (field === 'email') {
                        toast.error(`Email: ${errorMessage}`);
                    } else if (field === 'store_code') {
                        toast.error(`Kode Toko: ${errorMessage}`);
                    }
                });
            }
        } else {
            toast.success('Registrasi berhasil!');
            onSwitchToLogin(); // Redirect ke login setelah berhasil
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md mx-auto"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Lengkap
                    </label>
                    <input
                        type="text"
                        {...register('name', { required: 'Nama harus diisi' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Masukkan nama lengkap"
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                </div>

                {/* Email Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        {...register('email', {
                            required: 'Email harus diisi',
                            pattern: {
                                value: /^\S+@\S+$/i,
                                message: 'Format email tidak valid'
                            }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Masukkan email"
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                </div>

                {/* NIK Field */}
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

                {/* Store Code Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kode Toko
                    </label>
                    <input
                        type="text"
                        {...register('store_code', { required: 'Kode toko harus diisi' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Masukkan kode toko (contoh: H918)"
                    />
                    {errors.store_code && (
                        <p className="mt-1 text-sm text-red-600">{errors.store_code.message}</p>
                    )}
                </div>

                {/* Gender Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jenis Kelamin
                    </label>
                    <select
                        {...register('gender', { required: 'Jenis kelamin harus dipilih' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Pilih jenis kelamin</option>
                        <option value="male">Laki-laki</option>
                        <option value="female">Perempuan</option>
                    </select>
                    {errors.gender && (
                        <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                    )}
                </div>

                {/* Phone Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        No. Telepon
                    </label>
                    <input
                        type="tel"
                        {...register('phone')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Masukkan no. telepon (opsional)"
                    />
                    {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                </div>

                {/* Password Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        {...register('password', {
                            required: 'Password harus diisi',
                            minLength: {
                                value: 6,
                                message: 'Password minimal 6 karakter'
                            }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Masukkan password"
                    />
                    {errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                    )}
                </div>

                {/* Password Confirmation Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Konfirmasi Password
                    </label>
                    <input
                        type="password"
                        {...register('password_confirmation', {
                            required: 'Konfirmasi password harus diisi'
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ulangi password"
                    />
                    {errors.password_confirmation && (
                        <p className="mt-1 text-sm text-red-600">{errors.password_confirmation.message}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                    {loading ? 'Loading...' : 'Daftar'}
                </button>

                <div className="text-center">
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="text-sm text-blue-600 hover:text-blue-500"
                    >
                        Sudah punya akun? Login disini
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default Register;
