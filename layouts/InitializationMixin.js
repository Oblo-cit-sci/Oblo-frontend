import {mapGetters} from "vuex"
import FixDomainMixin from "~/components/global/FixDomainMixin"
import {PAGE_INDEX} from "~/lib/pages"
import {default_settings} from "~/lib/settings"
import {db_vars} from "~/lib/db_vars"
import SettingsChangeMixin from "~/components/global/SettingsChangeMixin"
import {DOMAIN_LANGUAGE, NO_DOMAIN, QP_lang, UI_LANGUAGE, VISITOR} from "~/lib/consts"
import HomePathMixin from "~/components/menu/HomePathMixin"
import EnvMixin from "~/components/global/EnvMixin"
import URLQueryMixin from "~/components/util/URLQueryMixin";
import LanguageMixin from "~/components/LanguageMixin";
import EntryFetchMixin from "~/components/entry/EntryFetchMixin";
import OfflineMixin from "~/lib/OfflineMixin"
import SlugEntryFetcher from "~/components/templates/SlugEntryFetcher";

export default {
  name: "InitializationMixin",
  mixins: [FixDomainMixin, SettingsChangeMixin, HomePathMixin, EnvMixin, URLQueryMixin, LanguageMixin,
    EntryFetchMixin, OfflineMixin, SlugEntryFetcher],
  created() {
    // console.log("db loaded??", this.db_loaded)
    default_settings.ui_language = this.default_language
    default_settings.domain_language = this.default_language
    if (!this.db_loaded)
      this.reload_storage()
    if (!this.$api.is_initialized()) {
      this.$api.init(this.$axios)
      if (this.is_prod) {
        this.privacy_sheet_open = true
      }
      // console.log(this.$api.axios.)
    }
  },
  computed: {
    ...mapGetters({
      db_loaded: "app/db_loaded",
      connected: "app/connected",
      initialized: "app/initialized"
    }),
  },
  methods: {
    reload_storage() {
      if (this.$localforage) {
        const remaining = db_vars.map(v => v.name)
        for (let store_var_descr of db_vars) {
          // console.log("loading", store_var_descr.name)
          this.$localforage.getItem(store_var_descr.name).then(store_var => {
            // console.log("db items: ", store_var_descr.name, store_var)
            if (store_var) {
              // console.log(store_var.constructor)
              this.$store.commit(store_var_descr.store_mutation, store_var)
              if (store_var_descr.name === "edit_entry") {
                this.add_edit()
              }
            }
            remaining.splice(remaining.indexOf(store_var_descr.name), 1);
            if (remaining.length === 0) {
              this.$store.commit("app/db_loaded")
            }
          }).catch(err => {
            console.log("localForage error", err)
          })
        }
        console.log("storage reloaded")
      }
    },
    add_edit() {
      // check if the edit entry is in entries and add it if not
      const edit = this.$store.getters["entries/get_edit"]()
      if (edit) {
        if (this.$_.some(this.$store.getters["entries/all_uuids"]() === edit.uuid)) {
          return
        }
        // console.log("putting back edit...")
        this.$store.commit("entries/save_entry", edit)
      }
    },
    async initialize() {
      console.log("initialize")
      // console.log("init.. url", this.$route.query.standalone || false)
      this.$store.commit("app/standalone", this.$route.query.standalone || false)
      // todo maybe this should be before init_data, to request the set language
      /*
        Authentication
       */
      try {
        const {data: resp} = await this.$api.actor.validate_session()
        console.log("validation done")
        if (resp.session_valid) {
          this.$store.dispatch("user/login", resp.data)
        } else {
          this.$store.dispatch("user/logout")
        }
        // this.process_login(me.data)
      } catch (e) {
        console.error(e)
        console.log("not logged in")
      }
      /*
       * get the language from the url-query-param or settings or platform defaults
       */
      const user_settings = this.$store.getters["user/settings"]
      const qp_lang = this.$route.query[QP_lang]
      const i_language = qp_lang || user_settings.ui_language || this.default_language

      const domain_name = this.query_param_domain_name || user_settings.fixed_domain || NO_DOMAIN
      const query_domains = [NO_DOMAIN].concat((domain_name !== NO_DOMAIN ? [domain_name] : []))
      console.log(`init with domain: ${query_domains}, lang: ${i_language}`)

      // this.$store.commit("domains/add_overview_language",i_language)
      // this.$api.domain.overviews(i_language).then(({data}) => {
      //   this.$store.commit("domain/add_domains_data", data.data)
      // })
      try {
        await this.get_domain_overviews(i_language)
      } catch (e) {
        console.error("init getting domain overviews failed", e)
      }

      let has_domain_data = true
      const init_domain_data = await Promise.all([
        this.$api.basic.init_data(i_language),
        this.$api.basic.domain_basics(query_domains, i_language).catch(e => {
          has_domain_data = false
        })])

      const init_data = init_domain_data[0].data


      const only_one_domain = init_data.platform.only_one_domain
      this.$store.commit("set_available_languages", init_data.languages)
      this.$store.commit("app/platform_data", init_data.platform)
      this.$store.commit("app/oauth_services", init_data.oauth_services)
      // not sure if its always: i_language...
      if (init_data.user_guide_url) {
        this.$store.commit("translate/add_user_guide_link", {language_code: i_language, url: init_data.user_guide_url})
        this.$store.commit("app/set_menu_to", {name: "user_guide", to: init_data.user_guide_url})
      }
      this.$store.commit("map/default_map_style", init_data.map_default_map_style)
      this.$store.commit("map/access_token", init_data.map_access_token)

      // login required...
      if (has_domain_data) {
        // console.log("HAS DOMAIN DATA!...")
        const domain_data = init_domain_data[1].data
        // check if the domain is delivered in the given language:
        const result_domain_language = Object.keys(this.$_.find(domain_data.data.domains, d => d.name === domain_name).langs)[0]

        // todo here call complete_language_domains if on domain-page and domain-lang different than ui-lang
        console.log("connected")

        const domains_data = domain_data.data.domains
        const language = domain_data.data.language

        await this.$store.commit("domain/add_domains_data", domains_data)

        await this.$store.dispatch("templates/add_templates_codes", domain_data.data.templates_and_codes)
        // debugger
        await this.change_language(i_language, true, result_domain_language)

        if (this.$store.getters.username === VISITOR) {
          const settings = this.$_.cloneDeep(default_settings)
          Object.assign(settings, {[DOMAIN_LANGUAGE]: language, [UI_LANGUAGE]: language})
          // todo change_language call
          this.$store.commit("user/change_setting", settings)
        }
        // console.log("?", language, language !== this.$i18n.fallbackLocale, this.$i18n.fallbackLocale)
        if (language !== this.$i18n.fallbackLocale) {
          console.log("init language != fallback language changing language to", language)
          this.$i18n.setLocaleMessage(language, domain_data.data.messages[language])
          // await this.change_language(language, false)
        } else {
          await this.guarantee_default_lang_language_names()
        }

        // guarantee entry & template
        if (this.query_entry_uuid) {
          console.log("ENTRY!!?")
          if(this.query_entry_access_key) {
            await this.guarantee_entry(this.query_entry_uuid, this.query_entry_access_key)
          } else {
            await this.guarantee_entry(this.query_entry_uuid)
          }
          // console.log("query_entry_uuid", this.query_entry_uuid)
          const entry = this.$store.getters["entries/get_entry"](this.query_entry_uuid)
          await this.guarantee_template_code_with_references(entry.template.slug, entry.language)
        }

        // const only_one_domain = resp.data.only_one_domain
        // console.log("multi domains?", only_one_domain, this.has_multiple_domains)

        if (only_one_domain) {
          console.log("only one domain, completing domain-lang", language)
          const domain_name = this.get_one_domain_name
          await this.prepare_goto_domain(domain_name, language)
          // // todo, maybe this should be replaces by something in the store
          if (this.$route.name === PAGE_INDEX) {
            // console.log("to domain page",this.get_one_domain_name)
            this.to_domain(domain_name, true, () => {
              this.set_init_done()
            })
          } else {
            // todo not sure why this is here- just one domain anyway
            const domain_name = this.$store.getters["user/settings"].fixed_domain || NO_DOMAIN
            this.$store.commit("domain/set_act_domain", domain_name)
            this.set_init_done()
          }
        } else {
          const fixed_domain = this.$store.getters["user/settings"].fixed_domain || NO_DOMAIN
          // if (fixed_domain) {
          //   domain_name = fixed_domain
          // }
          // console.log(`user fixed-domain: ${fixed_domain}`)

          await this.$store.dispatch("domain/set_act_domain_lang", {
            domain_name: domain_name,
            language
          })
          if (this.$route.name === PAGE_INDEX) {
            // console.log("to domain page",this.get_one_domain_name)
            if (fixed_domain !== NO_DOMAIN) {
              this.to_domain(fixed_domain, true, () => {
                this.set_init_done()
              })
            } else {
              this.set_init_done()
            }
          } else {
            this.set_init_done()
          }
        }
      } else {
        this.set_init_done()
      }

      await this.$store.dispatch("app/connected")

      // console.log("done")
      return Promise.resolve()
    },
    set_init_done() {
      console.log("set init done")
      this.$store.commit("app/initialized")
    },
  },
  watch: {
    async db_loaded(loaded) {
      console.log("db loaded", loaded)
      if (loaded) {
        if (this.is_standalone) {
          await this.load_offline_data()
        }

        if (this.is_offline) {
          console.log("offline")
          setTimeout(() => {
            this.$store.commit("app/initialized")
            this.set_home_to_offline()
            // this.$bus.$emit("main-menu-set", {name: "index", to: "/offline"})
          }, 80)
          await this.$router.push("/offline")
        } else {
          this.initialize().then(async () => {
            console.log("all done")
            // todo why??
            if (this.is_standalone) {
              console.log("gonna store all relevant data for offline mode")
              await this.persist_for_offline_mode()
            }
            // const token = this.$store.getters["user/get_auth_token"]
            // const evtSource = new EventSource(this.$api.api_baseURL + `/sse/stream?token=${token.access_token}`);
            // evtSource.onmessage = function (event) {
            //   console.log(event.data)
            // }
          }, err => {
            console.log("initialization failed", err)
          })
        }
      }
    }
  }
}
