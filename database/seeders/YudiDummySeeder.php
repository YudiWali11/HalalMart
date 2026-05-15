<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class YudiDummySeeder extends Seeder
{
    public function run(): void
    {
        // =========================================================
        // 1. Buat atau temukan user Yudi
        // =========================================================
        $user = User::firstOrCreate(
            ['email' => 'yudi@gmail.com'],
            [
                'name'     => 'Yudi',
                'password' => Hash::make('password123'),
            ]
        );

        $userId = $user->id;

        $this->command->info("👤 User Yudi (ID: {$userId}) siap digunakan.");

        // =========================================================
        // 2. Kategori (terhubung ke user Yudi)
        // =========================================================
        $categories = [
            // Kategori Masuk
            ['id' => 'cat-yudi-m01', 'name' => 'Penjualan Produk',   'type' => 'masuk',  'user_id' => $userId],
            ['id' => 'cat-yudi-m02', 'name' => 'Jasa Layanan',       'type' => 'masuk',  'user_id' => $userId],
            ['id' => 'cat-yudi-m03', 'name' => 'Investasi',          'type' => 'masuk',  'user_id' => $userId],
            ['id' => 'cat-yudi-m04', 'name' => 'Pinjaman Diterima',  'type' => 'masuk',  'user_id' => $userId],

            // Kategori Keluar
            ['id' => 'cat-yudi-k01', 'name' => 'Pembelian Bahan Baku', 'type' => 'keluar', 'user_id' => $userId],
            ['id' => 'cat-yudi-k02', 'name' => 'Gaji Karyawan',        'type' => 'keluar', 'user_id' => $userId],
            ['id' => 'cat-yudi-k03', 'name' => 'Biaya Operasional',    'type' => 'keluar', 'user_id' => $userId],
            ['id' => 'cat-yudi-k04', 'name' => 'Sewa Tempat',          'type' => 'keluar', 'user_id' => $userId],
        ];

        foreach ($categories as $cat) {
            DB::table('categories')->updateOrInsert(
                ['id' => $cat['id']],
                array_merge($cat, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }

        // =========================================================
        // 3. Template transaksi per bulan
        // =========================================================

        // 4 transaksi masuk per bulan (template nama, kategori, range nominal)
        $templateMasuk = [
            ['name' => 'Penjualan Produk',       'category_id' => 'cat-yudi-m01', 'day' => 5],
            ['name' => 'Pendapatan Jasa',         'category_id' => 'cat-yudi-m02', 'day' => 12],
            ['name' => 'Hasil Investasi',         'category_id' => 'cat-yudi-m03', 'day' => 18],
            ['name' => 'Penerimaan Pinjaman',     'category_id' => 'cat-yudi-m04', 'day' => 25],
        ];

        // 4 transaksi keluar per bulan
        $templateKeluar = [
            ['name' => 'Pembelian Bahan Baku',    'category_id' => 'cat-yudi-k01', 'day' => 3],
            ['name' => 'Gaji Karyawan',           'category_id' => 'cat-yudi-k02', 'day' => 28],
            ['name' => 'Biaya Operasional',       'category_id' => 'cat-yudi-k03', 'day' => 15],
            ['name' => 'Sewa Tempat',             'category_id' => 'cat-yudi-k04', 'day' => 1],
        ];

        // Data per bulan: nominal bervariasi agar dashboard terlihat dinamis
        $months = [
            1  => ['label' => 'Januari',  'masuk_amounts' => [5000000, 2000000, 1500000, 10000000], 'keluar_amounts' => [4000000, 6000000, 850000, 3500000]],
            2  => ['label' => 'Februari', 'masuk_amounts' => [3500000, 3000000, 1200000, 8000000],   'keluar_amounts' => [3800000, 6000000, 1200000, 3500000]],
            3  => ['label' => 'Maret',    'masuk_amounts' => [6500000, 1800000, 2500000, 5000000],   'keluar_amounts' => [4500000, 6500000, 900000, 3500000]],
            4  => ['label' => 'April',    'masuk_amounts' => [7200000, 2500000, 3000000, 12000000],  'keluar_amounts' => [5000000, 6000000, 2200000, 3500000]],
            5  => ['label' => 'Mei',      'masuk_amounts' => [8000000, 3500000, 2000000, 6000000],   'keluar_amounts' => [4200000, 6500000, 1500000, 3500000]],
        ];

        // Notes per template
        $notesMasuk = [
            'Penjualan produk ke pelanggan',
            'Pendapatan dari jasa layanan',
            'Hasil return investasi',
            'Penerimaan pinjaman modal',
        ];

        $notesKeluar = [
            'Pembelian bahan baku dari supplier',
            'Pembayaran gaji karyawan',
            'Pembayaran biaya operasional (listrik, internet, dll)',
            'Pembayaran sewa tempat usaha',
        ];

        $year = 2026;
        $transaksiMasuk  = [];
        $transaksiKeluar = [];

        foreach ($months as $month => $data) {
            $monthStr = str_pad($month, 2, '0', STR_PAD_LEFT);

            // Transaksi Masuk
            foreach ($templateMasuk as $i => $tpl) {
                $amount = $data['masuk_amounts'][$i];
                if ($amount <= 0) continue; // skip jika 0

                $day = min($tpl['day'], cal_days_in_month(CAL_GREGORIAN, $month, $year));
                $dayStr = str_pad($day, 2, '0', STR_PAD_LEFT);

                $transaksiMasuk[] = [
                    'id'          => "trx-yudi-m-{$monthStr}-" . ($i + 1),
                    'name'        => "{$tpl['name']} {$data['label']}",
                    'date'        => "{$year}-{$monthStr}-{$dayStr}",
                    'category_id' => $tpl['category_id'],
                    'amount'      => $amount,
                    'notes'       => "{$notesMasuk[$i]} bulan {$data['label']}",
                    'type'        => 'masuk',
                    'receipt_url' => null,
                    'user_id'     => $userId,
                ];
            }

            // Transaksi Keluar
            foreach ($templateKeluar as $i => $tpl) {
                $amount = $data['keluar_amounts'][$i];
                if ($amount <= 0) continue;

                $day = min($tpl['day'], cal_days_in_month(CAL_GREGORIAN, $month, $year));
                $dayStr = str_pad($day, 2, '0', STR_PAD_LEFT);

                $transaksiKeluar[] = [
                    'id'          => "trx-yudi-k-{$monthStr}-" . ($i + 1),
                    'name'        => "{$tpl['name']} {$data['label']}",
                    'date'        => "{$year}-{$monthStr}-{$dayStr}",
                    'category_id' => $tpl['category_id'],
                    'amount'      => $amount,
                    'notes'       => "{$notesKeluar[$i]} bulan {$data['label']}",
                    'type'        => 'keluar',
                    'receipt_url' => null,
                    'user_id'     => $userId,
                ];
            }
        }

        // =========================================================
        // 4. Insert semua transaksi
        // =========================================================
        $allTransactions = array_merge($transaksiMasuk, $transaksiKeluar);

        foreach ($allTransactions as $trx) {
            DB::table('transactions')->updateOrInsert(
                ['id' => $trx['id']],
                array_merge($trx, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }

        // =========================================================
        // 5. Summary
        // =========================================================
        $totalMasuk  = array_sum(array_column($transaksiMasuk, 'amount'));
        $totalKeluar = array_sum(array_column($transaksiKeluar, 'amount'));

        $this->command->info('');
        $this->command->info('✅ Data dummy untuk user Yudi berhasil dibuat!');
        $this->command->info("   - 8 kategori (4 masuk + 4 keluar)");
        $this->command->info("   - " . count($transaksiMasuk) . " transaksi masuk  (Rp " . number_format($totalMasuk, 0, ',', '.') . ")");
        $this->command->info("   - " . count($transaksiKeluar) . " transaksi keluar (Rp " . number_format($totalKeluar, 0, ',', '.') . ")");
        $this->command->info("   - Periode: Januari - Mei 2026");
        $this->command->info("   - Login: yudi@gmail.com / password123");
    }
}
