<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .info-box {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            border-left: 4px solid #10b981;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .label {
            font-weight: 600;
            color: #6b7280;
        }
        .value {
            color: #111827;
            font-weight: 500;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background: #10b981;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ ($registration instanceof \App\Models\DonationRegistration) ? 'Donation Confirmed!' : 'Registration Confirmed!' }}</h1>
        <p>{{ $registration->event->title }}</p>
    </div>

    <div class="content">
        <p>Dear {{ $registration->user->name }},</p>
        
        <p>Thank you for {{ ($registration instanceof \App\Models\DonationRegistration) ? 'your donation' : 'registering' }}! Your {{ ($registration instanceof \App\Models\DonationRegistration) ? 'contribution' : 'registration' }} has been confirmed.</p>

        <div class="info-box">
            <h3 style="margin-top: 0; color: #10b981;">{{ ($registration instanceof \App\Models\DonationRegistration) ? 'Donation Details' : 'Registration Details' }}</h3>
            
            @if(isset($registration->bib_number))
            <div class="info-row">
                <span class="label">BIB Number:</span>
                <span class="value">{{ $registration->bib_number }}</span>
            </div>
            @endif
            
            @if(isset($registration->participantCategory))
            <div class="info-row">
                <span class="label">Category:</span>
                <span class="value">{{ $registration->participantCategory->category_name }}</span>
            </div>
            @endif
            
            @if(isset($registration->volunteerRole))
            <div class="info-row">
                <span class="label">Volunteer Role:</span>
                <span class="value">{{ $registration->volunteerRole->custom_role_name ?? ($registration->volunteerRole->role_type->name_en ?? 'Volunteer') }}</span>
            </div>
            @endif
            
            @if(isset($registration->volunteerShift))
            <div class="info-row">
                <span class="label">Shift:</span>
                <span class="value">{{ $registration->volunteerShift->shift_date }} ({{ $registration->volunteerShift->start_time }} - {{ $registration->volunteerShift->end_time }})</span>
            </div>
            @endif
            
            <div class="info-row">
                <span class="label">Event Date:</span>
                <span class="value">{{ $registration->event->start_date->format('d M Y') }}</span>
            </div>
            
            @if($registration->event->location)
            <div class="info-row">
                <span class="label">Location:</span>
                <span class="value">{{ $registration->event->location }}</span>
            </div>
            @endif
            
            @if($registration->amount_paid > 0)
            <div class="info-row">
                <span class="label">Amount Paid:</span>
                <span class="value">RM {{ number_format($registration->amount_paid / 100, 2) }}</span>
            </div>
            @endif
        </div>

        @if(!($registration instanceof \App\Models\DonationRegistration))
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <strong>📱 Important:</strong> Please bring your QR code (attached) on event day for check-in.
        </div>
        @endif

        @if($registration->amount_paid > 0)
        <p><strong>Receipt:</strong> Your payment receipt is attached to this email.</p>
        @endif

        <div style="text-align: center;">
            <a href="{{ config('app.frontend_url') }}/user/registrations" class="button">
                View My Registrations
            </a>
        </div>
    </div>

    <div class="footer">
        <p>This is an automated email. Please do not reply.</p>
        <p>&copy; {{ date('Y') }} CharityStride. All rights reserved.</p>
    </div>
</body>
</html>
