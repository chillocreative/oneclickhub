<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscription_plans', function (Blueprint $table) {
            if (!Schema::hasColumn('subscription_plans', 'max_services')) {
                $table->integer('max_services')->nullable()->after('features');
            }
            if (!Schema::hasColumn('subscription_plans', 'max_categories')) {
                $table->integer('max_categories')->nullable()->after('max_services');
            }
        });
    }

    public function down(): void
    {
        Schema::table('subscription_plans', function (Blueprint $table) {
            if (Schema::hasColumn('subscription_plans', 'max_services')) {
                $table->dropColumn('max_services');
            }
            if (Schema::hasColumn('subscription_plans', 'max_categories')) {
                $table->dropColumn('max_categories');
            }
        });
    }
};
