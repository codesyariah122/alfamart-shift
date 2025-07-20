<?php

namespace App\Services;

use App\Models\Shift;

class ShiftService
{
    public function all()
    {
        return Shift::all();
    }

    public function store(array $data)
    {
        return Shift::create($data);
    }

    public function update(Shift $shift, array $data)
    {
        $shift->update($data);
        return $shift;
    }
}
