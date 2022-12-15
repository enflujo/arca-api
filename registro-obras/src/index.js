import { defineInterface } from '@directus/extensions-sdk';
import Componente from './interfaz.vue';

export default defineInterface({
  id: 'registro-obras',
  name: 'Registro Obras',
  icon: 'box',
  description: 'El id original sde las imágenes.',
  component: Componente,
  options: null,
  types: ['number'],
  group: 'standard',
});
