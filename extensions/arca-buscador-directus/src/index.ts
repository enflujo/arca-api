import { defineModule } from '@directus/extensions-sdk';
import Interfaz from './Interfaz.vue';

export default defineModule({
  id: 'buscador',
  name: 'Buscador',
  icon: 'manage_search',
  routes: [
    {
      path: '',
      component: Interfaz,
    },
  ],
});
