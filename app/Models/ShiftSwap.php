<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ShiftSwap extends Model
{
    use HasFactory;

    protected $fillable = [
        'store_id',
        'requester_id',
        'partner_id',
        'date',
        'requester_shift_id',
        'partner_shift_id',
        'status',
        'approved_by'
    ];

    protected $casts = [
        'date' => 'date',
    ];

    protected $attributes = [
        'status' => 'pending',
    ];

    public function requester()
    {
        return $this->belongsTo(Employee::class,'requester_id');
    }

    public function partner()
    {
        return $this->belongsTo(Employee::class,'partner_id');
    }

    public function approvedBy()
    {
        return $this->belongsTo(Employee::class,'approved_by');
    }
}


