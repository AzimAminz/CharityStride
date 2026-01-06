<x-mail::message>
# Verification Code (TAC)

Hello,

You are receiving this email because a request was made to verify your identity for a secure action on **CharityStride**.

Your 6-digit verification code is:

<x-mail::panel>
# {{ $code }}
</x-mail::panel>

This code is for **{{ $type }}** and will expire in 10 minutes. 

If you did not request this code, no further action is required. Please keep this code confidential and do not share it with anyone.

Thanks,<br>
The {{ config('app.name') }} Team
</x-mail::message>
