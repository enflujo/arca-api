import { defineHook } from '@directus/extensions-sdk';
import { EventContext } from '@directus/shared/dist/esm/types';

export default defineHook(({ action }, { services }) => {
  const { ItemsService } = services;

  action('obras.items.create', despliegue);
  action('obras.items.update', despliegue);

  async function despliegue(evento: Record<string, any>, contexto: EventContext) {
    // Sólo activar este despliegue de datos si la acción es de un usuario en la interfaz, no hay "accountability" si es por medio de este Hook.
    if (!contexto.accountability) return;

    /**
     * Si se edita o crea 1 elemento, sólo hay campo "key", si es una edición multiple es "keys" en array.
     * Volver cualquiera de estos en un array y editar uno por uno en loop.
     */
    let idsObras: number[] = [];
    if (evento.key) {
      idsObras.push(evento.key);
    } else {
      idsObras = evento.keys;
    }

    // Instancias del API para las colecciones que necesitamos.
    const obras = new ItemsService('obras', { schema: contexto.schema, knex: contexto.database });
    const ubicaciones = new ItemsService('ubicaciones', { schema: contexto.schema, kenx: contexto.database });

    for await (const id of idsObras) {
      // Leer los datos de cada obra.
      const datosObra = await obras.readOne(id);

      // Si existe el campo "ubicacion" podemos sacar los datos de la ciudad y país.
      if (datosObra.ubicacion) {
        const datosUbicacion = await ubicaciones.readByQuery({
          filter: {
            id: {
              _eq: datosObra.ubicacion,
            },
          },
          fields: ['ciudad.id', 'ciudad.pais'],
        });

        // Agregar ciudad y país a la obra. Esto automáticamente agrega la obra a las tablas de esa ciudad y país.
        if (datosUbicacion && datosUbicacion.length) {
          const { ciudad } = datosUbicacion[0];

          await obras.updateOne(id, {
            ciudad: ciudad.id,
            pais: ciudad.pais,
          });
        }
      } else {
        // Borrar ciudad y país cuando ubicación es nulo.
        await obras.updateOne(id, {
          ciudad: null,
          pais: null,
        });
      }
    }
  }
});
