<template lang="pug">


</template>

<script>
export default {
      name: "Filtergroup",
      mixins: [],
      components: {},
      props: {

      },
      data() {
          return {
            filter_configs: this.$_.mapKeys(this.include_filters, v => v.name),
            filter_values: {},
          }
      },
      created() {

      },
      computed: {

      },
      methods: {

      },
      watch: {

      }
}
</script>

<style scoped>

</style>
