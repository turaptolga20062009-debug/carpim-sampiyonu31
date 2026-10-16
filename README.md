# Çarpım Şampiyonu — Python + PWA

Bu proje Flask (Python) ile sunulan, iPhone ana ekranına eklenebilen ve temel oyun dosyalarını önbelleğe alarak çevrimdışı açılabilen bir web uygulaması başlangıcıdır.

## Özellikler
- 1–10 arası karışık çarpım soruları
- 60 saniyelik turlar, soru başına 15 saniye
- Dört şıklı cevaplar
- Yanlış cevapta doğru işlemi gösterme
- Başarı arttıkça daha büyük çarpanlara yönelen basit uyarlamalı zorluk
- Puan, seri, en iyi puan ve yanlış işlemleri takip etme
- Günlük 5 dakika hedef göstergesi
- Tekrar çalış ekranı
- PWA manifest ve service worker
- İlerleme bilgileri bu cihazın localStorage alanında tutulur

## Bilgisayarda çalıştırma (Windows)
1. Python 3.10 veya daha yeni bir sürüm kur.
2. Bu klasörü çıkar.
3. Klasör içinde Komut İstemi / PowerShell aç.
4. Şunları çalıştır:

```bash
py -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

5. Bilgisayarda `http://127.0.0.1:5000` adresini aç.

## iPhone'da kullanma ve internete yayınlama
- iPhone'da her yerden erişmek için uygulamanın HTTPS destekleyen bir hosting hizmetine yayınlanması gerekir.
- Yayınlandıktan sonra iPhone Safari'de adresini aç, Paylaş düğmesine dokun, **Ana Ekrana Ekle** seçeneğini kullan.
- İlk açılışta internet bağlantısı gerekir. Service worker dosyaları önbelleğe aldıktan sonra uygulama çevrimdışı da açılabilir.
- Çevrimdışı kullanım, uygulamanın önceden en az bir kez çevrimiçiyken açılmış olmasına bağlıdır.
- Bu ilk sürüm ilerlemeyi yalnızca ilgili cihaz/tarayıcıda saklar; cihazlar arasında eşitleme yoktur.

## Önemli notlar
- Yerel Flask geliştirme sunucusu herkese açık internet sunucusu değildir. `app.py` içindeki `debug=True` yalnızca yerel geliştirme içindir. Herkese açık yayın için bir üretim sunucusu/hosting ayarı kullan.
- Günlük süre sayacı şu başlangıç sürümünde tamamlanan oyun turlarının süresini toplar; daha gelişmiş oturum takibi daha sonra eklenebilir.
- Google Fonts internetten yüklenir; çevrimdışıyken sistem yazı tipi kullanılır.
