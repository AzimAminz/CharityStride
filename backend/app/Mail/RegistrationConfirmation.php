<?php

namespace App\Mail;

use App\Models\ParticipantRegistration;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Barryvdh\DomPDF\Facade\Pdf;

class RegistrationConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public $registration;
    public $qrCodePath;
    public $receiptPath;

    /**
     * Create a new message instance.
     */
    public function __construct(ParticipantRegistration $registration)
    {
        $this->registration = $registration->load(['event', 'user', 'participantCategory', 'payments']);
        
        // Generate QR Code using GD (not imagick)
        $this->qrCodePath = storage_path('app/temp/qr_' . $registration->id . '.png');
        
        // Ensure temp directory exists
        if (!file_exists(storage_path('app/temp'))) {
            mkdir(storage_path('app/temp'), 0755, true);
        }
        
        QrCode::format('png')
            ->size(300)
            ->errorCorrection('H')
            ->generate($registration->qr_code, $this->qrCodePath);
        
        // Generate PDF Receipt if paid
        if ($registration->amount_paid > 0) {
            $this->receiptPath = storage_path('app/temp/receipt_' . $registration->id . '.pdf');
            $pdf = Pdf::loadView('emails.receipt', ['registration' => $this->registration]);
            $pdf->save($this->receiptPath);
        }
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Registration Confirmation - ' . $this->registration->event->title,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.registration-confirmation',
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        $attachments = [];
        
        if (file_exists($this->qrCodePath)) {
            $attachments[] = Attachment::fromPath($this->qrCodePath)
                ->as('qr-code.png')
                ->withMime('image/png');
        }

        if (isset($this->receiptPath) && file_exists($this->receiptPath)) {
            $attachments[] = Attachment::fromPath($this->receiptPath)
                ->as('receipt.pdf')
                ->withMime('application/pdf');
        }

        return $attachments;
    }
}
