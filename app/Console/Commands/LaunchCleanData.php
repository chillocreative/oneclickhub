<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

/**
 * Pre-launch data wipe.
 *
 *  php artisan launch:clean-data --confirm
 *
 * Truncates all transactional tables created during testing while leaving
 * configuration intact: users, roles, subscription_plans, payment_gateways,
 * banking_detail, ssm_verifications, fcm_tokens, admin_settings, app
 * settings — all preserved.
 *
 * Tables wiped (in dependency order):
 *   - chat_messages
 *   - chat_conversations
 *   - reviews
 *   - transactions
 *   - orders               (a.k.a. bookings)
 *   - madani_applications
 *   - freelancer_availabilities
 *   - services
 *   - push_notifications
 *
 * Optionally clears uploaded media for those records when --files is passed.
 */
class LaunchCleanData extends Command
{
    protected $signature = 'launch:clean-data
                            {--confirm : Required to actually run. Without it, prints the plan only.}
                            {--files : Also wipe matching files in storage/app/public}';

    protected $description = 'Clear test data before public launch (services, reviews, chats, orders, transactions, push history, …).';

    /**
     * Order matters — children first, parents last, even with FK checks
     * disabled, so the autoincrement reset is clean.
     */
    private array $tables = [
        'chat_messages',
        'chat_conversations',
        'reviews',
        'transactions',
        'orders',
        'madani_applications',
        'freelancer_availabilities',
        'services',
        'push_notifications',
    ];

    private array $storageDirs = [
        'services',
        'payment-slips',
        'chat-attachments',
    ];

    public function handle(): int
    {
        $this->warn("Pre-launch data wipe — production DB.");
        $this->newLine();

        $counts = [];
        foreach ($this->tables as $table) {
            $counts[$table] = Schema::hasTable($table) ? DB::table($table)->count() : 0;
        }

        $this->table(
            ['Table', 'Rows'],
            collect($counts)->map(fn ($c, $t) => [$t, $c])->values()->all(),
        );

        if (!$this->option('confirm')) {
            $this->newLine();
            $this->info("Dry run. Re-run with --confirm to actually truncate.");
            $this->info("Add --files to also wipe storage/app/public/{services,payment-slips,chat-attachments}.");
            return self::SUCCESS;
        }

        $this->newLine();
        $this->warn("Wiping rows…");
        DB::transaction(function () {
            Schema::disableForeignKeyConstraints();
            try {
                foreach ($this->tables as $table) {
                    if (Schema::hasTable($table)) {
                        DB::table($table)->truncate();
                        $this->line("  ✓ {$table}");
                    }
                }
            } finally {
                Schema::enableForeignKeyConstraints();
            }
        });

        if ($this->option('files')) {
            $this->newLine();
            $this->warn("Wiping uploaded files…");
            foreach ($this->storageDirs as $dir) {
                if (Storage::disk('public')->exists($dir)) {
                    Storage::disk('public')->deleteDirectory($dir);
                    Storage::disk('public')->makeDirectory($dir);
                    $this->line("  ✓ storage/app/public/{$dir}");
                }
            }
        } else {
            $this->newLine();
            $this->comment("Skipped uploaded media (pass --files to also wipe storage/app/public/services, payment-slips, chat-attachments).");
        }

        $this->newLine();
        $this->info("Done. The app is ready for launch.");

        return self::SUCCESS;
    }
}
