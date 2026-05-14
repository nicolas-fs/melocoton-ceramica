-- ============================================================
-- SCHEMA DE BASE DE DATOS — Melocotón Cerámica
-- 
-- CÓMO USARLO:
-- 1. Entrá a supabase.com → tu proyecto → SQL Editor
-- 2. Copiá y pegá todo este archivo
-- 3. Hacé click en "Run"
-- 4. ¡Listo! Todas las tablas quedan creadas.
-- ============================================================


-- ── EXTENSIONES ───────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ── TABLA: productos ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS productos (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo               TEXT NOT NULL,
  slug                 TEXT NOT NULL UNIQUE,
  descripcion          TEXT NOT NULL DEFAULT '',
  descripcion_corta    TEXT NOT NULL DEFAULT '',
  precio               NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
  precio_original      NUMERIC(10,2),
  en_promocion         BOOLEAN NOT NULL DEFAULT FALSE,
  descuento_porcentaje INTEGER CHECK (descuento_porcentaje BETWEEN 1 AND 99),
  imagenes             TEXT[] NOT NULL DEFAULT '{}',
  stock                INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  categoria            TEXT NOT NULL DEFAULT 'tazas'
                         CHECK (categoria IN ('tazas','tazones','platos','macetas','bowls','sets','especial')),
  destacado            BOOLEAN NOT NULL DEFAULT FALSE,
  etiquetas            TEXT[] NOT NULL DEFAULT '{}',
  creado_en            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices de búsqueda
CREATE INDEX IF NOT EXISTS idx_productos_slug       ON productos(slug);
CREATE INDEX IF NOT EXISTS idx_productos_categoria  ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_destacado  ON productos(destacado);
CREATE INDEX IF NOT EXISTS idx_productos_stock      ON productos(stock);
CREATE INDEX IF NOT EXISTS idx_productos_en_promo   ON productos(en_promocion);

-- Trigger: actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION set_actualizado_en()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_productos_actualizado_en
  BEFORE UPDATE ON productos
  FOR EACH ROW EXECUTE FUNCTION set_actualizado_en();


-- ── TABLA: pedidos ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pedidos (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fecha               TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Datos del cliente
  cliente_nombre      TEXT NOT NULL,
  cliente_email       TEXT NOT NULL,
  cliente_telefono    TEXT NOT NULL,
  cliente_direccion   TEXT NOT NULL,
  cliente_ciudad      TEXT NOT NULL,
  cliente_provincia   TEXT NOT NULL DEFAULT 'Córdoba',
  cliente_cp          TEXT NOT NULL,
  cliente_notas       TEXT,

  -- Items como JSON array
  items               JSONB NOT NULL DEFAULT '[]',

  -- Totales
  subtotal            NUMERIC(10,2) NOT NULL,
  costo_envio         NUMERIC(10,2) NOT NULL DEFAULT 3500,
  total               NUMERIC(10,2) NOT NULL,

  -- Estado y pago
  estado              TEXT NOT NULL DEFAULT 'pendiente'
                        CHECK (estado IN ('pendiente','pagado','enviado','entregado','cancelado')),
  metodo_pago         TEXT NOT NULL
                        CHECK (metodo_pago IN ('mercadopago','transferencia')),
  id_transaccion_mp   TEXT,
  id_preferencia_mp   TEXT
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_pedidos_estado      ON pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha       ON pedidos(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_pedidos_email       ON pedidos(cliente_email);


-- ── TABLA: promociones ────────────────────────────────────
CREATE TABLE IF NOT EXISTS promociones (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre          TEXT NOT NULL,
  porcentaje      INTEGER NOT NULL CHECK (porcentaje BETWEEN 1 AND 99),
  productos_ids   UUID[] NOT NULL DEFAULT '{}',  -- vacío = aplica a todos
  activa          BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_inicio    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_fin       TIMESTAMPTZ,
  creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── TABLA: alertas_stock ──────────────────────────────────
-- Para el sistema de notificaciones de stock bajo
CREATE TABLE IF NOT EXISTS alertas_stock (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producto_id   UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  umbral        INTEGER NOT NULL DEFAULT 3,  -- notificar cuando stock <= umbral
  activa        BOOLEAN NOT NULL DEFAULT TRUE,
  ultimo_envio  TIMESTAMPTZ,
  creado_en     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── ROW LEVEL SECURITY ────────────────────────────────────
-- Los productos son públicos para lectura
ALTER TABLE productos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE promociones  ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas_stock ENABLE ROW LEVEL SECURITY;

-- Política: lectura pública de productos
CREATE POLICY "productos_lectura_publica"
  ON productos FOR SELECT
  USING (true);

-- Política: lectura pública de promociones activas
CREATE POLICY "promociones_lectura_publica"
  ON promociones FOR SELECT
  USING (activa = true);

-- Política: escritura solo desde el servidor (service_role)
-- Las demás operaciones usan la service_role key desde el backend

-- ── DATOS INICIALES ───────────────────────────────────────
-- Insertar los productos del catálogo inicial
-- (Podés agregar más o editarlos desde el panel admin)

INSERT INTO productos (titulo, slug, descripcion_corta, descripcion, precio, imagenes, stock, categoria, destacado, etiquetas) VALUES
(
  'Taza "Lo estás haciendo bien"',
  'taza-lo-estas-haciendo-bien',
  'Porque a veces necesitamos recordarnos que lo estamos haciendo bien.',
  E'Una taza para los días que cuestan un poco más.\n\nHecha a mano en arcilla blanca, esmaltada en tonos naturales.\n\n**Capacidad:** 350 ml\n**Técnica:** Torneada y esmaltada a mano\n**Apta para:** Microondas y lavavajillas',
  12500, '{}', 8, 'tazas', true, ARRAY['frases','regalo']
),
(
  'Tazón con Ternura',
  'tazon-con-ternura',
  'El tazón que te enamora. Grande, cálido y con toda la ternura del mundo.',
  E'Cortamos la semana con un poquito de ternura.\n\nTazón grande y profundo, ideal para el café con leche.\n\n**Capacidad:** 550 ml\n**Apta para:** Microondas y lavavajillas',
  16000, '{}', 6, 'tazones', true, ARRAY['desayuno','regalo']
),
(
  'Set Pedidos Personalizados',
  'set-pedidos-personalizados',
  'Con tu frase, tu nombre o tu diseño. El regalo más especial que existe.',
  E'Pedidos personalizados terminando la semana.\n\n**Incluye:** 2 piezas a elección\n**Personalización:** Frase, nombre o fecha',
  26000, '{}', 5, 'sets', true, ARRAY['personalizado','regalo']
)
ON CONFLICT (slug) DO NOTHING;

-- ── FUNCIÓN: actualizar stock ─────────────────────────────
CREATE OR REPLACE FUNCTION actualizar_stock(p_id UUID, p_delta INTEGER)
RETURNS INTEGER AS $$
DECLARE
  nuevo_stock INTEGER;
BEGIN
  UPDATE productos
  SET stock = GREATEST(0, stock + p_delta)
  WHERE id = p_id
  RETURNING stock INTO nuevo_stock;
  RETURN nuevo_stock;
END;
$$ LANGUAGE plpgsql;


-- ── VISTA: resumen de ventas ──────────────────────────────
CREATE OR REPLACE VIEW resumen_ventas AS
SELECT
  DATE_TRUNC('month', fecha) AS mes,
  COUNT(*) AS total_pedidos,
  COUNT(*) FILTER (WHERE estado IN ('pagado','enviado','entregado')) AS pedidos_pagados,
  SUM(total) FILTER (WHERE estado IN ('pagado','enviado','entregado')) AS monto_total,
  AVG(total) FILTER (WHERE estado IN ('pagado','enviado','entregado')) AS ticket_promedio
FROM pedidos
GROUP BY DATE_TRUNC('month', fecha)
ORDER BY mes DESC;
