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

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('schedules')->delete();
        DB::table('notifications')->delete();
        Employee::query()->delete();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $stores = Store::all();

        if ($stores->isEmpty()) {
            $this->command->error("Tidak ada data store ditemukan.");
            return;
        }

        $employeesToInsert = [];
        $adminCreated = false;

        foreach ($stores as $store) {
            $storeIs24Hours = $store->store_type === '24jam'; // pastikan kolom ini ada

            $totalEmployees = $storeIs24Hours ? 10 : 6;
            $numMale = $storeIs24Hours ? 8 : 3; // default laki-laki
            $numFemale = $storeIs24Hours ? 2 : ($totalEmployees - $numMale);

            // Admin sekali saja
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
                    'status' => 'active',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                $adminCreated = true;
            }

            // Acak gender untuk COS dan ACOS
            $cosGender = $faker->randomElement(['male', 'female']);
            $acosGender = $cosGender === 'male' ? 'female' : 'male';
            $numMale -= $cosGender === 'male' ? 1 : 0;
            $numFemale -= $cosGender === 'female' ? 1 : 0;

            // COS
            $employeesToInsert[] = [
                'nik' => 'COS' . $store->id,
                'name' => 'COS Store ' . $store->store_code,
                'email' => 'cos' . $store->id . '@store.com',
                'gender' => $cosGender,
                'phone' => $faker->phoneNumber,
                'store_id' => $store->id,
                'password' => Hash::make('password123'),
                'role' => 'cos',
                'status' => 'inactive',
                'created_at' => now(),
                'updated_at' => now(),
            ];

            // ACOS
            $employeesToInsert[] = [
                'nik' => 'ACOS' . $store->id,
                'name' => 'ACOS Store ' . $store->store_code,
                'email' => 'acos' . $store->id . '@store.com',
                'gender' => $acosGender,
                'phone' => $faker->phoneNumber,
                'store_id' => $store->id,
                'password' => Hash::make('password123'),
                'role' => 'acos',
                'status' => 'inactive',
                'created_at' => now(),
                'updated_at' => now(),
            ];

            // Sisa karyawan biasa
            for ($i = 0; $i < $numMale; $i++) {
                $employeesToInsert[] = [
                    'nik' => 'EMP' . $store->id . 'M' . $i,
                    'name' => 'Employee Male ' . ($i + 1) . ' Store ' . $store->store_code,
                    'email' => 'employee' . $store->id . 'm' . $i . '@store.com',
                    'gender' => 'male',
                    'phone' => $faker->phoneNumber,
                    'store_id' => $store->id,
                    'password' => Hash::make('password123'),
                    'role' => 'employee',
                    'status' => 'inactive',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            for ($j = 0; $j < $numFemale; $j++) {
                $employeesToInsert[] = [
                    'nik' => 'EMP' . $store->id . 'F' . $j,
                    'name' => 'Employee Female ' . ($j + 1) . ' Store ' . $store->store_code,
                    'email' => 'employee' . $store->id . 'f' . $j . '@store.com',
                    'gender' => 'female',
                    'phone' => $faker->phoneNumber,
                    'store_id' => $store->id,
                    'password' => Hash::make('password123'),
                    'role' => 'employee',
                    'status' => 'inactive',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        Employee::insert($employeesToInsert);

        $this->command->info('Seeder Employee selesai: sesuai dengan aturan toko 24 jam dan reguler.');
    }
}
