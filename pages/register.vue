<template lang="pug">
  v-flex(xs12='' sm8='' md6='')
    h2.mb-2 {{$t('register.h1')}}
    v-form
      Aspect(v-for="a of aspects"
        :aspect="a"
        :key="a.name"
        :ext_value.sync="a.value"
        @update:error="a.error = $event"
        :extra="{clearable:false}"
        mode="edit")
    v-btn.m-4(@click='submit' x-large :disabled="any_invalid || submitStatus === 'PENDING'" :loading="submit_loading" color='success') {{$t('register.btn_register')}}
    v-alert(:value='errorMsg !== null' type='error' prominent) {{errorMsg}}
</template>

<script>

  import {validationMixin} from 'vuelidate'

  import Aspect from "../components/Aspect";
  import TriggerSnackbarMixin from "../components/TriggerSnackbarMixin";
  import {password_aspect, password_confirm_aspect} from "~/lib/typical_aspects";
  import LoginMixin from "../components/actor/LoginMixin";
  import TypicalAspectMixin from "~/components/aspect_utils/TypicalAspectMixin"

  let username_regex = new RegExp('^[a-z][a-z0-9_]*$');

  export default {
    name: "register",
    components: {Aspect},
    mixins: [validationMixin, TriggerSnackbarMixin, LoginMixin, TypicalAspectMixin],
    data() {
      const password =  this.asp_password()
      return {
        aspects: {
          registered_name: this.asp_registered_name(),
          email: this.asp_email(),
          password: password,
          password_confirm: this.asp_password_confirm(password, "repeat")
        },
        submitStatus: null,
        errorMsg: null,
        submit_loading: false
      }
    },
    computed: {
      any_invalid() {
        // todo could also have  '|| !a.value'  but we should then be able to pass down the rules to the selectes
        return this.$_.some(this.aspects, (a) => a.hasOwnProperty("error") && a.error)
      }
    },
    methods: {
      // use this as a function to select/highlight a privacy from the list
      submit() {
        this.submit_loading = true
        this.$api.post_actor({
          registered_name: this.aspects.registered_name.value,
          email: this.aspects.email.value,
          password: this.aspects.password.value,
          password_confirm: this.aspects.password_confirm.value,
        }).then(({data}) => {
          if (data.data) {
            this.$router.push("/login")
            this.ok_snackbar(data.data)
          } else {
            this.errorMsg = data.error.msg
          }
        }).catch((err) => {
          this.errorMsg = this.$_.get(err.response, "data.error.msg", this.$t("_global.snack.something_went_wrong"))
          setTimeout(() => this.errorMsg = null, 12000)
        }).finally(() => {
          this.submit_loading = false
        })
      }
    }
  }
</script>

<style scoped>
  .selectedItem {
    background-color: aqua;
  }
</style>
