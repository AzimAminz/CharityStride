<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

use Illuminate\Support\Facades\Schedule;
use App\Models\Event;
use App\Events\EventStatusUpdated;

Schedule::call(function () {
    $events = Event::where('end_date', '<', now()->toDateString())
        ->where('status', '!=', 'completed')
        ->get();

    foreach ($events as $event) {
        $event->status = 'completed';
        $event->save();
        
        broadcast(new EventStatusUpdated($event));
    }
})->everyMinute();
