import {settings_loc_privacy_ask, settings_loc_privacy_exact, settings_loc_privacy_random} from "~/lib/settings"
import {LANGUAGE, MULTISELECT, SELECT, STR, TEMPLATE, USER} from "~/lib/consts"
import {pack_value, unpack} from "~/lib/aspect";
import LanguageMixin from "~/components/LanguageMixin";
import {object_list2options} from "~/lib/options";

let username_regex = new RegExp('^[a-z][a-z0-9_]*$');

export default {
  name: "TypicalAspectsMixin",
  mixins: [LanguageMixin],
  methods: {
    // aspect_label(base_name, alt_label) {
    //   return this.$t(this.t_label(base_name, alt_label))
    // },
    aspect_description(base_name, alt_descr) {
      return this.$t(this.t_description(base_name, alt_descr))
    },
    alt_label(base_name, alt_label) {
      return base_name + (alt_label ? "alt_label." + alt_label : "label")
    },
    alt_description(base_name, alt_descr) {
      return base_name + (alt_descr ? "alt_descr." + alt_descr : "descr")
    },
    asp_registered_name() {
      return {
        type: "str",
        name: "registered_name",
        t_label: "asp.username.label",
        attr: {
          max: 30,
          extra: {
            rules: [
              v => v && v.length >= 4 || this.$t("asp.username.rule_length"),
              v => username_regex.test(v) || this.$t("asp.username.rule_pattern")
            ]
          }
        },
        value: pack_value(""),
        error: true
      }
    },
    asp_user_query() {
      return {
        type: STR,
        t_label: "asp.user_query.label",
        // label: this.$t("asp.user_query.label"),
        name: "user_query",
        attr: {
          max: 90,
          extra: {
            rules: [
              v => v && ((v.length >= 4 && username_regex.test(v)) || (/.+@.+\..+/.test(v))) || this.$t("asp.user_query.rule")
            ]
          }
        },
        value: pack_value("")
      }
    },
    asp_public_name() {
      return {
        name: "public_name",
        t_label: "asp.public_name.label",
        type: "str",
        attr: {
          max: 30,
          extra: {
            rules: [
              v => v && v.length >= 2 && v.length <= 30 || this.$t("asp.public_name.rule_length"),
            ]
          }
        },
        value: pack_value(""),
        error: false
      }
    },
    asp_actor_description() {
      return {
        name: "description",
        t_label: "asp.user_description.label",
        t_description: "asp.user_description.descr",
        type: "str",
        attr: {
          max: 980,
        },
        error: false,
        value: pack_value("")
      }
    },
    asp_email(extra_rules = [], required = true) {
      return {
        type: "str",
        name: "email",
        t_label: "asp.email.label",
        attr: {
          max: 40,
          required,
          extra: {
            rules: this.$_.concat([
              v => /.+@.+\..+/.test(v) || this.$t("asp.email.rule")
            ], extra_rules)
          }
        },
        error: false,
        value: pack_value(""),
      }
    },
    asp_password(name = undefined, alt_label = undefined, attributes = {}) {
      const attr = Object.assign({
        max: 40,
        component_type: "password",
        extra: {
          rules: [
            v => v && (v.length >= 8) || this.$t("asp.password.rule_length")
          ]
        }
      }, attributes)
      return {
        type: "str",
        name: name ? name : "password",
        t_label: this.alt_label("asp.password.", alt_label),
        attr,
        value: pack_value(""),
        error: true
      }
    },
    asp_domain_select(name = "domain", t_label = "w.domain", multiselect = false, attr = {},
                      include_no_domain = false) {
      const all_domains_overview = this.$store.getters["domain/all_domains_overview"]
      (this.$store.getters["user/settings_ui_language"], include_no_domain)
      const domain_options = object_list2options(all_domains_overview, "title", "name", true)
      return {
        name,
        t_label,
        type: multiselect ? MULTISELECT : SELECT,
        attr,
        value: pack_value(multiselect ? [] : null),
        items: domain_options
      }
    },
    asp_password_confirm(password_aspect, alt_label = undefined) {
      return {
        type: "str",
        name: "password_confirm",
        t_label: this.alt_label("asp.password.", alt_label),
        attr: {
          max: 40,
          component_type: "password",
          extra: {
            rules: [
              v => v === unpack(password_aspect.value) || this.$t("asp.password.rule_repeat_match")
            ]
          }
        },
        value: pack_value(""),
        error: true
      }
    },
    asp_language(name = LANGUAGE, alt_label_descr = undefined, single_select = true, attr = {}) {
      return {
        name,
        t_label: this.alt_label("asp.language.", alt_label_descr),
        t_description: this.alt_description("asp.language.", alt_label_descr),
        type: single_select ? SELECT : MULTISELECT,
        attr: attr || {
          force_view: SELECT
        },
        value: pack_value(single_select ? null : []),
        items: this.get_language_options()
      }
    },
    asp_privacy(name = null, alt_label_descr = undefined) {
      return {
        name: name ? name : "privacy",
        t_label: this.alt_label("asp.privacy.", alt_label_descr),
        t_description: this.alt_description("asp.privacy.", alt_label_descr),
        attr: {
          only_value: true,
          // update_raw: true
        },
        type: SELECT,
        items: [{
          text: this.$t("asp.privacy.options.public.text"),
          description: this.aspect_description("asp.privacy.options.public.", alt_label_descr),
          value: "public",
          icon: "images/icons/privacy/earth.png"
        }, {
          text: this.$t("asp.privacy.options.private.text"),
          description: this.aspect_description("asp.privacy.options.private.", alt_label_descr),
          value: "private",
          icon: "images/icons/privacy/lock-outline.png"
        }],
        value: pack_value()
      }
      // todo privacy mode: something from the entry template rules en-foreces the privacy
      /*
            const privacy_set = this.template.rules.privacy
            return privacy_set ? VIEW : EDIT
       */
    },
    asp_license(name = null, include = [], exclude, alt_label_descr = undefined) {
      return {
        name: name ? name : "license",
        t_label: this.alt_label("asp.license.", alt_label_descr),
        t_description: this.alt_description("asp.license.", alt_label_descr),
        type: SELECT,
        attr: {
          descr_as_html: true,
          only_value: true,
          // update_raw: true
        },
        // todo problematic when more
        items: include[0],
        value: pack_value()
      }
      // for (let license_group of include) {
      //   const licence_entry = this.$store.getters["templates/code"](license_group)
      //   if (licence_entry) {
      //     aspect.items = licence_entry.values.list
      //   } else {
      //     console.log("cannot include license group", license_group)
      //   }
      // }
    },
    asp_location_privacy() {
      return {
        name: "location_privacy",
        t_label: "page.settings.asp.location_privacy.label",
        t_description: "page.settings.asp.location_privacy.description",
        type: SELECT,
        items: [
          {
            value: settings_loc_privacy_exact,
            text: this.$t("page.settings.asp.location_privacy.options.exact_location")
          },
          {
            value: settings_loc_privacy_random,
            text: this.$t("page.settings.asp.location_privacy.options.randomly_moved")
          },
          {value: settings_loc_privacy_ask, text: this.$t("page.settings.asp.location_privacy.options.always_ask")}
          // settings_loc_privacy_ask
        ],
        value: pack_value(),
      }
    },
    asp_entry_roles() {
      return {
        name: "actors",
        t_label: "asp.entry_roles.label",
        t_description: "asp.entry_roles.descr",
        type: "entry_roles"
      }
    },
    asp_set_editor_config() {
      return [
        this.asp_domain_select("domain",
          "page.actor.admin.asp_editor_for_domain",
          true,
          {
            force_view: "select",
            hide_on_disabled: true,
          }),
        this.asp_language("language", undefined, false, {
          hide_on_disabled: true,
        })]
    },
    asp_entry_type(name = TEMPLATE,  single_select = true, attr = {}, items = []) {
      return {
        name,
        t_label: "w.entrytype",
        //t_description: this.t_description("asp.language.", alt_label_descr),
        type: single_select ? SELECT : MULTISELECT,
        attr: attr || {
          force_view: SELECT
        },
        value: pack_value(single_select ? null : []),
        items
      }
    }
  }
}
