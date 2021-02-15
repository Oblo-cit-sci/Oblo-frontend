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
    const setup = this.$store.getters["translate/setup_values"]
    const translations = new Map(setup.messages.map(msg => ([msg[0], {
      index: msg[0],
      languages: [setup.src_lang, setup.dest_lang],
      messages: [msg[1], msg[2]]
    }])))
    return {
      show_only_incomplete: false,
      page: 1,
      messages_per_page: 20,
      changed_messages: new Set(),
      no_changes: true,
      translations
    }
  },
  computed: {
    ...mapGetters({setup: "translate/setup_values"}),
    total_pages() {
      // console.log("total", this.setups.length, this.setups.length / this.messages_per_page, Math.ceil(this.setups.length / this.messages_per_page))
      return Math.ceil(this.translations.length / this.messages_per_page)
    },
    show_translations() {
      let translations = Array.from(this.translations.values())
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
        this.changed_messages.add(name)
      } else {
        this.changed_messages.delete(name)
      }
      this.no_changes = this.changed_messages.size === 0
    },
    async submit() {
      try {
        if (["fe", "be"].includes(this.setup.component)) {
          const messages = Array.from(this.changed_messages).map(v => [v, this.translations.get(v).messages[1]])
          const {data} = await this.$api.language.update_messages(this.setup.component, this.setup.dest_lang, messages)
          this.ok_snackbar(data.msg)
          for (let m of messages) {
            this.$refs[m[0]][0].refresh_original()
          }
        } else if (this.setup.component === "domain") {
          const messages = this.get_flat_messages()
          try {
            // todo after the 1. submission, the domain- obj is created, and needs to be patched!
            if (this.setup.config.new_o) {
              const {data} = await this.$api.domain.post_from_flat(this.setup.config.domain, this.setup.dest_lang, messages)
              this.ok_snackbar(data.msg)
              // todo: this.setup.config.new_o should be changed to false
            } else {
              const {data} = await this.$api.domain.patch_from_flat(this.setup.config.domain, this.setup.dest_lang, messages)
              this.ok_snackbar(data.msg)
            }
            // console.log(this.changed_messages, "CM")
            const changed_messages = Object.entries(this.changed_messages)
            for (let m of this.changed_messages) {
              this.$refs[m][0].refresh_original()
            }
          } catch (e) {
            console.log(e)
            this.err_error_snackbar(e)
          }
        } else if (this.setup.component === "entries") {
          const messages = this.get_flat_messages()
          try {
            if (this.setup.config.new_o) {
              const {data} = await this.$api.entry.post_from_flat(this.setup.config.entry, this.setup.dest_lang, messages)
              this.ok_snackbar(data.msg)
            } else {
              const {data} = await this.$api.entry.patch_from_flat(this.setup.config.entry, this.setup.dest_lang, messages)
              this.ok_snackbar(data.msg)
            }
            const changed_messages = Object.entries(this.changed_messages)
            for (let m of changed_messages) {
              this.$refs[m[0]][0].refresh_original()
            }
          } catch (e) {
            this.err_error_snackbar(e)
          }
        } else {
          console.error("Unknown component", this.setup)
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
      return Array.from(this.translations).map(t => [t[0], t[1].messages[1]])
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
