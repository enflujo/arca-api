<template>
  <private-view title="Buscador Arca (Meilisearch)">
    <div class="contenido">
      <v-chip x-small>Meilisearch v{{ version }}</v-chip>

      <v-card>
        <v-card-title>Llave pública del buscador</v-card-title>
        <v-card-text>
          Esta es la llave que se debe usar en el "fron-end" para acceder a los datos de Meilisearch.
        </v-card-text>
      </v-card>

      <v-input v-model="llavePublica" readonly>
        <template #prepend><v-icon name="vpn_key" /></template>
      </v-input>

      <v-divider></v-divider>

      <v-card>
        <v-card-title>Recrear base de datos del buscador</v-card-title>
        <v-card-text
          >La base de datos del buscador se puede eliminar y recrear en cualquier momento en caso de que los datos estén
          presentando problemas. Este proceso puede ser lento.</v-card-text
        >
      </v-card>

      <v-progress-circular v-if="procesando" indeterminate />

      <v-info v-if="resultado.tipo" :icon="resultado.icono" :title="resultado.tipo" :type="resultado.tipo">{{
        resultado.mensaje
      }}</v-info>

      <v-button v-on:click="indexar">Reiniciar</v-button>
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
      procesando: false,
      resultado: { icono: '', tipo: '', mensaje: '', codigo: 0 },
    };
  },

  inject: ['api'],
  methods: {
    async indexar() {
      if (!this.api) return;
      this.procesando = true;
      const respuesta = await this.api('/arca-datos/reindexar');
      this.resultado = respuesta.data;

      this.procesando = false;
    },
  },

  async mounted() {
    const { data: llave } = await this.api('/arca-datos/llave-buscador');
    const { data: version } = await this.api('/arca-datos/version-buscador');

    this.llavePublica = llave ? llave : '';

    if (version && version.pkgVersion) {
      this.version = version.pkgVersion;
    }
  },
});
</script>

<style scoped>
.contenido {
  padding: 0 var(--content-padding);
}

.v-divider {
  margin: 2em 0;
}

.v-card {
  margin-bottom: 1em;
}
</style>
