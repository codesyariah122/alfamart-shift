import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const SetNewPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const { setNewPassword } = useAuth(); // pastikan fungsi di context sesuai
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            toast.error('Token tidak ditemukan');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Password dan konfirmasi password tidak cocok');
            return;
        }

        setLoading(true);
        try {
            const res = await setNewPassword({ token, password });
            toast.success(res.message || 'Password berhasil diubah');
            navigate('/'); // redirect ke login/homepage
        } catch (error) {
            toast.error(error.message || 'Gagal mengubah password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6">Set Password Baru</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password baru"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border rounded p-2 pr-10"
                        required
                        minLength={6}
                        disabled={loading}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                        tabIndex={-1}
                    >
                        {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.967 9.967 0 012.175-6.2M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c1.634 0 3.183.525 4.422 1.395M19.542 12c-1.274 4.057-5.065 7-9.542 7a9.967 9.967 0 01-4.422-1.395M15.536 15.536l4.243 4.243" />
                            </svg>
                        )}
                    </button>
                </div>

                <div className="relative">
                    <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Konfirmasi password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full border rounded p-2 pr-10"
                        required
                        minLength={6}
                        disabled={loading}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                        tabIndex={-1}
                    >
                        {showConfirmPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.967 9.967 0 012.175-6.2M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c1.634 0 3.183.525 4.422 1.395M19.542 12c-1.274 4.057-5.065 7-9.542 7a9.967 9.967 0 01-4.422-1.395M15.536 15.536l4.243 4.243" />
                            </svg>
                        )}
                    </button>
                </div>

                <button
                    type="submit"
                    className={`w-full bg-blue-600 text-white p-2 rounded ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                    disabled={loading}
                >
                    {loading ? 'Menyimpan...' : 'Simpan Password'}
                </button>
            </form>
        </div>
    );
};

export default SetNewPassword;
