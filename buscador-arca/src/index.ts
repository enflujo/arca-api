import { defineHook } from '@directus/extensions-sdk';
import { MeiliSearch } from 'meilisearch';
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
  ['categoria1.nombre'],
  ['categoria2.nombre'],
  ['categoria3.nombre'],
  ['categoria4.nombre'],
  ['categoria5.nombre'],
  ['categoria6.nombre'],
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

export default defineHook(({ action }, { services, getSchema, database }) => {
  const cliente = new MeiliSearch({ host: 'http://arca-bdbuscador:7700', apiKey: '1234' });
  const { ItemsService } = services;

  action('server.start', async () => {
    const { total } = await cliente.index('obras').getDocuments({ limit: 1 });
    const schema = await getSchema();
    const obras = new ItemsService('obras', { schema, knex: database });
    const coleccionObras = await obras.readByQuery({});

    const grupito = await obras.readByQuery({
      limit: 1,
      fields: [
        ...camposPlanos,
        ...camposM2O.map((campo) => campo[0]),
        ...camposM2M.map((campo) => `${campo[0]}.${campo[0]}_id.${campo[1]}`),
      ],
      filter: { estado: { _eq: 'publicado' } },
    });

    procesarObra(grupito[0]);

    // try {
    //   await cliente.index('obras').getRawInfo();
    // } catch (error) {
    //   try {
    //     await cliente.createIndex('obras', { primaryKey: 'registro' });
    //   } catch (error) {
    //     logger.warn(error);
    //   }
    // }

    //

    // console.log(total);

    // console.log(schema.collections.obras);
    // const indiceObras = cliente.deleteIndexIfExists('obras');
    // console.log(indiceObras);
    // cliente.updateIndex('obras', {});
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
                } else {
                  console.log(`campo ${nivel1}.${llave} es null`);
                }
              } else {
                console.log(`campo ${nivel1} es null`);
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
  }
});
