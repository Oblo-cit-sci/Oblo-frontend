<template lang="pug">
  v-flex(xs12 sm10 md8)
    h2 Reset your Password
    v-row(v-for="a of password_aspects" :key="a.name")
      v-col(cols=10)
        Aspect(
          :aspect="a"
          :ext_value.sync="a.value"
          @update:error="a.error = $event"
          :extra="{clearable:false}"
          mode="edit")
    v-btn(color="success" @click="change_password" :disabled="any_invalid") Save password
</template>

<script>
  import {password_aspect, password_confirm_aspect} from "~/lib/typical_aspects"
  import {extract_unpacked_values} from "~/lib/aspect"
  import Aspect from "~/components/Aspect"
  import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin"

  export default {
    name: "password_reset",
    components: {Aspect},
    mixins: [TriggerSnackbarMixin],
    data() {
      const new_pwd = this.$_.cloneDeep(password_aspect())
      new_pwd.label = "New password"
      const new_pwd_confirm = this.$_.cloneDeep(password_confirm_aspect())
      new_pwd_confirm.label = "Repeat new password"
      return {
        password_aspects: {
          password: new_pwd,
          password_confirm: this.$_.merge(new_pwd_confirm, {
            attr: {
              extra: {
                rules: [
                  v => v === this.password_aspects.password.value || "Passwords do not match"
                ]
              }
            }
          })
        }
      }
    },
    computed: {
      any_invalid() {
        // todo could also have  '|| !a.value'  but we should then be able to pass down the rules to the selectes
        return this.$_.some(this.password_aspects, (a) => a.hasOwnProperty("error") && a.error)
      }
    },
    methods: {
      change_password() {
        const data = extract_unpacked_values(this.password_aspects)
        data.registered_name = this.$route.query.user
        data.code = this.$route.query.code
        this.$api.post_actor__reset_password(data).then(({data}) => {
          this.ok_snackbar("Password updated")
          this.$router.push("/login")
        }).catch((err) => {
          // console.log("err", err.response)
          this.error_snackbar(err.response.data.error.msg)
        })
      }
    }
  }
</script>

<style scoped>

</style>
