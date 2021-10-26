<template lang="pug">
  div
    h1 {{$t("page.settings.h1")}}
    br
    v-row(v-for="(aspect) in settings_aspects" :key="aspect.name")
      v-col(alignSelf="stretch" :cols="base_cols")
        Aspect(
          :aspect="aspect"
          :ext_value.sync="aspect.value"
          mode="edit")
    div(v-if="is_fixed_domain && has_multiple_domains")
      h3 {{$t("page.settings.fixed_domain.h1")}}
      div
        span {{$t("page.settings.fixed_domain.p")}} &nbsp;
        b {{act_domain_title}}
        span . {{$t("page.settings.fixed_domain.p2")}}
      v-btn(@click="reset_fixed_domain()") {{$t("page.settings.fixed_domain.btn_reset")}}
    br
    v-btn(@click="back") {{$t("w.back")}}
    v-btn(@click="update_settings" :loading="update_button_loading" color="success") {{$t('w.update')}}
    br
    <!--    h3 Export data-->
    <!--    div Export all your entries-->
    <!--    v-btn(@click="export_entries") Export-->
    <!--      v-icon.ml-2 mdi-export-->
    <!--    h3 Import data-->
    <!--    div Import data from a previously exported (downloaded) json file-->
    <!--    LoadFileButton(@fileload="load_file($event)" )-->
    <!--    br-->
    <!--    v-divider.wide-divider-->
    <!--    h3 Clear entries-->
    <!--    div delete all entries. Make sure that you made backups of the entries you made-->
    <!--    v-btn(@click="show_clear_entries" color="error") Clear-->
    <!--    DecisionDialog(-->
    <!--      v-bind="dialog_data"-->
    <!--      :open.sync="show_dialog"-->
    <!--      @action="dialog_action($event)")-->
</template>

<script>


  import Aspect from "../components/Aspect";
  import LoadFileButton from "../components/util/LoadFileButton";
  import TriggerSnackbarMixin from "../components/TriggerSnackbarMixin";
  import {export_data, merge_imported_entries} from "~/lib/import_export";
  import PersistentStorageMixin from "../components/util/PersistentStorageMixin";

  import {extract_n_unpack_values, pack_value} from "~/lib/aspect"
  import FixDomainMixin from "~/components/global/FixDomainMixin"
  import {PAGE_PROFILE} from "~/lib/pages"
  import TypicalAspectMixin from "~/components/aspect_utils/TypicalAspectMixin"
  import AspectListMixin from "~/components/global/AspectListMixin"
  import {MSG_PATH_SOMETHING_WENT_WRONG} from "~/lib/consts"
  import LanguageMixin from "~/components/LanguageMixin";


  export default {
    name: "settings",
    components: {LoadFileButton, Aspect},
    mixins: [TriggerSnackbarMixin, PersistentStorageMixin, AspectListMixin, FixDomainMixin, LanguageMixin, TypicalAspectMixin],
    data() {
      const privacy_aspect = this.asp_privacy("default_privacy", "default")
      // todo the cc_licenses should come from a definition in the domain (licci)
      const license_aspect = this.asp_license("default_license", ["cc_licenses"], null, "default")
      const ui_lang_aspect = this.asp_language("ui_language","ui")
      ui_lang_aspect.items = this.get_language_options()

      const settings = this.$store.getters["user/settings"]
      privacy_aspect.value = pack_value(settings.default_privacy)
      license_aspect.value = pack_value(settings.default_license)
      ui_lang_aspect.value = pack_value(settings.ui_language)

      const settings_aspects = [
        // this.asp_location_privacy(), // taken out for now. always ask is the default.
        privacy_aspect,
        license_aspect,
        ui_lang_aspect
      ]
      return {
        dialog_data: {
          id: ""
        },
        settings_aspects: this.$_.cloneDeep(settings_aspects),
        test_save_connect_loading: false,
        // todo move to json files
        clear_dialog_data: {
          id: "clear entries",
          title: "Are you sure you want to clear all entries? Did you make a backup via Export?",
          cancel_color: "",
          confirm_color: "error"
        },
        entries_imported_dialog: {
          id: "entries imported",
          title: "Entries imported",
          text: "",
          cancel_color: "",
          show_cancel: false
        },
        show_dialog: false,
        update_button_loading: false
        // temporary for hot fix
      }
    },
    methods: {
      update_settings() {
        this.update_button_loading = true
        this.$api.actor.post_me({settings: extract_n_unpack_values(this.settings_aspects)}).then(({data}) => {
          this.$store.commit("user/set_settings", data.data.settings)
          this.change_language(data.data.settings.ui_language, false)
          this.ok_snackbar(this.$t("page.settings.settings_updated"))
          this.persist_user_settings()
          this.$router.push({name: PAGE_PROFILE})
        }).catch(err => {
          this.err_error_snackbar(err)
          console.log(err)
        }).finally(() => {
          this.update_button_loading = false
        })
      },
      export_entries() {
        const entries = Array.from(this.$store.state.entries.entries.values())
        export_data({entries: entries}, "all_entries.json")
      },
      show_clear_entries() {
        this.show_dialog = true
        this.dialog_data = this.clear_dialog_data
      },
      load_file(event) {
        if (event.ok) {

          // console.log(event.data.entries, typeof event.data.entries)
          let entries = event.data.entries
          // TODO TAKE CARE OF THE OLD FORMAT
          if (Array.isArray(event.data)) {
            entries = event.data
          } else if (!Array.isArray(event.data.entries)) {
            entries = Object.values(event.data.entries)
            console.log("trans", entries, typeof entries)
          }
          console.log("importing", entries.length)

          entries.forEach(entry => {
            entry.creation_datetime = new Date(entry.creation_datetime)
            entry.local = {
              dirty: false,
              prev: null,
            }
          })
          const result = merge_imported_entries(this.$store, entries)

          console.log("imported", result.length)
          // the following part will be usefull to display some results
          // const sorted = sort_by_type(result)
          // console.log("sorted", sorted)

          this.persist_entries()
          this.ok_snackbar("Entries imported")
        } else {
          this.error_snackbar(this.$t(MSG_PATH_SOMETHING_WENT_WRONG))
        }
      },
      dialog_action(event) {
        if (event.id === this.clear_dialog_data.id && event.confirm) {
          this.clear_entries()
        }
      },
      clear_entries() {
        this.$store.dispatch("clear_entries")
        this.persist_entries()
      },
      back() {
        this.$router.back()
      }
    },
    computed: {
      aspect_map() {
        return this.$_.keyBy(this.settings_aspects, "name")
      },
      act_domain_title() {
        return this.$store.getters["domain/act_domain_title"]
      }
    }
  }
</script>

<style scoped>

  .wide-divider {
    margin: 10px 0;
  }
</style>
