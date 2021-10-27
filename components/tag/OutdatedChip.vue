<template lang="pug">
  v-chip.mr-4(:ripple="false" small  color="red" outlined label)
    v-icon(small) mdi-clipboard-text-clock-outline
    p.ma-1 outdated
</template>

<script>
export default {
  name: "OutdatedChip",
  mixins: [],
  components: {},
  props: {},
  data() {
    return {}
  },
  computed: {},
  methods: {}
}
</script>

<style scoped>

</style>
