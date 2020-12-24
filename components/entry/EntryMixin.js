import {get_creator, get_entry_titleAspect, has_parent} from "~/lib/entry";
import {aspect_loc_str2arr, loc_append, loc_prepend} from "~/lib/aspect";
import {mapGetters} from "vuex"

import {
  ASPECT,
  DRAFT,
  EDIT,
  ENTRY,
  GLOBAL,
  META,
  META_ASPECT_LIST,
  PUBLISHED,
  REQUIRES_REVIEW,
  REVIEW, TAG,
  VIEW
} from "~/lib/consts";


import {check_str_is_uuid, printDate} from "~/lib/util";

import EntryPagesMixin from "~/components/entry/EntryPagesMixin"
import AspectListMixin from "~/components/global/AspectListMixin"
import ExportMixin from "~/components/global/ExportMixin"
import TemplateHelperMixin from "~/components/templates/TemplateHelperMixin";

export default {
  name: "EntryMixin",
  mixins: [EntryPagesMixin, AspectListMixin, ExportMixin, TemplateHelperMixin],
  props:
    {
      entry: {
        type: Object,
        required: true
      }
    },
  data() {
    return {
      // aspect_locs: {},
      aspect_extras: {}
    }
  },
  computed: {
    ...mapGetters({"is_admin": "user/is_admin", "username": "user/registered_name"}),
    uuid() {
      return this.entry.uuid
    },
    entry_date() {
      return printDate(new Date(this.entry.creation_ts))
    },
    in_context() {
      return (this.template.rules.context || GLOBAL) !== GLOBAL || this.entry.entry_refs.parent
    },
    tags_config() {
      return this.$_.get(this.template.rules, "tags_config", [])
    },
    has_parent() {
      return has_parent(this.entry)
    },
    parents() {
      let act = this.entry
      let result = []
      while (act.refs.parent) {
        act = this.$store.getters["entries/get_parent"](act.uuid)
        result.push({
          text: act.title,
          href: 'breadcrumbs_dashboard',
        })
      }
      return result
    },
    actors() {
      return this.entry.actors
    },
    creator() {
      // todo this is just a workaround, for strange be behaviour
      // should be
      // console.log(this.entry.actors.filter(er => er.role === "creator")[0].actor)
      return get_creator(this.entry)
    },
    is_creator() {
      // console.log(this.creator, this.$store.getters.registered_name)
      return this.creator.registered_name === this.username
    },
    template_slug() {
      return this.entry.template.slug
    },
    template() {
      const lang = this.$store.getters.domain_language
      if (this.force_entry_language) {
        return this.$store.getters["templates/entry_type"](this.template_slug, this.entry.language)
      }
      return this.$store.getters["templates/entry_type"](this.template_slug, lang)
    },
    template_color() {
      return this.$_.get(this.template, "rules.marker_color")
    },
    entry_title() {
      if (this.is_edit_mode) {
        // todo dirty. do this similar to new tag schema. have "titleAspect" in the attr of the actual aspect that
        // sets the title
        let titleAspect = get_entry_titleAspect(this.template)
        if (!titleAspect) {
          return this.entry.title
        }
        // todo maybe it would be cleaner to add "entry "+uuid , so that  aspect_loc_str2arr/is wrapped around
        let title = this.$store.getters["entries/value"](loc_prepend(EDIT, this.uuid, aspect_loc_str2arr(titleAspect)))
        title = this.$_.get(title, "value", "")
        return this.template.title + (title ? ": " + title : "")
      } else {
        return this.full_title
      }
    },
    full_title() {
      return this.template.title + (this.entry.title ? ": " + this.entry.title : "")
    },
    entry_image() {
      if (this.entry.image) {
        if (this.entry.image.startsWith("http")) {
          return this.entry.image
        } else if (check_str_is_uuid(this.entry.image)) {
          if (this.entry.status === "draft") {
            const img_data = this.$store.getters["files/get_file"](this.entry.image)
            if (img_data) {
              return img_data.data
            }
          } else {
            return this.$api.url_entry__$uuid__attachment__$file_uuid(this.uuid, this.entry.image)
          }
        } else {
          return null
        }
      }
    },
    parent_title() {
      // console.log("getting parent title", this)
      // todo not necessarily available for remote entries. should be included?
      return this.$store.getters["entries/get_parent"](this.uuid).title
    },
    type_name() {
      return this.template.title
    },
    aspect_loc() {
      return [ENTRY, this.uuid, this.template_slug]
    },
    outdated() {
      return false
      // return this.entry.template_version !== this.template.version
    },
    download_title() {
      // todo title, wont update in real time
      const entry_title = this.$store.getters["entries/get_entry_title"](this.uuid)
      return (this.type_name + "_" + entry_title).replace(" ", "_")
    },
    is_draft() {
      return this.entry.status === DRAFT
    },
    is_published() {
      return this.entry.status === PUBLISHED
    },
    is_requires_review() {
      return this.entry.status === REQUIRES_REVIEW
    },
    is_view_mode() {
      return this.mode === VIEW
    },
    is_edit_mode() {
      return this.mode === EDIT
    },
    is_review_mode() {
      return this.mode === REVIEW
    },
    is_editable_mode() {
      return [EDIT, REVIEW].includes(this.mode)
    },
    tags() {
      // console.log("template", this.template.entry_refs, this.entry.tags)
      const e_tags = this.entry.tags
      const result_tags = {}
      for(let group_name of Object.keys(this.entry.tags)) {
        let tag_values = e_tags[group_name]
        const template_tag_refs = this.template.entry_refs.filter(t => t.ref_type === TAG)
        // console.log(template_tag_refs)
        const code_slug =  this.$_.find(template_tag_refs, ref => {
          if (!Array.isArray(ref.tag)) {
            return ref.tag.name === group_name
          } else {
            return this.$_.some(ref.tag, tag_d => tag_d.name === group_name)
          }
        }).dest_slug
        const lang = this.$store.getters["user/settings_value"]("domain_language")
        // console.log(group_name, code_slug, lang)
        result_tags[group_name] = this.$store.getters["templates/tags_of_code"](code_slug, lang, tag_values)
      }
      return result_tags
    },
    version() {
      return this.entry.version
    },
    aspects() {
      return this.template.aspects
    },
    aspect_locs() {
      const aspect_locs = {}
      for (let aspect of this.aspects) {
        aspect_locs[aspect.name] = loc_append([this.aspect_loc], ASPECT, aspect.name)
      }
      for (let aspect of META_ASPECT_LIST) {
        aspect_locs[aspect] = loc_append([this.aspect_loc], META, aspect)
      }
      return aspect_locs
    }
  },
  // beforeMount() {
  //   this.update_aspect_locs()
  // },
  // beforeUpdate() {
  //   // console.log("update")
  //   this.update_aspect_locs()
  // },
  methods: {
    download() {
      //   return clone
      // })
      this.export_data(this.entry, this.download_title)
    },
    // update_aspect_locs() {
    //   // console.log("update_aspect_locs", this.entry !== null)
    //   if (this.entry !== null) {
    //     for (let aspect of this.template.aspects) {
    //       this.aspect_locs[aspect.name] = loc_append([this.aspect_loc], ASPECT, aspect.name)
    //       // console.log(aspect.name, this.aspect_locs[aspect.name])
    //     }
    //     for (let aspect of META_ASPECT_LIST) {
    //       this.aspect_locs[aspect] = loc_append([this.aspect_loc], META, aspect)
    //     }
    //   }
    // },
    get_attachments_to_post() {
      const new_files_data = []
      for (let file of this.entry.attached_files) {
        if (!file.hasOwnProperty("url")) {
          new_files_data.push(file)
        }
      }
      return new_files_data
    }
  }
}
