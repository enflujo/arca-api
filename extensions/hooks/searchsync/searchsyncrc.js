// searchsync/searchsyncrc.js
var obrasEstaticos = [
  "registro",
  "titulo",
  "imagen.id",
  "fuente.descripcion",
  "sintesis",
  "comentario_bibliografico",
  "iconotexto",
  "fecha_inicial",
  "fecha_final"
];
var obrasRelaciones = [
  // 'categoria1.nombre',
  // 'categoria1.descripcion',
  // 'categoria2.nombre',
  // 'categoria2.descripcion',
  // 'categoria3.nombre',
  // 'categoria3.descripcion',
  // 'categoria4.nombre',
  // 'categoria4.descripcion',
  // 'categoria5.nombre',
  // 'categoria5.descripcion',
  // 'categoria6.nombre',
  // 'categoria6.descripcion',
  // 'ciudad_origen.nombre',
  // 'ubicacion.nombre',
  // 'ubicacion.anotacion',
  // 'relato_visual.nombre',
  // 'relato_visual.descripcion',
  // 'escenarios.nombre',
  // 'escenarios.descripcion',
  // 'objetos.nombre',
  // 'objetos.descripcion',
  // 'tecnicas.nombre',
  // 'tecnicas.descripcion',
  // 'tipo_gestual.nombre',
  // 'tipo_gestual.descripcion',
  // 'complejo_gestual.nombre',
  // 'complejo_gestual.descripcion',
  "gestos.gestos_id.codigo",
  "gestos.obras_gestos.nombre",
  "gestos.obras_gestos.descripcion"
  // 'fisiognomica.nombre',
  // 'fisiognomica.descripcion',
  // 'fisiognomica_imagen.nombre',
  // 'fisiognomica_imagen.descripcion',
  // 'cartela_filacteria.nombre',
  // 'cartela_filacteria.descripcion',
  // 'rostro.nombre',
  // 'rostro.descripcion',
  // 'personajes.nombre',
  // 'personajes.descripcion',
  // 'simbolos.nombre',
  // 'simbolos.descripcion',
  // 'descriptores.nombre',
  // 'descriptores.descripcion',
  // 'caracteristicas.nombre',
  // 'caracteristicas.descripcion',
  // 'ciudad.nombre',
  // 'ciudad.descripcion',
  // 'pais.nombre',
  // 'pais.descripcion',
];
var config = {
  server: {
    type: "meilisearch",
    host: "http://arca-bdbuscador:7700",
    key: process.env.MEILI_MASTER_KEY
  },
  reindexOnStart: false,
  batchLimit: 100,
  collections: {
    obras: {
      filter: {
        estado: "publicado"
      },
      fields: [...obrasEstaticos, ...obrasRelaciones]
    }
  }
};
module.exports = config;
