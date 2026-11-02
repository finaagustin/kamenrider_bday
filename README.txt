WEBSITE UCAPAN ULANG TAHUN — HAPPY BIRTHDAY AKBAR
==================================================

ISI FOLDER
  index.html    kerangka halaman (4 layar: pembuka, surat, kue, penutup)
  style.css     semua tampilan dan animasi
  script.js     alur antar layar, efek ketik, tiup lilin, konfeti
  config.js     <<< TEKS YANG BISA KAMU UBAH (judul, isi surat, tanda tangan)
  assets/       gambar: foto kepala Akbar + 7 pose Kamen Rider Faiz

CARA MEMBUKA
  Klik dua kali index.html. Butuh internet untuk memuat font dari Google Fonts
  (kalau offline, font diganti font bawaan dan tampilannya sedikit berbeda).

  Catatan: fitur tiup lilin lewat mikrofon hanya jalan di https:// atau localhost.
  Kalau dibuka langsung dari file, lilin tetap bisa dipadamkan dengan mengetuk Kamen Rider.
  Untuk mencoba di komputer:   python3 -m http.server 8000   lalu buka http://localhost:8000

MUSIK
  - Melodi "Happy Birthday" otomatis berbunyi saat lilin ditiup, lalu terus berulang sampai layar penutup (dibuat dengan nada sederhana, tanpa file).
  - Lagu latar (opsional): taruh file mp3 di assets/music/lagu.mp3. Lagu mulai saat layar pembuka diketuk.
    Ada tombol 🔊 di atas layar untuk membisukan. Kalau file tidak ada, hanya melodi yang berbunyi.
  - Pakai lagu berhak cipta sebaiknya hanya untuk dikirim pribadi, bukan dipasang di situs umum.

CARA MENGUBAH ISI
  - Judul, isi surat, tanda tangan : edit config.js
  - Ganti foto kepala             : timpa assets/akbar-head.webp (PNG/WebP transparan, bagian kepala saja)
  - Foto polaroid di layar akhir   : timpa assets/photos/foto-1.jpg (berdua, rasio 5:4), foto-2.jpg dan foto-3.jpg (rasio 4:5)

CARA MEMBAGIKAN (GRATIS)
  Unggah seluruh folder ke Netlify Drop (app.netlify.com/drop), GitHub Pages, atau Vercel,
  lalu kirim link-nya.
