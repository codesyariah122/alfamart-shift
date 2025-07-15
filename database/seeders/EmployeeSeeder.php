<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Store;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class EmployeeSeeder extends Seeder
{
    public function run()
    {
        $store = Store::where('store_code', 'H918')->first();

        $employees = [
            [
                'nik' => '24021076',
                'name' => 'Ahmad Saputra',
                'email' => 'ahmad@gmail.com',
                'gender' => 'male',
                'phone' => '08123456789',
                'store_id' => $store->id,
                'password' => Hash::make('password123'),
                'role' => 'admin'
            ],
            [
                'nik' => '24021077',
                'name' => 'Siti Nurhaliza',
                'email' => 'siti@gmail.com',
                'gender' => 'female',
                'phone' => '08234567890',
                'store_id' => $store->id,
                'password' => Hash::make('password123')
            ],
            [
                'nik' => '24021078',
                'name' => 'Budi Santoso',
                'email' => 'budi@gmail.com',
                'gender' => 'male',
                'phone' => '08345678901',
                'store_id' => $store->id,
                'password' => Hash::make('password123')
            ]
        ];

        foreach ($employees as $employee) {
            Employee::create($employee);
        }
    }
}