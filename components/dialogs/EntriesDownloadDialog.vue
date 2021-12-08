<template lang="pug">
  //DialogWrapper
  //v-dialog(v-model="dialog_open" :persistent="persistent" @click:outside="click_outside")
  DialogWrapper(v-model="dialog_open" @close="close")
    h2 {{$t('comp.entries_download_dialog.dialog_header')}}
    // METADATA or FULL_ENTRIES
    AspectSet(:aspects="aspects" :values.sync="values" mode="edit" @is_complete="is_complete=$event")
    div.ml-2.mb-3
      v-alert(:color="template_info_color")
        span.font-weight-bold {{template_info_message}}
    v-btn(@click="close") {{$t('w.close')}}
    v-btn(:disabled="!is_complete" @click="download") {{$t('w.download')}}
</template>

<script>
import Dialog from "~/components/dialogs/Dialog"
import DialogWrapper from "~/components/dialogs/DialogWrapper"
import CustomDialogMixin from "~/components/dialogs/CustomDialogMixin"
import Aspect from "~/components/Aspect"
import {LANGUAGE, METADATA, SELECT, TEMPLATE} from "~/lib/consts"
import AspectSet from "~/components/AspectSet"
import {pack_value, type_default_value} from "~/lib/aspect"
import LayoutMixin from "~/components/global/LayoutMixin"
import {recursive_unpack2} from "~/lib/util"
import {is_uuid} from "~/lib/props_validators"
import TypicalAspectMixin from "~/components/aspect_utils/TypicalAspectMixin"

const ld = require("lodash")

// const DOWNLOAD_DONE = 2

export default {
  name: "EntriesDownloadDialog",
  mixins: [CustomDialogMixin, TypicalAspectMixin],
  components: {AspectSet, Aspect, DialogWrapper, Dialog},
  props: {
    entries_uuids: Array,
    templates: {
      type: Array,
      default: () => []
    },
    download_config: {
      type: Object,
      validator: (config) => {
        let uuids = ld.get(config, "entries")
        // todo search store module inits and rests all_uuids (which is that value)
        // to null, which makes this fail...
        if (uuids !== null) {
          // just check the 1. one...
          if (uuids.length > 0 && !is_uuid(uuids[0])) {
            return false
          }
        }
        return ld.has(config, "config") && Array.isArray(ld.get(config, "config"))
      },
    },
    download_status: Number
  },
  data() {
    return {
      values: {
        // select_template: type_default_value(SELECT),
        select_data: pack_value("metadata")
      },
      is_complete: false,
    }
  },
  computed: {
    select_data_aspect() {
      return {
        "name": "select_data",
        "t_label": "comp.entries_download_dialog.data_aspect.label",
        "type": SELECT,
        "items": [
          {
            "value": METADATA,
            "text": this.$t("comp.entries_download_dialog.data_aspect.items.0")
          },
          {
            "value": "complete",
            "text": this.$t("comp.entries_download_dialog.data_aspect.items.1")
          }
        ]
      }
    },
    aspects() {
      const base = [this.select_data_aspect]  // metadata or complete
      for (let conf of this.download_config.config) {
        // check if conf.name is TEMPLATE and if the value is longer than 1
        if (conf.name === TEMPLATE && conf.value.length > 1) {
          base.push(this.asp_entry_type(TEMPLATE, true, {}, conf.value))
        }
        // check if conf .name is LANGUAGE and the value more than 1
        if (conf.name === LANGUAGE && conf.value.length > 1) {
          base.push(this.asp_language())
        }
      }
      return base
    },
    only_metadata_selected() {
      return this.values.select_data.value === "metadata"
    },
    template_info_color() {
      if (this.templates.length !== 1 && !this.only_metadata_selected) {
        return "orange"
      } else {
        return "green"
      }
    },
    template_info_message() {
      const num_template_slugs = this.templates.length
      if (this.only_metadata_selected) {
        return "Metadata of all entries will be downloaded"
      }
      if (num_template_slugs === 0) {
        return "Unknown number of entry types. This might result in multiple download files"
      } else {
        return "Several entry types are included. This will result in multiple download files"
      }
    }
  },
  methods: {
    download() {
      this.$emit("download", recursive_unpack2(this.values))
    }
  },
  watch: {}
}
</script>

<style scoped>

</style>
