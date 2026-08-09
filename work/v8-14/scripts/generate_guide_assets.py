from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib.colors import HexColor, white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "downloads"
OUT.mkdir(parents=True, exist_ok=True)
PDF = OUT / "panduan-lengkap-jeniusppt.pdf"
SCREENSHOT = ROOT.parents[1] / "upload" / "db20dee0-0737-45e2-91fb-e269f01e063f.png"

font = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
bold = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
pdfmetrics.registerFont(TTFont("JP", font))
pdfmetrics.registerFont(TTFont("JPB", bold))
W,H = landscape(A4)
ORANGE, NAVY, MUTED, LIGHT, BLUE, GREEN = map(HexColor,["#ff6b1a","#111827","#64748b","#f1f5f9","#2563eb","#16a34a"])

def text(c, value, x, y, size=12, color=NAVY, face="JP", max_width=None):
    c.setFont(face,size); c.setFillColor(color)
    words=value.split(); line=""; lines=[]
    for word in words:
        trial=(line+" "+word).strip()
        if max_width and c.stringWidth(trial,face,size)>max_width:
            lines.append(line); line=word
        else: line=trial
    if line: lines.append(line)
    for i,row in enumerate(lines): c.drawString(x,y-i*(size*1.35),row)
    return y-len(lines)*(size*1.35)

def header(c, chapter, title, subtitle):
    c.setFillColor(white); c.rect(0,0,W,H,fill=1,stroke=0)
    c.setFillColor(ORANGE); c.rect(0,H-18,W,18,fill=1,stroke=0)
    text(c,chapter.upper(),46,H-58,10,ORANGE,"JPB")
    text(c,title,46,H-96,26,NAVY,"JPB")
    text(c,subtitle,46,H-122,11,MUTED,"JP",W-92)

def footer(c, page):
    c.setStrokeColor(HexColor("#e2e8f0")); c.line(46,30,W-46,30)
    text(c,"JeniusPPT.online - Panduan Pengguna",46,15,8,MUTED)
    text(c,str(page),W-57,15,8,MUTED,"JPB")

def card(c,x,y,w,h,title,body,color=ORANGE,icon="JP"):
    c.setFillColor(white); c.setStrokeColor(HexColor("#dbe2ea")); c.roundRect(x,y,w,h,12,fill=1,stroke=1)
    c.setFillColor(color); c.roundRect(x+14,y+h-51,38,38,9,fill=1,stroke=0)
    text(c,icon,x+21,y+h-39,10,white,"JPB")
    text(c,title,x+64,y+h-31,13,NAVY,"JPB",w-78)
    text(c,body,x+16,y+h-72,9,MUTED,"JP",w-32)

def mock_sidebar(c,x,y,w,h,active=0):
    c.setFillColor(LIGHT); c.roundRect(x,y,w,h,10,fill=1,stroke=0)
    items=["Dashboard","Jenius AI","Workspace","Materi","Peserta","Bank Soal","Bantuan"]
    for i,item in enumerate(items):
        yy=y+h-42-i*36
        c.setFillColor(ORANGE if i==active else HexColor("#ffffff")); c.roundRect(x+10,yy-10,w-20,29,7,fill=1,stroke=0)
        text(c,item,x+23,yy,8,white if i==active else NAVY,"JPB")

c=canvas.Canvas(str(PDF),pagesize=(W,H))

# 1
c.setFillColor(ORANGE); c.rect(0,0,W,H,fill=1,stroke=0)
c.setFillColor(white); c.circle(110,H-110,48,fill=1,stroke=0); text(c,"JP",85,H-124,27,ORANGE,"JPB")
text(c,"PANDUAN LENGKAP",64,H-210,13,white,"JPB")
text(c,"JeniusPPT.online",64,H-258,35,white,"JPB")
text(c,"Membuat presentasi, kuis, publikasi, sertifikat, dan laporan peserta dalam satu aplikasi.",64,H-294,13,white,"JP",560)
text(c,"Edisi 2026  |  Desktop dan Mobile",64,62,10,white,"JPB")
c.showPage()

# 2
header(c,"Daftar isi","Alur belajar yang disarankan","Ikuti bab secara berurutan saat pertama kali memakai JeniusPPT.")
chapters=[("01","Masuk & Dashboard","Login, tur, tema, bahasa"),("02","Membuat Materi","Slide, font, elemen, media"),("03","Kuis & Bank Soal","Soal, folder, impor, ekspor"),("04","Publikasi","Pratinjau, tautan, QR"),("05","Peserta","Nilai, filter, laporan"),("06","Fitur Lanjutan","AI, sertifikat, kreator, cadangan")]
for i,(n,t,b) in enumerate(chapters): card(c,46+(i%3)*250,115+(1-i//3)*160,225,132,t,b,ORANGE,n)
footer(c,2); c.showPage()

# 3
header(c,"Bab 1","Dashboard dan navigasi","Menu kiri menjadi pusat perpindahan halaman. Menu aktif selalu memakai warna solid cerah dengan teks putih.")
mock_sidebar(c,48,70,175,320,0)
card(c,250,260,250,118,"Mulai dari Dashboard","Lihat jumlah materi, peserta, publikasi terbaru, lalu gunakan tombol Buat Materi.",BLUE,"1")
card(c,520,260,250,118,"Ikuti Tour Guide","Sorotan gelap dan panah akan menunjuk menu satu per satu. Gunakan Berikutnya atau tombol panah keyboard.",ORANGE,"2")
card(c,250,105,250,118,"Atur tampilan","Pilih mode terang, gelap, warna aksen, serta bahasa melalui bagian atas dan Pengaturan.",GREEN,"3")
card(c,520,105,250,118,"Aman di HP","Buka hamburger untuk menampilkan menu. Dropdown berubah menjadi panel sentuh di bagian bawah.",BLUE,"4")
footer(c,3); c.showPage()

# 4
header(c,"Bab 2","Editor slide dan pemilihan font","Klik Judul, Isi, atau elemen teks. Setelah font dipilih, bentuk huruf langsung berubah dan tersimpan pada slide.")
if SCREENSHOT.exists():
    img=ImageReader(str(SCREENSHOT)); c.drawImage(img,45,88,width=515,height=290,preserveAspectRatio=True,anchor="c",mask="auto")
card(c,585,275,205,103,"1. Pilih target","Gunakan dropdown Judul, Isi, atau Teks Terpilih.",ORANGE,"1")
card(c,585,155,205,103,"2. Pilih font","Setiap nama memperlihatkan bentuk font aslinya.",BLUE,"2")
card(c,585,35,205,103,"3. Edit slide","Ukuran, tebal, miring, posisi, warna, serta spasi dapat diatur.",GREEN,"3")
footer(c,4); c.showPage()

# 5
header(c,"Bab 2","Elemen, media, desain, dan transisi","Ribbon editor dikelompokkan seperti aplikasi dokumen agar alat mudah ditemukan.")
items=[("Elemen","Teks, bentuk, foto, tabel, bagan, bingkai, stiker, dan objek 3D."),("Klik kanan","Duplikat, depan, belakang, kunci, dan hapus elemen."),("Media","Unggah gambar, video, audio, atau gunakan tautan yang didukung."),("Desain","Atur latar solid, ukuran slide, orientasi, dan template."),("Transisi","Pilih animasi serta durasi perpindahan slide."),("Simpan","Gunakan Simpan, Undo, Redo, Ctrl+S, Ctrl+Z, dan Ctrl+D.")]
for i,(t,b) in enumerate(items): card(c,46+(i%3)*250,112+(1-i//3)*160,225,132,t,b,[ORANGE,BLUE,GREEN][i%3],str(i+1))
footer(c,5); c.showPage()

# 6
header(c,"Bab 3","Bank Soal seperti pengelola berkas","Soal dapat dikelompokkan agar mudah dicari dan digunakan kembali.")
mock_sidebar(c,48,70,175,320,5)
steps=[("Folder baru","Pisahkan soal berdasarkan mapel, kelas, semester, atau tujuan."),("Cari dan urutkan","Cari isi soal lalu urutkan terbaru atau A-Z."),("Pilih beberapa","Pilih semua atau beberapa soal untuk dipindahkan dan dihapus."),("Impor dan ekspor","Cadangkan bank soal dalam JSON dan masukkan kembali kapan saja."),("Tampilan","Pilih daftar untuk detail atau kartu untuk melihat koleksi secara ringkas.")]
for i,(t,b) in enumerate(steps): card(c,250+(i%2)*270,285-(i//2)*115,250,98,t,b,ORANGE if i%2==0 else BLUE,str(i+1))
footer(c,6); c.showPage()

# 7
header(c,"Bab 4","Pratinjau dan publikasi","Pastikan slide dan kuis benar sebelum membagikan materi kepada peserta.")
for i,(t,b) in enumerate([("Preview","Periksa slide, animasi, video, audio, dan soal."),("Publish","Tekan Publish untuk membuat versi daring."),("Bagikan","Salin tautan atau tampilkan QR untuk dipindai siswa."),("Nilai pengalaman","Setelah publikasi, isi nilai 1-5 dan komentar singkat."),("Perbarui","Edit materi lalu publish ulang jika terdapat perubahan.")]): card(c,46+(i%3)*250,110+(1-i//3)*160,225,132,t,b,[BLUE,ORANGE,GREEN][i%3],str(i+1))
footer(c,7); c.showPage()

# 8
header(c,"Bab 5","Peserta, nilai, dan laporan","Halaman Peserta menggunakan warna solid dan menyediakan pengelolaan riwayat secara aman.")
items=[("Filter","Cari nama, materi, kelas, gender, status, dan rentang nilai."),("Pilih riwayat","Centang satu, beberapa, atau semua peserta yang sedang terlihat."),("Hapus","Hapus dipilih berwarna merah saat aktif. Hapus semua meminta konfirmasi."),("Laporan","Unduh Excel untuk olah data atau PDF untuk laporan siap baca."),("Ringkasan","Lihat total data, selesai, mengerjakan, serta rata-rata nilai."),("Sertifikat","Peserta yang memenuhi nilai minimum dapat menerima sertifikat.")]
for i,(t,b) in enumerate(items): card(c,46+(i%3)*250,112+(1-i//3)*160,225,132,t,b,[ORANGE,BLUE,GREEN][i%3],str(i+1))
footer(c,8); c.showPage()

# 9
header(c,"Bab 6","Jenius AI, sertifikat, dan Galeri Kreator","Gunakan alat tambahan sesuai kebutuhan tanpa meninggalkan ruang kerja utama.")
card(c,46,220,225,160,"Jenius AI","Masukkan topik, jenjang, jumlah slide, dan instruksi. Periksa fakta dan edit hasil sebelum publikasi.",BLUE,"AI")
card(c,307,220,225,160,"Studio Sertifikat","Atur teks, warna, logo, foto, tanda tangan, bingkai, dan lihat pratinjau langsung. Unduh JPG atau PDF.",ORANGE,"SC")
card(c,568,220,225,160,"Galeri Kreator","Unggah karya, isi kategori serta harga, kemudian kirim untuk kurasi. Transaksi nyata memerlukan payment gateway.",GREEN,"GK")
card(c,176,70,225,120,"Workspace & Sampah","Kelola file dan folder. Materi yang dihapus masuk Tempat Sampah sebelum dihapus permanen.",BLUE,"WS")
card(c,437,70,225,120,"Keamanan & Cadangan","Unduh cadangan data, simpan versi pemulihan, dan jangan membagikan kunci rahasia aplikasi.",ORANGE,"BK")
footer(c,9); c.showPage()

# 10
header(c,"Bantuan","Pemecahan masalah cepat","Gunakan daftar ini sebelum menghubungi pengelola.")
tips=[("Font belum berubah","Pilih target teks, pilih font lagi, simpan, lalu muat ulang dengan Ctrl+F5."),("Video tidak berjalan","Periksa tautan, format berkas, jaringan, dan izin autoplay browser."),("Link siswa gagal","Pastikan Firebase terkonfigurasi dan deployment Vercel berstatus Ready."),("Email gagal","Periksa GMAIL_USER, GMAIL_APP_PASSWORD, FEEDBACK_TO_EMAIL, lalu Redeploy."),("Tampilan lama","Gunakan Ctrl+Shift+R atau buka tab samaran untuk melewati cache."),("Data penting","Ekspor cadangan secara berkala sebelum menghapus data dalam jumlah besar.")]
for i,(t,b) in enumerate(tips): card(c,46+(i%2)*375,310-(i//2)*112,350,96,t,b,ORANGE if i%2==0 else BLUE,"!")
footer(c,10); c.showPage()

c.save()
print(PDF)
