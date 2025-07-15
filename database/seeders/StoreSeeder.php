<?php

namespace Database\Seeders;

use App\Models\Store;
use Illuminate\Database\Seeder;

class StoreSeeder extends Seeder
{
    public function run()
    {
        $stores = [
            [
                'store_code' => 'H918',
                'store_name' => 'Alfamart Erlangga Timur',
                'store_type' => '24h',
                'address' => 'Jl. Erlangga Timur No. 123, Semarang',
                'phone' => '024-1234567',
                'off_days_per_month' => 5,
                'whatsapp_number' => '628123456789'
            ],
            [
                'store_code' => 'H919',
                'store_name' => 'Alfamart Erlangga Barat',
                'store_type' => 'normal',
                'address' => 'Jl. Erlangga Barat No. 456, Semarang',
                'phone' => '024-7654321',
                'off_days_per_month' => 5,
                'whatsapp_number' => '628987654321'
            ]
        ];

        foreach ($stores as $store) {
            Store::create($store);
        }
    }
}