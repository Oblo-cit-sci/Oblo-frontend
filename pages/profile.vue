<template lang="pug">
  v-flex#top(xs12 sm10 md10)
    v-row
      v-col
        div {{$t("w.username")}}: {{registered_name}}
        GlobalRoleChip(:global_role="user_data.global_role")
      <!-- Profile image -->
      v-col
        v-row
          v-skeleton-loader.m-auto(width="80%" height="200px" type="image" loading v-if="!img_loaded")
          v-img(:src="profile_pic" height=200 contain @load="img_loaded=true")
        v-row(style="margin-top:-10%" v-if="edit_mode")
          v-col(offset=7)
            LoadFileButton(
              :btn_props="{fab:true}"
              label=""
              btn_icon="mdi-camera"
              filetype="image"
              :force_load="profile_pic_upload_loading"
              :size_limit="profile_pic_max_size"
              @fileload="profile_pic_added($event)")
    <!-- Public info -->
    h2 {{$t('page.profile.h_public')}}
    v-row(v-for="aspect in profile_aspects" :key="aspect.name")
      v-col.py-0(cols=10)
        Aspect(:aspect="aspect"
          :ext_value.sync="aspect.value"
          @update:error="$set(aspect, 'error', $event)"
          :mode="mode")
    <!-- Editor info -->
    div(v-if="is_editor && mode === 'view'")
      h2 {{$t('comp.global_role.editor')}}
      AspectSet(:aspects="editor_config_aspects" :values="editor_config_values" mode="view")
    <!-- Email and Password edit -->
    div(v-if="can_edit_email_password")
      h3 {{$t('page.profile.h_email_password')}}
      v-btn(color="info" @click="security_dialog_open=true") {{$t('page.profile.bt_change_email_pwd')}}
      Dialog(:dialog_open.sync="security_dialog_open" persistent)
        div
          EditContextTitle(v-if="!email_edit && !password_edit" :edit.sync="security_dialog_open" :label="$t('page.profile.h_email_password')" back_icon="mdi-close")
          EditContextTitle.pt-1(v-if="!password_edit" :edit.sync="email_edit"
            :label="$t('asp.email.label')" :mvalue="email_aspects.email.value")
          v-container(v-if="email_edit")
            v-row.pl-2(v-for="a of email_aspects" :key="a.name")
              v-col.pa-0(cols=10)
                Aspect(
                  :aspect="a"
                  :ext_value.sync="a.value"
                  mode="edit"
                  @update:error="a.error = $event")
            v-btn(v-if="email_edit" @click="change_email()" color="success" :disabled="any_email_aspect_invalid" :loading="email_update_loading") {{$t('w.save')}}
          div(v-if="!email_edit")
            EditContextTitle.pt-1(v-if="!email_edit" :edit.sync="password_edit"
              :label="$t('asp.password.label')")
            v-container(v-if="password_edit")
              v-row(v-for="a of password_aspects" :key="a.name")
                v-col(cols=10)
                  Aspect(
                    :aspect="a"
                    :ext_value.sync="a.value"
                    @update:error="a.error = $event"
                    :extra="{clearable:false}"
                    mode="edit")
              v-btn(v-if="password_edit" color="success" @click="change_password" :disabled="any_password_invalid") {{$t('page.profile.btn_save')}}
      v-divider.wide_divider
    <!-- Other aspects -->
    <!-- Research aspects, no_domain aspects -->
    div(v-if="!$_.isEmpty(no_domain_aspects)")
      h2#research_aspects {{$t('page.profile.h_research')}}
      div(v-if="edit_mode") {{$t('page.profile.research_info', {platform_title: platform_title})}}
      AspectSet(:aspects="no_domain_aspects" :values.sync="no_domain_values" :mode="mode")
    <!-- domain specific aspects -->
    div(v-if="!$_.isEmpty(domain_specific_aspects)")
      div(:style="{display:'none'}") {{domain_specific_aspects_values}}
      h2#domains {{$t("page.profile.h_domain")}} / {{domain_title}}
      AspectSet(:aspects="domain_specific_aspects" :values.sync="domain_specific_aspects_values" :mode="mode")
    <!-- BUTTONS -->
    div(v-if="!is_visitor")
      div(v-if="view_mode")
        v-btn(color="info" to="/settings" nuxt) {{$t("page.profile.btn_settings")}}
          v-icon(right) mdi-cog
        v-btn(color="info" @click="setEdit()") {{$t("page.profile.btn_edit_profile")}}
        v-btn(color="error" to="/basic/delete_account" nuxt) {{$t("page.profile.btn_delete")}}
      div(v-else)
        v-btn(@click="cancelEdit") {{$t('w.cancel')}}
        v-btn(color="success" @click="doneEdit" :disabled="any_invalid") {{$t("page.profile.btn_save")}}
    <!-- ENTRIES -->
    div(v-if="view_mode")
      v-divider.wide_divider
      h2 {{$t("page.profile.h_entries")}}
      EntryListWrapper(
        :wait="waiting"
        :style="main_container_width_style"
        :preview_options="entry_preview_options"
        :init_request="true"
        :search_config="entry_search_config")
</template>

<script>

// needs a server reroute plugin or module, that reroutes visitors back to index


import Aspect from "../components/Aspect";
import {DOMAIN, DRAFT, EDIT, EDITOR, LANGUAGE, NO_DOMAIN, VIEW, VISITOR} from "~/lib/consts";

import {mapGetters} from "vuex"
import {extract_n_unpack_values, pack_value, set_value_and_error} from "~/lib/aspect";
import PersistentStorageMixin from "../components/util/PersistentStorageMixin";

import LoadFileButton from "../components/util/LoadFileButton";
import {base64file_to_blob, common_filesize, route_change_query} from "~/lib/util";
import TriggerSnackbarMixin from "../components/TriggerSnackbarMixin";
import EntryListWrapper from "../components/EntryListWrapper"
import LayoutMixin from "~/components/global/LayoutMixin"
import TypicalAspectMixin from "~/components/aspect_utils/TypicalAspectMixin"
import FixDomainMixin from "~/components/global/FixDomainMixin"
import GoToMixin from "~/components/global/GoToMixin"
import GlobalRoleChip from "~/components/actor/GlobalRoleChip"
import AspectSet from "~/components/AspectSet"
import Dialog from "~/components/dialogs/Dialog";
import EditContextTitle from "~/components/util/EditContextTitle";
import FilterMixin from "~/components/FilterMixin"
import NavBaseMixin from "~/components/NavBaseMixin";

export default {
  name: "profile",
  components: {
    EditContextTitle,
    Dialog,
    AspectSet,
    GlobalRoleChip,
    EntryListWrapper,
    LoadFileButton,
    Aspect
  },
  mixins: [PersistentStorageMixin, NavBaseMixin, TriggerSnackbarMixin, LayoutMixin, TypicalAspectMixin, FixDomainMixin, GoToMixin, FilterMixin],
  data() {
    const new_pwd = this.asp_password(null, "new")
    return {
      profile_pic_upload_loading: false,
      profile_version_ts: Math.floor(new Date().getTime() / 1000),

      img_loaded: false,
      security_dialog_open: false,
      email_edit: false,
      password_edit: false,
      selected_tab: 0,
      profile_aspects: [
        this.asp_public_name(),
        this.asp_actor_description(),
        // this.asp_email()
      ],
      email_aspects: {
        email: this.asp_email([v => v !== this.user_data.email || this.$t("asp.email.new")]),
        password: this.asp_password()
      },
      email_update_loading: false,
      password_aspects: {
        actual_password: this.asp_password("actual_password", "current"),
        password: new_pwd,
        password_confirm: this.asp_password_confirm(new_pwd, "repeat_new")
      },
      no_domain_aspects: [],
      no_domain_values: {},
      // todo todo is this??, for which domain? always just on fixed?
      domain_specific_aspects: [],
      domain_specific_aspects_values: {},
      // set in created, when user is editor
      editor_config_aspects: null,
      editor_config_values: null,

      waiting: false,
    }
  },
  async created() {
    if (this.$store.getters.username === VISITOR) {
      await this.home()
    }
    this.language_aspects()
    this.reset_edit_values()

    if (this.is_editor) {
      this.editor_config_aspects = this.asp_set_editor_config()
      this.editor_config_values = {
        [DOMAIN]: pack_value(this.user_data.editor_config.domain),
        [LANGUAGE]: pack_value(this.user_data.editor_config.language)
      }
    }
    // editor_config_aspects" :values="editor_config_values"
  },
  methods: {
    goto_top() {
      setTimeout(() => this.$vuetify.goTo("body", {
        duration: 300,
        easing: "easeOutCubic"
      }), 50)
    },
    language_aspects() {
      const domain_data = this.$store.getters["domain/lang_domain_data"](NO_DOMAIN, this.domain_language)
      console.log("DD", domain_data, this.$store.getters["user/settings"].domain_language)
      this.no_domain_aspects = this.$_.cloneDeep(this.$_.get(domain_data, "users.profile.additional_aspects", []))

      if (this.is_fixed_domain) {
        const lang_domain_data = this.$store.getters["domain/act_lang_domain_data"]
        this.domain_specific_aspects = this.$_.cloneDeep(this.$_.get(lang_domain_data, "users.profile.additional_aspects", []))
        // todo here call a function that assigns external conditions
      }
    },
    // set_error(aspect_name, error) {
    //   this.$set(this.profile_aspects[aspect], error)
    // },
    reset_edit_values() {
      const user_data = this.$_.cloneDeep(this.user_data)
      for (let aspect of this.profile_aspects) {
        aspect.value = pack_value(user_data[aspect.name])
      }

      // this.email_aspects.email.value = this.user_data.email
      set_value_and_error(this.email_aspects.email, this.user_data.email, true)
      set_value_and_error(this.email_aspects.password, "", true)
      for (let a of Object.values(this.password_aspects)) {
        set_value_and_error(a, "")
      }

      const no_domain_data = this.$_.get(user_data.config_share, "domain.no_domain")
      if (no_domain_data) {
        this.no_domain_values = no_domain_data
      }

      if (this.is_fixed_domain) {
        if (this.$_.get(user_data.config_share, `domain.${this.fixed_domain}`)) {
          const domain_values = user_data.config_share.domain[this.fixed_domain]
          for (let aspect of this.domain_specific_aspects) {
            // aspect.value = domain_values[aspect.name]
            this.domain_specific_aspects_values[aspect.name] = domain_values[aspect.name]
          }
        }
      }
    },
    setEdit(mode = true) {
      this.$router.push(route_change_query(this.$route, {"edit": mode}))
      this.goto_top()
    },
    cancelEdit() {
      this.setEdit(false)
      this.reset_edit_values()
      this.goto_top()
    },
    doneEdit: function () {
      const new_profile = extract_n_unpack_values(this.profile_aspects)

      new_profile.domain = {}
      new_profile.domain.no_domain = this.no_domain_values

      if (this.is_fixed_domain) {
        new_profile.domain[this.fixed_domain] = this.domain_specific_aspects_values
      }
      this.$api.actor.post_me(new_profile).then(({data}) => {
        // console.log(data)
        this.$store.commit("user/set_user_data", data.data)
        this.persist_user_data()
        // this.setEdit(false)
        this.reset_edit_values()
        this.ok_snackbar(data.msg)
        this.$router.back()
        this.goto_top()
      }).catch((err) => {
        this.err_error_snackbar(err)
      })
    },
    change_email() {
      const new_email = extract_n_unpack_values(this.$_.mapValues(this.email_aspects, a => a.value))
      this.email_update_loading = true
      this.$api.actor.change_email(new_email).then(({data}) => {
        this.email_edit = false;
        this.ok_snackbar(data.msg)
        this.email_aspects.email.value = new_email.email
        const user_data = this.$_.cloneDeep(this.user_data)
        user_data.email = new_email.email
        this.$store.commit("user/set_user_data", user_data)
        this.persist_user_data()
        this.email_aspects.password.value = ""
        this.email_aspects.password.error = true
      }, err => {
        this.err_error_snackbar(err)
      }).finally(() => {
        this.email_update_loading = false
      })
    },
    change_password() {
      // const pwd = this.password_aspects
      // const ld = this.$_
      // debugger
      const new_password = extract_n_unpack_values(this.$_.mapValues(this.password_aspects, a => a.value))
      // console.log(this.password_aspects)
      console.log(new_password)
      this.$api.actor.change_password(new_password).then(() => {
        this.password_edit = false;
        this.ok_snackbar(this.$t("page.profile.msgs.password_changed"))
        for (let a of Object.values(this.password_aspects)) {
          set_value_and_error(a, "")
        }
      }).catch((err) => {
        this.err_error_snackbar(err)
      })
    },
    profile_pic_added(image) {
      if (image.ok) { // check != undefined, which comes from the (not removable? clearable on the fileinput
        let formData = new FormData();
        formData.append('file', base64file_to_blob(image.meta.type, image.data))
        this.profile_pic_upload_loading = true
        this.$api.actor.post_profile_pic(formData)
          .then(() => {
            // request the avatar to refill the browser cache
            this.profile_version_ts = Math.floor(new Date().getTime() / 1000)
            this.$axios.get(this.$api.actor.url_avatar(this.registered_name), {
              withCredentials: false,
              headers: {
                "accept": "image/jpeg"
              }
            }).catch(err => {
              console.error(err)
              console.log("CORS error probably ok ON DEV")
            })
          })
          .catch((err) => {
            this.err_error_snackbar(err)
          }).finally(() => {
          this.profile_pic_upload_loading = false
        })
      }
    },
  },
  computed: {
    ...mapGetters({
      user_data: "user",
      is_visitor: "is_visitor",
      own_entries_uuids: "entries/get_own_entries_uuids",
      domain_language: "domain_language"
    }),
    domain_title() {
      return this.$store.getters["domain/act_lang_domain_data"].title
    },
    platform_title() {
      return this.$store.getters["app/platform_data"].title
    },
    entry_search_config() {
      return [this.get_actor_filter(this.registered_name),
        this.get_status_filter([DRAFT])
      ]
    },
    entry_preview_options() {
      return {
        show_language_chip: true
      }
    },
    registered_name() {
      return this.user_data.registered_name
    },
    edit_mode() {
      const e = this.$route.query.edit
      if (e === undefined) {
        return false
      } else {
        if (typeof (e) === "string") {
          return e === "true"
        } else {
          return e
        }
      }
    },
    view_mode() {
      return !this.edit_mode
    },
    can_edit_email_password() {
      return this.edit_mode && !this.registered_name.startsWith("oauth_")
    },
    mode() {
      if (this.edit_mode)
        return EDIT
      else
        return VIEW
    },
    aspect_mode() {
      return this.edit_mode ? EDIT : VIEW
    },
    profile_pic() {
      return this.$api.actor.url_profile_pic(this.registered_name) + "?q=" + this.profile_version_ts
    },
    any_password_invalid() {
      return this.$_.some(this.password_aspects, (a) => a.hasOwnProperty("error") && a.error)
    },
    any_email_aspect_invalid() {
      return this.$_.some(this.email_aspects, (a) => a.hasOwnProperty("error") && a.error)
    },
    profile_pic_max_size() {
      return common_filesize(5, "MB")
    },
    // errors() {
    //   console.log("rrs")
    //   return this.profile_aspects.map(a => a.error)
    // },
    any_invalid() {
      return this.$_.some(this.profile_aspects, (a) => a.hasOwnProperty("error") && a.error)
    },
    is_editor() {
      return this.user_data.global_role === EDITOR
    }
  },
  watch: {
    security_dialog_open(open) {
      if (!open) {
        this.email_edit = false
        this.password_edit = false
      }
    },
    domain_language(lang) {
      console.log("new domain lang", lang)
      this.language_aspects()
    }
  }
}
</script>

<style scoped>

</style>
