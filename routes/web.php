<?php

use Illuminate\Support\Facades\Route;


/*
|--------------------------------------------------------------------------
| SPA Catch-all
|--------------------------------------------------------------------------
*/
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
