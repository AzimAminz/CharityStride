<?php

namespace App\Mail;

use App\Models\DonationRegistration;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;
use Barryvdh\DomPDF\Facade\Pdf;

class DonationReceipt extends Mailable
{
    use Queueable, SerializesModels;

    public $registration;
    public $receiptPath;

    /**
     * Create a new message instance.
     */
    public function __construct(DonationRegistration $registration)
    {
        $this->registration = $registration->load(['event', 'user', 'payments']);
        
        // Generate PDF Receipt
        $this->receiptPath = storage_path('app/temp/donation_receipt_' . $registration->id . '.pdf');
        
        // Ensure temp directory exists
        if (!file_exists(storage_path('app/temp'))) {
            mkdir(storage_path('app/temp'), 0755, true);
        }
        
        try {
            $pdf = Pdf::loadView('emails.donation-receipt', ['registration' => $this->registration]);
            $pdf->save($this->receiptPath);
        } catch (\Exception $e) {
            \Log::error('Donation receipt PDF generation error: ' . $e->getMessage());
        }
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Donation Receipt - ' . $this->registration->event->title,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.donation-confirmation',
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        $attachments = [];

        if (isset($this->receiptPath) && file_exists($this->receiptPath)) {
            $attachments[] = Attachment::fromPath($this->receiptPath)
                ->as('donation-receipt.pdf')
                ->withMime('application/pdf');
        }

        return $attachments;
    }
}
