<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSchedulesTable extends Migration
{
    public function up()
    {
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('employee_id');
            $table->unsignedBigInteger('shift_id');
            $table->date('schedule_date');
            $table->integer('month');
            $table->integer('year');
            $table->enum('generation_type', ['auto', 'manual', 'hybrid']);
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'confirmed', 'completed'])->default('pending');
            $table->timestamps();

            $table->foreign('employee_id')->references('id')->on('employees');
            $table->foreign('shift_id')->references('id')->on('shifts');
            $table->unique(['employee_id', 'schedule_date']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('schedules');
    }
}