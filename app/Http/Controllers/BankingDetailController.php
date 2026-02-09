<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class BankingDetailController extends Controller
{
    public function edit()
    {
        return Inertia::render('Settings/BankingDetails', [
            'bankingDetail' => auth()->user()->bankingDetail,
        ]);
    }

    public function ssmCertificate()
    {
        return Inertia::render('Settings/SsmCertificate', [
            'ssmVerification' => auth()->user()->ssmVerification ? array_merge(
                auth()->user()->ssmVerification->toArray(),
                ['grace_days_remaining' => auth()->user()->ssmVerification->gracePeriodDaysRemaining()]
            ) : null,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'bank_name' => 'required|string|max:255',
            'account_number' => 'required|string|max:50',
            'account_holder_name' => 'required|string|max:255',
        ]);

        auth()->user()->bankingDetail()->updateOrCreate(
            ['user_id' => auth()->id()],
            $validated
        );

        return back()->with('success', 'Banking details updated successfully.');
    }
}
