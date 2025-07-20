<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Employee;
use Illuminate\Support\Collection;

class ScheduleGeneratedMail extends Mailable
{
    use Queueable, SerializesModels;

    public Employee $employee;
    public Collection $schedules;
    public string $createdBy;
    public int $month;
    public int $year;

    public function __construct(Employee $employee, Collection $schedules, string $createdBy, int $month, int $year)
    {
        $this->employee = $employee;
        $this->schedules = $schedules;
        $this->createdBy = $createdBy;
        $this->month = $month;
        $this->year = $year;
    }

    public function build()
    {
        return $this->subject('Jadwal Kerja Bulan ' . now()->monthName)
            ->view('emails.schedule.generated');
    }
}
