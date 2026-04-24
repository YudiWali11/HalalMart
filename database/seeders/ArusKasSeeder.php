<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ArusKasSeeder extends Seeder
{
    public function run(): void
    {
        // =========================================================
        // KATEGORI
        // =========================================================
        $categories = [
            // Kategori Masuk
            ['id' => 'cat-001', 'name' => 'Penjualan Produk',   'type' => 'masuk'],
            ['id' => 'cat-002', 'name' => 'Jasa Layanan',       'type' => 'masuk'],
            ['id' => 'cat-003', 'name' => 'Investasi',          'type' => 'masuk'],
            ['id' => 'cat-004', 'name' => 'Pinjaman Diterima',  'type' => 'masuk'],

            // Kategori Keluar
            ['id' => 'cat-005', 'name' => 'Pembelian Bahan Baku', 'type' => 'keluar'],
            ['id' => 'cat-006', 'name' => 'Gaji Karyawan',        'type' => 'keluar'],
            ['id' => 'cat-007', 'name' => 'Biaya Operasional',    'type' => 'keluar'],
            ['id' => 'cat-008', 'name' => 'Sewa Tempat',          'type' => 'keluar'],
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
        // TRANSAKSI MASUK
        // =========================================================
        $transaksiMasuk = [
            ['id' => 'trx-m-001', 'name' => 'Penjualan Paket A',      'date' => '2026-01-05', 'category_id' => 'cat-001', 'amount' => 5000000,  'notes' => 'Pelanggan: Toko Maju Jaya'],
            ['id' => 'trx-m-002', 'name' => 'Penjualan Paket B',      'date' => '2026-01-15', 'category_id' => 'cat-001', 'amount' => 3500000,  'notes' => 'Pelanggan: CV Berkah'],
            ['id' => 'trx-m-003', 'name' => 'Jasa Konsultasi',        'date' => '2026-01-20', 'category_id' => 'cat-002', 'amount' => 2000000,  'notes' => 'Konsultasi sistem ERP'],
            ['id' => 'trx-m-004', 'name' => 'Penjualan Produk Massal','date' => '2026-02-03', 'category_id' => 'cat-001', 'amount' => 8000000,  'notes' => 'Event pameran dagang'],
            ['id' => 'trx-m-005', 'name' => 'Dividen Investasi',      'date' => '2026-02-10', 'category_id' => 'cat-003', 'amount' => 1500000,  'notes' => 'Reksa dana Q1'],
            ['id' => 'trx-m-006', 'name' => 'Jasa Pelatihan',         'date' => '2026-02-18', 'category_id' => 'cat-002', 'amount' => 3000000,  'notes' => 'Training 10 peserta'],
            ['id' => 'trx-m-007', 'name' => 'Penjualan Online',       'date' => '2026-03-07', 'category_id' => 'cat-001', 'amount' => 6500000,  'notes' => 'Via marketplace'],
            ['id' => 'trx-m-008', 'name' => 'Pinjaman Bank',          'date' => '2026-03-15', 'category_id' => 'cat-004', 'amount' => 20000000, 'notes' => 'KMK BRI tenor 12 bulan'],
            ['id' => 'trx-m-009', 'name' => 'Jasa Desain Grafis',     'date' => '2026-03-22', 'category_id' => 'cat-002', 'amount' => 1800000,  'notes' => 'Proyek branding klien'],
            ['id' => 'trx-m-010', 'name' => 'Penjualan Akhir Bulan',  'date' => '2026-04-10', 'category_id' => 'cat-001', 'amount' => 7200000,  'notes' => 'Closing kuartal 1'],
            ['id' => 'trx-m-011', 'name' => 'Return Investasi',       'date' => '2026-04-18', 'category_id' => 'cat-003', 'amount' => 2500000,  'notes' => 'Hasil saham Q1'],
        ];

        // =========================================================
        // TRANSAKSI KELUAR
        // =========================================================
        $transaksiKeluar = [
            ['id' => 'trx-k-001', 'name' => 'Beli Bahan Baku Bulan Jan', 'date' => '2026-01-08',  'category_id' => 'cat-005', 'amount' => 4000000,  'notes' => 'Supplier: UD Sumber Makmur'],
            ['id' => 'trx-k-002', 'name' => 'Gaji Karyawan Januari',     'date' => '2026-01-31',  'category_id' => 'cat-006', 'amount' => 6000000,  'notes' => '3 karyawan tetap'],
            ['id' => 'trx-k-003', 'name' => 'Bayar Listrik & Internet',  'date' => '2026-01-25',  'category_id' => 'cat-007', 'amount' => 850000,   'notes' => 'Tagihan bulan Januari'],
            ['id' => 'trx-k-004', 'name' => 'Sewa Ruko Bulan Februari',  'date' => '2026-02-01',  'category_id' => 'cat-008', 'amount' => 3500000,  'notes' => 'Kontrak tahunan'],
            ['id' => 'trx-k-005', 'name' => 'Beli Bahan Baku Bulan Feb', 'date' => '2026-02-06',  'category_id' => 'cat-005', 'amount' => 3800000,  'notes' => 'Stok produksi'],
            ['id' => 'trx-k-006', 'name' => 'Gaji Karyawan Februari',    'date' => '2026-02-28',  'category_id' => 'cat-006', 'amount' => 6000000,  'notes' => '3 karyawan tetap'],
            ['id' => 'trx-k-007', 'name' => 'Biaya Iklan Digital',       'date' => '2026-02-15',  'category_id' => 'cat-007', 'amount' => 1200000,  'notes' => 'Meta Ads + Google Ads'],
            ['id' => 'trx-k-008', 'name' => 'Beli Bahan Baku Bulan Mar', 'date' => '2026-03-05',  'category_id' => 'cat-005', 'amount' => 4500000,  'notes' => 'Pesanan meningkat'],
            ['id' => 'trx-k-009', 'name' => 'Sewa Ruko Bulan Maret',     'date' => '2026-03-01',  'category_id' => 'cat-008', 'amount' => 3500000,  'notes' => 'Kontrak tahunan'],
            ['id' => 'trx-k-010', 'name' => 'Gaji Karyawan Maret',       'date' => '2026-03-31',  'category_id' => 'cat-006', 'amount' => 6500000,  'notes' => '3 karyawan + bonus'],
            ['id' => 'trx-k-011', 'name' => 'Bayar Listrik & Internet',  'date' => '2026-03-25',  'category_id' => 'cat-007', 'amount' => 900000,   'notes' => 'Tagihan bulan Maret'],
            ['id' => 'trx-k-012', 'name' => 'Sewa Ruko Bulan April',     'date' => '2026-04-01',  'category_id' => 'cat-008', 'amount' => 3500000,  'notes' => 'Kontrak tahunan'],
            ['id' => 'trx-k-013', 'name' => 'Beli Peralatan Kantor',     'date' => '2026-04-05',  'category_id' => 'cat-007', 'amount' => 2200000,  'notes' => 'Printer + ATK'],
            ['id' => 'trx-k-014', 'name' => 'Gaji Karyawan April',       'date' => '2026-04-20',  'category_id' => 'cat-006', 'amount' => 6000000,  'notes' => '3 karyawan tetap'],
        ];

        $allTransactions = array_merge($transaksiMasuk, $transaksiKeluar);

        foreach ($allTransactions as $trx) {
            DB::table('transactions')->updateOrInsert(
                ['id' => $trx['id']],
                array_merge($trx, [
                    'type'       => str_contains($trx['id'], '-m-') ? 'masuk' : 'keluar',
                    'receipt_url' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }

        $this->command->info('✅ Data dummy berhasil dibuat!');
        $this->command->info('   - ' . count($categories) . ' kategori (4 masuk + 4 keluar)');
        $this->command->info('   - ' . count($transaksiMasuk) . ' transaksi masuk');
        $this->command->info('   - ' . count($transaksiKeluar) . ' transaksi keluar');
    }
}
