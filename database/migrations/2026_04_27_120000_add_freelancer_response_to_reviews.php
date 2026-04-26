<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            if (!Schema::hasColumn('reviews', 'freelancer_response')) {
                $table->text('freelancer_response')->nullable()->after('comment');
            }
            if (!Schema::hasColumn('reviews', 'responded_at')) {
                $table->timestamp('responded_at')->nullable()->after('freelancer_response');
            }
        });
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropColumn(['freelancer_response', 'responded_at']);
        });
    }
};
