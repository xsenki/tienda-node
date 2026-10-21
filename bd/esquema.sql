-- Tablas y datos de ejemplo de la Tienda DAW.
-- Se carga como administrador: sudo mariadb tienda < bd/esquema.sql
CREATE TABLE IF NOT EXISTS productos (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80)  NOT NULL,
  precio DECIMAL(6,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS visitas (
  id    TINYINT PRIMARY KEY,
  total INT NOT NULL DEFAULT 0
);

INSERT IGNORE INTO productos (id, nombre, precio) VALUES
  (1, 'Camiseta DAW', 12.50),
  (2, 'Taza «Funciona en mi máquina»', 8.00),
  (3, 'Pegatina Nginx', 1.50);

INSERT IGNORE INTO visitas (id, total) VALUES (1, 0);
