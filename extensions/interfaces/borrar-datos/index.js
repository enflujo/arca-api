import { defineInterface } from '@directus/extensions-sdk';
import { defineComponent, openBlock, createElementBlock } from 'vue';

var script = defineComponent({
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

function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("button", {
    onClick: _cache[0] || (_cache[0] = (...args) => (_ctx.borrar && _ctx.borrar(...args)))
  }, "Borrar Datos"))
}

script.render = render;
script.__file = "src/Interfaz.vue";

var index = defineInterface({
  id: 'borrar-datos',
  name: 'Borrar Datos',
  icon: 'delete_sweep',
  description: 'Borra los datos de un registro.',
  component: script,
  options: null,
  types: ['string'],
  group: 'standard',
});

export { index as default };
