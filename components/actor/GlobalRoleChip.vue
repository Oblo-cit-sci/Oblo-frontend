<template lang="pug">
  v-chip(outlined disabled small color="black" text-color="black")
    b.text-capitalize {{t_global_role}}
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
  computed: {
    t_global_role() {
      return this.$t("_global.role."+this.global_role)
    }
  },
  methods: {}
}
</script>

<style scoped>

</style>
