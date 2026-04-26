<?php

namespace App\Services;

/**
 * 20 password-reset message templates. Sendora (and WhatsApp) flag identical
 * bodies sent at scale, so we randomise across these wordings every time.
 *
 * Placeholders the caller must supply:
 *   {name}     — recipient's display name
 *   {password} — freshly-generated plaintext password (~20 chars)
 *   {app}      — app name, defaulted to "One Click Hub"
 */
class PasswordResetTemplates
{
    public const TEMPLATES = [
        "Hi {name}, your {app} password has been reset. Temporary password: {password}\n\nLog in and change it right away to stay secure.",
        "{app} password reset 🔐\n\nName: {name}\nNew password: {password}\n\nPlease update it after you sign in.",
        "Hello {name}! We've issued a fresh {app} password for you: {password}\n\nUpdate it from your profile after signing in.",
        "Selamat sejahtera {name}, kata laluan {app} baharu anda: {password}\n\nSila tukar kata laluan selepas log masuk untuk keselamatan akaun.",
        "Your {app} access has been refreshed 🔄\n\nLogin password: {password}\n\nChange it from Settings once you're in.",
        "Hi {name}, here's your one-time {app} password: {password}\n\nWe recommend changing it on first login.",
        "{app} security update for {name}\n\nNew login password: {password}\n\nPlease keep it private and rotate it once you're signed in.",
        "Password reset confirmation ✅\n\nUser: {name}\nTemporary password: {password}\n\nLog into {app} to set a permanent one.",
        "Hey {name}, you requested a {app} password reset. Use this to sign in: {password}\n\nThen pop into your profile and update it.",
        "Hi {name}, your new {app} password is ready: {password}\n\nFor your safety, change it after the next login.",
        "{app} account access\n\nName: {name}\nPassword: {password}\n\nThis password works once for sign-in — please reset it after.",
        "Selamat datang kembali {name}! Kata laluan sementara {app}: {password}\n\nKemaskini kata laluan anda di Tetapan untuk keselamatan.",
        "Heads up {name} — we've reset your {app} password to: {password}\n\nUpdate it immediately after signing in.",
        "Your {app} login has been refreshed.\n\nUser: {name}\nNew password: {password}\n\nChange it the moment you sign in.",
        "Hi {name}, fresh {app} password coming through: {password}\n\nTreat this as a one-time login — please rotate it.",
        "{app} password reset notice\n\nHello {name}, your temporary password is {password}.\nReplace it from your profile after signing in.",
        "Account recovery for {name}\n\nLogin to {app} with: {password}\n\nUpdate the password once you're back inside.",
        "Hi {name}, you can now access {app} again with this password: {password}\n\nPlease change it as soon as you log in.",
        "Password successfully reset for {name}.\n\nTemporary {app} password: {password}\n\nUpdate it from Settings to lock your account back down.",
        "{app} account update for {name}\n\nNew password: {password}\n\nKindly change it once you're logged in to keep your account safe.",
    ];

    public static function pick(string $name, string $password, string $app = 'One Click Hub'): string
    {
        $tpl = self::TEMPLATES[array_rand(self::TEMPLATES)];
        return strtr($tpl, [
            '{name}' => $name !== '' ? $name : 'there',
            '{password}' => $password,
            '{app}' => $app,
        ]);
    }
}
