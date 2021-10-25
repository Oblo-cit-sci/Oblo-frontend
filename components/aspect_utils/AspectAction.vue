<template lang="pug">
  div
    v-btn(v-if="has_button_trigger" :disabled="btn_disabled" @click="trigger_action" :loading="button_trigger_loading") {{trigger.button_label}}
</template>

<script>

import {EDIT} from "~/lib/consts"

import axios from "axios"
import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin"
import {
  aspect_default_value,
  aspect_loc_str2arr,
  aspect_raw_default_value,
  is_packed,
  pack_value,
  unpack
} from "~/lib/aspect"
import {transform_options_list} from "~/lib/options"
import TemplateAccessMixin from "~/components/templates/TemplateAccessMixin"

/**
 * attr: {
 *   action: {
 *     type: "api-query" | "emit"
 *     name?: str
 *     trigger: {
 *       type: "button" | "auto"
 *       requires_callback?: bool
 *       button_label?: str
 *       button_always_enabled?: bool
 *       only_on_change?: bool
 *     }
 *   }
 * }
 */
// todo maybe trigger.requires_callback can go since its basically always the case for api-query...
export default {
  name: "AspectAction",
  mixins: [TriggerSnackbarMixin, TemplateAccessMixin],
  components: {},
  props: {
    aspect: Object,
    extra: Object,
    mvalue: Object,
    has_changed: Boolean
  },
  data() {
    return {
      button_trigger_loading: false
    }
  },
  created() {
    if (this.has_button_trigger && this.trigger.requires_callback) {
      this.$bus.$on(["aspect-action-done"], () => {
        this.button_trigger_loading = false
      })
    }
  },
  computed: {
    value() {
      return unpack(this.mvalue)
    },
    action() {
      return this.aspect.attr.action
    },
    trigger() {
      return this.action.trigger
    },
    properties() {
      return this.action.properties
    },
    has_button_trigger() {
      return this.trigger.type === "button"
    },
    btn_disabled() {
      return (!this.has_value && !this.trigger.button_always_enabled) || (this.trigger.only_on_change && !this.has_changed)
    },
    has_auto_trigger() {
      return this.trigger.type === "auto"
    },
    has_value() {
      return this.value
    }
  },
  methods: {
    trigger_action() {
      // console.log("trigger action")

      if (this.has_button_trigger && this.trigger.requires_callback) {
        this.button_trigger_loading = true
      }
      switch (this.action.type) {
        case "api-query":
          this.perform_api_query()
          break
        case "emit":
          this.$emit("aspectAction", {action: "defined_action", name:this.action.name})
          // this.$bus.$on("aspect-action-done", () => {
          //   console.log("ll")
          //   this.button_trigger_loading = false
          // })
          break
        default:
          console.log(`unknown action type: ${this.action.type}`)
          this.button_trigger_loading = false
      }
    },
    reset_action() {
      this.handle_reset()
    },
    perform_api_query() {
      let url = this.properties.query_url
      if (this.properties.value_emit === "url_attach") {
        url += this.mvalue.value
      }
      if (url.startsWith("/api")) {
        url = this.$axios.defaults.baseURL + url
        // console.log("api server")
      }
      const method = this.properties.method || "get"
      const request = {
        method: method,
        url: url,
      }

      if (this.properties.value_emit === "content") {
        request.data = this.mvalue.value
      }

      axios(request).then(({data}) => {
        // console.log("received", data)
        const processed_data = this.process_result(data)
        // console.log("processed to", processed_data)
        const transformed_data = this.transform_data(processed_data)
        // console.log("transformed to", transformed_data)
        this.handle_result(transformed_data)
      }).catch(err => {
        console.log(err)
        this.handle_error(err)
      }).finally(() => {
        this.done()
      })
    },
    process_result(data) {
      // TODO...
      const process = this.action.properties.process_result
      if (!process) {
        return data
      }
      for (let process of this.action.properties.process_result) {
        const {name, value} = process
        if (name === "list_filter_index") {
          // console.log(data)
          debugger
        }
      }
      return data
      // const result = []
      // for (let i of process) {
      //   const k = Object.keys(i)[0]
      //   const v = i[k]
      //   let read = null
      //   // if value is just str, the string is the location of a simple value
      //   // if value is array, first is location, probably to an object, and the 2nd is how the keys are "joined"
      //   let joined = false
      //   if (this.$_.isArray(v)) {
      //     read = this.$_.get(data, v[0])
      //     joined = true
      //   } else {
      //     read = this.$_.get(data, v)
      //   }
      //   if (read) {
      //     if (joined) {
      //       const join_obj = (val) => {
      //         const keys_to_join = v[1]
      //         return this.$_.map(keys_to_join, prop => val[prop]).join(", ")
      //       }
      //       if (Array.isArray(read)) {
      //         read = read.map(i => join_obj(i))
      //       } else {
      //         read = join_obj(v)
      //       }
      //     }
      //     result.push({[k]: read})
      //   }
      // }
      // return result
    },
    transform_data(data) {
      const transformer = this.action.properties.transform_result
      if (!transformer) {
        return data
      }
      const val_is_packed = is_packed(data)
      data = unpack(data)
      for (let transformer_name of transformer) {
        switch (transformer_name) {
          case "transform_options_list":
            data = transform_options_list(data)
            break
          default:
            console.log("unknown transformer name:", transformer_name)
        }
      }
      if (val_is_packed) {
        data = pack_value(data)
      }
      return data
    },
    handle_reset() {
      const handle = this.action.properties.handle_result
      if (handle) {
        if (handle.type === "assign_to_aspect") {
          const aspect_loc = this.$_.concat([[EDIT, null]], aspect_loc_str2arr(handle.aspect, this.extra.list_index))
          const aspect = this.aspect_from_location(aspect_loc)
          this.$store.dispatch("entries/set_entry_value", {
            aspect_loc,
            value: aspect_default_value(aspect)
          })
          // console.log("reset", aspect_loc, aspect)
        }
      }
    },
    handle_result(result) {
      // console.log("result", result)
      const handle = this.action.properties.handle_result
      if (handle) {
        if (handle.type === "assign_to_aspect") {
          this.$store.commit("entries/new_set_entry_value", {
            uuid: null,
            // aspect_loc: this.$_.concat([[EDIT, null]], aspect_loc_str2arr(handle.aspect, this.extra.list_index)),
            aspect_loc: handle.aspect,
            value: result
          })
        } else {
          console.log("unknown handle type")
        }
      } else {
        console.log("no handle defined for action:", this.action.name)
      }
    },
    handle_error(err) {
      console.log(err.response)
      if (this.$_.get(err, "response.status") === 404) {
        this.error_snackbar("No results")
      }
    },
    done() {
      if (this.has_button_trigger) {
        this.button_trigger_loading = false
      }
    }
  },
  watch: {
    mvalue: {
      immediate: true,
      handler(new_val, prev_val) {
        // catch create call with nothing, and NOT initialized with aspect-default // false if value from aspect-cache
        if (this.$_.isEqual(new_val,aspect_default_value(this.aspect)) && prev_val === undefined) {
          return
        }
        // todo could also be another default
        if (this.has_auto_trigger) {
          if (this.$_.isEqual(unpack(new_val), aspect_raw_default_value(this.aspect))) {
            this.reset_action()
          } else {
            this.trigger_action()
          }
        }
      }
    }
  },
  beforeDestroy() {
    this.$bus.$off("aspect-action-done")
  }
}
</script>

<style scoped>

</style>
