<?php

namespace App\Events;

use App\Models\Event;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RegistrationCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $event;
    public $registrationType; // 'participant' or 'volunteer' or 'donation'

    /**
     * Create a new event instance.
     */
    public function __construct(Event $event, string $registrationType)
    {
        $this->event = $event->load(['ngo:id,name']);
        $this->registrationType = $registrationType;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): Channel
    {
        return new Channel('ngo.' . $this->event->ngo_id);
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'registration.created';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'event_id' => $this->event->id,
            'event_title' => $this->event->title,
            'registration_type' => $this->registrationType,
            'stats' => $this->event->stats,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
