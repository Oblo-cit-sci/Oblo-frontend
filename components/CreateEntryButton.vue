<template lang="pug">
  div
    v-btn(
      ref="create_button"
      x-large
      v-bind="bp_based_main_create_btn_props"
      color="#b88cf1"  @click="create_from_main_template")
      span(v-if="show_main_template_create_text") {{main_template.create_text}}
      v-icon mdi-plus
    v-btn.additional_templates_button(dark x-small absolute bottom fab v-if="can_create_multiple_etypes"
      :style="additional_template_button_shift"
      @click="$emit('create_entry')")
      v-icon mdi-dots-horizontal
</template>

<script>
import EntryCreateMixin from "~/components/entry/EntryCreateMixin"
import {mapGetters} from "vuex"
import {EDIT} from "~/lib/consts";
import NavBaseMixin from "~/components/NavBaseMixin";
import ResponsivenessMixin from "~/components/ResponsivenessMixin";
import DomainDataMixin from "~/components/domain/DomainDataMixin";

export default {
  name: "CreateEntryButton",
  mixins: [DomainDataMixin, EntryCreateMixin, NavBaseMixin, ResponsivenessMixin],
  components: {},
  data() {
    return {
      button_width: 0
    }
  },
  mounted() {
    this.button_width = this.$refs.create_button.$el.offsetWidth
  },
  computed: {
    ...mapGetters({
      menu_open: "menu/open"
    }),
    bp_based_main_create_btn_props() {
      if (this.show_main_template_create_text) {
        return {"rounded": true, "large": true}
      } else {
        return {"fab": true}
      }
    },
    additional_template_button_shift() {
      // todo 110 is very magic, depends on the length of the main create button text
      let shift = 0
      if (!this.show_main_template_create_text) {
        shift = "85px"
      } else {
        shift = this.button_width + "px"
      }
      // console.log("shift", shift)
      return {
        position: "absolute",
        left: shift
      }
    },
    show_main_template_create_text() {
      // todo, size can go into responsiveness Mixin
      return (!this.menu_open || this.is_xlarge) && !this.is_small
    }
  },
}
</script>

<style scoped>
.additional_templates_button {
  top: 50px;
  z-index: 30;
  /*transform: translateX(-50%)*/
}
</style>
