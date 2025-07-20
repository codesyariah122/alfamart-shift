import { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import Swal from 'sweetalert2';

const ChangePassword = () => {
    const { changePassword } = useSettings();
    const [password, setPassword] = useState('');

    const handleChangePassword = async () => {
        if (!password) {
            Swal.fire('Error', 'Password tidak boleh kosong.', 'error');
            return;
        }

        try {
            await changePassword({ password });
            Swal.fire('Berhasil', 'Password berhasil diganti.', 'success');
            setPassword('');
        } catch (error) {
            Swal.fire('Gagal', 'Terjadi kesalahan saat mengganti password.', 'error');
        }
    };

    return (
        <div>
            <input
                type="password"
                className="input"
                placeholder="Password baru"
                value={password}
                onChange={e => setPassword(e.target.value)}
            />
            <button className="btn mt-2" onClick={handleChangePassword}>
                Ganti Password
            </button>
        </div>
    );
};

export default ChangePassword
