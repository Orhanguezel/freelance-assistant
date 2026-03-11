# Freelance Assistant

Bu klasor Bionluk ve benzeri platformlarda teklif yazma rutini icin yerel bir yardimci arac icerir.

## Ne Yapar

- ilan metninden ihtiyac sinyallerini cikarir
- sana uygun kisa teklif yazar
- 600 karakter sinirina uygun kisa versiyon uretir
- daha detayli uzun teklif yazar
- Bionluk ve Upwork icin farkli ton kullanir
- ilk teslim suresi onerisi verir
- gunluk kullanim icin ozet ve kontrol listesi verir
- web arayuzunde tek tikla kopyalama saglar
- mevcut proje metadata'larindan bilgi paketi uretebilir

## Kurulum

```bash
cd /home/orhan/Documents/Projeler/Orhanguezel/career/freelance-assistant
npm run proposal:generate -- --brief examples/bionluk-brief.md
```

## Komutlar

```bash
npm run proposal:generate -- --brief examples/bionluk-brief.md
npm run proposal:generate -- --brief examples/bionluk-brief.md --platform upwork
npm run proposal:generate -- --brief examples/bionluk-brief.md --title "Next.js gelistirme destegi"
npm run proposal:generate -- --text "Ilan metni..."
cat ilan.txt | npm run proposal:generate -- --brief -
npm run proposal:web
npm run knowledge:sync
```

## Dosya Yapisi

- `src/generate-proposal.mjs`: teklif ureten CLI
- `src/proposal-engine.mjs`: ortak teklif motoru
- `src/server.mjs`: lokal web arayuzu sunucusu
- `data/profile.json`: senin guclu yonlerin ve varsayilan profil bilgilerin
- `data/knowledge.json`: projelerinden uretilen tasinabilir bilgi paketi
- `examples/bionluk-brief.md`: ornek ilan metni
- `public/`: web arayuzu dosyalari

## Not

Gerektiginde `data/profile.json` icini guncelleyerek cikan metinleri hizalayabilirsin.

Web arayuzu:

```bash
cd /home/orhan/Documents/Projeler/Orhanguezel/career/freelance-assistant
npm run proposal:web
# sonra tarayicida http://localhost:4177
```

Ayri repo mantigi:

- Bu araci ayri GitHub reposuna tasidiginda server tarafinda `/home/orhan/Documents/Projeler` yapisina ihtiyac duymaz.
- Gerekli proje bilgisi `data/knowledge.json` icinde tasinir.
- Bilgiyi guncellemek icin yerelde sunu calistir:

```bash
cd /home/orhan/Documents/Projeler/Orhanguezel/career/freelance-assistant
npm run knowledge:sync
```

Production dosyalari:

- `ecosystem.config.cjs`
- `deploy/nginx.freelance-assistant.conf`
- `deploy/deploy.sh`
- `DEPLOY.md`
