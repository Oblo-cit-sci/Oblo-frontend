<template lang="pug">
  div
    v-btn(v-if="button_trigger" :disabled="!has_value" @click="trigger_action" :loading="button_trigger_loading") {{trigger.button_label}}
</template>

<script>

  import {ENTRIES_SET_ENTRY_VALUE} from "~/store/entries"
  import {ASPECT, EDIT} from "~/lib/consts"

  import axios from "axios"
  import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin"
  import {aspect_loc_str2arr} from "~/lib/aspect"

  export default {
    name: "AspectAction",
    mixins: [TriggerSnackbarMixin],
    components: {},
    props: {
      aspect: Object,
      extra: Object,
      mvalue: Object
    },
    data() {
      return {
        button_trigger_loading: false
      }
    },
    computed: {
      value() {
        // todo should be somewhere else
        return this.$_.get(this.mvalue, "value", this.mvalue)
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
      button_trigger() {
        return this.trigger.type === "button"
      },
      auto_trigger() {
        return this.trigger.type === "auto"
      },
      has_value() {
        return this.value
      }
    },
    methods: {
      trigger_action() {
        if (this.button_trigger) {
          this.button_trigger_loading = true
        }
        switch (this.action.type) {
          case "api-query":
            this.perform_api_query()
            break
          default :
            console.log("unknown action type")
        }
      },
      perform_api_query() {
        let url = this.properties.query_url
        if (this.properties.value_emit === "url_attach") {
          url += this.mvalue.value
        }
        if (url.startsWith("/api")) {
          url = this.$axios.defaults.baseURL + url
          console.log("api server")
        }

        const method = this.properties.method || "get"
        const request = {
          method: method,
          url: url,
        }

        if(this.properties.value_emit === "content") {
          request.data = this.mvalue.value
        }

        axios(request).then(({data}) => {
          console.log("received", data)
          const processed_data = this.process_result(data)
          console.log("processed to", processed_data)
          this.handle_result(processed_data)
        }).catch(err => {
          console.log(err)
          this.handle_error(err)
        }).finally(() => {
          this.done()
        })
      },
      process_result(data) {
        const process = this.action.properties.process_result
        if(!process) {
          return data
        }
        const result = []
        for (let i of process) {
          const k = Object.keys(i)[0]
          const v = i[k]
          let read = null
          // if value is just str, the string is the location of a simple value
          // if value is array, first is location, probably to an object, and the 2nd is how the keys are "joined"
          let joined = false
          if (this.$_.isArray(v)) {
            read = this.$_.get(data, v[0])
            joined = true
          } else {
            read = this.$_.get(data, v)
          }
          if (read) {
            if (joined) {
              const join_obj = (val) => {
                const keys_to_join = v[1]
                return this.$_.map(keys_to_join, prop => val[prop]).join(", ")
              }
              if (Array.isArray(read)) {
                read = read.map(i => join_obj(i))
              } else {
                read = join_obj(v)
              }
            }
            result.push({[k]: read})
          }
        }
        return result
      },
      handle_result(result) {
        const handle = this.action.properties.handle_result
        if (handle.type === "assign_to_aspect") {
          console.log(aspect_loc_str2arr(handle.aspect, this.extra.list_index))
          this.$store.dispatch(ENTRIES_SET_ENTRY_VALUE, {
            aspect_loc: this.$_.concat([[EDIT, null]], aspect_loc_str2arr(handle.aspect, this.extra.list_index)),
            value: result
          })
        } else {
          console.log("unknown handle type")
        }
      },
      handle_error(err) {
        console.log(err.response)
        if (this.$_.get(err, "response.status") === 404) {
          this.error_snackbar("No results")
        }
      },
      done() {
        if (this.button_trigger) {
          this.button_trigger_loading = false
        }
      }
    },
    watch: {
      mvalue() {
        if (this.auto_trigger) {
          this.perform_api_query()
        }
      }
    }
  }
</script>

<style scoped>

</style>
