import { defineInterface } from '@directus/extensions-sdk';
import Componente from './interfaz.vue';

export default defineInterface({
  id: 'registro-obras',
  name: 'Registro Obras',
  icon: 'link',
  description: 'El id original de las imágenes.',
  component: Componente,
  options: null,
  types: ['integer'],
  group: 'standard',
});
