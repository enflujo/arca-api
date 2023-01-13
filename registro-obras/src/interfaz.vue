<template>
  <div>
    <v-input type="number" :class="font" :model-value="value" disabled />
  </div>
</template>

<script>
import { useApi } from '@directus/extensions-sdk';

export default {
  props: {
    value: {
      type: Number,
      default: null,
    },
  },
  emits: ['input'],

  setup(props, { emit }) {
    if (!props.value) {
      const api = useApi();

      api
        .get('/items/obras?aggregate[max]=registro')
        .then(({ data }) => {
          if (data.data && data.data.length && data.data[0].max && data.data[0].max.registro) {
            const nuevoValor = +data.data[0].max.registro + 1;
            emit('input', nuevoValor);
          }
        })
        .catch(console.error);
    }
  },
};
</script>
