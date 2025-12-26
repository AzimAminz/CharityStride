<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FileUploadController;
use App\Http\Controllers\NgoController;
use App\Http\Controllers\Admin\NgoManagementController;
use App\Http\Controllers\Api\Ngo\EventController;
use App\Http\Controllers\Api\Ngo\EventSectionController;
use App\Http\Controllers\Api\Ngo\EventDuplicateController;
use App\Http\Controllers\Api\VolunteerController;
use App\Http\Controllers\Api\DonationController;
use App\Http\Controllers\Api\ParticipantController;
use App\Http\Controllers\Api\LookupDataController;
use App\Http\Controllers\Api\PublicEventController;


// Lookup Data Routes (Public - needed for event creation forms)
Route::prefix('lookups')->group(function() {
    Route::get('/all', [LookupDataController::class, 'all']);
    Route::get('/volunteer-role-types', [LookupDataController::class, 'volunteerRoleTypes']);
    Route::get('/participant-category-types', [LookupDataController::class, 'participantCategoryTypes']);
    Route::get('/required-skills', [LookupDataController::class, 'requiredSkills']);
    Route::get('/shift-types', [LookupDataController::class, 'shiftTypes']);
});

// Public Event Discovery Routes
Route::prefix('public/events')->group(function() {
    Route::get('/', [PublicEventController::class, 'index']);
    Route::get('/popular', [PublicEventController::class, 'popular']);
    Route::get('/newest', [PublicEventController::class, 'newest']);
    Route::get('/suggestions', [PublicEventController::class, 'suggestions']);
    Route::get('/{id}', [PublicEventController::class, 'show']);
});


// Authentication Routes
Route::middleware(['cors'])->prefix('auth')->group(function(){

    // Normal Authentication
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Social Authentication
    Route::post('/google', [AuthController::class, 'googleLogin']);

    Route::middleware(['auth:sanctum'])->group(function(){
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/profile', [AuthController::class, 'profile']);
        Route::post('/complete-profile', [AuthController::class, 'completeProfile']);
    });

});

// File Upload Route (Protected)
Route::middleware(['auth:sanctum'])->post('/upload', [FileUploadController::class, 'upload']);
Route::middleware(['auth:sanctum'])->delete('/upload', [FileUploadController::class, 'delete']);

// NGO Routes (Protected - User/NGO role)
Route::middleware(['auth:sanctum', 'role:user,ngo'])->prefix('ngo')->group(function(){
    // NGO Registration
    Route::post('/register', [NgoController::class, 'register']);
    
    // Event Management (NGO role only)
    Route::middleware('role:ngo')->group(function(){
        Route::apiResource('events', EventController::class);
        Route::post('events/{id}/publish', [EventController::class, 'publish']);
        Route::post('events/{id}/unpublish', [EventController::class, 'unpublish']);
        Route::post('events/{id}/duplicate', [EventDuplicateController::class, 'duplicate']);
        
        // Event Components
        Route::post('events/{eventId}/sections', [EventSectionController::class, 'store']);
        Route::put('events/{eventId}/sections/{id}', [EventSectionController::class, 'update']);
        Route::delete('events/{eventId}/sections/{id}', [EventSectionController::class, 'destroy']);
        
        // Volunteer Module
        Route::get('events/{eventId}/volunteer/roles', [VolunteerController::class, 'getRoles']);
        Route::post('events/{eventId}/volunteer/roles', [VolunteerController::class, 'createRole']);
        Route::put('events/{eventId}/volunteer/roles/{roleId}', [VolunteerController::class, 'updateRole']);
        Route::delete('events/{eventId}/volunteer/roles/{roleId}', [VolunteerController::class, 'deleteRole']);
        Route::post('events/{eventId}/volunteer/roles/{roleId}/shifts', [VolunteerController::class, 'createShift']);
        Route::put('events/{eventId}/volunteer/shifts/{shiftId}', [VolunteerController::class, 'updateShift']);
        Route::delete('events/{eventId}/volunteer/shifts/{shiftId}', [VolunteerController::class, 'deleteShift']);
        
        // Donation Module
        Route::get('events/{eventId}/donation/config', [DonationController::class, 'getConfig']);
        Route::post('events/{eventId}/donation/config', [DonationController::class, 'saveConfig']);
        Route::get('events/{eventId}/donation/money-options', [DonationController::class, 'getMoneyOptions']);
        Route::post('events/{eventId}/donation/money-options', [DonationController::class, 'createMoneyOption']);
        Route::put('events/{eventId}/donation/money-options/{optionId}', [DonationController::class, 'updateMoneyOption']);
        Route::delete('events/{eventId}/donation/money-options/{optionId}', [DonationController::class, 'deleteMoneyOption']);
        Route::get('events/{eventId}/donation/item-options', [DonationController::class, 'getItemOptions']);
        Route::post('events/{eventId}/donation/item-options', [DonationController::class, 'createItemOption']);
        Route::put('events/{eventId}/donation/item-options/{optionId}', [DonationController::class, 'updateItemOption']);
        Route::delete('events/{eventId}/donation/item-options/{optionId}', [DonationController::class, 'deleteItemOption']);
        
        // Participant Module
        Route::get('events/{eventId}/participant/config', [ParticipantController::class, 'getConfig']);
        Route::post('events/{eventId}/participant/config', [ParticipantController::class, 'saveConfig']);
        Route::get('events/{eventId}/participant/categories', [ParticipantController::class, 'getCategories']);
        Route::post('events/{eventId}/participant/categories', [ParticipantController::class, 'createCategory']);
        Route::put('events/{eventId}/participant/categories/{categoryId}', [ParticipantController::class, 'updateCategory']);
        Route::delete('events/{eventId}/participant/categories/{categoryId}', [ParticipantController::class, 'deleteCategory']);
        Route::post('events/{eventId}/participant/categories/{categoryId}/tiers', [ParticipantController::class, 'createTier']);
        Route::put('events/{eventId}/participant/tiers/{tierId}', [ParticipantController::class, 'updateTier']);
        Route::delete('events/{eventId}/participant/tiers/{tierId}', [ParticipantController::class, 'deleteTier']);
        
        // Registration Management Routes
        Route::get('events/{eventId}/registrations', [RegistrationManagementController::class, 'getEventRegistrations']);
        Route::post('events/{eventId}/check-in', [RegistrationManagementController::class, 'checkInByQr']);
        Route::post('events/{eventId}/collect-tshirt', [RegistrationManagementController::class, 'collectTshirt']);
        Route::post('events/{eventId}/registrations/{registrationId}/verify', [RegistrationManagementController::class, 'manualVerify']);
        
        Route::get('saved-locations', [\App\Http\Controllers\Api\Ngo\SavedLocationController::class, 'index']);
        Route::post('saved-locations', [\App\Http\Controllers\Api\Ngo\SavedLocationController::class, 'store']);
        Route::delete('saved-locations/{id}', [\App\Http\Controllers\Api\Ngo\SavedLocationController::class, 'destroy']);
    });
});

// Admin Routes (Protected - Admin role only)
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function(){
    Route::get('/ngos', [NgoManagementController::class, 'index']);
    Route::get('/ngos/{id}', [NgoManagementController::class, 'show']);
    Route::patch('/ngos/{id}/status', [NgoManagementController::class, 'updateStatus']);
});
