import { defineHook } from '@directus/extensions-sdk';
import { MeiliSearch } from 'meilisearch';

export default defineHook(({ action }, { services, getSchema, database }) => {
  const cliente = new MeiliSearch({ host: 'http://arca-bdbuscador:7700' });
  const { ItemsService } = services;

  action('server.start', async () => {
    const schema = await getSchema();
    const obras = new ItemsService('obras', { schema, knex: database });
    const grupito = await obras.readByQuery({
      limit: 10,
    });
    console.log(grupito);
  });

  action('items.create', ({ collection, key }) => {
    actualizarObras(collection, [key]);
  });

  action('items.update', ({ collection, keys }) => {
    actualizarObras(collection, keys);
  });

  action('items.delete', ({ collection, payload }) => {
    console.log(collection, payload);
  });

  function actualizarObras(coleccion: string, ids: number[]) {
    console.log('actualizando indice obras', coleccion, ids);
  }
});
