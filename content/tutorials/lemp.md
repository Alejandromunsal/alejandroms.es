
---

# Servidor LEMP en Debian 12 en LXC (Proxmox)       


En este tutorial aprenderás a instalar y configurar un servidor **LEMP** (Linux, Nginx, MySQL/MariaDB y PHP) paso a paso, listo para producción.

---

## 1. Actualizar el sistema

Antes de instalar cualquier software, actualiza los repositorios y paquetes de Debian 12 para asegurarte de tener las últimas versiones y parches de seguridad.

```bash
sudo apt update && sudo apt upgrade -y
```
---  

## 2: Instalar Nginx

Nginx es un servidor web ligero y rápido. Instalaremos Nginx y verificaremos que esté activo.

```bash
sudo apt install nginx -y
sudo systemctl status nginx
```
---  
## 3: Instalar MariaDB

MariaDB será nuestra base de datos. Instalamos el paquete y aseguramos la instalación.


```bash
sudo apt install mariadb-server -y
sudo mysql_secure_installation
```
---  
## 4: Instalar PHP y extensiones

PHP permite que Nginx procese páginas dinámicas. Instalamos PHP y las extensiones necesarias para trabajar con MariaDB.

```bash
sudo apt install php-fpm php-mysql -y
php -v
```
---  
## 5: Configurar Nginx para PHP

Creamos un archivo de configuración para nuestro sitio web y le decimos a Nginx cómo manejar archivos PHP.

```bash
sudo nano /etc/nginx/sites-available/example.com
```


Contenido recomendado para el sitio:

```bash
server {
    listen 80;
    server_name example.com www.example.com;
    root /var/www/example.com;

    index index.php index.html index.htm;

    location / {
        try_files $uri $uri/ =404;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

Habilitar el sitio y recargar Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/example.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```
---  
## 6: Crear estructura de directorios para tu web

Creamos la carpeta raíz donde irán los archivos de la web y le damos permisos adecuados.

```bash
sudo mkdir -p /var/www/example.com
sudo chown -R www-data:www-data /var/www/example.com
sudo chmod -R 755 /var/www/example.com
```
---  
## 7: Comprobar PHP

Creamos un archivo info.php para verificar que PHP funciona correctamente con Nginx.

```bash
sudo nano /var/www/example.com/info.php
```

Contenido del archivo:

```php
<?php
phpinfo();
```

Después abre tu navegador y accede a:

```php
http://example.com/info.php
```

Si ves la página con la información de PHP, todo está funcionando correctamente.

---  
## 8: Ajustes de seguridad básicos

Activar firewall (ufw) y permitir tráfico web:

```bash
sudo apt install ufw -y
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

Opcional: cambiar contraseña root de MariaDB si no lo hiciste antes:

```bash
sudo mysql_secure_installation
```
---  
## 9: (Opcional) Instalar Certificado SSL con Let’s Encrypt

Si quieres que tu sitio sea HTTPS:

Instalar Certbot:

```bash
sudo apt install certbot python3-certbot-nginx -y
```


Generar certificado:

```bash
sudo certbot --nginx -d example.com -d www.example.com
```

Verificar renovación automática:

```bash
sudo systemctl status certbot.timer
```
---  
## 10: Resumen

Felicidades, has completado la instalación y configuración de un servidor LEMP en Debian 12 dentro de tu contenedor LXC en Proxmox. Con este servidor ahora cuentas con una base sólida y segura para alojar aplicaciones web dinámicas, sitios corporativos o proyectos personales.

A lo largo de este tutorial, has aprendido a:

- Mantener tu sistema actualizado y seguro, aplicando buenas prácticas de administración de paquetes.

- Instalar y configurar Nginx, un servidor web rápido y eficiente, optimizado para servir contenido estático y dinámico.

- Instalar y asegurar MariaDB, la base de datos relacional que gestionará la información de tus aplicaciones.

- Configurar PHP para trabajar con Nginx y MariaDB, permitiendo ejecutar aplicaciones web dinámicas.

- Organizar la estructura de tus directorios y asignar permisos adecuados para mayor seguridad.

- Verificar que todos los componentes funcionan correctamente mediante pruebas sencillas.

- (Opcional) Añadir certificados SSL con Let’s Encrypt, asegurando conexiones HTTPS seguras para tus usuarios.

Ahora tu servidor LEMP está listo para recibir proyectos web reales. Puedes empezar a desplegar tu propio sitio, experimentar con CMS como WordPress o Joomla, o incluso montar aplicaciones más avanzadas desarrolladas por ti.

Recuerda que la seguridad y el mantenimiento continuo son esenciales: mantener los paquetes actualizados, revisar los logs del servidor y aplicar buenas prácticas de configuración te permitirá evitar problemas y garantizar un rendimiento óptimo.

Con esta base, el siguiente paso natural es aprender a desplegar y gestionar tus sitios web, configurar backups automáticos y, si lo deseas, optimizar el rendimiento de Nginx y MariaDB para cargas más altas. ¡El mundo de la administración de servidores está abierto para ti!

---