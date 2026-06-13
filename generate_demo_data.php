<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Category;
use App\Models\Transaction;
use Carbon\Carbon;

$user = User::where('email', 'yudi@gmail.com')->first();

if (!$user) {
    die("User yudi@gmail.com tidak ditemukan.\n");
}

echo "Membuat data dummy untuk user: {$user->name}...\n";

// Hapus transaksi & kategori lama untuk user ini (agar bersih)
Transaction::where('user_id', $user->id)->delete();
Category::where('user_id', $user->id)->delete();

// Buat Kategori Masuk (dengan ID unik untuk Yudi)
$kategoriMasuk = [
    'cat-yudi-m1' => Category::create(['id' => 'cat-yudi-m1', 'user_id' => $user->id, 'name' => 'Penjualan Produk Herbal', 'type' => 'masuk']),
    'cat-yudi-m2' => Category::create(['id' => 'cat-yudi-m2', 'user_id' => $user->id, 'name' => 'Penjualan Produk Kecantikan', 'type' => 'masuk']),
    'cat-yudi-m3' => Category::create(['id' => 'cat-yudi-m3', 'user_id' => $user->id, 'name' => 'Penjualan Kebutuhan Harian', 'type' => 'masuk']),
    'cat-yudi-m4' => Category::create(['id' => 'cat-yudi-m4', 'user_id' => $user->id, 'name' => 'Penjualan Paket Promo', 'type' => 'masuk']),
];

// Buat Kategori Keluar (dengan ID unik untuk Yudi)
$kategoriKeluar = [
    'cat-yudi-k1' => Category::create(['id' => 'cat-yudi-k1', 'user_id' => $user->id, 'name' => 'Pembelian Stok Barang HNI', 'type' => 'keluar']),
    'cat-yudi-k2' => Category::create(['id' => 'cat-yudi-k2', 'user_id' => $user->id, 'name' => 'Operasional (Listrik/Air/Internet)', 'type' => 'keluar']),
    'cat-yudi-k3' => Category::create(['id' => 'cat-yudi-k3', 'user_id' => $user->id, 'name' => 'Transportasi & Distribusi', 'type' => 'keluar']),
    'cat-yudi-k4' => Category::create(['id' => 'cat-yudi-k4', 'user_id' => $user->id, 'name' => 'Pengeluaran Lain-lain', 'type' => 'keluar']),
];

// Produk HNI Berdasarkan Tier untuk Penjualan yang Lebih Realistis
$productsTier1 = [ // Low-price/Daily Needs (Rp 20.000 - Rp 50.000)
    ['name' => 'Pasta Gigi Herbal HNI', 'category_id' => 'cat-yudi-m3', 'price' => 20000],
    ['name' => 'Sabun Kolagen HNI', 'category_id' => 'cat-yudi-m2', 'price' => 25000],
    ['name' => 'Sabun Madu HNI', 'category_id' => 'cat-yudi-m2', 'price' => 25000],
    ['name' => 'Sabun Propolis HNI', 'category_id' => 'cat-yudi-m2', 'price' => 25000],
    ['name' => 'Pasta Gigi Sensitive HNI', 'category_id' => 'cat-yudi-m3', 'price' => 30000],
    ['name' => 'Minyak Herba Sinergi (MHS)', 'category_id' => 'cat-yudi-m1', 'price' => 30000],
    ['name' => 'Minyak Goreng HNI 1L', 'category_id' => 'cat-yudi-m3', 'price' => 35000],
    ['name' => 'Minyak Zaitun HNI', 'category_id' => 'cat-yudi-m2', 'price' => 35000],
    ['name' => 'HNI Shampoo', 'category_id' => 'cat-yudi-m3', 'price' => 40000],
    ['name' => 'HNI Body Wash', 'category_id' => 'cat-yudi-m2', 'price' => 45000],
    ['name' => 'Detergen Green Wash HNI', 'category_id' => 'cat-yudi-m3', 'price' => 45000],
    ['name' => 'Hibis Sanitary Napkin HNI', 'category_id' => 'cat-yudi-m3', 'price' => 50000],
];

$productsTier2 = [ // Medium-price/Herbal/Cosmetics (Rp 70.000 - Rp 150.000)
    ['name' => 'Harumi HNI', 'category_id' => 'cat-yudi-m1', 'price' => 70000],
    ['name' => 'Siena HNI', 'category_id' => 'cat-yudi-m1', 'price' => 75000],
    ['name' => 'Beauty Day Cream HNI', 'category_id' => 'cat-yudi-m2', 'price' => 75000],
    ['name' => 'Extra Food HNI', 'category_id' => 'cat-yudi-m1', 'price' => 80000],
    ['name' => 'Beauty Night Cream HNI', 'category_id' => 'cat-yudi-m2', 'price' => 85000],
    ['name' => 'Andrographis HNI', 'category_id' => 'cat-yudi-m1', 'price' => 85000],
    ['name' => 'Spirulina HNI', 'category_id' => 'cat-yudi-m1', 'price' => 90000],
    ['name' => 'Madu Multiflora HNI', 'category_id' => 'cat-yudi-m1', 'price' => 100000],
    ['name' => 'Kopi Seven Elements', 'category_id' => 'cat-yudi-m1', 'price' => 110000],
    ['name' => 'Madu Pahit HNI', 'category_id' => 'cat-yudi-m1', 'price' => 120000],
    ['name' => 'Madu Sapu Jagat', 'category_id' => 'cat-yudi-m1', 'price' => 120000],
    ['name' => 'Centella Skin Care HNI', 'category_id' => 'cat-yudi-m2', 'price' => 150000],
];

$productsTier3 = [ // High-price/Special Supplements/Promo Packages (Rp 175.000 - Rp 450.000)
    ['name' => 'Procumin Propolis HNI', 'category_id' => 'cat-yudi-m1', 'price' => 175000],
    ['name' => 'Paket Sehat Keluarga HNI', 'category_id' => 'cat-yudi-m4', 'price' => 180000],
    ['name' => 'Paket Cantik Kolagen HNI', 'category_id' => 'cat-yudi-m4', 'price' => 200000],
    ['name' => 'Deep Squalene HNI', 'category_id' => 'cat-yudi-m1', 'price' => 250000],
    ['name' => 'Paket Herbal Imunitas HNI', 'category_id' => 'cat-yudi-m4', 'price' => 250000],
    ['name' => 'Paket Hijrah Produk HNI Lengkap', 'category_id' => 'cat-yudi-m4', 'price' => 450000],
];

$startDate = Carbon::create(2026, 5, 1);
$endDate = Carbon::create(2026, 6, 30);
$currentDate = clone $startDate;

$totalMasukAll = 0;
$totalKeluarAll = 0;

$countTransactions = 0;

while ($currentDate->lte($endDate)) {
    $dateStr = $currentDate->format('Y-m-d');
    
    // Jumlah pelanggan: rata-rata ~20 orang per hari (antara 18 s/d 22 orang)
    $jumlahPelanggan = rand(18, 22);
    $omzetHariIni = 0;
    
    // Buat transaksi masuk untuk hari ini
    for ($i = 0; $i < $jumlahPelanggan; $i++) {
        // Distribusi: 70% Tier 1 (Harian), 20% Tier 2 (Herbal/Kosmetik sedang), 10% Tier 3 (Herbal mahal/Paket)
        $roll = rand(1, 100);
        if ($roll <= 70) {
            $product = $productsTier1[array_rand($productsTier1)];
        } elseif ($roll <= 90) {
            $product = $productsTier2[array_rand($productsTier2)];
        } else {
            $product = $productsTier3[array_rand($productsTier3)];
        }
        
        // Quantity acak: 75% beli 1 pcs, 20% beli 2 pcs, 5% beli 3 pcs
        $randQty = rand(1, 100);
        if ($randQty <= 75) {
            $qty = 1;
        } elseif ($randQty <= 95) {
            $qty = 2;
        } else {
            $qty = 3;
        }
        
        $amount = $product['price'] * $qty;
        $omzetHariIni += $amount;
        
        $name = "Penjualan " . $product['name'];
        if ($qty > 1) {
            $name .= " ({$qty} Pcs)";
        }
        
        Transaction::create([
            'id' => 'tx-' . uniqid() . '-' . rand(100, 999),
            'user_id' => $user->id,
            'category_id' => $product['category_id'],
            'type' => 'masuk',
            'name' => $name,
            'amount' => $amount,
            'date' => $dateStr,
            'notes' => 'Pencatatan kas masuk dari transaksi penjualan ritel pelanggan.',
        ]);
        $countTransactions++;
    }
    
    $totalMasukAll += $omzetHariIni;
    
    // ==========================================
    // TRANSAKSI KELUAR (PENGELUARAN PRESISI)
    // ==========================================
    
    // Keuntungan bersih berkisar antara 20% s/d 30%. Kita set target profit harian antara 22% s/d 28%
    $profitMarginPercent = rand(22, 28);
    $targetPengeluaran = $omzetHariIni * (100 - $profitMarginPercent) / 100;
    
    $opsAmount = 0;
    $transAmount = 0;
    $miscAmount = 0;
    
    // 1. Operasional bulanan dibayar tanggal 5 (Mei dan Juni)
    $dayOfMonth = $currentDate->day;
    if ($dayOfMonth === 5) {
        $opsAmount = rand(400, 550) * 1000;
        Transaction::create([
            'id' => 'tx-' . uniqid() . '-' . rand(100, 999),
            'user_id' => $user->id,
            'category_id' => 'cat-yudi-k2',
            'type' => 'keluar',
            'name' => 'Bayar Tagihan Listrik & Internet Toko',
            'amount' => $opsAmount,
            'date' => $dateStr,
            'notes' => 'Pembayaran tagihan listrik token dan wifi bulanan ruko.',
        ]);
        $countTransactions++;
    }
    
    // 2. Transportasi (50% kemungkinan per hari)
    if (rand(1, 2) === 1) {
        $transAmount = rand(15, 30) * 1000;
        Transaction::create([
            'id' => 'tx-' . uniqid() . '-' . rand(100, 999),
            'user_id' => $user->id,
            'category_id' => 'cat-yudi-k3',
            'type' => 'keluar',
            'name' => 'Biaya Transportasi Stok',
            'amount' => $transAmount,
            'date' => $dateStr,
            'notes' => 'Biaya bensin untuk pengambilan stok barang.',
        ]);
        $countTransactions++;
    }
    
    // 3. Pengeluaran Lain-lain (25% kemungkinan per hari)
    if (rand(1, 4) === 1) {
        $miscAmount = rand(10, 35) * 1000;
        Transaction::create([
            'id' => 'tx-' . uniqid() . '-' . rand(100, 999),
            'user_id' => $user->id,
            'category_id' => 'cat-yudi-k4',
            'type' => 'keluar',
            'name' => 'Pembelian Perlengkapan Toko',
            'amount' => $miscAmount,
            'date' => $dateStr,
            'notes' => 'Beli kantong plastik ramah lingkungan dan ATK toko.',
        ]);
        $countTransactions++;
    }
    
    // 4. Sisa target pengeluaran dialokasikan ke belanja stok (cat-yudi-k1)
    $stokAmount = $targetPengeluaran - $opsAmount - $transAmount - $miscAmount;
    if ($stokAmount < 300000) {
        $stokAmount = 300000; // Minimal belanja stok agar DC memproses
    }
    
    $stokAmountRounded = round($stokAmount, -3);
    
    Transaction::create([
        'id' => 'tx-' . uniqid() . '-' . rand(100, 999),
        'user_id' => $user->id,
        'category_id' => 'cat-yudi-k1',
        'type' => 'keluar',
        'name' => 'Belanja Stok Produk HNI',
        'amount' => $stokAmountRounded,
        'date' => $dateStr,
        'notes' => 'Pembelian stok produk ke Distributor Center (DC) HNI.',
    ]);
    $countTransactions++;
    
    $pengeluaranHariIni = $opsAmount + $transAmount + $miscAmount + $stokAmountRounded;
    $totalKeluarAll += $pengeluaranHariIni;
    
    $currentDate->addDay();
}

$profit = $totalMasukAll - $totalKeluarAll;
$profitPercentage = $totalMasukAll > 0 ? ($profit / $totalMasukAll) * 100 : 0;

echo "Berhasil membuat data dummy (1 Mei 2026 - 30 Juni 2026)!\n";
echo "Total Transaksi Dibuat: " . $countTransactions . "\n";
echo "Total Pemasukan (Omzet): Rp " . number_format($totalMasukAll, 0, ',', '.') . " (Rata-rata: Rp " . number_format($totalMasukAll / 61, 0, ',', '.') . " / hari)\n";
echo "Total Pengeluaran: Rp " . number_format($totalKeluarAll, 0, ',', '.') . "\n";
echo "Total Keuntungan Bersih: Rp " . number_format($profit, 0, ',', '.') . " (" . number_format($profitPercentage, 2, ',', '.') . "%)\n";
