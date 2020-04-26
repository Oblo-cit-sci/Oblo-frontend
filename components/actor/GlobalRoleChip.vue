<template lang="pug">
  v-chip(outlined disabled small color="black" text-color="black")
    b.text-capitalize {{global_role}}

</template>

<script>
export default {
  name: "GlobalRoleChip",
  mixins: [],
  components: {},
  props: {
    global_role: String
  },
  data() {
    return {}
  },
  computed: {},
  methods: {}
}
</script>

<style scoped>

</style>
