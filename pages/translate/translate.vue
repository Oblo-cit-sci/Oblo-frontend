<template lang="pug">
  div
    v-btn(@click="back")
      v-icon(left) mdi-arrow-left
      span {{$t("page.translate.back")}}
    AspectSet(:aspects="setup_aspects" :values="setup_values" mode="view" compact)
    //v-container.pt-1.pb-0(justify-center align-center)
    //  v-row.pl-1()
    //    v-col.py-0(offset=4 cols=6)
    v-row.pb-2
      v-col.py-0(cols=3)
        v-checkbox(v-model="show_only_incomplete" :label="$t('page.translate.only_undone')" hide-details)
      v-col.pb-0.pt-4(cols=4 xs="12")
        v-text-field.search_field(
          v-model="search_query"
          :label="$t('comp.search.txt_field_label')"
          solo
          hide-details
          append-icon="mdi-magnify"
          @click:append="search"
          clearable)
      v-col.pb-0
        v-btn-toggle(mandatory group v-model="search_in_langs" multiple color="blue")
          v-btn(tile :disabled="disable_search_lang_selector" :value="setup_values.src_lang.value") {{setup_values.src_lang.text}}
          v-btn(tile :disabled="disable_search_lang_selector" :value="setup_values.dest_lang.value") {{setup_values.dest_lang.text}}
      v-col.pb-0(align-self="center")
        div {{$tc('page.translate.messages', filtered_messages.length)}}
    MessageTranslationBlock(v-for="t in show_translations"
      v-bind="translation_o[t]"
      @update="update_msg(t, $event)"
      :mark_required="is_required(t)"
      :ref="t"
      @has_changed="has_changed($event)"
      :key="t")
    v-row(justify="center")
      v-col.col-2
        v-btn(v-if="page !== 0" :disabled="disable_submit" @click="submit" color="success" large) {{$t("w.submit")}}
    v-sheet(min-height="30px") {{can_change_page_text}}
    SimplePaginate(:total_pages="total_pages" v-model="page" :allow="no_changes")
</template>

<script>
import {mapGetters} from 'vuex'
import MessageTranslationBlock from '~/components/language/MessageTranslationBlock'
import SimplePaginate from '~/components/SimplePaginate'
import TriggerSnackbarMixin from '~/components/TriggerSnackbarMixin'
import {BACKEND_COMPONENT, DEST_LANG, DOMAIN, ENTRIES, FRONTEND_COMPONENT, PUBLISHED, SRC_LANG} from '~/lib/consts'
import AspectSet from "~/components/AspectSet";
import OptionsMixin from "~/components/aspect_utils/OptionsMixin";
import TranslationSetupMixin from "~/components/language/TranslationSetupMixin";
import {ENTRY} from "~/components/global/HasMainNavComponentMixin";


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
      search_query: "",
      search_results: null,
      search_in_langs: []
    }
  },
  created() {
    if (!this.setup.dest_lang) {
      this.$router.push('/translate/setup')
    }
    this.search_in_langs = [this.src_lang.value, this.dest_lang.value]
  },
  computed: {
    setup_aspects() {
      return [
        this.dest_language_select_aspect([this.setup_values[DEST_LANG]]), this.component_select_aspect(),
        this.domain_select_aspect(), this.entry_select_aspect([this.setup_values[ENTRY]]),
        this.src_language_select_aspect([this.setup_values[SRC_LANG]])
      ]
    },
    src_lang() {
      return this.setup_values.src_lang
    },
    dest_lang() {
      return this.setup_values.dest_lang
    },
    disable_search_lang_selector() {
      return !this.search_query
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
    filtered_messages() {
      let messages = this.message_order
      if (this.show_only_incomplete) {
        messages = messages.filter((t) =>
          (this.translation_o[t].messages[0] !== '' && ['', null].includes(this.translation_o[t].messages[1]))
        )
      }
      if (this.search_results !== null) {
        messages = messages.filter(m => this.search_results.includes(m))
      }
      return messages
    },
    total_pages() {
      // console.log("total", this.setups.length, this.setups.length / this.messages_per_page, Math.ceil(this.setups.length / this.messages_per_page))
      return Math.ceil(this.filtered_messages.length / this.messages_per_page)
    },
    show_translations() {
      return this.filtered_messages.slice(
        (this.page - 1) * this.messages_per_page,
        this.page * this.messages_per_page
      ) // translations.slice((this.page - 1) * this.messages_per_page, (this.page) * this.messages_per_page)
    },
  },
  methods: {
    search() {
      if ((this.search_query?.length || 0) === 0) {
        return
      }
      this.search_results = []
      const query = this.search_query.toLowerCase()
      for (let msg of this.setup.messages) {
        if (msg[1] && this.search_in_langs.includes(this.src_lang.value)) {
          if (msg[1].toLowerCase().search(query) !== -1) {
            this.search_results.push(msg[0])
            continue
          }
        }
        if (msg[2] && this.search_in_langs.includes(this.dest_lang.value)) {
          if (msg[2].toLowerCase().search(query) !== -1) {
            this.search_results.push(msg[0])
          }
        }
      }
    },
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
        if ([FRONTEND_COMPONENT, BACKEND_COMPONENT].includes(this.setup.component)) {
          await this.submit_message_component()
        } else if (this.setup.component === DOMAIN) {
          await this.submit_domain()
        } else if (this.setup.component === ENTRIES) {
          await this.submit_entry()
        } else {
          console.error('Unknown component', this.setup)
        }
      } catch (err) {
        this.err_error_snackbar(err)
        // console.log(err)
      }
    },
    async submit_message_component() {
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
    },
    async submit_domain() {
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
          // data.data contains the domain-data if is published
          if(data.data) {
            this.$store.commit("domain/add_domains_data", [data.data])
          }
          // todo: this.setup.config.new_o should be changed to false
        } else {
          const {data} = await this.$api.domain.patch_from_flat(
            this.setup.config.domain,
            this.setup.dest_lang,
            messages
          )
          if (data.data) {
            // console.log(data.data)
            this.$store.commit("domain/add_domains_data", [data.data])
          }
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
    },
    async submit_entry() {
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
    // get_required_words() {
    //   if (this.setup.component === DOMAIN) {
    //     return ['title', 'description']
    //   } else return []
    // },
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
    search_query(query) {
      if ((query?.length || 0) < 4) {
        this.search_results = null
        return
      }
      this.search(query)
    },
    search_in_langs() {
      this.search(this.search_query)
    }
  }
}
</script>

<style scoped>

/*.active_class {*/
/*  background-color: khaki;*/
/*}*/
</style>
