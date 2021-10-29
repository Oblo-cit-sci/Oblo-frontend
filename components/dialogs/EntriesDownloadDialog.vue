<template lang="pug">
  //DialogWrapper
  //v-dialog(v-model="dialog_open" :persistent="persistent" @click:outside="click_outside")
  DialogWrapper(v-model="dialog_open" @close="close")
    h2 {{$t('comp.entries_download_dialog.dialog_header')}}
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
import {SELECT} from "~/lib/consts"
import AspectSet from "~/components/AspectSet"
import {pack_value, type_default_value} from "~/lib/aspect"
import LayoutMixin from "~/components/global/LayoutMixin"

export default {
  name: "EntriesDownloadDialog",
  mixins: [CustomDialogMixin],
  components: {AspectSet, Aspect, DialogWrapper, Dialog},
  props: {
    entries_uuids: Array,
    templates: {
      type:Array,
      default: () => []
    }
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
    // select_template_aspect() {
    //   return {
    //     "name": "select_template",
    //     "t_label": "comp.entries_download_dialog.template_aspect_label",
    //     "type": SELECT,
    //     "items": [
    //       {
    //         "value": "cool",
    //         "text": "cool"
    //       },
    //       {
    //         "value": "not cool",
    //         "text": "not cool"
    //       }
    //     ]
    //   }
    // },
    select_data_aspect() {
      return {
        "name": "select_data",
        "t_label": "comp.entries_download_dialog.data_aspect.label",
        "type": SELECT,
        "items": [
          {
            "value": "metadata",
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
      return [this.select_data_aspect]
    },
    only_metadata_selected() {
      return this.values.select_data.value === "metadata"
    },
    template_info_color() {
      if(this.templates.length !== 1 && ! this.only_metadata_selected) {
        return "orange"
      } else {
        return "green"
      }
    },
    template_info_message() {
      const num_template_slugs = this.templates.length
      if(this.only_metadata_selected) {
        return "Metadata of all entries will be downloaded"
      }
      if(num_template_slugs === 0) {
        return "Unknown number of entry types. This might result in multiple download files"
      } else {
        return "Several entry types are included. This will result in multiple download files"
      }
    }
  },
  methods: {
    download() {
      console.log("download")
    }
  },
  watch: {}
}
</script>

<style scoped>

</style>
