<template>
  <div>
    <v-input type="number" :model-value="value" :class="font" @update:model-value="$emit('input', $event)" disabled />
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { useApi } from '@directus/extensions-sdk';

export default defineComponent({
  inject: ['values'],
  emits: ['values', 'input'],
  props: {
    value: {
      type: Number,
      default: null,
    },

    collection: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      numeroRegistro: null,
    };
  },

  setup(props, { emit }) {
    if (!props.value) {
      const api = useApi();
      api('/items/obras?aggregate[max]=registro').then(({ data }) => {
        const nuevoValor = +data.data[0].max.registro + 1;
        emit('input', nuevoValor);
      });
    } else {
      console.log('Valor ya existe y es', props.value);
    }
  },
});
</script>
