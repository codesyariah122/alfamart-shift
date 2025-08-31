<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'store_id',
        'employee_id',
        'shift_id',
        'schedule_date',
        'month',
        'year',
        'generation_type',
        'notes',
        'status',
        'created_by',
    ];

    protected $casts = [
        'schedule_date' => 'date',
        'month' => 'integer',
        'year'  => 'integer',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }

    public function creator()
    {
        return $this->belongsTo(Employee::class, 'created_by');
    }
}
