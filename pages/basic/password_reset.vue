<template lang="pug">
  v-flex(xs12 sm10 md6)
    h2 {{$t('password_reset.h1')}}
    Aspect(v-for="a of aspects"
      :key="a.name"
      :aspect="a"
      :ext_value.sync="a.value"
      mode="edit"
      @aspectAction="aspect_action($event)"
      @update:error="a.error = $event")
    v-btn.m-4(@click='submit' rounded large :disabled="any_invalid" :loading="submit_loading" color='success') {{$t('password_reset.btn_send')}}

</template>

<script>
  import TypicalAspectMixin from "~/components/aspect_utils/TypicalAspectMixin"
  import Aspect from "~/components/Aspect"
  import {extract_unpacked_values} from "~/lib/aspect"
  import {PAGE_LOGIN} from "~/lib/pages"

  export default {
    name: "password_reset",
    mixins: [TypicalAspectMixin],
    components: {Aspect},
    props: {},
    data() {
      const password = this.asp_password()
      // asp_password.attr.extra.enter_pressed = true
      return {
        submit_loading: false,
        aspects: {
          password: password,
          password_confirm: this.asp_password_confirm(password, "repeat")
        }
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
        const values = Object.assign(extract_unpacked_values(this.aspects), {
          code: this.$route.query.code,
          registered_name: this.$route.query.user
        })
        console.log(values)
          this.$api.post_actor__reset_password(values).then(res => {
            console.log(res)
            this.$router.push(PAGE_LOGIN)
          })
      }
    }
  }
</script>

<style scoped>

</style>
