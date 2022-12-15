import { useApi, defineInterface } from '@directus/extensions-sdk';
import { defineComponent, resolveComponent, openBlock, createElementBlock, createVNode, normalizeClass } from 'vue';

var script = defineComponent({
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

function render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_v_input = resolveComponent("v-input");

  return (openBlock(), createElementBlock("div", null, [
    createVNode(_component_v_input, {
      type: "number",
      "model-value": _ctx.value,
      class: normalizeClass(_ctx.font),
      "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => (_ctx.$emit('input', $event))),
      disabled: ""
    }, null, 8 /* PROPS */, ["model-value", "class"])
  ]))
}

script.render = render;
script.__file = "src/interfaz.vue";

var index = defineInterface({
  id: 'registro-obras',
  name: 'Registro Obras',
  icon: 'box',
  description: 'El id original sde las imágenes.',
  component: script,
  options: null,
  types: ['number'],
  group: 'standard',
});

export { index as default };
