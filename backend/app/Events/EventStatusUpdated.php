<?php

namespace App\Events;

use App\Models\Event;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel; // Added PrivateChannel
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow; // Typically needed for instant updates
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EventStatusUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $event;

    /**
     * Create a new event instance.
     */
    public function __construct(Event $event)
    {
        $this->event = $event->load(['ngo:id,name']);
        \Illuminate\Support\Facades\Log::info('EventStatusUpdated Dispatching', ['event_id' => $event->id, 'status' => $event->status]);
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('public-events'),
            new PrivateChannel('ngo.' . $this->event->ngo_id),
            new PrivateChannel('admin-events'),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'event.status.updated';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'event_id' => $this->event->id,
            'status' => $this->event->status,
            'title' => $this->event->title,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
