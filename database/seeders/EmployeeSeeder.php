<?php

namespace Database\Seeders;

use App\Models\Store;
use App\Models\Employee;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class EmployeeSeeder extends Seeder
{
    public function run()
    {
        $store = Store::where('store_code', 'H918')->first();

        if (!$store) {
            $this->command->error("Store dengan kode H918 tidak ditemukan.");
            return;
        }

        // 1. Hapus data schedules terlebih dahulu agar tidak melanggar FK constraint
        DB::table('schedules')->delete();

        // 2. Hapus semua employees yang ada di store tersebut
        Employee::where('store_id', $store->id)->delete();

        // 3. Data baru
        $employees = [
            [
                'nik' => '99999999',
                'name' => 'Admin Alfamart',
                'email' => 'admin@alfamart.com',
                'gender' => 'male',
                'phone' => '0810000000',
                'store_id' => $store->id,
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ],
            [
                'nik' => '16096174',
                'name' => 'Sholihul Hadi',
                'email' => 'sholihulhadi@gmail.com',
                'gender' => 'male',
                'phone' => '08123456789',
                'store_id' => $store->id,
                'password' => Hash::make('password123'),
                'role' => 'cos',
            ],
            [
                'nik' => '18080835',
                'name' => 'Ahmad Widiantor',
                'email' => 'ahmadwidiantor@gmail.com',
                'gender' => 'male',
                'phone' => '0811111112',
                'store_id' => $store->id,
                'password' => Hash::make('password123'),
                'role' => 'acos',
            ],
            [
                'nik' => '22067008',
                'name' => 'Arief Saputro',
                'email' => 'ariefsaputro@gmail.com',
                'gender' => 'male',
                'phone' => '0811111113',
                'store_id' => $store->id,
                'password' => Hash::make('password123'),
                'role' => 'acos',
            ],
            [
                'nik' => '22079237',
                'name' => 'Guntur Adi Saputro',
                'email' => 'gunturadisaputro@gmail.com',
                'gender' => 'male',
                'phone' => '0811111114',
                'store_id' => $store->id,
                'password' => Hash::make('password123'),
                'role' => 'acos',
            ],
            [
                'nik' => '24021076',
                'name' => 'Muhammad Ghozi Taqiuddin',
                'email' => 'muhammadghozitaqiuddin@gmail.com',
                'gender' => 'male',
                'phone' => '0811111115',
                'store_id' => $store->id,
                'password' => Hash::make('password123'),
                'role' => 'employee',
            ],
            [
                'nik' => '23090167',
                'name' => 'Diah Sasi Novitasari',
                'email' => 'diahsasinovitasari@gmail.com',
                'gender' => 'female',
                'phone' => '0811111116',
                'store_id' => $store->id,
                'password' => Hash::make('password123'),
                'role' => 'employee',
            ],
            [
                'nik' => '24054655',
                'name' => 'Bima',
                'email' => 'bima@gmail.com',
                'gender' => 'male',
                'phone' => '0811111117',
                'store_id' => $store->id,
                'password' => Hash::make('password123'),
                'role' => 'employee',
            ],
            [
                'nik' => '24014652',
                'name' => 'Adit',
                'email' => 'adit@gmail.com',
                'gender' => 'male',
                'phone' => '0811111118',
                'store_id' => $store->id,
                'password' => Hash::make('password123'),
                'role' => 'employee',
            ],
            [
                'nik' => '24110167',
                'name' => 'Adi',
                'email' => 'adi@gmail.com',
                'gender' => 'male',
                'phone' => '08901234567',
                'store_id' => $store->id,
                'password' => Hash::make('password123'),
                'role' => 'employee'
            ],
            [
                'nik' => '24021085',
                'name' => 'Dewi Lestari',
                'email' => 'dewi@gmail.com',
                'gender' => 'female',
                'phone' => '08991234567',
                'store_id' => $store->id,
                'password' => Hash::make('password123'),
                'role' => 'employee'
            ],
            [
                'nik' => '24021086',
                'email' => 'cos1@gmail.com',
                'name' => 'Cos Employee',
                'gender' => 'male',
                'phone' => '08123456790',
                'store_id' => 1,
                'password' => Hash::make('password'),
                'role' => 'cos',
            ],
            [
                'nik' => '24021087',
                'email' => 'acos1@gmail.com',
                'name' => 'Acos Employee',
                'gender' => 'female',
                'phone' => '08123456791',
                'store_id' => 1,
                'password' => Hash::make('password'),
                'role' => 'acos',
            ],
        ];

        // 4. Insert ulang tanpa takut duplikat
        Employee::insert($employees);

        $this->command->info('EmployeeSeeder berhasil dijalankan tanpa duplikasi dan tanpa error relasi.');
    }
}
