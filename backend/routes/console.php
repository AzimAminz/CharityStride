<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

use Illuminate\Support\Facades\Schedule;
use App\Models\Event;
use App\Events\EventStatusUpdated;

// Register command for manual execution
Artisan::command('events:check-expiry', function () {
    $this->info('Checking for expired events...');
    
    $events = Event::where('end_date', '<', now()->toDateString())
        ->where('status', '!=', 'closed')
        ->get();

    $count = 0;
    foreach ($events as $event) {
        $event->status = 'closed';
        $event->save();
        
        broadcast(new EventStatusUpdated($event));
        $this->info("Closed event: {$event->title}");
        $count++;
    }

    $this->info("Done. Closed {$count} events.");
})->purpose('Check and close expired events');

// Schedule the command to run every minute
Schedule::command('events:check-expiry')->everyMinute();
