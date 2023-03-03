import { defineHook } from '@directus/extensions-sdk';
import { MeiliSearch } from 'meilisearch';
import { obtenerMensajeError } from './ayudas';
import { CamposM2M, CamposM2O, CamposSimples, Obra } from './tipos';

const colecciones = ['obras'];

const camposPlanos: (keyof CamposSimples)[] = [
  'registro',
  'titulo',
  'sintesis',
  'comentario_bibliografico',
  'iconotexto',
];

const camposM2O: [relacion: string, nuevaLLave?: keyof CamposM2O][] = [
  ['fuente.descripcion', 'fuente'],
  ['imagen.id', 'imagen'],
  ['categoria1.nombre', 'categoria1'],
  ['categoria2.nombre', 'categoria2'],
  ['categoria3.nombre', 'categoria3'],
  ['categoria4.nombre', 'categoria4'],
  ['categoria5.nombre', 'categoria5'],
  ['categoria6.nombre', 'categoria6'],
  ['donante.nombre', 'donante'],
  ['ciudad_origen.nombre', 'ciudad_origen'],
  ['ubicacion.nombre', 'ubicacion'],
  ['ubicacion.ciudad.nombre', 'ciudad'],
  ['ubicacion.ciudad.pais.nombre', 'pais'],
  ['relato_visual.nombre', 'relato_visual'],
  ['tipo_gestual.nombre', 'tipo_gestual'],
  ['complejo_gestual.nombre', 'complejo_gestual'],
  ['fisiognomica.nombre', 'fisiognomica'],
  ['fisiognomica_imagen.nombre', 'fisiognomica_imagen'],
  ['rostro.nombre', 'rostro'],
];

const camposM2M: [coleccion: keyof Obra, llave: 'nombre' | 'codigo', nuevaLlave?: keyof CamposM2M][] = [
  ['escenarios', 'nombre', 'escenarios'],
  ['objetos', 'nombre', 'objetos'],
  ['tecnicas', 'nombre', 'tecnicas'],
  ['gestos', 'nombre', 'gestos'],
  ['gestos', 'codigo'],
  ['personajes', 'nombre', 'personajes'],
  ['simbolos', 'nombre', 'simbolos'],
  ['descriptores', 'nombre', 'descriptores'],
  ['caracteristicas', 'nombre', 'caracteristicas'],
];

export default defineHook(({ action }, { services, getSchema, database, logger }) => {
  const { MEILI_MASTER_KEY } = process.env;

  if (!MEILI_MASTER_KEY) return;
  const cliente = new MeiliSearch({ host: 'http://arca-bdbuscador:7700', apiKey: MEILI_MASTER_KEY });
  const { ItemsService } = services;

  action('server.start', async () => {
    const { total } = await cliente.index('obras').getDocuments({ limit: 1 });
    const schema = await getSchema();
    const obras = new ItemsService('obras', { schema, knex: database });
    const conteoObras = await obras.readByQuery({
      filter: { estado: { _eq: 'publicado' } },
      aggregate: { count: ['*'] },
    });
    const totalObras = +conteoObras[0].count;

    if (+total !== totalObras) {
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
      }

      const limite = 100;
      const paginas = Math.ceil(totalObras / limite);
      const campos = [
        ...camposPlanos,
        ...camposM2O.map((campo) => campo[0]),
        ...camposM2M.map((campo) => `${campo[0]}.${campo[0]}_id.${campo[1]}`),
      ];

      for (let pagina = 0; pagina < paginas; pagina++) {
        const grupoObras = await obras.readByQuery({
          filter: { estado: { _eq: 'publicado' } },
          limit: limite,
          offset: pagina * limite,
          fields: campos,
        });

        if (!grupoObras || !grupoObras.length) break;

        const datosProcesados = grupoObras.map((obra: Obra) => procesarObra(obra));

        await cliente.index('obras').addDocuments(datosProcesados);
      }
      logger.info('Colección "obras" indexada en la base de datos del buscador');
    }
  });

  action('items.create', ({ colection, payload }) => {
    // actualizarObras(collection, [key]);
    if (colection === 'obras') {
      const datosProcesados = procesarObra(payload);
      cliente.index('obras').addDocuments([datosProcesados]);
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

  function procesarObra(obra: any) {
    const procesado: any = { registro: obra.registro, titulo: obra.titulo };

    camposPlanos.forEach((campo) => {
      if (obra[campo]) {
        procesado[campo] = obra[campo];
      }
    });

    camposM2O.forEach(([campo, nuevaLlave]) => {
      if (campo) {
        switch (nuevaLlave) {
          case 'ciudad':
            if (obra.ubicacion && obra.ubicacion.ciudad && obra.ubicacion.ciudad.nombre) {
              procesado.ciudad = obra.ubicacion.ciudad.nombre;
            }
            break;

          case 'pais':
            if (
              obra.ubicacion &&
              obra.ubicacion.ciudad &&
              obra.ubicacion.ciudad.pais &&
              obra.ubicacion.ciudad.pais.nombre
            ) {
              procesado.pais = obra.ubicacion.ciudad.pais.nombre;
            }
            break;
          case 'categoria1':
            if (obra.categoria1 && obra.categoria1.nombre) {
              if (!procesado.categorias) {
                procesado.categorias = [];
              }
              procesado.categorias.push(obra.categoria1.nombre);
            }
            break;
          case 'categoria2':
            if (obra.categoria2 && obra.categoria2.nombre) {
              procesado.categorias?.push(obra.categoria2.nombre);
            }
            break;
          case 'categoria3':
            if (obra.categoria3 && obra.categoria3.nombre) {
              procesado.categorias?.push(obra.categoria3.nombre);
            }
            break;
          case 'categoria4':
            if (obra.categoria4 && obra.categoria4.nombre) {
              procesado.categorias?.push(obra.categoria4.nombre);
            }
            break;
          case 'categoria5':
            if (obra.categoria5 && obra.categoria5.nombre) {
              procesado.categorias?.push(obra.categoria5.nombre);
            }
            break;
          case 'categoria6':
            if (obra.categoria6 && obra.categoria6.nombre) {
              procesado.categorias?.push(obra.categoria6.nombre);
            }
            break;
          default:
            const [nivel1, llave] = campo.split('.');

            if (nivel1 && llave) {
              const obj = obra[nivel1 as keyof Obra];
              if (obj && typeof obj === 'object') {
                const valor: any = obj[llave];

                if (valor && nuevaLlave) {
                  procesado[nuevaLlave] = valor;
                }
              }
            }
            break;
        }
      }
    });

    camposM2M.forEach(([nombre, llave, nuevaLlave]) => {
      if (nombre && llave) {
        const intermedia = `${nombre}_id`;
        const tieneValores = obra[nombre] && obra[nombre].length;

        if (nuevaLlave && tieneValores) {
          obra[nombre].forEach((instancia: any) => {
            if (instancia[intermedia] && instancia[intermedia][llave]) {
              if (!procesado[nuevaLlave]) {
                procesado[nuevaLlave] = [];
              }

              let valor = instancia[intermedia][llave];

              if (nuevaLlave === 'gestos') {
                if (instancia[intermedia].codigo) {
                  valor = `${instancia[intermedia].codigo}: ${valor}`;
                }
              }
              procesado[nuevaLlave].push(valor);
            }
          });
        }
      }
    });

    for (const campo in procesado) {
      if (typeof procesado[campo] === 'object') {
        procesado[campo] = procesado[campo].join(', ');
      }
    }

    return procesado;
  }
});
