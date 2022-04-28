import { defineInterface } from '@directus/extensions-sdk';
import InterfaceComponent from './interface.vue';

export default defineInterface({
  id: 'mapa-arca',
  name: 'Mapa Arca',
  icon: 'box',
  description: 'Extensión del mapa para usar en Arca',
  component: InterfaceComponent,
  options: null,
  types: ['text'],
});
