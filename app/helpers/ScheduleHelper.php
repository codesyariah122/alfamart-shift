<?php

namespace App\Helpers;

class ScheduleHelper
{
    public static function makeScheduleRow($emp, $shift, $date, $isCos = false, $isAcos = false)
    {
        return [
            'employee_id' => $emp->id,
            'date' => $date,
            'shift' => $shift,
            'is_cos' => $isCos,
            'is_acos' => $isAcos,
        ];
    }
}
