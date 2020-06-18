import {settings_loc_privacy_random} from "~/lib/settings"

let username_regex = new RegExp('^[a-z][a-z0-9_]*$');

export default {
  name: "TypicalAspectsMixin",
  methods: {
    label(base_name, alt_label) {
      return this.$t(this.t_label(base_name, alt_label))
    },
    description(base_name, alt_descr) {
      return this.$t(this.t_description(base_name, alt_descr))
    },
    t_label(base_name, alt_label) {
      return base_name + (alt_label ? "alt_label." + alt_label : "label")
    },
    t_description(base_name, alt_descr) {
      return base_name + (alt_descr ? "alt_descr." + alt_descr : "descr")
    },
    asp_registered_name() {
      return {
        type: "str",
        // todo make small
        name: "Username",
        t_label: "_global.asp_username.label",
        attr: {
          max: 30,
          unpacked: true,
          extra: {
            rules: [
              v => v && v.length >= 4 || this.$t("_global.asp_username.rule_length"),
              v => username_regex.test(v) || this.$t("_global.asp_username.rule_pattern")
            ]
          }
        },
        value: "",
        error: true
      }
    },
    asp_public_name() {
      return {
        name: "public_name",
        t_label: ".asp_public_name.label",
        type: "str",
        attr: {
          max: 30,
          unpacked: true,
          extra: {
            rules: [
              v => v && v.length >= 2 && v.length <= 30 || this.$t(".asp_public_name.rule_length"),
            ]
          }
        },
        value: "",
        error: false
      }
    },
    asp_actor_description() {
      return {
        name: "description",
        t_label: ".asp_user_description.label",
        t_description: ".asp_user_description.descr",
        type: "str",
        attr: {
          max: 980,
          unpacked: true
        },
        error: false,
        value: ""
      }
    },
    asp_email() {
      return {
        type: "str",
        name: "email",
        t_label: "_global.asp_email.label",
        attr: {
          max: 40,
          unpacked: true,
          extra: {
            rules: [
              v => /.+@.+\..+/.test(v) || this.$t("_global.asp_email.rule.valid")
            ]
          }
        },
        error: false,
        value: ""
      }
    },
    asp_password(name = undefined, alt_label = undefined) {
      return {
        type: "str",
        name: name ? name : "password",
        t_label: this.t_label("_global.asp_password.", alt_label),
        attr: {
          max: 40,
          unpacked: true,
          component_type: "password",
          extra: {
            rules: [
              v => v && (v.length >= 8) || this.$t("_global.asp_password.rule_length")
            ]
          }
        },
        value: "",
        error: true
      }
    },
    asp_password_confirm(password_aspect, alt_label = undefined) {
      return {
        type: "str",
        name: "repeat password",
        t_label: this.t_label("_global.asp_password.", alt_label),
        attr: {
          max: 40,
          unpacked: true,
          component_type: "password",
          extra: {
            rules: [
              v => v === password_aspect.value || this.$t("_global.asp_password_repeat.rule_match")
            ]
          }
        },
        value: "",
        error: true
      }
    },
    asp_privacy_aspect(name = null, alt_label_descr = undefined) {
      return {
        name: name ? name : "privacy",
        t_label: this.t_label("_global.asp_privacy.", alt_label_descr),
        t_description: this.t_description("_global.asp_privacy.", alt_label_descr),
        type: "select",
        attr: {
          unpacked: true
        },
        items: [{
          text: this.$t("_global.asp_privacy.item_public.text"),
          description: this.$t("_global.asp_privacy.item_public.descr"),
          value: "public",
          icon: "privacy/earth.png"
        }, {
          text: this.$t("_global.asp_privacy.item_private.text"),
          description: this.$t("_global.asp_privacy.item_private.descr"),
          value: "private",
          icon: "privacy/lock-outline.png"
        }]
      }
      // todo privacy mode: something from the entry template rules en-foreces the privacy
      /*
            const privacy_set = this.template.rules.privacy
            return privacy_set ? VIEW : EDIT
       */
    },
    asp_license_aspect(name = null, include = [], exclude, alt_label_descr = undefined) {
      const aspect = {
        name: name ? name : "license",
        t_label: this.t_label("_global.asp_license.", alt_label_descr),
        t_description: this.t_description("_global.asp_license.", alt_label_descr),
        type: "select",
        attr: {
          unpacked: true,
        },
        items: []
      }
      for (let license_group of include) {
        if (this.$store.state.codes.hasOwnProperty(license_group)) {
          // `.values.licences` should be documentented somewhere or be more flexible
          const licence_entry = this.$store.state.codes[license_group]
          const select_transform_keys = this.$_.get(licence_entry, "rules.edit.select_transform_keys", null)
          if (select_transform_keys) {
            aspect.items = this.$_.map(licence_entry.values.licenses, (l) => {
                const transformed = {}
                this.$_.forEach(select_transform_keys, (k, v) => {
                  transformed[v] = l[k]
                })
                return Object.assign(transformed, l)
              }
            )
          } else {
            aspect.items = licence_entry.values.licenses
          }
        } else {
          console.log("cannot include license group", license_group)
        }
      }
      return aspect
    },
    asp_location_privacy() {
      return {
        name: "location_privacy",
        t_label: "_global.asp_location_privacy.label",
        t_description: "_global.asp_location_privacy.descr",
        type: "select",
        attr: {
          unpacked: true
        },
        items: [
          "exact location",
          settings_loc_privacy_random,
          // settings_loc_privacy_ask
        ],
        value: null,
      }
    }
  }
}
