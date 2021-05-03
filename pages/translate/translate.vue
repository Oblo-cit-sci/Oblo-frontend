<template lang="pug">
  div
    v-btn(@click="back")
      v-icon(left) mdi-arrow-left
      span {{$t("page.translate.back")}}
    AspectSet(:aspects="setup_aspects" :values="setup_values" mode="view" compact)
    v-checkbox(v-model="show_only_incomplete" :label="$t('page.translate.only_undone')")
    MessageTranslationBlock(v-for="t in show_translations"
      v-bind="translation_o[t]"
      @update="update_msg(t, $event)"
      :mark_required="is_required(t)"
      :ref="t"
      @has_changed="has_changed($event)"
      :key="t")
    v-row(justify="center")
      v-col.col-2
        v-btn(:disabled="disable_submit" @click="submit" color="success" large) {{$t("w.submit")}}
    v-sheet(min-height="30px") {{can_change_page_text}}
    SimplePaginate(:total_pages="total_pages" v-model="page" :allow="no_changes")
</template>

<script>
import {mapGetters} from 'vuex'
import MessageTranslationBlock from '~/components/language/MessageTranslationBlock'
import SimplePaginate from '~/components/SimplePaginate'
import TriggerSnackbarMixin from '~/components/TriggerSnackbarMixin'
import {DOMAIN, PUBLISHED, SELECT} from '~/lib/consts'
import AspectSet from "~/components/AspectSet";
import OptionsMixin from "~/components/aspect_utils/OptionsMixin";
import TranslationSetupMixin from "~/components/language/TranslationSetupMixin";

export default {
  name: 'Translate',
  components: {SimplePaginate, MessageTranslationBlock, AspectSet},
  mixins: [OptionsMixin, TriggerSnackbarMixin, TranslationSetupMixin],
  data() {
    const setup = this.$store.getters['translate/setup_values']
    const message_order = setup.messages.map((msg) => msg[0])
    const translation_o = this.$_.keyBy(
      setup.messages.map((msg) => ({
        index: msg[0],
        languages: [setup.src_lang, setup.dest_lang],
        original: msg[2],
        messages: [msg[1], msg[2]],
      })),
      (m) => m.index
    )
    return {
      show_only_incomplete: false,
      page: 1,
      messages_per_page: 20,
      changed_messages: new Set(),
      no_changes: true,
      message_order,
      translation_o,
    }
  },
  created() {
    if (!this.setup.dest_lang) {
      this.$router.push('/translate/setup')
    }
  },
  computed: {
    setup_aspects() {
      return [
        this.dest_language_select_aspect([this.setup_values["dest_lang"]]), this.component_select_aspect(),
        this.domain_select_aspect(), this.entry_select_aspect([this.setup_values["entry"]]),
        this.src_language_select_aspect([this.setup_values["src_lang"]])
      ]
    },
    setup_values() {
      return this.$store.getters['translate/packed_values']
    },
    ...mapGetters({setup: 'translate/setup_values'}),
    disable_submit() {
      return this.no_changes
    },
    can_change_page_text() {
      if (this.no_changes) {
        return ""
      } else {
        return this.$t("page.translate.submit_required")
      }
    },
    total_pages() {
      // console.log("total", this.setups.length, this.setups.length / this.messages_per_page, Math.ceil(this.setups.length / this.messages_per_page))
      return Math.ceil(this.message_order.length / this.messages_per_page)
    },
    show_translations() {
      // let translations = Array.from(this.translations.values())
      let shown_messages = this.message_order
      if (this.show_only_incomplete) {
        shown_messages = shown_messages.filter((t) =>
          ['', null].includes(this.translation_o[t].messages[1])
        )
      }
      return shown_messages.slice(
        (this.page - 1) * this.messages_per_page,
        this.page * this.messages_per_page
      ) // translations.slice((this.page - 1) * this.messages_per_page, (this.page) * this.messages_per_page)
    },

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
        if (['fe', 'be'].includes(this.setup.component)) {
          const messages = Array.from(this.changed_messages).map((v) => {
              let dest_msg = this.translation_o[v].messages[1]
              if (dest_msg === "")
                dest_msg = null
              return [
                v,
                dest_msg,
              ]
            }
          )
          const {data} = await this.$api.language.update_messages(
            this.setup.component,
            this.setup.dest_lang,
            messages
          )
          this.ok_snackbar(data.msg)
          // console.log("refs", this.$refs)
          for (const m of messages) {
            this.$refs[m[0]][0].refresh_original()
          }
        } else if (this.setup.component === 'domain') {
          const messages = this.get_flat_messages()
          try {
            // todo after the 1. submission, the domain- obj is created, and needs to be patched!
            if (this.setup.config.new_o) {
              const {data} = await this.$api.domain.post_from_flat(
                this.setup.config.domain,
                this.setup.dest_lang,
                messages
              )
              this.ok_snackbar(data.msg)
              // todo: this.setup.config.new_o should be changed to false
            } else {
              const {data} = await this.$api.domain.patch_from_flat(
                this.setup.config.domain,
                this.setup.dest_lang,
                messages
              )
              this.ok_snackbar(data.msg)
            }
            // const changed_messages = Object.entries(this.changed_messages)
            // todo, words??!?!
            for (const m of this.changed_messages) {
              this.$refs[m][0].refresh_original()
            }
          } catch (e) {
            console.log(e)
            this.err_error_snackbar(e)
          }
        } else if (this.setup.component === 'entries') {
          const messages = this.get_flat_messages()
          try {
            if (this.setup.config.new_o) {
              const {data} = await this.$api.entry.post_from_flat(
                this.setup.config.entry,
                this.setup.dest_lang,
                messages
              )
              this.ok_snackbar(data.msg)
            } else {
              const {data} = await this.$api.entry.patch_from_flat(
                this.setup.config.entry,
                this.setup.dest_lang,
                messages
              )
              this.ok_snackbar(data.msg)
              const entry = data.data
              if (entry.status === PUBLISHED) {
                await this.$store.dispatch("templates/add_templates_codes", [entry])
              }
              //
            }
            for (const m of this.changed_messages) {
              this.$refs[m][0].refresh_original()
            }
          } catch (e) {
            console.error(e)
            this.err_error_snackbar(e)
          }
        } else {
          console.error('Unknown component', this.setup)
        }
      } catch (err) {
        this.err_error_snackbar(err)
        // console.log(err)
      }
    },
    back() {
      this.$router.push('/translate/setup')
    },
    get_flat_messages() {
      /**
       * just get the index and dest_msg for all messages (used for domain, entry)
       */
      return this.message_order.map(m => {
        const t = this.translation_o[m]
        return [t.index, t.messages[1]]
      })
    },
    translation_passes(messages) {
      // console.log(messages[0], messages[1])
      return messages[0] === '' || messages[1] !== ''
    },
    is_required(translation_block) {
      return false
    },
    get_required_words() {
      if (this.setup.component === DOMAIN) {
        return ['title', 'description']
      } else return []
    },
    update_msg(index, message) {
      this.translation_o[index].messages[1] = message
    },
  },
  watch: {
    page(current, prev) {
      setTimeout(() => {
        this.$vuetify.goTo('body', {
          offset: 0,
          duration: 1000,
          easing: 'easeInOutCubic',
        })
      }, 50)
    },
    required_messages: {
      deep: true,
      handler(val) {
        console.log(val)
      },
    },
    translation_o: {
      deep: true,
      handler(val) {
        console.log('ta', val)
      },
    },
  },
}
</script>

<style scoped>
</style>
