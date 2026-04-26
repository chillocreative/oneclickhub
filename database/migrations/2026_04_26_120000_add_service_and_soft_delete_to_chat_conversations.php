<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('chat_conversations', function (Blueprint $table) {
            if (!Schema::hasColumn('chat_conversations', 'service_id')) {
                $table->foreignId('service_id')
                    ->nullable()
                    ->after('order_id')
                    ->constrained('services')
                    ->nullOnDelete();
            }
            if (!Schema::hasColumn('chat_conversations', 'deleted_by_user_one_at')) {
                $table->timestamp('deleted_by_user_one_at')->nullable();
            }
            if (!Schema::hasColumn('chat_conversations', 'deleted_by_user_two_at')) {
                $table->timestamp('deleted_by_user_two_at')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('chat_conversations', function (Blueprint $table) {
            if (Schema::hasColumn('chat_conversations', 'service_id')) {
                $table->dropConstrainedForeignId('service_id');
            }
            if (Schema::hasColumn('chat_conversations', 'deleted_by_user_one_at')) {
                $table->dropColumn('deleted_by_user_one_at');
            }
            if (Schema::hasColumn('chat_conversations', 'deleted_by_user_two_at')) {
                $table->dropColumn('deleted_by_user_two_at');
            }
        });
    }
};
