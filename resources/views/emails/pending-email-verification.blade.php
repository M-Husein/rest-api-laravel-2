@component('mail::message')
# Verify Your New Email Address

Hi {{ $userName }},

You requested to change your email address to **{{ $newEmail }}**.

Click the button below to verify and activate your new email address.
This link will expire in **{{ $expiresIn }}**.

@component('mail::button', ['url' => $verifyUrl])
Verify New Email
@endcomponent

If you did not request this change, you can safely ignore this email.
Your current email address will remain unchanged.

Thanks,
{{ config('app.name') }}
@endcomponent