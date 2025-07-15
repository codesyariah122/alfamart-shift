<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEmployeesTable extends Migration
{
    public function up()
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('nik')->unique();
            $table->string('name');
            $table->string('email')->unique();
            $table->enum('gender', ['male', 'female']);
            $table->string('phone')->nullable();
            $table->unsignedBigInteger('store_id');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('role', ['admin', 'employee'])->default('employee');
            $table->rememberToken();
            $table->timestamps();

            $table->foreign('store_id')->references('id')->on('stores');
        });
    }

    public function down()
    {
        Schema::dropIfExists('employees');
    }
}