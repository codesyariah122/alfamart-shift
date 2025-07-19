<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        DB::statement("ALTER TABLE schedules MODIFY generation_type ENUM('auto', 'manual', 'hybrid', 'weekly') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL");
    }

    public function down()
    {
        DB::statement("ALTER TABLE schedules MODIFY generation_type ENUM('auto', 'manual', 'hybrid') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL");
    }
};
