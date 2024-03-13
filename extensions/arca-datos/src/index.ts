import { defineEndpoint } from '@directus/extensions-sdk';
import { clienteBuscador, crearIndiceObras, estadoInstanciaBuscador, versionMeilisearch } from '../../buscador';
import MeiliSearch from 'meilisearch';

type Respuesta = {
  send: (datos: string | boolean | Object | undefined) => void;
};

export default defineEndpoint((router, { services, logger }) => {
  const { ItemsService } = services;

  /**
   * Da acceso a la llave píblica para usar en el front-end
   */
  router.get('/llave-buscador', async (peticion: any, respuesta: Respuesta) => {
    const cliente = clienteBuscador() as MeiliSearch;

    const { results } = await cliente.getKeys({ limit: 3 });

    if (results) {
      const datos = results.find((llave) => llave.name === 'Default Search API Key');

      if (datos && datos.key) {
        respuesta.send(datos.key);
        return;
      }
    }

    respuesta.send(undefined);
  });

  /**
   * Utilidad para eliminar los datos de Meilisearch y volver a crear la base de datos desde cero.
   */
  router.get('/reindexar', async (peticion: any, respuesta: Respuesta) => {
    if (!peticion.accountability.admin) {
      respuesta.send('No tienes permiso para reindexar la base de datos');
      return;
    }

    const obras = new ItemsService('obras', { schema: peticion.schema, accountability: peticion.accountability });
    const proceso = await crearIndiceObras(obras, logger);
    respuesta.send(proceso);
  });

  router.get('/estado-buscador', async (peticion: any, respuesta: Respuesta) => {
    if (!peticion.accountability.admin) {
      respuesta.send('No tienes permiso esto');
      return;
    }
    const estado = await estadoInstanciaBuscador();
    respuesta.send(estado);
  });

  router.get('/version-buscador', async (peticion: any, respuesta: Respuesta) => {
    if (!peticion.accountability.admin) {
      respuesta.send('No tienes permiso esto');
      return;
    }

    const version = await versionMeilisearch();
    respuesta.send(version);
  });
});
