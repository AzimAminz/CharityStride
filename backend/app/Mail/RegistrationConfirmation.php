<?php

namespace App\Mail;

use App\Models\ParticipantRegistration;
use App\Models\VolunteerRegistration;
use App\Models\DonationRegistration;
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
    public function __construct(ParticipantRegistration|VolunteerRegistration|DonationRegistration $registration)
    {
        $this->qrCodePath = storage_path('app/temp/qr_' . $registration->id . '.png');
        
        // Ensure temp directory exists
        if (!file_exists(storage_path('app/temp'))) {
            mkdir(storage_path('app/temp'), 0755, true);
        }

        if ($registration instanceof ParticipantRegistration) {
            $this->registration = $registration->load(['event.ngo', 'user', 'participantCategory', 'payments']);
        } elseif ($registration instanceof VolunteerRegistration) {
            $this->registration = $registration->load(['event.ngo', 'user', 'volunteerRole', 'volunteerShift', 'payments']);
        } else {
            $this->registration = $registration->load(['event.ngo', 'user', 'payments']);
        }
        
        // Skip QR Code and check-in info for donations
        if (!($registration instanceof DonationRegistration)) {
            // Generate QR Code using external API but with robust Http facade and timeout
            try {
                $qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' . urlencode($registration->qr_code);
                $response = \Illuminate\Support\Facades\Http::timeout(5)->get($qrUrl);
                
                if ($response->successful()) {
                    file_put_contents($this->qrCodePath, $response->body());
                } else {
                    \Log::error('Failed to generate QR code from API: ' . $response->status());
                }
            } catch (\Exception $e) {
                \Log::error('QR code generation error: ' . $e->getMessage());
            }
        }
        
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
        $subject = ($this->registration instanceof DonationRegistration) 
            ? 'Donation Confirmed - ' . $this->registration->event->title
            : 'Registration Confirmed - ' . $this->registration->event->title;

        return new Envelope(
            subject: $subject,
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
