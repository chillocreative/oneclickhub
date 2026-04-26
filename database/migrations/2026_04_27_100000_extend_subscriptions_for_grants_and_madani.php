<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            if (!Schema::hasColumn('subscriptions', 'grant_type')) {
                $table->string('grant_type', 32)->default('payment')->after('amount_paid');
            }
            if (!Schema::hasColumn('subscriptions', 'granted_by_user_id')) {
                $table->foreignId('granted_by_user_id')
                    ->nullable()
                    ->after('grant_type')
                    ->constrained('users')
                    ->nullOnDelete();
            }
        });

        Schema::table('subscription_plans', function (Blueprint $table) {
            if (!Schema::hasColumn('subscription_plans', 'requires_approval')) {
                $table->boolean('requires_approval')->default(false)->after('is_popular');
            }
            if (!Schema::hasColumn('subscription_plans', 'sponsored_by')) {
                $table->string('sponsored_by')->nullable()->after('requires_approval');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'must_change_password')) {
                $table->boolean('must_change_password')->default(false)->after('password');
            }
            if (!Schema::hasColumn('users', 'address')) {
                $table->text('address')->nullable()->after('phone_number');
            }
        });
    }

    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            if (Schema::hasColumn('subscriptions', 'granted_by_user_id')) {
                $table->dropConstrainedForeignId('granted_by_user_id');
            }
            if (Schema::hasColumn('subscriptions', 'grant_type')) {
                $table->dropColumn('grant_type');
            }
        });

        Schema::table('subscription_plans', function (Blueprint $table) {
            $table->dropColumn(['requires_approval', 'sponsored_by']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['must_change_password', 'address']);
        });
    }
};
