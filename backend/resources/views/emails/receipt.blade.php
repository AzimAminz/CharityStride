<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
        }
        .receipt {
            max-width: 800px;
            margin: 0 auto;
            border: 2px solid #10b981;
        }
        .header {
            background: #10b981;
            color: white;
            padding: 30px;
            text-align: center;
        }
        .content {
            padding: 30px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        th {
            background: #f3f4f6;
            font-weight: 600;
        }
        .total {
            font-size: 20px;
            font-weight: bold;
            text-align: right;
            padding: 20px;
            background: #f9fafb;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="header">
            <h1>PAYMENT RECEIPT</h1>
            <p>{{ $registration->event->ngo->name }}</p>
        </div>

        <div class="content">
            <table>
                <tr>
                    <th>Receipt No:</th>
                    <td>{{ $registration->payments->first()->payment_reference ?? 'N/A' }}</td>
                </tr>
                <tr>
                    <th>Date:</th>
                    <td>{{ $registration->created_at->format('d M Y, h:i A') }}</td>
                </tr>
                <tr>
                    <th>{{ ($registration instanceof \App\Models\DonationRegistration) ? 'Donor:' : 'Participant:' }}</th>
                    <td>{{ $registration->user->name }}</td>
                </tr>
                <tr>
                    <th>Email:</th>
                    <td>{{ $registration->user->email }}</td>
                </tr>
            </table>

            <h3>Event Details</h3>
            <table>
                <tr>
                    <th>Event:</th>
                    <td>{{ $registration->event->title }}</td>
                </tr>
                @if(!($registration instanceof \App\Models\DonationRegistration))
                <tr>
                    <th>Category:</th>
                    <td>{{ $registration->participantCategory->category_name }}</td>
                </tr>
                @if($registration->participantCategory->has_bib)
                <tr>
                    <th>BIB Number:</th>
                    <td>{{ $registration->bib_number }}</td>
                </tr>
                @endif
                @endif
                <tr>
                    <th>Event Date:</th>
                    <td>{{ $registration->event->start_date->format('d M Y') }}</td>
                </tr>
            </table>

            <h3>Payment Details</h3>
            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th style="text-align: right;">Amount (RM)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            @if($registration instanceof \App\Models\DonationRegistration)
                                Donation Support - {{ $registration->event->title }}
                            @else
                                Registration Fee - {{ $registration->participantCategory->category_name }}
                            @endif
                        </td>
                        <td style="text-align: right;">{{ number_format($registration->amount_paid / 100, 2) }}</td>
                    </tr>
                </tbody>
            </table>

            <div class="total">
                Total Paid: RM {{ number_format($registration->amount_paid / 100, 2) }}
            </div>

            <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
                This is a computer-generated receipt and does not require a signature.
            </p>
        </div>
    </div>
</body>
</html>
