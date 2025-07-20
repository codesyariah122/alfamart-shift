import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Login from './Login';
import Register from './Register';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
            >
                {/* Left Side - Branding */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center lg:text-left text-white space-y-6"
                >
                    <div className="flex items-center justify-center lg:justify-start gap-4">
                        <div className="w-16 h-16 bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">A</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Alfamart</h1>
                            <p className="text-lg opacity-90">Shift Management System</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-4xl font-bold leading-tight">
                            Kelola Jadwal Shift
                            <br />
                            <span className="text-yellow-300">Dengan Mudah</span>
                        </h2>
                        <p className="text-xl opacity-90 leading-relaxed">
                            Sistem penjadwalan shift karyawan berbasis web yang memudahkan
                            manajer dan karyawan mengakses jadwal secara real-time.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-4">
                            <div className="text-2xl mb-2">🤖</div>
                            <h3 className="font-semibold mb-1">Auto Generate</h3>
                            <p className="opacity-80">Jadwal otomatis berdasarkan aturan</p>
                        </div>
                        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-4">
                            <div className="text-2xl mb-2">📱</div>
                            <h3 className="font-semibold mb-1">Real-time</h3>
                            <p className="opacity-80">Notifikasi WhatsApp instan</p>
                        </div>
                        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-4">
                            <div className="text-2xl mb-2">📊</div>
                            <h3 className="font-semibold mb-1">Export Excel</h3>
                            <p className="opacity-80">Laporan lengkap</p>
                        </div>
                        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-4">
                            <div className="text-2xl mb-2">⚙️</div>
                            <h3 className="font-semibold mb-1">Flexible</h3>
                            <p className="opacity-80">Pengaturan sesuai kebutuhan</p>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side - Auth Form */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white bg-opacity-95 backdrop-blur-lg rounded-3xl p-8 shadow-2xl"
                >
                    <div className="flex justify-center mb-6">
                        <div className="bg-gray-100 rounded-xl p-1 flex">
                            <button
                                onClick={() => setIsLogin(true)}
                                className={`px-6 py-2 rounded-lg transition-all font-medium ${isLogin
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Login
                            </button>
                            <button
                                onClick={() => setIsLogin(false)}
                                className={`px-6 py-2 rounded-lg transition-all font-medium ${!isLogin
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Register
                            </button>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {isLogin ? (
                            <Login key="login" onSwitchToRegister={() => setIsLogin(false)} />
                        ) : (
                            <Register key="register" onSwitchToLogin={() => setIsLogin(true)} />
                        )}
                    </AnimatePresence>
                    {/* Link lupa password */}
                    <div className="text-center text-sm mt-2">
                        <Link to="/forgot-password" className="text-blue-600 hover:underline">
                            Lupa password?
                        </Link>
                    </div>
                </motion.div>
            </motion.div >
        </div >
    );
};

export default AuthPage;
