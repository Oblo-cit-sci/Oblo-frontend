<template lang="pug">
  div
    v-text-field(readonly flat solo :value="index" hide-details prefix="index:")
    v-row.ml-1
      v-col.pt-0.px-1(v-for="(msg, index) in messages" :key="index" md="6" sm="12")
        v-text-field(
          readonly rounded hide-details
          :background-color="is_selected(index)"
          :prefix="prefix[index]"
          :value="msg" append-outer-icon="mdi-check"
          @click:append-outer="select(index)")
</template>

<script>
export default {
  name: "TextCompare",
  mixins: [],
  components: {},
  props: {
    index: String,
    messages: Array,
    prefix: {
      type: Array,
      default: () => ["1)","2)"]
    }
  },
  data() {
    return {
      selected: null
    }
  },
  computed: {},
  methods: {
    select(index) {
      this.selected = index
      console.log("select", index)
      this.$emit("select",this.messages[index])
    },
    is_selected(index) {
      return this.selected === index ? "light-green" : null
    }
  }
}
</script>

<style scoped>

</style>
