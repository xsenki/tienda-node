# Tienda DAW

Aplicación de ejemplo (Node.js + Express + MariaDB) para practicar el despliegue de una aplicación
detrás de Nginx en el módulo **Despliegue de Aplicaciones Web** (2º DAW).

## Qué hace

| Ruta | Respuesta |
|------|-----------|
| `/` | Página con los productos y un contador de visitas (lee y escribe en la base de datos) |
| `/api/productos` | Los productos en JSON |
| `/salud` | `{"estado":"ok"}` si llega a la base de datos; **503** si no |

## Despliegue (resumen)

```bash
sudo git clone <URL-de-este-repositorio> /opt/tienda-app   # o clonar y luego chown
cd /opt/tienda-app
npm install                       # instala express, mariadb y dotenv en node_modules
cp .env.example .env              # y pon la contraseña de la base de datos
sudo mariadb tienda < bd/esquema.sql
sudo cp despliegue/tienda-app.service /etc/systemd/system/
sudo systemctl enable --now tienda-app
```

Nginx (`despliegue/app-proxy.nginx`) recibe las visitas por HTTPS en `app.test` y las reenvía a
`127.0.0.1:3000`.

## Actualizar

```bash
git pull && npm install && sudo systemctl restart tienda-app
```

Lo que **no** está en el repositorio: `.env` (contraseñas) y `node_modules/` (se instala con `npm install`).
