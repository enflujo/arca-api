import { defineHook } from '@directus/extensions-sdk';
import { MeiliSearch } from 'meilisearch';
import { clienteBuscador, crearIndiceObras, existeIndiceObras } from '../../buscador';
import procesarObra from '../../buscador/procesarObra';
import { colecciones, camposM2M, camposM2O, camposPlanos } from '../../buscador/constantes';

export default defineHook(({ action }, { services, getSchema, database, logger }) => {
  const cliente = clienteBuscador() as MeiliSearch;
  const campos = [
    ...camposPlanos,
    ...camposM2O.map((campo) => campo[0]),
    ...camposM2M.map((campo) => `${campo[0]}.${campo[0]}_id.${campo[1]}`),
  ];

  const { ItemsService } = services;

  action('server.start', async () => {
    if (!existeIndiceObras()) {
      const schema = await getSchema();
      const obras = new ItemsService('obras', { schema, knex: database });
      crearIndiceObras(obras, logger);
    }
  });

  action('items.create', async ({ collection, payload }) => {
    if (collection === 'obras') {
      const schema = await getSchema();
      const obras = new ItemsService('obras', { schema, knex: database });
      const datosObra = await obras.readByQuery({
        filter: { registro: { _eq: `${payload.registro}` } },
        limit: 1,
        fields: campos,
      });

      const obraProcesada = procesarObra(datosObra[0]);
      await cliente.index('obras').addDocuments([obraProcesada]);
    }
  });

  action('items.update', async ({ collection, keys }) => {
    console.log(collection, keys);
    if (colecciones.includes(collection)) {
      const schema = await getSchema();

      if (collection === 'obras') {
        const obras = new ItemsService('obras', { schema, knex: database });
      }
    }

    // actualizarObras(collection, keys);
  });

  action('items.delete', ({ collection, payload }) => {
    console.log(collection, payload);
  });

  function actualizarObras(coleccion: string, ids: number[]) {
    if (!colecciones.includes(coleccion)) return;
    console.log('actualizando registros de', coleccion, ids);
  }
});
