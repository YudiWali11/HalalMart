<?php

use App\Models\Transaction;
use App\Models\Category;
use Carbon\Carbon;

$categories = Category::all();

for ($i = 0; $i < 50; $i++) {
    $cat = $categories->random();
    $type = $cat->type;
    $name = $cat->name . ' Transaksi #' . rand(100, 999);
    
    $start = Carbon::create(2026, 1, 1);
    $end = Carbon::today();
    $randomDays = rand(0, $start->diffInDays($end));
    $date = $start->copy()->addDays($randomDays)->format('Y-m-d');
    $amount = ($type === 'masuk') ? rand(200000, 3000000) : rand(50000, 1500000);
    
    Transaction::create([
        'id' => 'tx-ext-' . uniqid() . '-' . $i,
        'category_id' => $cat->id,
        'type' => $type,
        'name' => $name,
        'amount' => $amount,
        'date' => $date,
        'notes' => 'Data otomatis untuk visualisasi penuh.',
    ]);
}

echo "Berhasil membuat 50 data tambahan!";
