<?php

namespace Database\Seeders;

use App\Models\Store;
use App\Models\Employee;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;

class EmployeeSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();

        // Nonaktifkan FK constraints sementara
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Hapus data schedules dan data lain yg tergantung employee
        DB::table('schedules')->delete();
        DB::table('notifications')->delete(); // Hapus juga tabel yg ada FK ke employees

        // Hapus data employee dengan delete, bukan truncate
        Employee::query()->delete();

        // Aktifkan FK constraints lagi
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Lanjut ke insert data employee
        $stores = Store::all();

        if ($stores->isEmpty()) {
            $this->command->error("Tidak ada data store ditemukan.");
            return;
        }

        $employeesToInsert = [];
        $adminCreated = false;

        foreach ($stores as $store) {
            $maleCount = 0;
            $femaleCount = 0;

            // Buat 1 admin sekali saja, status aktif
            if (!$adminCreated) {
                $employeesToInsert[] = [
                    'nik' => 'ADMIN' . $store->id,
                    'name' => 'Admin Store ' . $store->store_code,
                    'email' => 'admin' . $store->id . '@store.com',
                    'gender' => 'male',
                    'phone' => $faker->phoneNumber,
                    'store_id' => $store->id,
                    'password' => Hash::make('admin123'),
                    'role' => 'admin',
                    'status' => 'active',  // admin aktif
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                $adminCreated = true;
            }

            // 1 COS (male), status inactive
            $employeesToInsert[] = [
                'nik' => 'COS' . $store->id . 'M',
                'name' => 'COS Male Store ' . $store->store_code,
                'email' => 'cos' . $store->id . 'm@store.com',
                'gender' => 'male',
                'phone' => $faker->phoneNumber,
                'store_id' => $store->id,
                'password' => Hash::make('password123'),
                'role' => 'cos',
                'status' => 'inactive',  // inactive
                'created_at' => now(),
                'updated_at' => now(),
            ];
            $maleCount++;

            // 1 ACOS (female), status inactive
            $employeesToInsert[] = [
                'nik' => 'ACOS' . $store->id . 'F',
                'name' => 'ACOS Female Store ' . $store->store_code,
                'email' => 'acos' . $store->id . 'f@store.com',
                'gender' => 'female',
                'phone' => $faker->phoneNumber,
                'store_id' => $store->id,
                'password' => Hash::make('password123'),
                'role' => 'acos',
                'status' => 'inactive',  // inactive
                'created_at' => now(),
                'updated_at' => now(),
            ];
            $femaleCount++;

            // Sisanya employee biasa, status inactive
            for ($i = $maleCount; $i < 5; $i++) {
                $employeesToInsert[] = [
                    'nik' => 'EMP' . $store->id . 'M' . $i,
                    'name' => 'Employee Male ' . ($i + 1) . ' Store ' . $store->store_code,
                    'email' => 'employee' . $store->id . 'm' . $i . '@store.com',
                    'gender' => 'male',
                    'phone' => $faker->phoneNumber,
                    'store_id' => $store->id,
                    'password' => Hash::make('password123'),
                    'role' => 'employee',
                    'status' => 'inactive',  // inactive
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            for ($j = $femaleCount; $j < 5; $j++) {
                $employeesToInsert[] = [
                    'nik' => 'EMP' . $store->id . 'F' . $j,
                    'name' => 'Employee Female ' . ($j + 1) . ' Store ' . $store->store_code,
                    'email' => 'employee' . $store->id . 'f' . $j . '@store.com',
                    'gender' => 'female',
                    'phone' => $faker->phoneNumber,
                    'store_id' => $store->id,
                    'password' => Hash::make('password123'),
                    'role' => 'employee',
                    'status' => 'inactive',  // inactive
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        Employee::insert($employeesToInsert);

        $this->command->info('Seeder Employee selesai: 10 karyawan per store, status awal inactive kecuali admin.');
    }
}
