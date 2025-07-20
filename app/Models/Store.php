<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Store extends Model
{
    use HasFactory;

    protected $fillable = [
        'store_code',
        'store_name',
        'store_type',
        'address',
        'phone',
        'off_days_per_month',
        'whatsapp_number'
    ];

    public function employees()
    {
        return $this->hasMany(Employee::class);
    }

    public function getShiftCountAttribute()
    {
        return $this->store_type === '24h' ? 3 : 2;
    }
}
