<?php

namespace Database\Seeders;

use App\Models\Store;
use Illuminate\Database\Seeder;

class StoreSeeder extends Seeder
{
    public function run()
    {
        $stores = [
            // 24 Jam
            [
                'store_code' => 'H918',
                'store_name' => 'Erlangga Timur',
                'store_type' => '24h',
                'address' => 'Jl. Erlangga Timur No. 123, Semarang',
                'phone' => '024-1234567',
                'off_days_per_month' => 5,
                'whatsapp_number' => '628123456789'
            ],
            [
                'store_code' => 'H926',
                'store_name' => 'Ki Mangunsarkoro',
                'store_type' => '24h',
                'address' => 'Jl. Ki Mangunsarkoro, Semarang',
                'phone' => '024-1111111',
                'off_days_per_month' => 5,
                'whatsapp_number' => '628111111111'
            ],
            [
                'store_code' => 'H923',
                'store_name' => 'Kelud Raya',
                'store_type' => '24h',
                'address' => 'Jl. Kelud Raya, Semarang',
                'phone' => '024-2222222',
                'off_days_per_month' => 5,
                'whatsapp_number' => '628222222222'
            ],
            [
                'store_code' => 'H929',
                'store_name' => 'Pemuda Baru',
                'store_type' => '24h',
                'address' => 'Jl. Pemuda Baru, Semarang',
                'phone' => '024-3333333',
                'off_days_per_month' => 5,
                'whatsapp_number' => '628333333333'
            ],
            [
                'store_code' => 'H932',
                'store_name' => 'Dr Kariadi',
                'store_type' => '24h',
                'address' => 'Jl. Dr Kariadi, Semarang',
                'phone' => '024-4444444',
                'off_days_per_month' => 5,
                'whatsapp_number' => '628444444444'
            ],
            // Reguler
            [
                'store_code' => 'H919',
                'store_name' => 'Senjoyo',
                'store_type' => 'normal',
                'address' => 'Jl. Senjoyo, Semarang',
                'phone' => '024-5555555',
                'off_days_per_month' => 5,
                'whatsapp_number' => '628555555555'
            ],
            [
                'store_code' => 'H920',
                'store_name' => 'Jagalan',
                'store_type' => 'normal',
                'address' => 'Jl. Jagalan, Semarang',
                'phone' => '024-6666666',
                'off_days_per_month' => 5,
                'whatsapp_number' => '628666666666'
            ],
            [
                'store_code' => 'H921',
                'store_name' => 'Krakatau',
                'store_type' => 'normal',
                'address' => 'Jl. Krakatau, Semarang',
                'phone' => '024-7777777',
                'off_days_per_month' => 5,
                'whatsapp_number' => '628777777777'
            ],
            [
                'store_code' => 'H922',
                'store_name' => 'Batan Selatan',
                'store_type' => 'normal',
                'address' => 'Jl. Batan Selatan, Semarang',
                'phone' => '024-8888888',
                'off_days_per_month' => 5,
                'whatsapp_number' => '628888888888'
            ],
            [
                'store_code' => 'H924',
                'store_name' => 'Brumbungan',
                'store_type' => 'normal',
                'address' => 'Jl. Brumbungan, Semarang',
                'phone' => '024-9999999',
                'off_days_per_month' => 5,
                'whatsapp_number' => '628999999999'
            ],
            [
                'store_code' => 'H925',
                'store_name' => 'Rejosari',
                'store_type' => 'normal',
                'address' => 'Jl. Rejosari, Semarang',
                'phone' => '024-1010101',
                'off_days_per_month' => 5,
                'whatsapp_number' => '628101010101'
            ],
            [
                'store_code' => 'H927',
                'store_name' => 'Tumpang',
                'store_type' => 'normal',
                'address' => 'Jl. Tumpang, Semarang',
                'phone' => '024-1212121',
                'off_days_per_month' => 5,
                'whatsapp_number' => '628121212121'
            ],
            [
                'store_code' => 'H928',
                'store_name' => 'Halmahera',
                'store_type' => 'normal',
                'address' => 'Jl. Halmahera, Semarang',
                'phone' => '024-1313131',
                'off_days_per_month' => 5,
                'whatsapp_number' => '628131313131'
            ],
            [
                'store_code' => 'H930',
                'store_name' => 'Karanganyar',
                'store_type' => 'normal',
                'address' => 'Jl. Karanganyar, Semarang',
                'phone' => '024-1414141',
                'off_days_per_month' => 5,
                'whatsapp_number' => '628141414141'
            ],
            [
                'store_code' => 'H931',
                'store_name' => 'MT Haryono',
                'store_type' => 'normal',
                'address' => 'Jl. MT Haryono, Semarang',
                'phone' => '024-1515151',
                'off_days_per_month' => 5,
                'whatsapp_number' => '628151515151'
            ],
            [
                'store_code' => 'H933',
                'store_name' => 'MT Haryono',
                'store_type' => 'normal',
                'address' => 'Jl. MT Haryono, Semarang',
                'phone' => '024-1616161',
                'off_days_per_month' => 5,
                'whatsapp_number' => '628161616161'
            ],
        ];

        foreach ($stores as $store) {
            Store::updateOrCreate(
                ['store_code' => $store['store_code']],
                $store
            );
        }
    }
}
