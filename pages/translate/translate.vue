<template lang="pug">
  div
    v-btn(@click="back") {{$t("page.translate.back")}}
    v-checkbox(v-model="show_only_incomplete" :label="$t('page.translate.only_undone')")
    MessageTranslationBlock(v-for="t in show_translations"
      v-bind="t"
      :ref="t.index"
      @has_changed="has_changed($event)"
      :key="t.index")
    v-row(justify="center")
      v-col.col-2
        v-btn(:disabled="no_changes" @click="submit" color="success" large) {{$t("w.submit")}}
    SimplePaginate(:total_pages="total_pages" v-model="page")
</template>

<script>
import {mapGetters} from "vuex";
import MessageTranslationBlock from "~/components/language/MessageTranslationBlock";
import SimplePaginate from "~/components/SimplePaginate";
import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin";

export default {
  name: "translate",
  components: {SimplePaginate, MessageTranslationBlock},
  mixins: [TriggerSnackbarMixin],
  created() {
    if (!this.setup.dest_lang) {
      this.$router.push("/translate/setup")
    }
  },
  data() {
    return {
      show_only_incomplete: false,
      page: 1,
      messages_per_page: 20,
      changed_messages: {},
      no_changes: true
    }
  },
  computed: {
    ...mapGetters({setup: "translate/setup_values"}),
    translations() {
      return this.setup.messages.map(msg => ({
        index: msg[0],
        languages: [this.setup.src_lang, this.setup.dest_lang],
        messages: [msg[1], msg[2]]
      }))
    },
    total_pages() {
      // console.log("total", this.setups.length, this.setups.length / this.messages_per_page, Math.ceil(this.setups.length / this.messages_per_page))
      return Math.ceil(this.translations.length / this.messages_per_page)
    },
    show_translations() {
      let translations = this.translations
      if (this.show_only_incomplete) {
        translations = translations.filter(t => t.messages[1] === "")
      }
      return translations.slice((this.page - 1) * this.messages_per_page, (this.page) * this.messages_per_page)
    }
  },
  methods: {
    has_changed({name, change, value}) {
      // console.log("msg change", name, change)
      if (change) {
        this.changed_messages[name] = value
      } else {
        delete this.changed_messages[name]
      }
      this.no_changes = this.$_.isEmpty(this.changed_messages)
    },
    async submit() {
      try {
        if (["fe", "be"].includes(this.setup.component)) {
          const messages = Object.entries(this.changed_messages)
          const {data} = await this.$api.language.update_messages(this.setup.component, this.setup.dest_lang, messages)
          this.ok_snackbar(data.msg)
          for (let m of messages) {
            this.$refs[m[0]][0].refresh_original()
          }
        } else if (this.setup.component === "domain") {
          const messages = this.get_flat_messages()
          if (this.setup.config.new_o) {
            const {data} = await this.$api.domain.post_from_flat(this.setup.config.domain, this.setup.dest_lang, messages)
          } else {
            const {data} = await this.$api.domain.patch_from_flat(this.setup.config.domain, this.setup.dest_lang, messages)
          }
          const changed_messages = Object.entries(this.changed_messages)
          for (let m of changed_messages) {
            this.$refs[m[0]][0].refresh_original()
          }
        }
      } catch (err) {
        this.err_error_snackbar(err)
        // console.log(err)
      }
    },
    back() {
      this.$router.push("/translate/setup")
    },
    get_flat_messages() {
      /**
       * just get the index and dest_msg for all messages (used for domain, entry)
       */
      return this.translations.map(t => [t.index, t.messages[1]])
    },
    find_title_message(flat_messages) {
      for (let msg of flat_messages) {
        if (msg[0] === "title") {
          return msg[1]
        }
      }
      console.error("title message not found")
    }
  },
  watch: {
    page(current, prev) {
      setTimeout(() => {
        this.$vuetify.goTo("body", {offset: 0, duration: 1000, easing: "easeInOutCubic"})
      }, 50)
    }
  }
}
</script>

<style scoped>

</style>
