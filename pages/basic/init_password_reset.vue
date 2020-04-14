<template lang="pug">
  v-flex(xs12 sm10 md6)
    h2 Password reset
    Aspect(:aspect="query"
      :ext_value.sync="query.value"
      mode="edit"
      @update:error="query.error = $event")
    v-btn(@click='send' color='success' autofocus :disabled="query.error") Send email
    v-alert(:value='errorMsg != null' type='error' prominent transition="scroll-y-reverse-transition") {{errorMsg}}
</template>

<script>
  import {STR} from "~/lib/consts"
  import Aspect from "~/components/Aspect"
  import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin"

  export default {
    name: "init_password_reset",
    components: {Aspect},
    mixins: [TriggerSnackbarMixin],
    data() {
      return {
        query: {
          type: STR,
          label: "",
          name: "query",
          description: "Enter your email or username",
          attr: {
            max: 30,
            unpacked: true,
            extra: {
              rules: [
                v => v.length > 0,
              ]
            }
          },
          error: true,
          value: ""
        },
        errorMsg: null
      }
    },
    methods: {
      send() {
        this.$api.actor__init_password_reset(this.query.value.toLowerCase()).then(({data}) => {
          this.ok_snackbar(data.data.msg)
          this.$router.push("reset_mail_sent")
        }).catch(err => {
          this.errorMsg = err.response.data.error.msg
          setTimeout(() => this.errorMsg = null, 2000)
        })
      }
    }
  }
</script>

<style scoped>

</style>
