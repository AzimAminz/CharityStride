<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FileUploadController;
use App\Http\Controllers\NgoController;
use App\Http\Controllers\Admin\NgoManagementController;
use App\Http\Controllers\Admin\EventManagementController;
use App\Http\Controllers\Api\Ngo\EventController;
use App\Http\Controllers\Api\Ngo\EventSectionController;
use App\Http\Controllers\Api\Ngo\EventDuplicateController;
use App\Http\Controllers\Api\VolunteerController;
use App\Http\Controllers\Api\DonationController;
use App\Http\Controllers\Api\ParticipantController;
use App\Http\Controllers\Api\LookupDataController;
use App\Http\Controllers\Api\PublicEventController;
use App\Http\Controllers\Api\RegistrationStatusController;
use Illuminate\Support\Facades\Broadcast;

// Enable Broadcasting for API (Sanctum Auth)
Route::post('/broadcasting/auth', function (Illuminate\Http\Request $request) {
    return Broadcast::auth($request);
})->middleware('auth:sanctum');


// Lookup Data Routes (Public - needed for event creation forms)
Route::prefix('lookups')->group(function() {
    Route::get('/all', [LookupDataController::class, 'all']);
    Route::get('/volunteer-role-types', [LookupDataController::class, 'volunteerRoleTypes']);
    Route::get('/shift-types', [LookupDataController::class, 'shiftTypes']);
});

// Public Event Discovery Routes
Route::prefix('public/events')->group(function() {
    Route::get('/', [PublicEventController::class, 'index']);
    Route::get('/popular', [PublicEventController::class, 'popular']);
    Route::get('/newest', [PublicEventController::class, 'newest']);
    Route::get('/donations', [PublicEventController::class, 'donations']);
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

// User Registration Status Check (Protected - User must be logged in)
Route::middleware(['auth:sanctum'])->get('/events/{eventId}/my-registration-status', [RegistrationStatusController::class, 'checkStatus']);

// Authenticated User Routes (General)
Route::middleware(['auth:sanctum'])->group(function() {
    // Participant Registration
    Route::post('/events/{eventId}/register/participant', [\App\Http\Controllers\Api\ParticipantRegistrationController::class, 'store']);
    Route::post('/events/{eventId}/register/volunteer', [\App\Http\Controllers\Api\VolunteerRegistrationController::class, 'store']);
    Route::post('/events/{eventId}/register/donation', [\App\Http\Controllers\Api\DonationRegistrationController::class, 'store']);
    
    // Payment Process
    Route::get('/payments/{id}', [\App\Http\Controllers\Api\PaymentController::class, 'show']);
    Route::post('/payments/{id}/mock-process', [\App\Http\Controllers\Api\PaymentController::class, 'processMock']);
    
    // User Dashboard
    Route::get('/user/dashboard', [\App\Http\Controllers\Api\User\DashboardController::class, 'index']);
    Route::get('/user/my-registrations', [\App\Http\Controllers\Api\User\UserRegistrationController::class, 'index']);
    Route::get('/user/my-certificates', [\App\Http\Controllers\Api\User\UserRegistrationController::class, 'myCertificates']);
    
    // Receipt Download
    Route::get('/user/registrations/{id}/receipt', [\App\Http\Controllers\Api\ReceiptController::class, 'downloadReceipt']);

    // User Profile
    Route::put('/user/profile', [\App\Http\Controllers\Api\User\ProfileController::class, 'updateProfile']);
    Route::put('/user/password', [\App\Http\Controllers\Api\User\ProfileController::class, 'updatePassword']);
    Route::post('/user/tac-request', [\App\Http\Controllers\Api\User\ProfileController::class, 'requestTac']);
    Route::put('/user/password-with-tac', [\App\Http\Controllers\Api\User\ProfileController::class, 'updatePasswordWithTac']);
});

// NGO Routes (Protected - User/NGO role)
Route::middleware(['auth:sanctum', 'role:user,ngo,admin'])->prefix('ngo')->group(function(){
    // NGO Registration
    Route::post('/register', [NgoController::class, 'register']);
    
    // Event Management (NGO role only)
    Route::middleware('role:ngo')->group(function(){
        Route::get('/dashboard', [\App\Http\Controllers\Api\Ngo\DashboardController::class, 'index']);
        Route::get('/analytics', [\App\Http\Controllers\Api\Ngo\AnalyticsController::class, 'index']);
        Route::get('/analytics/report', [\App\Http\Controllers\Api\Ngo\AnalyticsController::class, 'generateReport']);
        
        // Custom route definition for 'show' and 'index' to allow admin access
        Route::get('events', [EventController::class, 'index'])->withoutMiddleware('role:ngo')->middleware('role:ngo,admin');
        Route::get('events/{id}', [EventController::class, 'show'])->withoutMiddleware('role:ngo')->middleware('role:ngo,admin');
        
        Route::apiResource('events', EventController::class)->except(['index', 'show']); // Exclude index and show as they are defined above
        
        Route::post('events/{id}/publish', [EventController::class, 'publish']);
        Route::post('events/{id}/cancel-publish-request', [EventController::class, 'cancelPublishRequest']);
        Route::post('events/{id}/unpublish', [EventController::class, 'unpublish']);
        Route::post('events/{id}/cancel-unpublish-request', [EventController::class, 'cancelUnpublishRequest']);
        Route::post('events/{id}/restore', [EventController::class, 'restore']);
        Route::delete('events/{id}/force-delete', [EventController::class, 'forceDelete']);
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
        Route::delete('events/{eventId}/participant/categories/{id}', [ParticipantController::class, 'deleteCategory']);
        
        // Registration Management
        Route::get('events/{eventId}/registrations', [\App\Http\Controllers\Api\Ngo\RegistrationManagementController::class, 'getEventRegistrations']);
        Route::post('events/{eventId}/participant/categories/{categoryId}/tiers', [ParticipantController::class, 'createTier']);
        Route::put('events/{eventId}/participant/tiers/{tierId}', [ParticipantController::class, 'updateTier']);
        Route::delete('events/{eventId}/participant/tiers/{tierId}', [ParticipantController::class, 'deleteTier']);
        
        // Registration Management Routes
        Route::post('verify-qr', [\App\Http\Controllers\Api\Ngo\RegistrationManagementController::class, 'verifyQR']);
        Route::post('events/{eventId}/check-in', [\App\Http\Controllers\Api\Ngo\RegistrationManagementController::class, 'checkInByQr']);
        Route::post('events/{eventId}/check-out', [\App\Http\Controllers\Api\Ngo\RegistrationManagementController::class, 'checkOutByQr']);

        // Settings
        Route::put('/profile', [\App\Http\Controllers\Api\Ngo\NgoProfileController::class, 'updateProfile']);
        Route::put('/bank', [\App\Http\Controllers\Api\Ngo\NgoProfileController::class, 'updateBank']);
        Route::post('events/{eventId}/collect-tshirt', [\App\Http\Controllers\Api\Ngo\RegistrationManagementController::class, 'collectTshirt']);
        Route::post('events/{eventId}/registrations/{registrationId}/verify', [\App\Http\Controllers\Api\Ngo\RegistrationManagementController::class, 'manualVerify']);
        
        Route::get('saved-locations', [\App\Http\Controllers\Api\Ngo\SavedLocationController::class, 'index']);
        Route::post('saved-locations', [\App\Http\Controllers\Api\Ngo\SavedLocationController::class, 'store']);
        Route::delete('saved-locations/{id}', [\App\Http\Controllers\Api\Ngo\SavedLocationController::class, 'destroy']);
    });
});

// Admin Routes (Protected - Admin role only)
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function(){
    Route::get('/dashboard', [\App\Http\Controllers\Admin\DashboardController::class, 'index']);
    Route::get('/ngos', [NgoManagementController::class, 'index']);
    Route::get('/ngos/{id}', [NgoManagementController::class, 'show']);
    Route::patch('/ngos/{id}/status', [NgoManagementController::class, 'updateStatus']);

    // Event Management
    Route::get('/events', [\App\Http\Controllers\Api\Admin\EventController::class, 'index']); // Use new controller
    Route::patch('/events/{id}/approve', [\App\Http\Controllers\Api\Admin\EventController::class, 'approve']);
    Route::patch('/events/{id}/reject', [\App\Http\Controllers\Api\Admin\EventController::class, 'reject']);
    Route::patch('/events/{id}/take-down', [\App\Http\Controllers\Api\Admin\EventController::class, 'takeDown']);
    
    // Unpublish Requests
    Route::get('/unpublish-requests', [\App\Http\Controllers\Api\Admin\EventController::class, 'unpublishRequests']);
    Route::patch('/unpublish-requests/{id}/approve', [\App\Http\Controllers\Api\Admin\EventController::class, 'approveUnpublish']);
    Route::patch('/unpublish-requests/{id}/reject', [\App\Http\Controllers\Api\Admin\EventController::class, 'rejectUnpublish']);

    // Report Generation
    Route::get('/reports/platform-overview', [\App\Http\Controllers\Admin\ReportController::class, 'platformOverview']);
    Route::get('/reports/revenue', [\App\Http\Controllers\Admin\ReportController::class, 'revenueReport']);
    Route::get('/reports/ngo-performance', [\App\Http\Controllers\Admin\ReportController::class, 'ngoPerformanceReport']);
    Route::get('/reports/event-analytics', [\App\Http\Controllers\Admin\ReportController::class, 'eventAnalyticsReport']);
    Route::get('/reports/user-activity', [\App\Http\Controllers\Admin\ReportController::class, 'userActivityReport']);
});
