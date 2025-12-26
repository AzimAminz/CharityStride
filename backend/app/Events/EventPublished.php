<?php

namespace App\Events;

use App\Models\Event;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EventPublished implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $event;

    /**
     * Create a new event instance.
     */
    public function __construct(Event $event)
    {
        // Load relationships for the broadcast
        $this->event = $event->load(['ngo:id,name,logo_url']);
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): Channel
    {
        return new Channel('public-events');
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'event.published';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'event' => $this->event,
            'message' => 'New event published: ' . $this->event->title,
        ];
    }
}
