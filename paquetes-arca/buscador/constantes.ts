import { CamposM2M, CamposM2O, CamposSimples, Obra } from './tipos';

export const camposPlanos: (keyof CamposSimples)[] = [
  'registro',
  'titulo',
  'sintesis',
  'comentario_bibliografico',
  'iconotexto',
];

export const camposM2O: [relacion: string, nuevaLLave?: keyof CamposM2O][] = [
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
  ['gesto1.nombre', 'gesto1'],
  ['gesto1.codigo'],
  ['gesto2.nombre', 'gesto2'],
  ['gesto2.codigo'],
  ['gesto3.nombre', 'gesto3'],
  ['gesto3.codigo'],
];

export const camposM2M: [coleccion: keyof Obra, llave: 'nombre' | 'apellido', nuevaLlave?: keyof CamposM2M][] = [
  ['autores', 'nombre', 'autores'],
  ['autores', 'apellido'],
  ['escenarios', 'nombre', 'escenarios'],
  ['objetos', 'nombre', 'objetos'],
  ['tecnicas', 'nombre', 'tecnicas'],
  ['personajes', 'nombre', 'personajes'],
  ['simbolos', 'nombre', 'simbolos'],
  ['descriptores', 'nombre', 'descriptores'],
  ['caracteristicas', 'nombre', 'caracteristicas'],
];
