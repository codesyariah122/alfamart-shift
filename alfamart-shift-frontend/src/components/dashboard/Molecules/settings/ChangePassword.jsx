import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Swal from 'sweetalert2';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';

const ChangePassword = () => {
    const { changePassword } = useAuth();
    const [oldPassword, setOldPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChangePassword = async () => {
        if (!oldPassword || !password || !confirmPassword) {
            Swal.fire('Error', 'Semua field harus diisi.', 'error');
            return;
        }

        if (password !== confirmPassword) {
            Swal.fire('Error', 'Konfirmasi password tidak cocok.', 'error');
            return;
        }

        setIsLoading(true);

        const result = await changePassword({
            old_password: oldPassword,
            password,
            password_confirmation: confirmPassword,
        });

        setIsLoading(false);

        if (result.success) {
            Swal.fire('Berhasil', result.message, 'success');
            setOldPassword('');
            setPassword('');
            setConfirmPassword('');
        } else {
            const errorMessage = result.errors?.old_password?.[0]
                || result.errors?.password?.[0]
                || result.message;
            Swal.fire('Gagal', errorMessage, 'error');
        }
    };

    return (
        <div className="max-w-md mx-auto p-4 bg-white shadow rounded">
            <h2 className="text-lg font-semibold mb-4">Ganti Password</h2>

            {/* Old Password */}
            <div className="relative mb-3">
                <input
                    type={showOldPassword ? 'text' : 'password'}
                    className="input w-full pr-10"
                    placeholder="Password lama"
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    disabled={isLoading}
                />
                <span
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                >
                    {showOldPassword ? (
                        <EyeSlashIcon className="w-5 h-5 text-gray-600" />
                    ) : (
                        <EyeIcon className="w-5 h-5 text-gray-600" />
                    )}
                </span>
            </div>

            {/* New Password */}
            <div className="relative mb-3">
                <input
                    type={showPassword ? 'text' : 'password'}
                    className="input w-full pr-10"
                    placeholder="Password baru"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={isLoading}
                />
                <span
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5 text-gray-600" />
                    ) : (
                        <EyeIcon className="w-5 h-5 text-gray-600" />
                    )}
                </span>
            </div>

            {/* Confirm Password */}
            <div className="relative mb-4">
                <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="input w-full pr-10"
                    placeholder="Konfirmasi password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                />
                <span
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                    {showConfirmPassword ? (
                        <EyeSlashIcon className="w-5 h-5 text-gray-600" />
                    ) : (
                        <EyeIcon className="w-5 h-5 text-gray-600" />
                    )}
                </span>
            </div>

            <button
                onClick={handleChangePassword}
                disabled={isLoading}
                className={`w-full font-semibold py-2 px-4 rounded transition-colors duration-200 ${isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
            >
                {isLoading ? 'Memproses...' : 'Ganti Password'}
            </button>
        </div>
    );
};

export default ChangePassword;
