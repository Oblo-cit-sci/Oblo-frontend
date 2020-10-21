<template lang="pug">
  v-toolbar(flat dense)
    v-btn(v-if="btn_icon" icon @click="$emit('btn_pressed')")
      v-icon {{btn_icon}}
    v-toolbar-title
      span.font-weight-bold {{title}}
</template>

<script>
export default {
  name: "ButtonTitleToolbar",
  mixins: [],
  components: {},
  props: {
    btn_icon: {
      type: String
    },
    title: {
      type: String,
      required: true
    }
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
