#!/bin/bash
# crearRespaldo.sh

set -e  # aborta si algo falla

# Cargar variables de entorno
source .env

# Crear carpeta dump si no existe
mkdir -p dump

# Fecha actual
FECHA=$(date +"%Y-%m-%d_%H-%M-%S")

# Nombre del archivo
ARCHIVO="dump/arcabd_${FECHA}.sql"

# Dump de la base de datos
/usr/bin/docker exec -t arca-cms-bd pg_dump \
  -U "$BD_USUARIO" "$BD_NOMBRE_BD" \
  > "$ARCHIVO"

echo "✅ Respaldo creado: $ARCHIVO"
