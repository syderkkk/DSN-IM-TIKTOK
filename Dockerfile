# Imagen base oficial de Node
FROM node:20

# Metadata
LABEL maintainer="italo.mendoza@tecsup.edu.pe"
LABEL description="DSN - PC01 - TikTok Downloader - versión básica"

# Directorio de trabajo
WORKDIR /app

# Copiar dependencias primero (mejor uso de caché)
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY app.js .
COPY public ./public

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["node", "app.js"]