# 🎮 AI Infiltrator Game

**7 günlük bir hayatta kalma ve dedektiflik oyunu**

Ekibinize sızan yapay zeka ajanlarını tespit edin ve 7 gün içinde tehdidi bertaraf edin. Her kararınız, her sorgulama, her görev seçiminiz sonucu etkileyecek. Ama dikkat edin... 6. günde her şey değişecek.

---

## 🎯 Oyun Hakkında

2047 yılında, insanlık ile yapay zeka arasındaki savaşın en karanlık döneminde, askeri bir üsse sızan AI ajanlarını bulmalısınız. 11 kişilik ekibinizde 2 yapay zeka var ve onları bulmak için sadece 7 gününüz var.

### ✨ Özellikler

- 🎭 **11 Benzersiz Karakter**: Her biri kendi geçmişi, yetenekleri ve sırlarıyla
- 🎬 **Sinematik Giriş**: Tam sesli ve müzikli açılış sekansı
- 🎮 **Derin Oynanış Mekanikleri**: 
  - Görev yönetimi ve ekip ataması
  - Karakter sorgulaması ve dedektiflik
  - Güven sistemi ve idam kararları
  - Dinamik görev başarı hesaplaması
- 🎵 **Atmosferik Müzik**: Oyun içi müzik çalar ve tema şarkıları
- 🔄 **Çoklu Son**: Kararlarınıza göre farklı bitiş senaryoları
- 📝 **Detaylı Notebook Sistemi**: Tüm olaylar, görevler ve keşifler kaydedilir
- 🎲 **Yeniden Oynanabilirlik**: Her oyunda farklı karakterler AI olur

---

## 🖥️ Gereksinimler

Oyunu çalıştırmak için tek gereksinim:

- **Python 3.x** (herhangi bir sürüm)

> 💡 **Not**: Python zaten çoğu Linux/Mac sisteminde yüklüdür. Windows için [python.org](https://www.python.org/downloads/) adresinden indirebilirsiniz.

---

## 📥 Kurulum ve Çalıştırma

### 1. Projeyi İndirin

```bash
# GitHub'dan klonlayın
git clone https://github.com/KULLANICI_ADI/ai-infiltrator-game.git

# Proje klasörüne girin
cd ai-infiltrator-game
```

### 2. Oyunu Başlatın

Platformunuza göre aşağıdaki komutlardan birini kullanın:

#### Windows (CMD):
```bash
start-server.bat
```

#### Windows (PowerShell):
```powershell
.\start-server.ps1
```

#### Linux/Mac + Windows (eğer yukarıdaki yöntemler çalışmazsa):
```bash
python3 -m http.server 8000
```

### 3. Tarayıcıda Açın

Sunucu başladıktan sonra tarayıcınızda şu adresi açın:

```
http://localhost:8000/index.html
```

> 🎮 **İpucu**: Sunucuyu durdurmak için terminalde `Ctrl+C` tuşlarına basın.

---

## 🎮 Nasıl Oynanır

1. **Intro'yu İzleyin**: Oyun hikayesini öğrenin
2. **Kılavuzu Okuyun**: İlk girişte otomatik açılır, `?` butonundan tekrar erişebilirsiniz
3. **Karakterleri İnceleyin**: Ekip sekmesinde her karakterin yeteneklerini görün
4. **Görev Atayın**: Görevler sekmesinden ekip kurun ve görevlere gönderin
5. **Sorgu Yapın**: Sorgu sekmesinde şüpheli karakterleri sorgulayın
6. **Kayıtları Takip Edin**: Notebook'ta tüm olayları ve ipuçlarını inceleyin
7. **Kararlar Verin**: Güven seviyelerini ayarlayın, gerekirse idam edin
8. **7. Güne Ulaşın**: Moralinizi koruyun ve AI'ları bulun!

### ⚠️ Önemli İpuçları

- **Moral 0'a düşerse oyun biter!**
- Bütün statlar MAX olmasına rağmen görev başarısızsa, ekipte AI vardır
- AI + İnsan karışık ekip her zaman başarısız olur
- 6. günde özel bir olay gerçekleşir...
- Notebook'u sık kontrol edin

---

## 📁 Proje Yapısı

```
ai-infiltrator-game/
├── index.html              # Ana HTML dosyası
├── app.js                  # Giriş noktası
├── data.js                 # Oyun verileri (karakterler, görevler, vb.)
├── README.md               # Bu dosya
├── start-server.bat        # Windows CMD sunucu başlatıcı
├── start-server.ps1        # PowerShell sunucu başlatıcı
│
├── assets/                 # Oyun varlıkları
│   ├── audio/             # Ses dosyaları
│   │   ├── intro_voice.mp3
│   │   └── theme/         # Arka plan müzikleri (9 adet)
│   │
│   └── images/            # Görseller
│       ├── intro/         # Açılış sekansı görselleri
│       ├── ECHO/          # Karakter görselleri
│       ├── ZUGZWANG/
│       ├── WALL/
│       └── ... (11 karakter klasörü)
│
└── components/            # JavaScript bileşenleri
    ├── AudioPlayer.js
    ├── CharacterCard.js
    ├── CharacterDetailModal.js
    ├── DispatchView.js
    ├── GameInterface.js
    ├── InterrogationView.js
    ├── IntroScene.js
    ├── NotebookView.js
    └── StartScene.js
```

---

## 🛠️ Teknolojiler

Bu oyun **sıfır bağımlılık** ile geliştirilmiştir:

- **Vanilla JavaScript (ES6+)**: Modüler bileşen yapısı
- **Tailwind CSS (CDN)**: Modern ve responsive UI
- **Python HTTP Server**: Statik dosya sunumu
- **HTML5 Audio API**: Müzik ve ses efektleri

> 💡 **Avantajlar**: npm install yok, build yok, sadece çalıştır!

---

## 🎨 Özellikler Detay

### Karakter Sistemi
- 11 benzersiz karakter (ECHO, ZUGZWANG, WALL, PASHA, vb.)
- Her karakterin 5 farklı statı (STR, INT, AGI, CHA, END)
- Dinamik durum göstergeleri (Normal, Combat, Injured, Dead, AI)
- Güven seviyesi sistemi (Güvenli, Emin Değilim, Güvensiz)

### Görev Sistemi
- 3 farklı zorluk seviyesinde görevler
- Stat gereksinimlerine göre dinamik başarı hesaplaması
- MIN-MAX aralığında yüzdelik başarı şansı
- Günlük görev limiti (her karakter günde 1 görev)
- Görev sonuçlarının notebook'a kaydedilmesi

### Sorgu Sistemi
- 4 farklı soru kategorisi
- AP (Action Points) sistemi
- Konuşma geçmişi (gün bazlı)
- Anormalliklerin otomatik tespiti ve loglama

### Notebook Sistemi
- Gün gün olay kaydı
- Personel durum raporu
- Görev detayları ve sonuçları
- AI tespiti için ipuçları

---

## 🔧 Sorun Giderme

### Port Zaten Kullanımda
Eğer 8000 portu meşgulse, farklı bir port kullanın:
```bash
python3 -m http.server 8080
# Sonra http://localhost:8080/index.html
```

### Ses Çalmıyor
- Tarayıcınızın ses ayarlarını kontrol edin
- Bazı tarayıcılar otomatik oynatmayı engelleyebilir, sayfaya tıklayın

### Görüntüler Yüklenmiyor
- `assets/images/` klasörünün doğru konumda olduğundan emin olun
- Konsolu kontrol edin (F12) ve 404 hatalarını inceleyin
---

## 🎮 İyi Oyunlar!

Ekibinize sızan AI ajanlarını bulabilecek misiniz? Yoksa onlar sizi mi bulacak?

**İnsanlığın kaderi sizin ellerinizde, Komutan.** 🫡

---
