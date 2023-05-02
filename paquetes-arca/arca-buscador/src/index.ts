import { defineHook } from '@directus/extensions-sdk';
import { MeiliSearch } from 'meilisearch';
import { clienteBuscador, crearIndiceObras, existeIndiceObras } from '../../buscador';
import procesarObra from '../../buscador/procesarObra';

const colecciones = ['obras'];

export default defineHook(({ action }, { services, getSchema, database, logger }) => {
  const cliente = clienteBuscador() as MeiliSearch;

  const { ItemsService } = services;

  action('server.start', async () => {
    if (!existeIndiceObras()) {
      const schema = await getSchema();
      const obras = new ItemsService('obras', { schema, knex: database });
      crearIndiceObras(obras, logger);
    }
  });

  action('items.create', ({ collection, payload }) => {
    // actualizarObras(collection, [key]);
    if (collection === 'obras') {
      console.log(payload);
      // const datosProcesados = procesarObra(payload);
      // // console.log(datosProcesados);
      // cliente.index('obras').addDocuments([datosProcesados]);
    }
  });

  action('items.update', ({ collection, keys }) => {
    actualizarObras(collection, keys);
  });

  action('items.delete', ({ collection, payload }) => {
    console.log(collection, payload);
  });

  function actualizarObras(coleccion: string, ids: number[]) {
    if (!colecciones.includes(coleccion)) return;
    console.log('actualizando registros de', coleccion, ids);
  }
});
