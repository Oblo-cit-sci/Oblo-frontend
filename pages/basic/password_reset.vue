<template lang="pug">
  v-flex(xs12 sm10 md6)
    h2 {{$t('page.password_reset.h1')}}
    Aspect(v-for="a of aspects"
      :key="a.name"
      :aspect="a"
      :ext_value.sync="a.value"
      mode="edit"
      @aspectAction="aspect_action($event)"
      @update:error="a.error = $event")
    v-btn.m-4(@click='submit' rounded large :disabled="any_invalid" :loading="submit_loading" color='success') {{$t('page.password_reset.btn_send')}}
</template>

<script>
  import TypicalAspectMixin from "~/components/aspect_utils/TypicalAspectMixin"
  import Aspect from "~/components/Aspect"
  import {extract_n_unpack_values} from "~/lib/aspect"
  import {PAGE_LOGIN} from "~/lib/pages"
  import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin";

  export default {
    name: "password_reset",
    mixins: [TypicalAspectMixin, TriggerSnackbarMixin],
    components: {Aspect},
    props: {},
    data() {
      const password = this.asp_password()
      // asp_password.attr.extra.enter_pressed = true
      return {
        submit_loading: false,
        aspects: [password,this.asp_password_confirm(password, "repeat")]

      }
    },
    computed: {
      any_invalid() {
        // todo could also have  '|| !a.value'  but we should then be able to pass down the rules to the selectes
        return this.$_.some(this.aspects, (a) => a.hasOwnProperty("error") && a.error)
      }
    },
    methods: {
      submit() {
        const values = Object.assign(extract_n_unpack_values(this.aspects), {
          code: this.$route.query.code,
          registered_name: this.$route.query.user
        })
        // console.log(values)
          this.$api.actor.reset_password(values).then(({data}) => {
            this.ok_snackbar(data.msg)
            this.$router.push({name: PAGE_LOGIN})
          }, (err) => {
            this.err_error_snackbar(err)
        })
      }
    }
  }
</script>

<style scoped>

</style>
