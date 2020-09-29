<template lang="pug">
  div
    v-btn(
      :style="{transform: 'translateX(-50%)'}"
      v-bind="bp_based_main_create_btn_props"
      color="success"  @click="create_from_main_template")
      span(v-if="show_main_template_create_text") {{main_template.create_text}}
      v-icon mdi-plus
    v-btn.additional_templates_button(dark x-small absolute bottom fab v-if="can_create_multiple_etypes"
      :style="additional_template_button_shift"
      @click="$emit('create_entry')")
      v-icon mdi-dots-horizontal
</template>

<script>
export default {
  name: "CreateEntryButton",
  mixins: [],
  components: {},
  props: {
    show_main_template_create_text: {
      type: Boolean
    },
    create_text: {},
  },
  data() {
    return {}
  },
  computed: {
    bp_based_main_create_btn_props() {
      if (this.show_main_template_create_text) {
        return {"rounded": true, "large": true}
      } else {
        return {"fab": true}
      }
    },
    additional_template_button_shift() {
      // todo 110 is very magic, depends on the length of the main create button text
      let shift = "110px"
      if (!this.show_main_template_create_text) {
        shift = "40px"
      }
      // console.log("shift", shift)
      return {
        position: "absolute",
        left: shift
      }
    },
  },
  methods: {}
}
</script>

<style scoped>

</style>
