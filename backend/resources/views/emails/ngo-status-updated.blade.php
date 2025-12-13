<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NGO Status Update</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
        }
        .content {
            background: #f9fafb;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-top: none;
        }
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            margin: 10px 0;
        }
        .status-approved {
            background: #d1fae5;
            color: #065f46;
        }
        .status-rejected {
            background: #fee2e2;
            color: #991b1b;
        }
        .status-blocked {
            background: #e5e7eb;
            color: #374151;
        }
        .ngo-details {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            background: #059669;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 20px;
        }
        .button:hover {
            background: #047857;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Charity Stride</h1>
        <p>NGO Registration Status Update</p>
    </div>

    <div class="content">
        <p>Dear {{ $ngo->user->name }},</p>

        @if($status === 'approved')
            <p>We are pleased to inform you that your NGO registration has been <strong>approved</strong>!</p>
            
            <div class="status-badge status-approved">✓ Approved</div>

            <div class="ngo-details">
                <h3>{{ $ngo->name }}</h3>
                <p><strong>Registration Number:</strong> {{ $ngo->registration_no }}</p>
                <p><strong>Category:</strong> {{ $ngo->category }}</p>
            </div>

            <p>Congratulations! You can now:</p>
            <ul>
                <li>Create and manage charity events</li>
                <li>Receive donations from supporters</li>
                <li>Access your NGO dashboard</li>
                <li>Connect with volunteers and donors</li>
            </ul>

            <p>Get started by logging into your account and exploring your NGO dashboard.</p>

            <a href="{{ config('app.frontend_url') }}/login" class="button">Login to Dashboard</a>

        @elseif($status === 'rejected')
            <p>Thank you for your interest in registering with Charity Stride.</p>
            
            <div class="status-badge status-rejected">✗ Registration Not Approved</div>

            <div class="ngo-details">
                <h3>{{ $ngo->name }}</h3>
                <p><strong>Registration Number:</strong> {{ $ngo->registration_no }}</p>
            </div>

            <p>After careful review, we regret to inform you that we are unable to approve your NGO registration at this time.</p>

            <p>This decision may be due to:</p>
            <ul>
                <li>Incomplete or incorrect documentation</li>
                <li>Information that doesn't meet our verification requirements</li>
                <li>Other administrative reasons</li>
            </ul>

            <p>If you believe this is an error or would like more information, please contact our support team.</p>

        @elseif($status === 'blocked')
            <p>This is an important notification regarding your NGO account.</p>
            
            <div class="status-badge status-blocked">⚠ Account Blocked</div>

            <div class="ngo-details">
                <h3>{{ $ngo->name }}</h3>
                <p><strong>Registration Number:</strong> {{ $ngo->registration_no }}</p>
            </div>

            <p>Your NGO account has been temporarily blocked from platform activities.</p>

            <p>This action was taken due to administrative reasons. If you believe this is an error or need clarification, please contact our support team immediately.</p>

        @endif

        <div class="footer">
            <p>This is an automated message from Charity Stride.</p>
            <p>For questions or support, please contact us at support@charitystride.com</p>
            <p>&copy; {{ date('Y') }} Charity Stride. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
