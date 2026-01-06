<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #374151; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 40px; }
        .content { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 24px; padding: 40px; }
        .alert-box { background: #fef2f2; border: 1px solid #fee2e2; border-radius: 16px; padding: 20px; margin: 24px 0; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #9ca3af; }
        .button { display: inline-block; padding: 12px 24px; background-color: #059669; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: bold; margin-top: 20px; }
        h1 { font-size: 24px; font-weight: 800; color: #111827; margin: 0; }
        p { margin-bottom: 16px; }
    </style>
</head>
<body>
    <div className="container">
        <div className="content">
            <h1>Makluman Penurunan Acara</h1>
            <p>Halo pihak NGO,</p>
            
            <p>Kami ingin memaklumkan bahawa acara anda yang bertajuk <strong>"{{ $event->title }}"</strong> telah diturunkan (taken down) daripada platform CharityStride oleh pihak pengurusan.</p>

            <div className="alert-box">
                <p style="margin: 0; font-weight: bold; color: #991b1b;">Sebab Penurunan:</p>
                <p style="margin: 8px 0 0 0; color: #b91c1c;">"{{ $reason }}"</p>
            </div>

            <p>Acara ini tidak lagi akan dipaparkan kepada umum di platform kami. Sekiranya anda merasakan ini adalah satu kesilapan atau ingin membuat rayuan, sila hubungi pihak sokongan admin kami.</p>

            <p>Terima kasih atas kerjasama anda.</p>

            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f3f4f6;">
                <p style="font-size: 14px; color: #6b7280; margin: 0;">Yang benar,<br><strong>Pasukan Admin CharityStride</strong></p>
            </div>
        </div>
        <div className="footer">
            &copy; {{ date('Y') }} CharityStride. Semua hak terpelihara.
        </div>
    </div>
</body>
</html>
