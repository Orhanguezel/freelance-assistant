# Deploy Guide

## 1. Yeni repo olustur

Ornek:

```bash
cd /home/orhan/Documents/Projeler/Orhanguezel/career/freelance-assistant
git init -b main
git add .
git commit -m "feat: bootstrap freelance assistant"
git remote add origin git@github.com:Orhanguezel/freelance-assistant.git
git push -u origin main
```

## 2. Server'a kur

```bash
ssh user@server
sudo mkdir -p /var/www/freelance-assistant
sudo chown -R $USER:$USER /var/www/freelance-assistant
cd /var/www
git clone git@github.com:Orhanguezel/freelance-assistant.git
cd freelance-assistant
npm install --omit=dev
pm2 start ecosystem.config.cjs
pm2 save
```

## 3. Nginx bagla

Kopyala:

```bash
sudo cp deploy/nginx.freelance-assistant.conf /etc/nginx/sites-available/freelance-assistant
sudo ln -s /etc/nginx/sites-available/freelance-assistant /etc/nginx/sites-enabled/freelance-assistant
sudo nginx -t
sudo systemctl reload nginx
```

## 4. SSL ekle

```bash
sudo certbot --nginx -d teklif.orhanguezel.com
```

## 5. Guncelleme

Server tarafinda:

```bash
cd /var/www/freelance-assistant
bash deploy/deploy.sh
```

## 6. Health check

```bash
curl http://127.0.0.1:4177/health
```
