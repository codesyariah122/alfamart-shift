<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Employee extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'store_id',
        'nik',
        'name',
        'email',
        'gender',
        'phone',
        'store_id',
        'status',
        'email_verified_at',
        'activation_token',
        'password',
        'role'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
}
