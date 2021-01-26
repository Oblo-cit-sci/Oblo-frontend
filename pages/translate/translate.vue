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
    if (!this.translation.dest_lang) {
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
    ...mapGetters({translation: "translate/translation"}),
    translations() {
      return this.translation.messages.map(msg => ({
        index: msg[0],
        languages: [this.translation.src_lang, this.translation.dest_lang],
        messages: [msg[1], msg[2]]
      }))
    },
    total_pages() {
      // console.log("total", this.translations.length, this.translations.length / this.messages_per_page, Math.ceil(this.translations.length / this.messages_per_page))
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
      if (change) {
        this.changed_messages[name] = value
      } else {
        delete this.changed_messages[name]
      }
      this.no_changes = this.$_.isEmpty(this.changed_messages)
    },
    submit() {
      const messages = Object.entries(this.changed_messages)
      this.$api.language.update_messages(this.translation.component, this.translation.dest_lang, messages).then(({data}) => {
        this.ok_snackbar(data.msg)
        // console.log(messages)
        for (let m of messages) {
          // console.log(this.$refs[m[0]][0])
          this.$refs[m[0]][0].refresh_original()
        }
      }, err => {
        this.err_error_snackbar(err)
      })
    },
    back() {
      this.$router.push("/translate/setup")
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
