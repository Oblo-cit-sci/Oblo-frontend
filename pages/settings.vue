<template lang="pug">
  div
    h1 Settings
    br
    h3 Upload to the LICCI Repo (temporary option)
    div During the main data collection period of LICCI partners, partners can upload collected data to the LICCI data repository
    br
    TextShort(
      :aspect="user_key_aspect"
      :value="user_key"
      mode="edit"
      v-on:update_value="update_value($event)")
    h3 Import data
    LoadFileButton(@fileload="load_file($event)")
    br
    h3 Clear entries
    div delete all entries. Make sure that you made backups of the entries you made
    v-btn(@click="show_clear_entries" color="error") Clear
    DecisionDialog(
      v-bind="dialog_data"
      :open.sync="show_dialog"
      @action="dialog_action($event)")
</template>

<script>


    import Aspect from "../components/Aspect";
    import {pack_value} from "../lib/aspect";
    import LoadFileButton from "../components/LoadFileButton";
    import DecisionDialog from "../components/DecisionDialog";
  import TextShort from "../components/aspectInput/TextShort";

    export default {
        name: "settings",
        components: {TextShort, DecisionDialog, LoadFileButton, Aspect},
        data() {
            return {
                dialog_data: {
                    id: ""
                },
                clear_dialog_data: {
                    id: "clear entries",
                    title: "Are you sure you want to clear all entries? Did you make a backup via Export?",
                    cancel_color: "",
                    confirm_color: "error"
                },
                user_key_aspect: {
                    name: "User key",
                    description: "For that purpose, in order to identify each partner, you need to paste your user key here, which you received from the LICCI core team",
                    type: "str",
                    attr: {
                        max: 40
                    }
                },
                show_dialog: false
            }
        },
        methods: {
            show_clear_entries() {
                this.show_dialog = true
                this.dialog_data = this.clear_dialog_data
            },
            update_value(event) {
                this.$store.commit("add_meta", {
                    repository: {
                        user_key: event
                    }
                })
            },
            load_file(event) {
                if (event.ok) {
                    event.data.forEach(entry => {
                        this.$store.commit("entries/save_entry", entry)
                    })
                }
            },
            dialog_action(event) {
                if (event.id === this.clear_dialog_data.id) {
                    this.clear_entries()
                }
            },
            clear_entries() {
                this.$store.dispatch("clear_entries")
            }
        },
        computed: {
            user_key() {
                return this.$store.getters["user_key"]
            }
        }
    }
</script>

<style scoped>

</style>
