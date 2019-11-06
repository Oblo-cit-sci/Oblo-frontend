<template lang="pug">
  div
    h1 Settings
    br
    div(v-if="partner_settings")
      h3 User key: Upload to the LICCI Repo (temporary option)
      div During the main data collection period of LICCI partners, partners can upload collected data to the LICCI data repository. AUTOMATICALLY SAVED
      TextShort(
        :aspect="user_key_aspect"
        :mvalue="user_key"
        mode="edit"
        v-on:update_value="update_value($event)")
      v-btn(@click="test_save") Test and save
      br
      v-divider.wide-divider
    h3 Export data
    div Export all your entries
    v-btn(@click="export_entries") Export
    h3 Import data
    div Import data from a previously exported (downloaded) json file
    LoadFileButton(@fileload="load_file($event)" )
    br
    v-divider.wide-divider
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
    import TextShort from "../components/aspects/TextShortAspect";
    import TriggerSnackbarMixin from "../components/TriggerSnackbarMixin";
    import {export_data} from "../lib/import_export";
    import {ENTRIES_SAVE_ENTRY, USER_KEY} from "../lib/store_consts";
    import {get_release_mode} from "../lib/util";
    import {LICCI_PARTNERS} from "../lib/consts";

    export default {
        name: "settings",
        components: {TextShort, DecisionDialog, LoadFileButton, Aspect},
        mixins: [TriggerSnackbarMixin],
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
            test_save() {
                let data = {user_key: this.$store.state.meta.repository.user_key}
                this.$axios.post("https://licci.uab.cat/cgi-bin/test_user.py", data, {
                    headers: {
                        "accept": "*",
                        "Access-Control-Allow-Headers": "accept",
                        'Access-Control-Allow-Origin': '*',
                    }
                }).then(res => {
                    this.snackbar(res.data.status, res.data.msg)
                    if (res.data.status) {
                        this.$router.push("/")
                    }
                }).catch(err => {
                    console.log(err)
                    this.error_snackbar("Something went horribly wrong")
                })
            },
            export_entries() {
                const entries = Array.from(this.$store.state.entries.entries.values())
                export_data(entries, "all_licci_entries.json")
            },
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
                        entry.creation_datetime = new Date(entry.creation_datetime)
                        this.$store.commit(ENTRIES_SAVE_ENTRY, entry)
                    })
                    console.log("Entries imported")
                    this.ok_snackbar("Entries imported")
                } else {
                    this.error_snackbar("Something went wrong")
                }
            },
            dialog_action(event) {
                if (event.id === this.clear_dialog_data.id) {
                    this.clear_entries()
                }
            },
            clear_entries() {
                this.$store.dispatch("clear_entries")
                this.$localForage.setItem("entries", this.$store.state.entries.entries, () => {
                    console.log("stored")
                })
            }
        },
        computed: {
            user_key() {
                return pack_value(this.$store.getters[USER_KEY])
            },
            partner_settings() {
                return get_release_mode(this.$store) === LICCI_PARTNERS
            }
        }
    }
</script>

<style scoped>

  .wide-divider {
    margin: 10px 0;
  }
</style>
