-- HormigónCalc 211 — Schema inicial
-- Se ejecuta automáticamente al levantar el contenedor de PostgreSQL

CREATE TABLE IF NOT EXISTS usuarios (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consultas (
  id            SERIAL PRIMARY KEY,
  usuario_id    INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre        VARCHAR(150) NOT NULL DEFAULT 'Consulta sin nombre',

  -- Parámetros del hormigón
  fcr_type      CHAR(1)   NOT NULL DEFAULT 'E',
  fc            NUMERIC   NOT NULL DEFAULT 21,
  s             NUMERIC   NOT NULL DEFAULT 0,
  data_count    INTEGER   NOT NULL DEFAULT 0,
  fcr_input     NUMERIC   NOT NULL DEFAULT 0,
  slump_cm      NUMERIC   NOT NULL DEFAULT 10,
  has_air       BOOLEAN   NOT NULL DEFAULT FALSE,
  exposure      SMALLINT  NOT NULL DEFAULT 1,
  freeze_thaw   BOOLEAN   NOT NULL DEFAULT FALSE,

  -- Parámetros del cemento
  pec           NUMERIC   NOT NULL DEFAULT 3150,

  -- Árido fino
  peaf          NUMERIC   NOT NULL DEFAULT 2600,
  haf           NUMERIC   NOT NULL DEFAULT 5,
  absaf         NUMERIC   NOT NULL DEFAULT 2,
  mf            NUMERIC   NOT NULL DEFAULT 2.8,

  -- Árido grueso
  peag          NUMERIC   NOT NULL DEFAULT 2650,
  hag           NUMERIC   NOT NULL DEFAULT 2,
  absag         NUMERIC   NOT NULL DEFAULT 1,
  tmn           VARCHAR(8) NOT NULL DEFAULT '1',
  puc           NUMERIC   NOT NULL DEFAULT 1600,

  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- Actualiza updated_at automáticamente al modificar una consulta
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_consultas_updated_at
BEFORE UPDATE ON consultas
FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();
