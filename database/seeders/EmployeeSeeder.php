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
                'nik' => '24021076',
                'name' => 'Ahmad Saputra',
                'email' => 'ahmad@gmail.com',
                'gender' => 'male',
                'phone' => '08123456789',
                'store_id' => $store->id,
                'password' => Hash::make('Bismillah@123'),
                'role' => 'admin'
            ],
            [
                'nik' => '24021077',
                'name' => 'Siti Nurhaliza',
                'email' => 'siti@gmail.com',
                'gender' => 'female',
                'phone' => '08234567890',
                'store_id' => $store->id,
                'password' => Hash::make('password123'),
                'role' => 'employee'
            ],
            [
                'nik' => '24021078',
                'name' => 'Budi Santoso',
                'email' => 'budi@gmail.com',
                'gender' => 'male',
                'phone' => '08345678901',
                'store_id' => $store->id,
                'password' => Hash::make('password123'),
                'role' => 'employee'
            ],
            [
                'nik' => '24021079',
                'name' => 'Joko Widodo',
                'email' => 'joko@gmail.com',
                'gender' => 'male',
                'phone' => '08456789012',
                'store_id' => $store->id,
                'password' => Hash::make('password123'),
                'role' => 'employee'
            ],
            [
                'nik' => '24021080',
                'name' => 'Rudi Hartono',
                'email' => 'rudi@gmail.com',
                'gender' => 'male',
                'phone' => '08567890123',
                'store_id' => $store->id,
                'password' => Hash::make('password123'),
                'role' => 'employee'
            ],
            [
                'nik' => '24021081',
                'name' => 'Agus Salim',
                'email' => 'agus@gmail.com',
                'gender' => 'male',
                'phone' => '08678901234',
                'store_id' => $store->id,
                'password' => Hash::make('password123'),
                'role' => 'employee'
            ],
            [
                'nik' => '24021082',
                'name' => 'Dedi Mulyadi',
                'email' => 'dedi@gmail.com',
                'gender' => 'male',
                'phone' => '08789012345',
                'store_id' => $store->id,
                'password' => Hash::make('password123'),
                'role' => 'employee'
            ],
            [
                'nik' => '24021083',
                'name' => 'Tono Supriyadi',
                'email' => 'tono@gmail.com',
                'gender' => 'male',
                'phone' => '08890123456',
                'store_id' => $store->id,
                'password' => Hash::make('password123'),
                'role' => 'employee'
            ],
            [
                'nik' => '24021084',
                'name' => 'Rahmat Hidayat',
                'email' => 'rahmat@gmail.com',
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
