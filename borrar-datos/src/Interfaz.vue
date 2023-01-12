<template>
  <button @click="borrar">Borrar Datos</button>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    collection: {
      type: String,
      default: null,
    },
  },

  setup({}, { emit }) {
    return { borrar };

    function borrar() {
      emit('setFieldValue', { field: 'sintesis', value: null });
      emit('setFieldValue', { field: 'fuente', value: null });
    }
  },
});
</script>

<style></style>
