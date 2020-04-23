<template lang="pug">
  div
    v-btn(v-if="button_trigger" @click="trigger_action" :loading="button_trigger_loading") {{trigger.button_label}}
</template>

<script>

  import {ENTRIES_SET_ENTRY_VALUE} from "~/store/entries"
  import {ASPECT, EDIT} from "~/lib/consts"

  import axios from "axios"

  export default {
    name: "AspectAction",
    mixins: [],
    components: {},
    props: {
      aspect: Object,
      mvalue: Object
    },
    data() {
      return {
        button_trigger_loading: false
      }
    },
    computed: {
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
      }
    },
    methods: {
      trigger_action() {
        if(this.button_trigger) {
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
        axios.get(url, {}).then(({data}) => {
          const processed_data = this.process_result(data)
          this.handle_result(processed_data)
          this.done()
        }).catch(err => {
          console.log(err)
        })
      },
      process_result(data) {
        const process = this.action.properties.process_result
        const result = []
        for (let i of process) {
          debugger
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
          this.$store.dispatch(ENTRIES_SET_ENTRY_VALUE, {
            aspect_loc: [[EDIT, null], [ASPECT, handle.aspect]],
            value: result
          })
        } else {
          console.log("unknown handle type")
        }
      },
      done() {
        if(this.button_trigger) {
          this.button_trigger_loading = false
        }
      }
    }
  }
</script>

<style scoped>

</style>
