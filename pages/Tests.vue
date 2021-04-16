<template lang="pug">
  div
</template>

<script>

export default {
  name: "Tests",
  mixins: [],
  components: {},
  head() {
    return {
      title: "cool",
    }
  },
  async created() {
    // experimental feature. load and run domain-js-plugin
    const url = this.$api.static.url("js/licci.js")
    const domain_plugin = document.createElement('script')
    domain_plugin.setAttribute("type", "text/javascript")
    domain_plugin.setAttribute("src", url)

    domain_plugin.onload = function (d) {
      console.log("loaded")
      console.log(d)
    }

    document.getElementsByTagName("head")[0].appendChild(domain_plugin)
    const fn = window["crossref_transform"];
    if (typeof fn === "function") fn({"cool": 4});
  },
  data() {
    return {}
  },
  computed: {},
  methods: {},
  watch: {}
}
</script>

<style scoped>

</style>
