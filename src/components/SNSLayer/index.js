import SNSLayer from './SNSLayer.vue';

module.exports = {
  install: (Vue, options) => {
    Vue.component('sns-layer', SNSLayer);
  },
};
