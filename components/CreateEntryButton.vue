<template lang="pug">
  v-btn(
    v-if="can_create_some_entry"
    ref="create_button"
    large
    v-bind="bp_based_main_create_btn_props"
    color="#b88cf1"  @click="create_entry")
    span(v-if="show_main_template_create_text") {{create_text}}
    v-icon mdi-plus
</template>

<script>
import EntryCreateMixin from "~/components/entry/EntryCreateMixin"
import {mapGetters} from "vuex"
import {EDIT} from "~/lib/consts";
import NavBaseMixin from "~/components/NavBaseMixin";
import ResponsivenessMixin from "~/components/ResponsivenessMixin";
import DomainDataMixin from "~/components/domain/DomainDataMixin";

/**
 * domain.json structure
 * 1.   "templates": {
    "main": {
      "template_slug": "local_observation",
      "create_text": "add observation"
    }
  }

 * 2.   "templates": {
      "create_text" : "add observation" [optional]
  }
 */

export default {
  name: "CreateEntryButton",
  mixins: [DomainDataMixin, EntryCreateMixin, NavBaseMixin, ResponsivenessMixin],
  components: {},
  props: {
    size: {
      type: String,
      default: "large"
    }
  },
  data() {
    return {
      button_width: 0
    }
  },
  mounted() {
    if (this.can_create_some_entry) {
      this.button_width = this.$refs.create_button.$el.offsetWidth
    }
  },
  computed: {
    ...mapGetters({
      menu_open: "menu/open"
    }),
    can_create_some_entry() {
      return this.create_templates_options.length > 0
    },
    bp_based_main_create_btn_props() {
      if (this.show_main_template_create_text) {
        return {"rounded": true, "large": true}
      } else {
        return {"fab": true}
      }
    },
    create_text() {
      return this.$_.get(this.domain_data, "templates.create_text", this.$t("comp.create_entry_button.create_text"))
    },
    show_main_template_create_text() {
      // todo, size can go into responsiveness Mixin
      return (!this.menu_open || this.is_xlarge) && !this.is_small
    }
  },
  methods: {
    create_entry() {
      // console.log("create entry")
      if (this.create_templates_options.length > 1) {
        this.$bus.$emit("domain-create_entry")
        // this.$bus.$emit("create_entry")
      } else {
        this.$bus.$emit("domain-create_entry", this.create_templates_options[0].slug)
      }
    }
  }
}
</script>

<style scoped>

</style>
