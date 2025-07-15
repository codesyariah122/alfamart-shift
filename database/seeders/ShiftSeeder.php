<?php

namespace Database\Seeders;

use App\Models\Shift;
use Illuminate\Database\Seeder;

class ShiftSeeder extends Seeder
{
    public function run()
    {
        $shifts = [
            [
                'shift_code' => 'P',
                'shift_name' => 'Pagi (07:00-15:00)',
                'start_time' => '07:00',
                'end_time' => '15:00',
                'gender_restriction' => 'none'
            ],
            [
                'shift_code' => 'S',
                'shift_name' => 'Siang (15:00-23:00)',
                'start_time' => '15:00',
                'end_time' => '23:00',
                'gender_restriction' => 'none'
            ],
            [
                'shift_code' => 'M',
                'shift_name' => 'Malam (23:00-07:00)',
                'start_time' => '23:00',
                'end_time' => '07:00',
                'gender_restriction' => 'male_only'
            ],
            [
                'shift_code' => 'O',
                'shift_name' => 'Libur',
                'start_time' => '00:00',
                'end_time' => '00:00',
                'gender_restriction' => 'none'
            ]
        ];

        foreach ($shifts as $shift) {
            Shift::create($shift);
        }
    }
}