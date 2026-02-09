# Docker Komutları

## Development (Geliştirme)

### Development container'ı başlat (hot reload ile)
```bash
docker-compose up toast-dev
```

veya arka planda:
```bash
docker-compose up -d toast-dev
```

Tarayıcıda aç: http://localhost:5173

### Logları izle
```bash
docker-compose logs -f toast-dev
```

## Production (Üretim)

### Production container'ı başlat
```bash
docker-compose up toast-prod
```

veya arka planda:
```bash
docker-compose up -d toast-prod
```

Tarayıcıda aç: http://localhost:8080

## Her İkisini Birden Başlat
```bash
docker-compose up -d
```

## Durdur ve Temizle

### Container'ları durdur
```bash
docker-compose down
```

### Container'ları durdur ve volume'leri temizle
```bash
docker-compose down -v
```

### Image'leri yeniden build et
```bash
docker-compose build --no-cache
```

## Manuel Docker Komutları (docker-compose kullanmadan)

### Development için build
```bash
docker build --target development -t insider-toast:dev .
```

### Development container'ı çalıştır
```bash
docker run -p 5173:5173 -v ${PWD}/src:/app/src insider-toast:dev
```

### Production için build
```bash
docker build --target production -t insider-toast:prod .
```

### Production container'ı çalıştır
```bash
docker run -p 8080:80 insider-toast:prod
```

## Test Çalıştırma

### Container içinde test
```bash
docker-compose run --rm toast-dev npm test
```

### Container içinde coverage
```bash
docker-compose run --rm toast-dev npm run test:coverage
```

## Container'a Shell Erişimi

### Development container'a bash/sh ile gir
```bash
docker-compose exec toast-dev sh
```

### Production container'a bash/sh ile gir
```bash
docker-compose exec toast-prod sh
```

## Temizlik

### Tüm container'ları sil
```bash
docker-compose rm -f
```

### Kullanılmayan image'leri temizle
```bash
docker image prune -a
```

### Tüm Docker kaynaklarını temizle
```bash
docker system prune -a --volumes
```
