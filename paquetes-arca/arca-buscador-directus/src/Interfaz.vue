<template>
  <private-view title="Buscador Arca (Meilisearch)">Content goes here...</private-view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { MeiliSearch } from 'meilisearch';
const MEILI_MASTER_KEY = 'prueba';

export default defineComponent({
  data() {
    return {
      totalObras: 0,
      obrasIndexadas: 0,
    };
  },

  inject: ['api'],
  async mounted() {
    console.log(MEILI_MASTER_KEY);
    if (!MEILI_MASTER_KEY) return;

    const cliente = new MeiliSearch({ host: 'http://arca-bdbuscador:7700', apiKey: MEILI_MASTER_KEY });
    const { total } = await cliente.index('obras').getDocuments({ limit: 1 });
    console.log(total);
    // this.api.get('http://localhost:7700');
    // this.api
    //   .items('obras')
    //   .readByQuery({
    //     filter: { estado: { _eq: 'publicado' } },
    //     aggregate: { count: ['*'] },
    //   })
    //   .then((respuesta) => {
    //     console.log(respuesta);
    //   })
    //   .catch(console.error);
  },
});
</script>
