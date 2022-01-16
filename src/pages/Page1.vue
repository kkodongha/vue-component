<template>
  <test-component-1 />
</template>

<script>
import TestComponent1 from '@/components/TestComponent1/TestComponent1.vue';
export default {
  components: { TestComponent1 },
  created() {
    console.log('hio');
  },
};
</script>

<style></style>
