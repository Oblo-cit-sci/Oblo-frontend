<template lang="pug">
  div
    h2 {{$t("page.actor.admin.edit_user")}}
    v-form
      Aspect(v-for="a of aspects"
        :key="a.name"
        :aspect="a"
        :ext_value.sync="a.value",
        mode="edit"
        :conditionals="packed_values"
        @update:error="a.error = $event")
      v-btn(@click="update()") {{$t("w.update")}}
</template>

<script>

import {ADMIN, EDITOR, SELECT, USER, VALUE} from "~/lib/consts"
import Aspect from "~/components/Aspect"
import {object_list2options} from "~/lib/options"
import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin"
import {aspect_raw_default_value, pack_propper_value, pack_value, unpack} from "~/lib/aspect"
import AspectSet from "~/components/AspectSet"
import TypicalAspectMixin from "~/components/aspect_utils/TypicalAspectMixin";
import {recursive_unpack} from "~/lib/util";

export default {
  name: "ActorAdminEdit",
  components: {AspectSet, Aspect},
  mixins: [TriggerSnackbarMixin, TypicalAspectMixin],
  comments: {},
  props: {
    actor: Object
  },
  data() {
    const editor_config_aspects = this.asp_set_editor_config()
    editor_config_aspects.forEach(a => {
      a.attr.condition = {
        aspect: "$.global_role",
        value: "editor"
      }
    })
    console.log(this.actor, this.actor.global_role)
    return {
      // todo use typicalAspectMixin.asp_set_editor_config
      aspects: [{
        type: SELECT,
        t_label: "page.actor.admin.asp_global_role",
        name: "global_role",
        attr: {
          force_view: "select",
          extra: {
            rules: []
          }
        },
        // need this, otherwise condition doesnt trigger on change
        value: pack_value(),
        items: [
          {text: this.$t("comp.global_role.user"), value: USER},
          {text: this.$t("comp.global_role.editor"), value: EDITOR},
          {text: this.$t("comp.global_role.admin"), value: ADMIN}
        ],
        error: true
      }].concat(editor_config_aspects),
      has_errors: null
    }
  },
  created() {
    const user_data = this.$_.cloneDeep(this.actor)
    user_data.editor_config.value.global_role = unpack(user_data.global_role)
    const editor_config = unpack(user_data.editor_config)
    for (let aspect_name of Object.keys(this.aspect_map)) {
      this.aspect_map[aspect_name].value = pack_propper_value(editor_config[aspect_name])
    }
  },
  computed: {
    packed_values() {
      return this.$_.mapValues(this.aspect_map, VALUE)
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
      const unpacked_values = recursive_unpack(this.aspect_map, true)
      this.$api.actor.post_global_role(
        this.actor.registered_name.value, unpacked_values).then(({data}) => {
        this.ok_snackbar(data.msg)
        this.$emit("role_changed", unpack(unpacked_values.global_role))
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
