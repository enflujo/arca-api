import MeiliSearch from 'meilisearch';
import type { Logger } from 'pino';
import { obtenerMensajeError } from './ayudas';
import { camposM2M, camposM2O, camposPlanos } from './constantes';
import { Obra } from './tipos';
import procesarObra from './procesarObra';

let instanciaBuscador: MeiliSearch;

export function clienteBuscador() {
  if (!instanciaBuscador) {
    const { MEILI_MASTER_KEY, MEILI_BD_URL } = process.env;

    if (!MEILI_MASTER_KEY && !MEILI_BD_URL) return;
    instanciaBuscador = new MeiliSearch({ host: `http://${MEILI_BD_URL}:7700`, apiKey: MEILI_MASTER_KEY });
  }

  return instanciaBuscador;
}

export async function numeroObrasIndexadas() {
  const cliente = clienteBuscador();

  if (!cliente || !existeIndiceObras()) return;

  const conteoIndiceObras = await cliente.index('obras').getDocuments({ limit: 1 });
  return conteoIndiceObras.total;
}

export async function existeIndiceObras() {
  const cliente = clienteBuscador();
  try {
    await cliente?.getIndex('obras');
    return true;
  } catch {
    return false;
  }
}

export async function crearIndiceObras(obras: any, logger: Logger) {
  const cliente = clienteBuscador();
  if (!cliente) return;

  const conteoObras = await obras.readByQuery({
    filter: { estado: { _eq: 'publicado' } },
    aggregate: { count: ['*'] },
  });
  const totalObras = +conteoObras[0].count;

  try {
    await cliente.deleteIndexIfExists('obras');
  } catch (error) {
    logger.warn(`No se puede borrar colección "obras" de meilisearch: ${obtenerMensajeError(error)}`);
    logger.debug(error);
  }

  try {
    await cliente.createIndex('obras', { primaryKey: 'registro' });
  } catch (error) {
    logger.warn(`No se puede crear colección "obras" de meilisearch: ${obtenerMensajeError(error)}`);
    logger.debug(error);
    process.exit(0);
  }

  const limite = 100;
  const paginas = Math.ceil(totalObras / limite);
  const campos = [
    ...camposPlanos,
    ...camposM2O.map((campo) => campo[0]),
    ...camposM2M.map((campo) => `${campo[0]}.${campo[0]}_id.${campo[1]}`),
  ];

  for (let pagina = 0; pagina <= paginas; pagina++) {
    const grupoObras = await obras.readByQuery({
      filter: { estado: { _eq: 'publicado' } },
      limit: limite,
      offset: pagina * limite,
      fields: campos,
    });

    if (!grupoObras || !grupoObras.length) break;

    const datosProcesados = grupoObras.map((obra: Obra) => {
      const datos = procesarObra(obra);

      if (!datos.autores) {
        console.log(obra.autores, datos);
      }

      return datos;
    });

    await cliente.index('obras').addDocuments(datosProcesados);
  }

  logger.info('Colección "obras" indexada en la base de datos del buscador');
}

export function estadoInstanciaBuscador() {
  const cliente = clienteBuscador();
  return cliente?.getTasks({ indexUids: ['obras'] });
}

export function versionMeilisearch() {
  const cliente = clienteBuscador();
  return cliente?.getVersion();
}
