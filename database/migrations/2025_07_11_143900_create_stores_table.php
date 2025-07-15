<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStoresTable extends Migration
{
    public function up()
    {
        Schema::create('stores', function (Blueprint $table) {
            $table->id();
            $table->string('store_code')->unique();
            $table->string('store_name');
            $table->enum('store_type', ['24h', 'normal'])->default('normal');
            $table->string('address');
            $table->string('phone')->nullable();
            $table->integer('off_days_per_month')->default(5);
            $table->string('whatsapp_number')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('stores');
    }
}