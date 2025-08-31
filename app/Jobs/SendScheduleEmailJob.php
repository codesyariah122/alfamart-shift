<?php

namespace App\Jobs;

use App\Mail\ScheduleGeneratedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendScheduleEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $employee, $schedules, $createdBy, $month, $year;

    public function __construct($employee, $schedules, $createdBy, $month, $year)
    {
        $this->employee = $employee;
        $this->schedules = $schedules;
        $this->createdBy = $createdBy;
        $this->month = $month;
        $this->year = $year;
    }

    public function handle()
    {
        Mail::to($this->employee->email)->send(new ScheduleGeneratedMail(
            $this->employee,
            $this->schedules,
            $this->createdBy,
            $this->month,
            $this->year
        ));
    }
}
