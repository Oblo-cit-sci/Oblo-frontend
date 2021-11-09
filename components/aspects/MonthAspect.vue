<template lang="pug">
  div
    v-date-picker(v-if="is_editable_mode" type="month" v-model="i_value" :max="max")
    div(v-else)
      span(v-text="i_value")
</template>

<script>
import AspectComponentMixin from "~/components/aspects/AspectComponentMixin"

export default {
  name: "MonthAspect",
  mixins: [AspectComponentMixin],
  components: {},
  props: {},
  data() {
    return {}
  },
  created() {
    this.i_value = this.value
  },
  methods: {

  },
  computed: {
    until_now() {
      return this.$_.get(this.attr,"until_now", true)
    },
    max() {
      if (this.until_now) {
        return new Date().toISOString()
      } else {
        return null
      }
    },
    i_value: {
      get() {
        return this.value
      },
      set(value) {
        this.update_value(value)
      }
    }
  }
}
</script>

<style scoped>

</style>
