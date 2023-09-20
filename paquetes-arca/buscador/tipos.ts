/**
 * Registro general bajo el nuevo modelado de datos
 * Los campos de tipo array (Autor[]) y de nombre plural se refieren a campos de M2M en el CMS.
 * Los campos de nombre singular son campos que se asignan directamente o tienen una conexión con otra colección de tipo M2O
 */

type ID = string | number;
type SoloNombre = { nombre: string } | null;

export type Obra = {
  /** Asignado automáticamente por Directus (Primary Key) */
  id: ID;
  registro: number;
  /**
   * ..:: Se asignan directamente en el registro ::..
   */
  /** Directo: Titulo de la obra */
  titulo: string;

  /** Directo: Síntesis */
  sintesis: string;
  /** Directo: Comentario Bibliográfico */
  comentario_bibliografico: string;
  /** Iconotexto */
  iconotexto: string;

  /** Directo: ¿la fecha es un periodo? permite hacer visible el campo fecha_final */
  fecha_periodo: boolean;

  /** Directo: Fecha inicial o exacta */
  fecha_inicial: number;

  /** Directo: Fecha final (sólo cuando es periodo) */
  fecha_final: number;

  /**
   * ..:: Relaciones "Many to One" (M2O) - Sólo se les puede asignar 1 valor ::..
   */

  /** M2O: Imagen de la obra */
  imagen: { id: string } | null;
  /** M2O: Fuente de la imagen */
  fuente: { descripcion: string } | null;
  /** M2O: Ubicación donde se encuentra la obra */
  ubicacion: { nombre: string; ciudad: { nombre: string; pais?: { nombre: string } } } | null;
  /** M2O: Tipo de donante de la obra */
  donante: SoloNombre;
  /** M2O: Categoría que describe el relato visual */
  relato_visual: SoloNombre;
  /** M2O: Complejos Gestuales */
  complejo_gestual: SoloNombre;
  /** M2O: Tipos Gestuales */
  tipo_gestual: SoloNombre;
  /** M2O: Fisiognómicas */
  fisiognomica: SoloNombre;
  /** M2O: Fisiognómicas Imagen */
  fisiognomica_imagen: SoloNombre;
  /** M2O: Rostro */
  rostro: SoloNombre;
  /** M2O: Ciudad Origen */
  ciudad_origen: SoloNombre;
  /** M2O: Cartela Filacteria */
  cartela_filacteria: SoloNombre;
  /** M2O: Categoria 1 */
  categoria1: SoloNombre;
  /** M2O: Categoria 2 */
  categoria2: SoloNombre;
  /** M2O: Categoria 3 */
  categoria3: SoloNombre;
  /** M2O: Categoria 4 */
  categoria4: SoloNombre;
  /** M2O: Categoria 5 */
  categoria5: SoloNombre;
  /** M2O: Categoria 6 */
  categoria6: SoloNombre;
  /** M2O: Ciudad */
  ciudad: ID;
  /** M2O: Pais */
  pais: ID;
  /** M2O: Gesto1 */
  gesto1: { nombre: string; codigo: string };
  /** M2O: Gesto2 */
  gesto2: { nombre: string; codigo: string };
  /** M2O: Gesto3 */
  gesto3: { nombre: string; codigo: string };
  /**
   * ..:: Relaciones "Many to Many" (M2M) - Permite más de 1 valor ::..
   */
  /** M2M: Autores de la obra */
  autores: { autores_id: ID }[] | null;
  /** M2M: Objetos Gestos */
  objetos: { objetos_id: ID }[];
  /** M2M: Escenario */
  escenarios: { escenarios_id: ID }[];
  /** M2M: Técnicas */
  tecnicas: { tecnicas_id: ID }[];
  /** M2M: Personajes */
  personajes: { personajes_id: ID }[];
  /** M2M: Símbolos */
  simbolos: (ID | { simbolos_id: ID })[];
  /** M2M: Descriptores */
  descriptores: (ID | { descriptores_id: ID })[];
  /** M2M: Características Particulares */
  caracteristicas: (ID | { caracteristicas_id: ID })[];
};

export interface CamposSimples {
  registro: number;
  titulo: string;
  sintesis?: string;
  comentario_bibliografico?: string;
  iconotexto?: string;
}

export interface CamposM2O {
  fuente?: string;
  imagen?: string;
  categorias?: string[];
  categoria1?: string;
  categoria2?: string;
  categoria3?: string;
  categoria4?: string;
  categoria5?: string;
  categoria6?: string;
  donante?: string;
  ciudad_origen?: string;
  ubicacion?: string;
  ciudad?: string;
  pais?: string;
  relato_visual?: string;
  tipo_gestual?: string;
  complejo_gestual?: string;
  fisiognomica?: string;
  fisiognomica_imagen?: string;
  rostro?: string;
  gesto1?: string;
  gesto1_codigo?: string;
  gesto2?: string;
  gesto2_codigo?: string;
  gesto3?: string;
  gesto3_codigo?: string;
}

export interface CamposM2M {
  autores?: string[];
  escenarios?: string[];
  objetos?: string[];
  tecnicas?: string[];
  personajes?: string[];
  simbolos?: string[];
  descriptores?: string[];
  caracteristicas?: string[];
}

export interface ObraProcesada extends CamposSimples, CamposM2O, CamposM2M {}
