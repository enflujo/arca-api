import { defineInterface } from '@directus/extensions-sdk';
import Componente from './Interfaz.vue';

export default defineInterface({
  id: 'borrar-datos',
  name: 'Borrar Datos',
  icon: 'delete_sweep',
  description: 'Borra los datos de un registro.',
  component: Componente,
  options: null,
  types: ['string'],
  group: 'standard',
});
