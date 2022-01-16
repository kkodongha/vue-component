import TestComponent1 from './TestComponent1.vue';

module.exports = {
  install: (Vue, options) => {
    Vue.component('test-component1', TestComponent1);
  },
};
