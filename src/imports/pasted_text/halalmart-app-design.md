Buatkan desain UI/UX aplikasi web bernama “HalalMart”, yaitu aplikasi pencatatan dan monitoring arus kas untuk kebutuhan pribadi dan operasional UMKM HalalMart. Bahasa antarmuka harus menggunakan Bahasa Indonesia. Platform utama adalah website desktop, tetapi desain harus tetap sangat nyaman, rapi, responsif, dan interaktif saat dibuka di mobile browser.

Tujuan utama aplikasi:
- membantu pengguna mencatat transaksi pemasukan dan pengeluaran
- memantau kondisi arus kas secara visual
- memfilter data berdasarkan kategori dan tanggal
- mengelola kategori transaksi
- membuat laporan arus kas yang bisa diexport ke PDF
- menyediakan sistem login dan register

Arah desain:
- minimalist, clean, modern, premium, elegan, tidak ramai
- nuansa visual seperti produk Apple: banyak white space, struktur rapi, tipografi jelas, card bersih, ikon halus, visual ringan
- mendukung light mode dan dark mode dengan toggle yang mudah digunakan user
- desain harus terasa modern, profesional, dan cocok untuk aplikasi keuangan bisnis kecil
- hindari tampilan seperti admin template generik
- gunakan hierarchy visual yang kuat, spacing konsisten, radius modern, bayangan lembut, dan state interaktif yang jelas
- tampilkan desain yang terasa hidup, interaktif, dan polished

Branding:
- nama aplikasi: HalalMart
- buat identitas visual yang modern, profesional, bersih, dan terpercaya
- gunakan warna utama yang cocok untuk aplikasi keuangan halal: hijau modern yang elegan sebagai warna utama, dipadukan dengan netral terang/gelap
- sediakan versi light mode dan dark mode
- gunakan aksen warna yang tetap hemat agar tidak terlalu ramai
- bila perlu, tambahkan logo placeholder sederhana bertema HalalMart yang clean dan modern

Target user:
1. pengguna pribadi yang ingin mencatat arus kas
2. UMKM HalalMart yang ingin memantau pemasukan, pengeluaran, dan laporan arus kas

Buatkan desain dengan struktur informasi dan user flow yang sangat jelas. Jangan hanya membuat tampilan cantik, tetapi juga pikirkan UX, navigasi, kemudahan input data, keterbacaan tabel, dan kenyamanan penggunaan di desktop maupun mobile.

==================================================
HALAMAN YANG HARUS DIBUAT
==================================================

1. Halaman Login
- form email
- form password
- tombol login
- link ke halaman register
- opsi lihat/sembunyikan password
- tampilkan desain yang clean, modern, tidak membosankan
- sediakan card auth yang elegan
- tampilkan branding HalalMart secara halus
- dark mode dan light mode harus tetap konsisten

2. Halaman Register
- nama lengkap
- email
- password
- konfirmasi password
- tombol register
- link ke halaman login
- validasi visual yang jelas
- desain harus sejalan dengan halaman login

3. Dashboard
Dashboard adalah halaman utama setelah login dan harus menjadi pusat insight keuangan.

Komponen dashboard yang wajib:
- header halaman dengan judul dashboard dan ringkasan singkat
- date range filter
- filter kategori
- tombol reset filter
- card ringkasan:
  - total pemasukan
  - total pengeluaran
  - selisih / saldo bersih
- card harus jelas, elegan, mudah discan, dan punya visual state yang baik
- tampilkan indikator tren atau perbandingan bila diperlukan

Visualisasi yang wajib:
- 1 line chart gabungan pemasukan dan pengeluaran harian
- 1 line chart gabungan pemasukan dan pengeluaran bulanan
- 1 bar chart kategori pengeluaran terbesar
- 1 bar chart kategori pemasukan terbesar

Aturan desain dashboard:
- jangan terlalu padat
- tata letak grid harus rapi dan premium
- gunakan card-chart yang modern dan sangat mudah dibaca
- legenda chart harus jelas
- filter harus mudah digunakan
- data dan insight harus cepat terbaca
- sediakan empty state saat data belum ada
- sediakan state loading yang modern seperti skeleton loading
- tampilkan interaksi hover, active, selected, dan focus state

Di mobile:
- ringkasan card tetap nyaman dibaca
- chart diatur stack vertikal
- filter bisa collapse ke panel atau sheet agar tidak sempit
- tetap prioritaskan keterbacaan

4. Halaman Kategori
Fungsi utama:
- menampilkan tabel kategori
- filter jenis kategori: pemasukan / pengeluaran
- tombol tambah kategori
- aksi edit dan hapus
- CRUD kategori

Komponen yang perlu dibuat:
- header halaman
- tombol tambah kategori
- filter jenis kategori
- search kategori
- tabel kategori yang bersih
- pagination
- modal atau drawer form tambah/edit kategori

Kolom tabel yang direkomendasikan:
- nama kategori
- jenis kategori
- tanggal dibuat
- aksi

Form kategori:
- nama kategori
- jenis kategori: pemasukan atau pengeluaran
- tombol simpan
- tombol batal

Desain:
- tabel harus modern, clean, tidak berat
- setiap row punya hover state
- aksi edit dan hapus harus jelas tapi tidak mengganggu
- konfirmasi hapus harus elegan dan aman
- tampilkan empty state jika belum ada kategori

5. Halaman Transaksi Masuk
Fungsi utama:
- menampilkan daftar transaksi pemasukan
- filter tanggal
- filter kategori
- search
- sorting ascending dan descending di tiap kolom
- menampilkan total nominal dari transaksi yang sedang tampil di layar
- ada tambah, edit, dan delete transaksi

Aturan khusus:
- saat tambah/edit transaksi masuk, pilihan kategori hanya menampilkan kategori pemasukan

Komponen halaman:
- header halaman
- tombol tambah transaksi masuk
- filter tanggal
- filter kategori
- search bar
- tombol reset filter
- tabel transaksi
- info jumlah data tampil
- total nominal data yang sedang tampil
- pagination

Kolom tabel yang direkomendasikan:
- tanggal transaksi
- nama transaksi
- kategori
- nominal
- catatan
- aksi

Aturan tabel:
- semua kolom penting bisa disort ascending/descending
- row per page maksimal tampilkan 10, 25, 50, 100 dengan default 10 atau 25
- rekomendasikan default tampilan yang paling nyaman untuk UX aplikasi keuangan
- tampilkan total nominal hanya dari data yang sedang tampil setelah filter, search, dan pagination diterapkan
- desain tabel harus profesional, nyaman untuk data finansial, dan mudah discan

Form tambah/edit transaksi masuk:
- nama transaksi
- tanggal transaksi
- kategori pemasukan
- nominal
- catatan
- tombol simpan
- tombol batal

Desain form:
- gunakan modal besar, drawer samping, atau halaman form yang sangat nyaman
- pastikan input nominal terlihat penting dan mudah diisi
- validasi harus jelas
- tampilkan state error dan success

6. Halaman Transaksi Keluar
Halaman ini mirip dengan transaksi masuk, tetapi khusus untuk pengeluaran.

Aturan khusus:
- saat tambah/edit transaksi keluar, pilihan kategori hanya menampilkan kategori pengeluaran

Komponen dan perilaku:
- sama seperti transaksi masuk
- konsisten secara visual
- bedakan konteks dengan label atau warna aksen yang tetap halus

7. Halaman Export PDF / Laporan
Buat halaman khusus untuk membuat dan mengunduh laporan arus kas PDF.

Tujuan:
- user bisa memilih rentang tanggal
- user bisa memilih jenis laporan
- user bisa memilih kategori jika diperlukan
- user bisa preview ringkasan laporan sebelum download
- user bisa mengunduh file PDF yang rapi dan profesional

Komponen halaman:
- filter periode tanggal
- filter jenis laporan:
  - semua transaksi
  - hanya pemasukan
  - hanya pengeluaran
  - laporan arus kas lengkap
- filter kategori opsional
- tombol preview laporan
- tombol download PDF

Tampilan preview laporan di aplikasi:
- card ringkasan:
  - total pemasukan
  - total pengeluaran
  - selisih
- tabel ringkasan transaksi
- preview mini dari struktur PDF
- informasi periode laporan

Konsep desain hasil PDF:
Buat rancangan preview PDF yang profesional dan cocok untuk laporan skripsi maupun operasional UMKM.

Struktur PDF yang direkomendasikan:
- header laporan dengan nama HalalMart
- judul laporan: Laporan Arus Kas
- periode laporan
- tanggal cetak
- ringkasan total pemasukan, pengeluaran, dan selisih
- tabel transaksi masuk dan keluar
- bisa dipisahkan per bagian atau diberi label jenis transaksi
- gunakan layout PDF yang bersih, formal, profesional, sangat mudah dibaca
- cocok dicetak di kertas A4
- tampilkan contoh desain preview PDF di UI aplikasi

==================================================
NAVIGASI DAN STRUKTUR LAYOUT
==================================================

Buat sistem navigasi yang modern, sederhana, dan nyaman.

Untuk desktop:
- gunakan sidebar kiri modern yang clean
- menu:
  - Dashboard
  - Kategori
  - Transaksi Masuk
  - Transaksi Keluar
  - Export PDF
- bagian atas/topbar berisi:
  - nama halaman
  - search global opsional
  - toggle light/dark mode
  - profil user dropdown

Untuk mobile:
- gunakan pendekatan yang tetap interaktif dan efisien
- bisa gunakan bottom navigation atau sidebar drawer mobile
- navigasi harus tetap mudah dijangkau
- filter kompleks bisa dibuka melalui drawer atau bottom sheet
- hindari tabel yang terlalu sulit dipakai di layar kecil
- bila perlu, gunakan responsive table atau card list untuk mobile

==================================================
USER FLOW YANG HARUS DIDESAIN
==================================================

Susun alur pengguna yang logis dan halus:

Flow utama:
1. user membuka aplikasi
2. login atau register
3. masuk ke dashboard
4. melihat ringkasan arus kas
5. membuka transaksi masuk atau transaksi keluar
6. menambah transaksi
7. kembali melihat dashboard dengan data terupdate
8. mengelola kategori bila diperlukan
9. membuat laporan PDF
10. download laporan

Flow tambahan:
- user mengganti dark mode/light mode
- user memfilter dashboard berdasarkan tanggal dan kategori
- user mengurutkan tabel transaksi
- user melihat total transaksi yang sedang tampil
- user menghapus data dengan dialog konfirmasi yang aman

==================================================
KOMPONEN INTERAKTIF YANG WAJIB ADA
==================================================

Buat komponen reusable dan interaktif, seperti:
- tombol primary, secondary, ghost, danger
- input text
- input search
- select dropdown
- date picker / range picker
- modal
- drawer
- dropdown menu
- pagination
- tab / segmented control jika perlu
- badge status
- toast notification
- confirmation dialog
- empty state
- loading state / skeleton
- chart card
- stat card
- responsive table
- mobile card list untuk transaksi bila diperlukan
- toggle dark mode/light mode
- show/hide password
- hover, active, focus, disabled state pada semua komponen penting

Pastikan seluruh komponen terlihat konsisten, reusable, modern, dan siap diimplementasikan oleh developer.

==================================================
PRINSIP UX YANG HARUS DIIKUTI
==================================================

- prioritaskan keterbacaan data finansial
- jangan terlalu banyak warna
- hierarchy harus jelas
- white space cukup luas
- tombol aksi penting harus mudah ditemukan
- filter harus praktis
- jangan membuat halaman terlalu padat
- desain harus terasa ringan dan cepat
- error state, empty state, success state harus jelas
- cocok untuk user non-teknis
- interaksi harus terasa modern dan halus
- mobile responsiveness harus dipikirkan sejak awal, bukan hanya versi desktop yang diperkecil

==================================================
DELIVERABLE DESAIN YANG DIINGINKAN
==================================================

Tolong hasilkan:
- desain high-fidelity untuk desktop dan mobile
- design system mini untuk warna, tipografi, spacing, button, input, card, table, modal
- halaman login
- halaman register
- dashboard
- halaman kategori
- halaman transaksi masuk
- halaman transaksi keluar
- halaman export PDF
- komponen interaktif utama
- contoh dark mode dan light mode
- contoh preview hasil laporan PDF
- prototype flow dasar antar halaman

Pastikan hasil akhir terasa seperti produk SaaS keuangan modern yang bersih, profesional, interaktif, elegan, dan realistis untuk dikembangkan lebih lanjut dengan Laravel 11.