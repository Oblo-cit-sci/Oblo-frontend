<template lang="pug">
  v-flex(xs12 sm10 md8)
    h2 Delete your account
    p {{text}}
    h3 The following entries will be deleted
    CompactEntryList(:entries="entries_to_delete")
    h3.my-2 Please provide your credentials to verify your identity
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
  import {store_received_entries} from "~/lib/client"
  import EntryListWrapper from "~/components/EntryListWrapper"
  import CompactEntryList from "~/components/entry/CompactEntryList"
  import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin"
  import {LOGOUT} from "~/store"
  import PersistentStorageMixin from "~/components/util/PersistentStorageMixin"
  import NavBaseMixin from "~/components/NavBaseMixin"
  import TypicalAspectMixin from "~/components/aspect_utils/TypicalAspectMixin"

  export default {
    name: "delete_account",
    mixins: [TriggerSnackbarMixin, PersistentStorageMixin, NavBaseMixin, TypicalAspectMixin],
    components: {CompactEntryList, EntryListWrapper, Aspect},
    props: {},
    data() {
      return {
        text: "If you have not posted content publicly, all the private entries " +
          "that you created without any collaborator and user information will be permanently deleted. " +
          "If you have posted entries publicly, these entries will continue to be stored and publicly available, " +
          "and we will continue to retain basic user data (you username and public name) so your connection with them is preserved. " +
          "All private entries without other collaborators will be deleted. Those with collaborators will remain",
        aspects: {
          registered_name: this.asp_registered_name(),
          password: this.asp_password()
        },
        entries_to_delete: []
      }
    },
    created() {
      this.$api.actor__init_delete().then(({data}) => {
        this.entries_to_delete = store_received_entries(this.$store, data.data)
      })
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
          this.ok_snackbar(data.data)
          this.clear_storage()
          this.$store.dispatch(LOGOUT)
          this.home()
        }).catch(err => {
          console.log(err)
          this.error_snackbar(this.$t("comp.snackbar.something_went_wrong"))
        })
      }
    }
  }
</script>

<style scoped>

</style>
