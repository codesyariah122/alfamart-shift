<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Shift extends Model
{
    use HasFactory;

    protected $fillable = [
        'shift_code',
        'shift_name',
        'start_time',
        'end_time',
        'gender_restriction'
    ];

    protected $casts = [
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
    ];

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }

    public function canAssignToGender($gender)
    {
        if ($this->gender_restriction === 'none') {
            return true;
        }
        
        if ($this->gender_restriction === 'male_only' && $gender === 'male') {
            return true;
        }
        
        if ($this->gender_restriction === 'female_only' && $gender === 'female') {
            return true;
        }
        
        return false;
    }
}