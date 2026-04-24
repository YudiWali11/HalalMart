<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\TransactionController;

/*
|--------------------------------------------------------------------------
| Auth Routes
|--------------------------------------------------------------------------
*/
Route::prefix('api')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth')->group(function () {
        Route::get('/user', [AuthController::class, 'user']);
        Route::post('/logout', [AuthController::class, 'logout']);
        
        // Moved from api.php to ensure stable session handling
        Route::apiResource('categories', CategoryController::class);
        Route::apiResource('transactions', TransactionController::class);
    });
});

/*
|--------------------------------------------------------------------------
| SPA Catch-all
|--------------------------------------------------------------------------
*/
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
