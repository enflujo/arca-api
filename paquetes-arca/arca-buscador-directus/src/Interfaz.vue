<template>
  <private-view title="Buscador Arca (Meilisearch)">
    <div class="contenido">
      <v-chip x-small>Meilisearch v{{ version }}</v-chip>

      <v-card>
        <v-card-title>Llave pública del buscador</v-card-title>
        <v-card-text>
          Esta es la llave que se debe usar en el "fron-end" para acceder a los datos de meilisearch.
        </v-card-text>
      </v-card>

      <v-input v-model="llavePublica" readonly>
        <template #prepend><v-icon name="vpn_key" /></template>
      </v-input>

      <v-card>
        <v-card-title>Reiniciar base de datos</v-card-title>
        <v-card-text> </v-card-text>
      </v-card>
      <v-button v-on:click="indexar">Reiniciar</v-button>
      <v-divider>New Section</v-divider>
      <v-button v-on:click="estado">Estado</v-button>
    </div>
  </private-view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  data() {
    return {
      totalObras: 0,
      obrasIndexadas: 0,
      llavePublica: '',
      version: null,
    };
  },

  inject: ['api'],
  methods: {
    async indexar() {
      const respuesta = await this.api('/arca-datos/reindexar');
      console.log(respuesta.data);
    },

    async estado() {
      const respuesta = await this.api('/arca-datos/estado-buscador');
      console.log(respuesta.data);
    },
  },
  async mounted() {
    const { data: llave } = await this.api('/arca-datos/llave-buscador');
    const { data: version } = await this.api('/arca-datos/version-buscador');
    this.llavePublica = llave ? llave : '';
    if (version && version.pkgVersion) {
      this.version = version.pkgVersion;
    }
    // console.log(MEILI_MASTER_KEY);
    // if (!MEILI_MASTER_KEY) return;

    // const cliente = new MeiliSearch({
    //   host: 'https://apiarca.uniandes.edu.co/arca-buscador/',
    //   apiKey: MEILI_MASTER_KEY,
    // });
    // const { total } = await cliente.index('obras').getDocuments({ limit: 1 });
    // console.log(total);
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

<style scoped>
.contenido {
  padding: 0 var(--content-padding);
}

.v-card {
  margin-bottom: 1em;
}
/* .v-chip {
		--v-chip-color: var(--red);
		--v-chip-background-color: var(--red-50);
		--v-chip-color-hover: var(--white);
		--v-chip-background-color-hover: var(--red);
	} */
</style>
