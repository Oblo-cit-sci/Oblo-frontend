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
        @update:ext_value="update_value(a, $event)"
        mode="edit"
        @update:error="a.error = $event")
      v-btn(@click="update()") {{$t("w.update")}}
</template>

<script>

import {EDITOR, GLOBAL_ROLE, SELECT} from "~/lib/consts"
import Aspect from "~/components/Aspect"
import {DOMAINS} from "~/store"
import {object_list2options} from "~/lib/options"
import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin"
import {USER_GLOBAL_ROLE} from "~/store/user"
import {extract_unpacked_values, pack_value} from "~/lib/aspect"
import AspectSet from "~/components/AspectSet"

export default {
  name: "ActorAdminEdit",
  components: {AspectSet, Aspect},
  mixins: [TriggerSnackbarMixin],
  comments: {},
  props: {
    actor: Object
  },
  data() {
    return {
      aspects:
        {
          global_role: {
            type: SELECT,
            t_label: "page.actor.admin.asp_global_role",
            name: "global_role",
            attr: {
              unpacked: true,
              force_view: "select",
              extra: {
                rules: [
                  // v => v && v.length >= 4 || 'Username must have at 4 characters',
                ]
              }
            },
            value: "",
            items: [
              {text: this.$t("comp.global_role.user"), value: "user"},
              {text: this.$t("comp.global_role.editor"), value: "editor"},
              {text: this.$t("comp.global_role.admin"), value: "admin"}
            ],
            error: true
          },
          editor_for: {
            name: "editor_for",
            t_label: "page.actor.admin.asp_editor_for_domain",
            type: SELECT,
            attr: {
              force_view: "select",
              hide_on_disabled: true,
              condition: {
                aspect: "# global_role",
                value: "editor"
              }
            },
            items: this.domains(),
            value: pack_value()
          }
        },
      has_errors: null
    }
  },
  created() {
    const user_data = this.$_.cloneDeep(this.actor)
    this.aspects.global_role.value = user_data.global_role
    // todo disabledness should come through AspectSet, which can manage conditions
    if (user_data.global_role === EDITOR) {
      this.aspects.editor_for.attr.disable = false
      this.aspects.editor_for.value.value = user_data.editor_domain
    }
  },
  computed: {
    aspects_o() {
      return Object.values(this.aspects)
    },
    values() {
      return extract_unpacked_values(this.aspects)
    }
  },
  methods: {
    domains() {
      return object_list2options(this.$store.getters["domains_for_lange"](this.$store.getters["user/settings_value"]("ui_language")), "title", "name", true)
    },
    update_value(aspect, val) {
      if (aspect.name === GLOBAL_ROLE) {
        this.aspects.editor_for.attr.disable = val !== "editor"
        this.aspects.editor_for.value = pack_value()
      }
    },
    update() {
      console.log(this.aspects.editor_for.value)
      this.$api.actor.post_global_role(
        this.actor.registered_name,
        this.aspects.global_role.value,
        this.aspects.editor_for.value.value).then(({data}) => {
        this.ok_snackbar(data.data)
        this.$emit("role_changed", this.aspects.global_role.value)
      }, err => {
        console.log(err)
      })
    }
  }
}
</script>

<style scoped>

</style>
