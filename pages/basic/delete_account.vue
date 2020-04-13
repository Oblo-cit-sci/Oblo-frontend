<template lang="pug">
  v-flex(xs12 sm10 md8)
    h2 Delete your account
    p {{text}}
    div Please provide your credentials to verify your identity
    Aspect(v-for="a of aspects"
      :key="a.name"
      :aspect="a"
      :ext_value.sync="a.value"
      mode="edit"
      @update:error="a.error = $event")
    v-btn(@click="$router.back()") cancel
    v-btn(color="error" :disabled="any_invalid" @click="delete_account") Delete account
</template>

<script>
  import Aspect from "~/components/Aspect"
  import {STR} from "~/lib/consts"

  export default {
    name: "delete_account",
    mixins: [],
    components: {Aspect},
    props: {},
    data() {
      return {
        text: "If you have not posted content publicly, all the private entries, " +
          "that you created without any collaborator and user information will be permanently deleted. " +
          "If you have posted entries publicly, these entries will continue to be stored and publicly available, " +
          "and we will continue to retain basic user data (you username and public name) so your connection with them is preserved. " +
          "All private entries withou other collaborators will be deleted. Those with collaborators will remain",
        aspects: {
          registered_name: {
            type: STR,
            label: "Username",
            name: "registered_name",
            attr: {
              max: 30,
              unpacked: true,
              extra: {
                rules: [
                  v => v && v.length >= 4 || 'Username must have at 4 characters',
                ]
              }
            },
            value: "",
            error: true
          },
          password: {
            type: STR,
            name: "Password",
            attr: {
              max: 40,
              unpacked: true,
              component_type: "password",
              extra: {
                rules: [
                  v => v && v.length >= 8 || 'Password must have at least 8 characters',
                ]
              }
            },
            value: "",
            error: true
          }
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
      delete_account() {
        this.$api.delete_account({
          registered_name: this.aspects.registered_name.value,
          password: this.aspects.password.value
        }).then(({data}) => {
          console.log(data)
        }).catch(err => {
          console.log(err)
        })
      }
    }
  }
</script>

<style scoped>

</style>
