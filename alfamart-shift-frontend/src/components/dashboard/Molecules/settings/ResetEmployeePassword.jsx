import { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import Swal from 'sweetalert2';

const ResetEmployeePassword = () => {
    const { resetEmployeePassword } = useSettings();
    const [employeeId, setEmployeeId] = useState('');

    const handleReset = async () => {
        if (!employeeId) {
            Swal.fire('Error', 'ID Karyawan harus diisi!', 'error');
            return;
        }

        const confirm = await Swal.fire({
            title: 'Apakah Anda yakin?',
            text: 'Password karyawan akan di-reset!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, reset!',
            cancelButtonText: 'Batal',
        });

        if (confirm.isConfirmed) {
            try {
                await resetEmployeePassword(employeeId);
                Swal.fire('Berhasil', 'Password berhasil di-reset.', 'success');
                setEmployeeId('');
            } catch (error) {
                Swal.fire('Gagal', 'Terjadi kesalahan saat reset password.', 'error');
            }
        }
    };

    return (
        <div>
            <input
                className="input"
                placeholder="ID Karyawan"
                value={employeeId}
                onChange={e => setEmployeeId(e.target.value)}
            />
            <button className="btn mt-2" onClick={handleReset}>
                Reset Password
            </button>
        </div>
    );
};

export default ResetEmployeePassword
