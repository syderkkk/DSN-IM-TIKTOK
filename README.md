# DSN-IM-TIKTOK

Aplicacion web para analizar y descargar videos de TikTok.

## Requisitos

- Node.js 20+
- npm 10+
- Docker (opcional)
- Git

## 1) Clonar el repositorio

```bash
git clone https://github.com/syderkkk/DSN-IM-TIKTOK
cd DSN-IM-TIKTOK
```

## 2) Ejecutar en local (sin Docker)

Instalar dependencias:

```bash
npm install
```

Iniciar servidor:

```bash
npm start
```

Abrir en navegador:

- http://localhost:3000

Validar health check:

```bash
curl -i http://localhost:3000/health
```

Respuesta esperada:

- HTTP 200
- {"status":"ok"}

## 3) Ejecutar con Docker

### 3.1 Build de imagen basica

```bash
docker build -t dsn-im-tiktok:v1.0 .
```

### 3.2 Build de imagen optimizada (slim)

```bash
docker build -f Dockerfile.optimizado -t dsn-im-tiktok:v1.1-slim .
```

### 3.3 Build de imagen multistage (slim)

```bash
docker build -f Dockerfile.multistage -t dsn-im-tiktok:v1.2-slim .
```

Ver imagenes:

```bash
docker images | grep dsn-im-tiktok
```

### 3.4 Levantar contenedor

```bash
docker rm -f dsn-im-tiktok-container 2>/dev/null || true
docker run -d --name dsn-im-tiktok-container -p 3000:3000 --restart unless-stopped dsn-im-tiktok:v1.1-slim
```

Verificar estado:

```bash
docker ps
docker logs --tail 100 dsn-im-tiktok-container
curl -i http://localhost:3000/health
```

## 4) Comandos utiles

Ver estado del contenedor:

```bash
docker ps -a | grep dsn-im-tiktok-container
```

Reiniciar contenedor:

```bash
docker restart dsn-im-tiktok-container
```

Detener y borrar:

```bash
docker rm -f dsn-im-tiktok-container
```

Ver logs en vivo:

```bash
docker logs -f dsn-im-tiktok-container
```

## 5) Solucion de problemas

### Error: container name is already in use

```bash
docker rm -f dsn-im-tiktok-container
docker run -d --name dsn-im-tiktok-container -p 3000:3000 --restart unless-stopped dsn-im-tiktok:v1.1-slim
```

## 6) Estructura del proyecto

```text
app.js
Dockerfile
Dockerfile.optimizado
Dockerfile.multistage
package.json
public/
  index.html
```

## 7) Notas

- La aplicacion esta orientada a uso educativo.
- Respetar derechos de autor y terminos de plataforma.
