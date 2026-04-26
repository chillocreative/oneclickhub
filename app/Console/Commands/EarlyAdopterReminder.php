<?php

namespace App\Console\Commands;

use App\Models\Subscription;
use App\Services\FcmService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

/**
 * Daily check for early-adopter trials nearing expiry.
 *
 *  php artisan early-adopter:remind             # actually sends pushes
 *  php artisan early-adopter:remind --dry-run   # log targets only
 *
 * Sends two milestone pushes during the 90-day trial:
 *   - 30 days remaining: founding-member rate CTA
 *   - 10 days remaining: urgency reminder
 *
 * Schedule daily at 09:00 MYT in routes/console.php.
 */
class EarlyAdopterReminder extends Command
{
    protected $signature = 'early-adopter:remind {--dry-run : Print targets without sending pushes}';

    protected $description = 'Send Day-30 / Day-10 founding-member nudges to active early-adopter subscriptions.';

    public function handle(FcmService $fcm): int
    {
        $dry = $this->option('dry-run');
        $today = Carbon::today();

        // We treat 'days remaining' inclusively against ends_at at midnight.
        $thirtyDaysOut = $today->copy()->addDays(30);
        $tenDaysOut = $today->copy()->addDays(10);

        $milestones = [
            [
                'label' => 'Day-30',
                'date' => $thirtyDaysOut,
                'title' => '30 days of free Starter Hub left',
                'body' => 'Lock in our Founding Member rate (RM 99/yr) before your trial ends.',
            ],
            [
                'label' => 'Day-10',
                'date' => $tenDaysOut,
                'title' => 'Trial ending in 10 days',
                'body' => 'Subscribe now to keep your service listings live.',
            ],
        ];

        $totalSent = 0;

        foreach ($milestones as $m) {
            $subscriptions = Subscription::query()
                ->where('grant_type', 'early_adopter')
                ->whereIn('status', [Subscription::STATUS_ACTIVE, Subscription::STATUS_CANCELLED])
                ->whereDate('ends_at', $m['date']->toDateString())
                ->with('user')
                ->get();

            $this->info("[{$m['label']}] {$subscriptions->count()} subscription(s) ending {$m['date']->toDateString()}");

            foreach ($subscriptions as $sub) {
                $userId = $sub->user_id;
                $name = $sub->user?->name ?? 'unknown';

                if ($dry) {
                    $this->line("  · would notify user #{$userId} ({$name})");
                    continue;
                }

                try {
                    $sent = $fcm->sendToUser(
                        $userId,
                        $m['title'],
                        $m['body'],
                        [
                            'type' => 'subscription',
                            'event' => 'early_adopter.reminder.' . strtolower($m['label']),
                        ],
                    );
                    $totalSent += $sent;
                    $this->line("  ✓ user #{$userId} ({$name}) — {$sent} device(s)");
                } catch (\Throwable $e) {
                    $this->warn("  ✗ user #{$userId} ({$name}): {$e->getMessage()}");
                }
            }
        }

        $this->newLine();
        if ($dry) {
            $this->comment('Dry run complete. Re-run without --dry-run to actually send.');
        } else {
            $this->info("Done. Total devices reached: {$totalSent}.");
        }

        return self::SUCCESS;
    }
}
