<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('schedules', function (Blueprint $table) {
            $table->unsignedBigInteger('store_id')->after('id')->nullable(); // atau hilangkan nullable jika wajib
            $table->foreign('store_id')->references('id')->on('stores')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('schedules', function (Blueprint $table) {
            $table->dropForeign(['store_id']);
            $table->dropColumn('store_id');
        });
    }
};
