<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Public channel for event updates
Broadcast::channel('public-events', function () {
    return true; // Public channel, anyone can listen
});

// NGO private channel
Broadcast::channel('ngo.{id}', function ($user, $id) {
    return (int) $user->ngo_id === (int) $id;
});

// Admin private channel
Broadcast::channel('admin-events', function ($user) {
    \Illuminate\Support\Facades\Log::info('Admin channel auth attempt', ['user_id' => $user->id, 'role' => $user->role]);
    return $user->role === 'admin';
});
