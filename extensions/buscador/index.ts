import { MeiliSearch } from 'meilisearch';
import type { Logger } from 'pino';
import { obtenerMensajeError } from './ayudas';
import { camposM2M, camposM2O, camposPlanos } from './constantes';
import { Obra } from './tipos';
import procesarObra from './procesarObra';

let instanciaBuscador: InstanceType<typeof MeiliSearch>;
let creandoDocumentos = false;

function limpiarHTML(valor: any): any {
  if (typeof valor !== 'string') return valor;

  // Remover etiquetas HTML
  let limpio = valor.replace(/<[^>]*>/g, '');

  // Decodificar entidades HTML numéricas decimales y hexadecimales
  limpio = limpio.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)));
  limpio = limpio.replace(/&#x([0-9a-f]+);/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16)));

  // Crear un elemento temporal para decodificar entidades nombradas
  if (limpio.includes('&')) {
    const textarea = { innerHTML: limpio } as any;
    try {
      limpio = textarea.innerHTML;
    } catch (e) {
      // Fallback: decodificar manualmente las más comunes
      limpio = limpio
        .replace(/&nbsp;/g, ' ')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&aacute;/g, 'á')
        .replace(/&eacute;/g, 'é')
        .replace(/&iacute;/g, 'í')
        .replace(/&oacute;/g, 'ó')
        .replace(/&uacute;/g, 'ú')
        .replace(/&Aacute;/g, 'Á')
        .replace(/&Eacute;/g, 'É')
        .replace(/&Iacute;/g, 'Í')
        .replace(/&Oacute;/g, 'Ó')
        .replace(/&Uacute;/g, 'Ú')
        .replace(/&ntilde;/g, 'ñ')
        .replace(/&Ntilde;/g, 'Ñ')
        .replace(/&amp;/g, '&');
    }
  }

  // Remover espacios múltiples
  limpio = limpio.replace(/\s+/g, ' ').trim();

  return limpio;
}

function limpiarObjetoHTML(objeto: any): any {
  if (Array.isArray(objeto)) {
    return objeto.map((item) => limpiarObjetoHTML(item));
  }

  if (objeto && typeof objeto === 'object') {
    const resultado: any = {};
    for (const clave in objeto) {
      resultado[clave] = limpiarObjetoHTML(objeto[clave]);
    }
    return resultado;
  }

  return limpiarHTML(objeto);
}

export function clienteBuscador() {
  if (!instanciaBuscador) {
    const { MEILI_MASTER_KEY, MEILI_BD_URL } = process.env;

    // No construimos cliente si falta alguno de los valores necesarios.
    if (!MEILI_MASTER_KEY || !MEILI_BD_URL) return;

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
  // Si ya se esta creando la base de datos.
  if (creandoDocumentos)
    return {
      titulo: 'Advertencia',
      tipo: 'warning',
      mensaje: 'Se están procesando los datos, esperar a que termine el proceso.',
      codigo: 204,
    };

  const cliente = clienteBuscador();

  if (!cliente)
    return {
      titulo: 'Error',
      tipo: 'danger',
      mensaje: 'Parece que Meilisearch no está corriendo, revisar el estado de la aplicación en el servidor.',
      codigo: 500,
    };

  const conteoObras = await obras.readByQuery({
    filter: { estado: { _eq: 'publicado' } },
    aggregate: { count: ['*'] },
  });

  const totalObras = +conteoObras[0].count;

  try {
    await cliente.deleteIndexIfExists('obras');
  } catch (error) {
    const mensaje = `No se puede borrar colección "obras" de meilisearch: ${obtenerMensajeError(error)}`;
    logger.warn(mensaje);
    logger.debug(error);
    return { titulo: 'Error', tipo: 'danger', mensaje, codigo: 500 };
  }

  try {
    await cliente.createIndex('obras', { primaryKey: 'registro' });
  } catch (error) {
    const mensaje = `No se puede crear colección "obras" de meilisearch: ${obtenerMensajeError(error)}`;
    logger.warn(mensaje);
    logger.debug(error);

    return { titulo: 'Error', tipo: 'danger', mensaje, codigo: 500 };
  }

  const limite = 100;
  const paginas = Math.ceil(totalObras / limite);
  const campos = [
    ...camposPlanos,
    ...camposM2O.map((campo) => campo[0]),
    ...camposM2M.map((campo) => `${campo[0]}.${campo[0]}_id.${campo[1]}`),
  ];

  creandoDocumentos = true;

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
      const datosLimpios = limpiarObjetoHTML(datos);

      if (pagina === 0 && obra.registro === 27004) {
        logger.info('Datos antes de limpiar (registro 27004):', JSON.stringify(datos).substring(0, 200));
        logger.info('Datos después de limpiar (registro 27004):', JSON.stringify(datosLimpios).substring(0, 200));
      }

      return datosLimpios;
    });

    await cliente.index('obras').addDocuments(datosProcesados);
  }

  creandoDocumentos = false;
  logger.info('Colección "obras" indexada en la base de datos del buscador');
  return { titulo: 'Proceso Finalizado', tipo: 'success', mensaje: 'Obras indexadas con éxito.', codigo: 200 };
}

export function estadoInstanciaBuscador() {
  const cliente = clienteBuscador();
  return cliente?.tasks.getTasks();
}

export function versionMeilisearch() {
  const cliente = clienteBuscador();
  return cliente?.getVersion();
}
