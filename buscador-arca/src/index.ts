import { defineHook } from '@directus/extensions-sdk';
import { MeiliSearch } from 'meilisearch';

const camposPlanos = ['registro', 'titulo', 'sintesis', 'comentario_bibliografico', 'iconotexto'];

const camposM2O = [
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

const camposM2M = [
  ['escenarios', 'nombre'],
  ['objetos', 'nombre'],
  ['tecnicas', 'nombre'],
  ['gestos', 'nombre'],
  ['gestos', 'codigo'],
  ['personajes', 'nombre'],
  ['personajes', 'muerte'],
  ['personajes', 'muerte_anotacion'],
  ['personajes', 'beatificacion_canonizacion_desde'],
  ['personajes', 'beatificacion_canonizacion_desde_anotacion'],
  ['personajes', 'beatificacion_canonizacion_hasta'],
  ['personajes', 'beatificacion_canonizacion_hasta_anotacion'],
  ['simbolos', 'nombre'],
  ['descriptores', 'nombre'],
  ['caracteristicas', 'nombre'],
];

export default defineHook(({ action }, { services, getSchema, database, logger }) => {
  const cliente = new MeiliSearch({ host: 'http://arca-bdbuscador:7700', apiKey: '1234' });
  const { ItemsService } = services;

  action('server.start', async () => {
    const schema = await getSchema();
    const obras = new ItemsService('obras', { schema, knex: database });
    const grupito = await obras.readByQuery({
      limit: 1,
      fields: [
        ...camposPlanos,
        ...camposM2O.map((campo) => campo[0]),
        ...camposM2M.map((campo) => `${campo[0]}.${campo[0]}_id.${campo[1]}`),
      ],
      filter: { estado: { _eq: 'publicado' } },
    });

    const procesado: any = {};

    camposPlanos.forEach((campo) => {
      if (grupito[0][campo]) {
        procesado[campo] = grupito[0][campo];
      }
    });

    camposM2O.forEach(([campo, nuevaLlave]) => {
      if (campo && nuevaLlave) {
        if (nuevaLlave === 'ciudad') {
          if (grupito[0].ubicacion && grupito[0].ubicacion.ciudad && grupito[0].ubicacion.ciudad.nombre) {
            procesado.ciudad = grupito[0].ubicacion.ciudad.nombre;
          }
        } else if (nuevaLlave === 'pais') {
          if (
            grupito[0].ubicacion &&
            grupito[0].ubicacion.ciudad &&
            grupito[0].ubicacion.ciudad.pais &&
            grupito[0].ubicacion.ciudad.pais.nombre
          ) {
            procesado.pais = grupito[0].ubicacion.ciudad.pais.nombre;
          }
        } else {
          const [nivel1, llave] = campo.split('.');

          if (nivel1 && llave) {
            if (grupito[0][nivel1]) {
              const valor = grupito[0][nivel1][llave];

              if (valor) {
                procesado[nuevaLlave] = valor;
              } else {
                console.log(`campo ${nivel1}.${llave} es null`);
              }
            } else {
              console.log(`campo ${nivel1} es null`);
            }
          }
        }
      }
    });

    console.log(procesado);

    // try {
    //   await cliente.index('obras').getRawInfo();
    // } catch (error) {
    //   try {
    //     await cliente.createIndex('obras', { primaryKey: 'registro' });
    //   } catch (error) {
    //     logger.warn(error);
    //   }
    // }

    // const { total } = await cliente.index('obras').getDocuments({ limit: 1 });

    // console.log(total);

    // console.log(schema.collections.obras);
    // const indiceObras = cliente.deleteIndexIfExists('obras');
    // console.log(indiceObras);
    // cliente.updateIndex('obras', {});
    console.log(JSON.stringify(grupito, null, 2));
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
