let username_regex = new RegExp('^[a-z][a-z0-9_]*$');

export default {
  name: "TypicalAspectsMixin",
  methods: {
    label(base_name, alt_label) {
      return this.$t(base_name + "alt_label." + alt_label ? alt_label : "label")
    },
    registered_name() {
      return {
        type: "str",
        // todo make small
        name: "Username",
        label: this.$t("_global.asp_username.label"),
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
    email() {
      return {
        type: "str",
        name: "email",
        label: this.$t("_global.asp_email.label"),
        attr: {
          max: 40,
          unpacked: true,
          extra: {
            rules: [
              v => /.+@.+\..+/.test(v) || this.$t("_global.asp_email.rule.valid")
            ]
          }
        },
        value: "",
        error: true
      }
    },
    password(alt_label = undefined) {
      return {
        type: "str",
        name: "password",
        label: this.label("_global.asp_password.", alt_label),
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
    password_confirm(password_aspect, alt_label = undefined) {
      return {
        type: "str",
        name: "repeat password",
        label: this.label("_global.asp_password_repeat.", alt_label),
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
    license_aspect(include = [], exclude, alt_label = undefined) {
      const aspect = {
        name: "license",
        label: this.label("_global.asp_license", alt_label),
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
          const select_transform_keys = ld.get(licence_entry, "rules.edit.select_transform_keys", null)
          if (select_transform_keys) {
            aspect.items = ld.map(licence_entry.values.licenses, (l) => {
                const transformed = {}
                ld.forEach(select_transform_keys, (k, v) => {
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
    }
  }
}
