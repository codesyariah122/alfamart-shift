import {
    ArrowPathIcon,
    KeyIcon,
    ShieldCheckIcon,
    CalendarDaysIcon,
    UsersIcon,
    ChartBarIcon,
    Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { ScheduleGenerator, ScheduleViewer, EmployeeManagement, ReportDashboard } from '@/components/dashboard';
import { SettingsPanel } from '@/components/dashboard'
export const cards = [
    {
        id: 'generate',
        title: 'Generate Jadwal',
        description: 'Buat jadwal shift otomatis atau manual',
        icon: CalendarDaysIcon,
        gradient: 'from-blue-500 to-purple-600',
        component: ScheduleGenerator,
        roles: ['admin', 'cos', 'acos']
    },
    {
        id: 'schedule',
        title: 'Lihat Jadwal',
        description: 'Tampilkan jadwal shift semua karyawan',
        icon: CalendarDaysIcon,
        gradient: 'from-green-500 to-teal-600',
        component: ScheduleViewer,
        roles: ['admin', 'acos', 'cos', 'employee']
    },
    {
        id: 'calendar',
        title: 'Kalender',
        description: 'Lihat jadwal dalam tampilan kalender',
        icon: CalendarDaysIcon,
        gradient: 'from-purple-500 to-pink-600',
        component: null,
        roles: ['admin', 'acos', 'cos', 'employee']
    },
    {
        id: 'employees',
        title: 'Karyawan',
        description: 'Kelola data karyawan',
        icon: UsersIcon,
        gradient: 'from-orange-500 to-red-600',
        component: EmployeeManagement,
        roles: ['admin']
    },
    {
        id: 'reports',
        title: 'Laporan',
        description: 'Lihat laporan dan statistik',
        icon: ChartBarIcon,
        gradient: 'from-yellow-500 to-orange-600',
        component: ReportDashboard,
        roles: ['admin', 'cos', 'acos']
    },
    {
        id: 'settings',
        title: 'Pengaturan',
        description: 'Konfigurasi sistem',
        icon: Cog6ToothIcon,
        gradient: 'from-gray-500 to-gray-700',
        component: SettingsPanel,
        roles: ['admin']
    }
];

export const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const tabs = [
    {
        id: 'store',
        label: 'Pengaturan Toko',
        icon: <Cog6ToothIcon className="w-4 h-4" />,
    },
    {
        id: 'shifts',
        label: 'Daftar Shift',
        icon: <CalendarDaysIcon className="w-4 h-4" />,
    },
    {
        id: 'reset',
        label: 'Reset Jadwal',
        icon: <ArrowPathIcon className="w-4 h-4" />,
    },
    { id: 'change-password', label: 'Ganti Password', icon: <KeyIcon className="h-5 w-5" /> },
    { id: 'reset-password', label: 'Reset Password Karyawan', icon: <ShieldCheckIcon className="h-5 w-5" /> },
];

export const generationOptions = [
    { id: 'auto', title: 'Otomatis', icon: '🤖', description: 'Generate otomatis sesuai aturan' },
    { id: 'manual', title: 'Manual', icon: '✋', description: 'Isi jadwal secara manual' },
    { id: 'hybrid', title: 'Hybrid', icon: '⚖️', description: 'Manual lalu auto-fill' }
];
export const autoSubOptions = [
    { id: 'daily', title: 'Per Hari', description: 'Generate harian' },
    { id: 'weekly', title: 'Per Minggu', description: 'Generate mingguan' },
    { id: 'monthly', title: 'Per Bulan', description: 'Generate bulanan' },
    { id: 'custom', title: 'Custom Range', description: 'Tentukan rentang' }
];

export const generateCalendarHeader = (month, year) => {
    const daysInMonth = new Date(year, month, 0).getDate(); // jumlah hari
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    const result = [];
    for (let date = 1; date <= daysInMonth; date++) {
        const dayIndex = new Date(year, month - 1, date).getDay(); // 0-6
        result.push({
            date,
            day: dayNames[dayIndex],
        });
    }

    return result;
};

export const steps = ['Informasi Pribadi', 'Informasi Toko', 'Keamanan'];
