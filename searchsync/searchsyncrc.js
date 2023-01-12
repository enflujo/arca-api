const config = {
  server: {
    type: 'meilisearch',
    host: 'http://arca-bdbuscador:7700',
    key: '81086ece-7c22-46ac-b867-7f3ecdb00c18',
  },
  reindexOnStart: false,
  batchLimit: 100,
  collections: {
    obras: {
      filter: {
        estado: 'publicado',
      },
      fields: ['id', 'registro', 'titulo', 'categoria1.nombre', 'categoria1.descripcion', 'imagen.id'],
    },
    autores: {
      fields: ['nombre', 'apellido'],
    },
  },
};

module.exports = config;
