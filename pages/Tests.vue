<template lang="pug">
  div
</template>

<script>

export default {
  name: "Tests",
  mixins: [],
  components: {
  },
  head() {
    return {
      title: "cool",
    }
  },
  async created() {
    // Experimental domain-js-plugin loading and execution
    var fileref=document.createElement('script')
    fileref.setAttribute("type","text/javascript")
    fileref.setAttribute("src", url)
    document.getElementsByTagName("head")[0].appendChild(fileref)
    const fn = window["crossref_transform"];
    if (typeof fn === "function") fn({"cool":4});

  },
  data() {
    return {
    }
  },
  computed: {
  },
  methods: {

  },
  watch: {}
}
</script>

<style scoped>

</style>
