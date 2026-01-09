import { camposM2M, camposM2O, camposPlanos } from './constantes';
import { Obra } from './tipos';

function limpiarHTML(texto: string): string {
  if (!texto || typeof texto !== 'string') return texto;

  // Remover etiquetas HTML
  let limpio = texto.replace(/<[^>]*>/g, '');

  // Decodificar entidades HTML
  limpio = limpio
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

  // Remover espacios múltiples
  limpio = limpio.replace(/\s+/g, ' ').trim();

  return limpio;
}

export default (obra: any) => {
  const procesado: any = { registro: obra.registro, titulo: obra.titulo, gestos: [] };

  // Siempre inicializamos categorias para poder ir agregando en cualquier orden.
  procesado.categorias = [];

  camposPlanos.forEach((campo) => {
    if (obra[campo]) {
      procesado[campo] = typeof obra[campo] === 'string' ? limpiarHTML(obra[campo]) : obra[campo];
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
            procesado.categorias.push(obra.categoria1.nombre);
          }
          break;
        case 'categoria2':
          if (obra.categoria2 && obra.categoria2.nombre) {
            procesado.categorias.push(obra.categoria2.nombre);
          }
          break;
        case 'categoria3':
          if (obra.categoria3 && obra.categoria3.nombre) {
            procesado.categorias.push(obra.categoria3.nombre);
          }
          break;
        case 'categoria4':
          if (obra.categoria4 && obra.categoria4.nombre) {
            procesado.categorias.push(obra.categoria4.nombre);
          }
          break;
        case 'categoria5':
          if (obra.categoria5 && obra.categoria5.nombre) {
            procesado.categorias.push(obra.categoria5.nombre);
          }
          break;
        case 'categoria6':
          if (obra.categoria6 && obra.categoria6.nombre) {
            procesado.categorias.push(obra.categoria6.nombre);
          }
          break;
        case 'gesto1':
          if (obra.gesto1 && obra.gesto1.nombre) {
            const codigo = obra.gesto1.codigo ? `(${obra.gesto1.codigo}) ` : '';
            procesado.gestos.push(`${codigo}${obra.gesto1.nombre}`);
          }
          break;
        case 'gesto2':
          if (obra.gesto2 && obra.gesto2.nombre) {
            const codigo = obra.gesto2.codigo ? `(${obra.gesto2.codigo}) ` : '';
            procesado.gestos.push(`${codigo}${obra.gesto2.nombre}`);
          }
          break;
        case 'gesto3':
          if (obra.gesto3 && obra.gesto3.nombre) {
            const codigo = obra.gesto3.codigo ? `(${obra.gesto3.codigo}) ` : '';
            procesado.gestos.push(`${codigo}${obra.gesto3.nombre}`);
          }
          break;
        default:
          const [nivel1, llave] = campo.split('.');

          if (nivel1 && llave) {
            const obj = obra[nivel1 as keyof Obra];
            if (obj && typeof obj === 'object') {
              const valor: any = obj[llave];

              if (valor && nuevaLlave) {
                procesado[nuevaLlave] = typeof valor === 'string' ? limpiarHTML(valor) : valor;
              }
            }
          }
          break;
      }
    }
  });

  camposM2M.forEach(([coleccion, llave, nuevaLlave]) => {
    if (coleccion && llave) {
      const intermedia = `${coleccion}_id`;
      const tieneValores = obra[coleccion] && obra[coleccion].length;

      if (nuevaLlave && tieneValores) {
        obra[coleccion].forEach((instancia: any) => {
          if (instancia[intermedia]) {
            if (!procesado[nuevaLlave]) {
              procesado[nuevaLlave] = [];
            }

            if (nuevaLlave === 'autores') {
              const nombreCompleto = [];

              if (instancia[intermedia].nombre) nombreCompleto.push(instancia[intermedia].nombre);
              if (instancia[intermedia].apellido) nombreCompleto.push(instancia[intermedia].apellido);

              procesado[nuevaLlave].push(nombreCompleto.join(' '));
            } else {
              const valor = instancia[intermedia][llave];
              procesado[nuevaLlave].push(typeof valor === 'string' ? limpiarHTML(valor) : valor);
            }
          }
        });
      }
    }
  });
  for (const campo in procesado) {
    if (Array.isArray(procesado[campo])) {
      procesado[campo] = procesado[campo].join(', ');
    }
  }
  return procesado;
};
