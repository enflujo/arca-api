<template>
  <div>
    <v-input type="number" :class="font" :value="value" @update:model-value="$emit('input', $event)" />
    <!-- <button @click="buscar()">buscar</button> -->
  </div>
</template>

<script>
export default {
  emits: ['input'],
  props: {
    value: {
      type: Number,
      default: null,
    },
  },

  setup(props, { emit }) {
    return { actualizar };

    function actualizar(value) {
      emit('input', value);
    }
  },
};
</script>
