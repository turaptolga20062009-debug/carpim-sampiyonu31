# Çarpım Şampiyonu — Render'a yükleme

1. Bu klasörün içindeki dosyaları GitHub'da yeni bir depoya yükleyin (repository root doğrudan app.py, requirements.txt, templates/, static/ içermeli).
2. Render'da New + > Web Service seçin ve GitHub deposunu bağlayın.
3. Runtime Python seçin. Build Command: `pip install -r requirements.txt`
4. Start Command: `gunicorn app:app --bind 0.0.0.0:$PORT`
5. Free planı seçip Create Web Service'e basın.
6. Deploy bitince Render'ın verdiği `https://...onrender.com` bağlantısını iPhone'da Safari ile açın.
7. Paylaş > Ana Ekrana Ekle.

Not: Ücretsiz web hizmetleri bir süre kullanılmadığında uykuya geçebilir; ilk açılış biraz gecikebilir. Oyun ilerlemesi cihazın tarayıcı depolamasında tutulur.
