<template lang="pug">
  div
    h2 Edit User
    v-form
      Aspect(v-for="a of aspects"
        :key="a.name"
        :aspect="a"
        :ext_value.sync="a.value",
        @update:ext_value="update_value(a, $event)"
        mode="edit"
        @update:error="a.error = $event")
</template>

<script>

  import {SELECT} from "~/lib/consts"
  import Aspect from "~/components/Aspect"
  import {DOMAINS} from "~/store"
  import {object_list2options} from "~/lib/options"

  export default {
    name: "ActorAdminEdit",
    components: {Aspect},
    mixins: [],
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
              label: "Global role",
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
                {text: "User", value: "user"},
                {text: "Editor", value: "editor"},
                {text: "Admin", value: "admin"}
              ],
              error: true
            },
            editor_for: {
              name: "editor_for",
              label: "Editor for domain",
              type: SELECT,
              attr: {
                force_view: "select",
                disable: true,
                hide_on_disabled: true
              },
              items: this.domains()
            }
          }
      }
    },
    created() {
      const user_data = this.$_.cloneDeep(this.actor)
      this.aspects.global_role.value = user_data.global_role
    },
    methods: {
      domains() {
        return object_list2options(this.$store.getters[DOMAINS], "title", "name", true)
      },
      update_value(aspect, val) {
        if (aspect.name === "global_role") {
          this.aspects.editor_for.attr.disable = val !== "editor"
        }
      }
    },
    watch: {}
  }
</script>

<style scoped>

</style>
