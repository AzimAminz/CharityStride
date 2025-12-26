<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Public channel for event updates
Broadcast::channel('public-events', function () {
    return true; // Public channel, anyone can listen
});
