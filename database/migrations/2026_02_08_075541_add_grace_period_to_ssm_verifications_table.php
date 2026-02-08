<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('ssm_verifications', function (Blueprint $table) {
            $table->timestamp('grace_period_ends_at')->nullable()->after('admin_notes');
            $table->timestamp('services_hidden_at')->nullable()->after('grace_period_ends_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ssm_verifications', function (Blueprint $table) {
            $table->dropColumn(['grace_period_ends_at', 'services_hidden_at']);
        });
    }
};
