<template>
  <div>
    TestComponent1 Component 입니다. <br />
    propText : {{ propText }} <br />
    axiosReturnData : {{ axiosReturnData }}<br />
    <Sub1 />
    <Sub2 />
  </div>
</template>

<script>
import Sub1 from '@/components/TestComponent1/Sub1.vue';
import Sub2 from '@/components/TestComponent1/Sub2.vue';

export default {
  components: { Sub1, Sub2 },
  mixins: [],
  props: {
    axios: {
      type: Object,
    },
    propText: {
      type: String,
      required: false,
    },
  },
  data() {
    return {
      axiosReturnData: null,
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
    // this.axiosTest();
  },
  destroyed() {},
  methods: {
    async axiosTest() {
      await this.$axios
        .$get('/view/vod', {
          params: {
            lectureTypeCode: 'VOD',
            classID: 1544,
          },
        })
        .then((res) => {
          this.axiosReturnData = res;
        })
        .catch((e) => {
          console.log('error');
        });
    },
  },
};
</script>

<style scoped></style>
