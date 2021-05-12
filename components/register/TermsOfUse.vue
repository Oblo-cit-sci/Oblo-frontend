<template lang="pug">
  div
    v-row.ml-2(align="center")
      v-checkbox(v-model="i_agree")
      div {{$t('page.register.i_agree_with')}} &nbsp;
        a(@click="i_terms_dialog_open = true") {{$t('page.about[1].h2')}}
    v-dialog(v-model="i_terms_dialog_open" :width="main_container_with")
      v-card
        FlexibleTextSection.pa-4.pb-1(:section="terms_of_use_section" disable_divider, :fields="template_fields")
        v-card-actions
          v-btn(icon text @click="i_terms_dialog_open = false")
            v-icon mdi-close
</template>

<script>
import LayoutMixin from "~/components/global/LayoutMixin";
import FlexibleTextSection from "~/components/global/FlexibleTextSection";

export default {
  name: "TermsOfUse",
  components: {FlexibleTextSection},
  mixins: [LayoutMixin],
  props: {
    agree: {
      type: Boolean,
    },
    terms_dialog_open: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      // agree: false,
      // terms_dialog_open: false
    }
  },
  computed: {
    terms_of_use_section() {
      // make this better so its not destroyed in the translation tables. translations shouldnt touch it.
      // todo just grab it from the right location. rename p.index from h2 to p.h:terms_of_use and find by that key
      return this.$_.find(this.$i18n.msg("page.about"), s => s.hasOwnProperty("terms_of_use"))
    },
    i_terms_dialog_open: {
      get: function () {
        return this.terms_dialog_open
      },
      set: function (value) {
        this.$emit("update:terms_dialog_open", value)
      }
    },
    i_agree: {
      get: function () {
        return this.agree
      },
      set: function (value) {
        this.$emit("update:agree", value)
      }
    },
    template_fields() {
      return {
        platform_title: this.$store.getters["app/platform_data"].title
      }
    }
  }
}
</script>

<style scoped>

</style>
