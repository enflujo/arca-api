import { defineHook } from '@directus/extensions-sdk';
import { MeiliSearch } from 'meilisearch';
import { clienteBuscador, crearIndiceObras, existeIndiceObras } from '../../buscador';
import procesarObra from '../../buscador/procesarObra';
import { colecciones, camposM2M, camposM2O, camposPlanos, mapaRelaciones } from '../../buscador/constantes';

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

export default defineHook(({ action }, { services, getSchema, database, logger }) => {
  const campos = [
    ...camposPlanos,
    ...camposM2O.map((campo) => campo[0]),
    ...camposM2M.map((campo) => `${campo[0]}.${campo[0]}_id.${campo[1]}`),
    'estado',
  ];

  const { ItemsService } = services;

  action('server.start', async () => {
    if (!(await existeIndiceObras())) {
      const schema = await getSchema();
      const obras = new ItemsService('obras', { schema, knex: database });
      await crearIndiceObras(obras, logger);
    }
  });

  action('items.create', async ({ collection, payload, keys }) => {
    if (collection !== 'obras') return;

    const cliente = obtenerCliente();
    if (!cliente) return;

    const registroId = keys?.[0] ?? payload?.id ?? payload?.registro;
    if (!registroId) return;

    const schema = await getSchema();
    const obras = new ItemsService('obras', { schema, knex: database });
    const datosObra = await obras.readByQuery({
      filter: { id: { _eq: registroId } },
      limit: 1,
      fields: campos,
    });

    if (!datosObra?.length) {
      logger.warn(`No se encontró la obra creada con id ${registroId} para indexar`);
      return;
    }

    const obra = datosObra[0];
    if (!obra || obra.estado !== 'publicado') return;

    const obraProcesada = procesarObra(obra);
    const obraLimpia = limpiarObjetoHTML(obraProcesada);
    await cliente.index('obras').addDocuments([obraLimpia]);
  });

  action('items.update', async ({ collection, keys }) => {
    if (!colecciones.includes(collection)) return;

    if (collection === 'obras') {
      await reindexarObras(keys);
      return;
    }

    // Para colecciones relacionadas, encontramos solo las obras afectadas
    await reindexarObrasPorRelacion(collection, keys);
  });

  action('items.delete', async ({ collection, keys }) => {
    if (!colecciones.includes(collection)) return;

    const cliente = obtenerCliente();
    if (!cliente) return;

    if (collection === 'obras') {
      if (!keys?.length) return;
      await cliente.index('obras').deleteDocuments(keys as string[]);
      return;
    }

    // Al eliminar elementos relacionados, reindexamos las obras que los usaban
    await reindexarObrasPorRelacion(collection, keys);
  });

  function obtenerCliente() {
    const instancia = clienteBuscador() as MeiliSearch | undefined;
    if (!instancia) {
      logger.warn('No se puede conectar a Meilisearch: revisar MEILI_MASTER_KEY / MEILI_BD_URL o servicio caído.');
    }
    return instancia;
  }

  async function reindexarObras(ids: string[] | number[]) {
    if (!ids?.length) return;

    const cliente = obtenerCliente();
    if (!cliente) return;

    const schema = await getSchema();
    const obras = new ItemsService('obras', { schema, knex: database });

    const datosObras = await obras.readByQuery({
      filter: { id: { _in: ids } },
      limit: ids.length,
      fields: campos,
    });

    if (!datosObras?.length) return;

    const publicadas = datosObras.filter((obra: any) => obra.estado === 'publicado');
    if (!publicadas.length) return;

    const procesadas = publicadas.map((obra: any) => {
      const obraProcesada = procesarObra(obra);
      return limpiarObjetoHTML(obraProcesada);
    });
    await cliente.index('obras').addDocuments(procesadas);
  }

  /**
   * Encuentra y reindexa solo las obras afectadas por cambios en una colección relacionada.
   * Esto evita tener que reindexar los 30,000+ registros completos.
   */
  async function reindexarObrasPorRelacion(coleccion: string, ids: string[] | number[]) {
    if (!ids?.length) return;

    const relacion = mapaRelaciones[coleccion];
    if (!relacion) {
      logger.warn(`No hay mapa de relación para la colección ${coleccion}`);
      return;
    }

    let obrasAfectadas: number[] = [];

    if (relacion.tipo === 'M2O' && relacion.campo) {
      // Para relaciones M2O, buscamos directamente en la tabla obras
      const resultado = await database('obras').whereIn(relacion.campo, ids).select('id');

      obrasAfectadas = resultado.map((row: any) => row.id);

      // Para gestos, también revisamos gesto2 y gesto3
      if (coleccion === 'gestos') {
        const resultado2 = await database('obras').whereIn('gesto2', ids).select('id');
        const resultado3 = await database('obras').whereIn('gesto3', ids).select('id');
        obrasAfectadas.push(...resultado2.map((row: any) => row.id));
        obrasAfectadas.push(...resultado3.map((row: any) => row.id));
      }
    } else if (relacion.tipo === 'M2M' && relacion.tablaPivote) {
      // Para relaciones M2M, buscamos en la tabla pivote
      // En Directus, el campo en la tabla pivote usa el nombre de la colección directamente: autores_id, personajes_id, etc.
      const campoRelacion = `${coleccion}_id`;

      const resultado = await database(relacion.tablaPivote).whereIn(campoRelacion, ids).select('obras_id');

      obrasAfectadas = resultado.map((row: any) => row.obras_id);
    }

    // Eliminar duplicados
    obrasAfectadas = [...new Set(obrasAfectadas)];

    if (!obrasAfectadas.length) {
      logger.info(`No se encontraron obras afectadas por cambios en ${coleccion} con ids ${ids.join(', ')}`);
      return;
    }

    logger.info(`Reindexando ${obrasAfectadas.length} obras afectadas por cambios en ${coleccion}`);
    await reindexarObras(obrasAfectadas);
  }
});
