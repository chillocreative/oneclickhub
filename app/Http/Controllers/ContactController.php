<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use App\Services\AdminWhatsappNotifier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Contact');
    }

    public function store(Request $request, AdminWhatsappNotifier $admin): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone_number' => 'required|string|max:32',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        $contact = ContactMessage::create($validated);

        // Throttled WhatsApp ping to admin so they see new enquiries
        // without flooding the device.
        try {
            $admin->notify(
                "📩 New contact form\n"
                . "Name: {$contact->name}\n"
                . "Phone: {$contact->phone_number}\n"
                . "Email: {$contact->email}\n"
                . "Subject: {$contact->subject}\n\n"
                . Str::limit($contact->message, 200)
            );
        } catch (\Throwable $e) {
            Log::warning('Contact admin WhatsApp notify failed', [
                'error' => $e->getMessage(),
            ]);
        }

        return back()->with('success', 'Your message has been sent successfully. We will get back to you soon.');
    }

    /**
     * Admin: list all contact messages, newest first.
     */
    public function adminIndex(Request $request): Response
    {
        $messages = ContactMessage::latest()->paginate(20)->withQueryString();

        return Inertia::render('Admin/Contacts/Index', [
            'messages' => $messages,
            'stats' => [
                'total' => ContactMessage::count(),
            ],
        ]);
    }

    public function adminDestroy(ContactMessage $contact): RedirectResponse
    {
        $contact->delete();
        return back()->with('success', 'Message deleted.');
    }

    public function adminClearAll(): RedirectResponse
    {
        $count = ContactMessage::count();
        ContactMessage::truncate();
        return back()->with('success', "Cleared {$count} message" . ($count === 1 ? '' : 's') . '.');
    }
}
