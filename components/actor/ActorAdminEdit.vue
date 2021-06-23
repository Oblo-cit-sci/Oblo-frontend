<template lang="pug">
  div
    h2 Edit User
    v-form
      <!--      AspectSet(:aspects="aspects_o" mode="edit" :values="values" @has_error="has_error=$event")-->
      <!--      div {{has_errors}} jkjk-->
      Aspect(v-for="a of aspects"
        :key="a.name"
        :aspect="a"
        :ext_value.sync="a.value",
        mode="edit"
        :conditionals="values"
        @update:error="a.error = $event")
      v-btn(@click="update()") {{$t("w.update")}}
</template>

<script>

import {ADMIN, EDITOR, GLOBAL_ROLE, MULTISELECT, SELECT, USER} from "~/lib/consts"
import Aspect from "~/components/Aspect"
import {object_list2options} from "~/lib/options"
import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin"
import {aspect_raw_default_value, extract_n_unpack_values, pack_value, unpack} from "~/lib/aspect"
import AspectSet from "~/components/AspectSet"
import TypicalAspectMixin from "~/components/aspect_utils/TypicalAspectMixin";

export default {
  name: "ActorAdminEdit",
  components: {AspectSet, Aspect},
  mixins: [TriggerSnackbarMixin, TypicalAspectMixin],
  comments: {},
  props: {
    actor: Object
  },
  data() {
    return {
      aspects: [{
        type: SELECT,
        t_label: "page.actor.admin.asp_global_role",
        name: "global_role",
        attr: {
          force_view: "select",
          extra: {
            rules: [
              // v => v && v.length >= 4 || 'Username must have at 4 characters',
            ]
          }
        },
        value: pack_value(),
        items: [
          {text: this.$t("comp.global_role.user"), value: USER},
          {text: this.$t("comp.global_role.editor"), value: EDITOR},
          {text: this.$t("comp.global_role.admin"), value: ADMIN}
        ],
        error: true
      },
        this.asp_domain_select("domain",
          "page.actor.admin.asp_editor_for_domain",
          true,
          {
            force_view: "select",
            hide_on_disabled: true,
            condition: {
              aspect: "# global_role",
              value: "editor"
            }
          }),
        this.asp_language("language", undefined, false, {
          hide_on_disabled: true,
          condition: {
            aspect: "# global_role",
            value: "editor"
          }
        })],
      has_errors: null
    }
  },
  created() {
    const user_data = this.$_.cloneDeep(this.actor)
    for (let aspect_name of Object.keys(this.aspect_map)) {
      const editor_config = unpack(user_data.editor_config)
      this.aspect_map[aspect_name].value = pack_value(editor_config[aspect_name])
    }
  },
  computed: {
    values() {
      return extract_n_unpack_values(this.aspects)
    },
    aspect_map() {
      return this.$_.keyBy(this.aspects, "name")
    },
  },
  methods: {
    domains() {
      const l = this.$store.getters["user/settings_value"]("ui_language")
      const domains = this.$store.getters["domain/all_domains_overview"](l)
      return object_list2options(domains, "title", "name", true)
    },
    update() {
      this.$api.actor.post_global_role(
        this.actor.registered_name.value, this.values).then(({data}) => {
        this.ok_snackbar(data.msg)
        this.$emit("role_changed", unpack(this.values.global_role))
      }, err => {
        this.err_error_snackbar(err)
        console.log(err)
      })
    },
    raw_aspect_default_value(aspect) {
      return aspect_raw_default_value(aspect)
    },
  }
}
</script>

<style scoped>

</style>
