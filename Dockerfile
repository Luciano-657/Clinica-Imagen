# Imagen base con PHP + Apache
FROM php:8.2-apache

# Instalar dependencias del sistema y extensiones PHP necesarias
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    zip \
    && docker-php-ext-install pdo pdo_mysql mysqli

# Instalar Composer (copiado desde la imagen oficial de Composer)
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Habilitar mod_rewrite (útil si usas URLs limpias)
RUN a2enmod rewrite

# Definir la carpeta de trabajo
WORKDIR /var/www/html
