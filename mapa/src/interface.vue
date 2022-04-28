<template>
  <div>
    <h2>HoLA</h2>
    <p>{{ punto }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import { useApi, useStores, useCollection } from '@directus/extensions-sdk';
import { Field } from '@directus/shared/dist/esm/types';

export default defineComponent({
  inject: ['values'],
  props: {
    value: {
      type: String,
      default: null,
    },
    collection: {
      type: String,
      default: null,
    },
  },
  emits: ['input'],
  data() {
    return {
      punto: '',
    };
  },
  setup(props, { emit }) {
    const api = useApi();

    const { useFieldsStore } = useStores();
    const coleccion = useCollection(props.collection);
    const fieldName = useFieldsStore().getField(props.collection, 'latitud') as Field;

    // const collectionsStore = useCollectionsStore();

    console.log(fieldName, Object.keys(fieldName), props.collection, fieldName.name, fieldName.meta, fieldName.field);

    return { handleChange };

    function handleChange(value: string): void {
      emit('input', value);
    }
  },

  mounted() {
    const latitud = document.querySelector('[field="latitud"]') as HTMLInputElement;
    const longitud = document.querySelector('[field="longitud"]') as HTMLInputElement;
    const actualizarPunto = () => {
      console.log('Actualizando punto');
      this.punto = `POINT (${longitud.value} ${latitud.value})`;
      this.values.ubicacion = `POINT (${longitud.value} ${latitud.value})`;
    };

    latitud.onchange = actualizarPunto;
    longitud.onchange = actualizarPunto;
    latitud.oninput = actualizarPunto;
    // latitud.onclick = actualizarPunto;
    actualizarPunto();
  },
});
</script>
