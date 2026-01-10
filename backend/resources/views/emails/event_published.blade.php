<!DOCTYPE html>
<html>
<head>
    <title>Event Published</title>
</head>
<body style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f3f4f6; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <!-- Header -->
        <div style="background-color: #10b981; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">Event Published! 🎉</h1>
        </div>

        <!-- Event Card -->
        <div style="padding: 0;">
            @if($event->thumbnail)
                <img src="{{ $event->thumbnail }}" alt="{{ $event->title }}" style="width: 100%; height: 250px; object-fit: cover; display: block;">
            @endif
            
            <div style="padding: 30px;">
                <h2 style="margin-top: 0; color: #111827; font-size: 20px;">{{ $event->title }}</h2>
                
                <p style="color: #6b7280; margin-bottom: 20px;">Dear {{ $event->ngo->name }},</p>
                <p style="color: #374151;">We are thrilled to inform you that your event has been approved and is now <strong>LIVE</strong> on CharityStride.</p>

                <div style="background-color: #f9fafb; border-radius: 12px; padding: 15px; margin: 20px 0;">
                    <table style="width: 100%;">
                        <tr>
                            <td style="padding: 5px 0; color: #6b7280; width: 80px;">Date</td>
                            <td style="font-weight: 600; color: #111827;">{{ \Carbon\Carbon::parse($event->start_date)->format('d M Y') }}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #6b7280;">Location</td>
                            <td style="font-weight: 600; color: #111827;">{{ $event->address ?? 'Virtual/TBD' }}</td>
                        </tr>
                    </table>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                    <a href="{{ config('app.frontend_url') }}/events/{{ $event->id }}" style="background-color: #10b981; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Event</a>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0;">&copy; {{ date('Y') }} CharityStride. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
