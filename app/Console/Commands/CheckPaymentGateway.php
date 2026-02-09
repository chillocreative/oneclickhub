<?php

namespace App\Console\Commands;

use App\Models\PaymentGateway;
use App\Services\BayarcashService;
use Illuminate\Console\Command;

class CheckPaymentGateway extends Command
{
    protected $signature = 'payment:check {gateway=bayarcash}';
    protected $description = 'Check payment gateway configuration';

    public function handle()
    {
        $gatewaySlug = $this->argument('gateway');
        $gateway = PaymentGateway::where('slug', $gatewaySlug)->first();

        if (!$gateway) {
            $this->error("Gateway '{$gatewaySlug}' not found in database.");
            return 1;
        }

        $this->info("=== {$gateway->name} Configuration ===");
        $this->line("Status: " . ($gateway->is_active ? 'ENABLED' : 'DISABLED'));
        $this->line("Mode: " . strtoupper($gateway->mode));
        $this->newLine();

        $settings = $gateway->settings ?? [];

        $this->info("Configuration Keys:");
        $requiredKeys = ['personal_access_token', 'portal_key', 'api_secret_key'];

        foreach ($requiredKeys as $key) {
            $value = $settings[$key] ?? null;
            $status = !empty($value) ? '✓ SET' : '✗ MISSING';
            $this->line("  {$key}: {$status}");
            if (!empty($value)) {
                $masked = substr($value, 0, 4) . '****' . substr($value, -4);
                $this->line("    Value: {$masked}");
            }
        }

        $this->newLine();

        if ($gatewaySlug === 'bayarcash') {
            $bayarcash = new BayarcashService();
            $isAvailable = $bayarcash->isAvailable();

            if ($isAvailable) {
                $this->info("✓ Bayarcash is properly configured and ready!");
            } else {
                $this->error("✗ Bayarcash is NOT properly configured.");
                $this->warn("Please ensure:");
                $this->line("  1. Gateway is ENABLED");
                $this->line("  2. Personal Access Token is set");
                $this->line("  3. Portal Key is set");
            }
        }

        return 0;
    }
}
