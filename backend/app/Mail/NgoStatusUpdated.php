<?php

namespace App\Mail;

use App\Models\Ngo;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NgoStatusUpdated extends Mailable
{
    use Queueable, SerializesModels;

    public $ngo;
    public $status;

    /**
     * Create a new message instance.
     */
    public function __construct(Ngo $ngo, string $status)
    {
        $this->ngo = $ngo;
        $this->status = $status;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = match($this->status) {
            'approved' => 'Your NGO Registration has been Approved! 🎉',
            'rejected' => 'Update on Your NGO Registration',
            'blocked' => 'Important: Your NGO Account Status',
            default => 'Update on Your NGO Registration',
        };

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
            view: 'emails.ngo-status-updated',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
