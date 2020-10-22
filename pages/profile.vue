<template lang="pug">
  v-flex#top(xs12 sm10 md10)
    v-row
      v-col
        div {{$t("w.username")}}: {{registered_name}}
        GlobalRoleChip(:global_role="user_data.global_role")
      <!-- Profile image -->
      v-col
        v-row
          v-img(:src="profile_pic" max-height=200 contain)
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
      v-col(cols=10)
        Aspect(:aspect="aspect"
          :ext_value.sync="aspect.value"
          @update:error="$set(aspect, 'error', $event)"
          :mode="aspect_mode")
    <!-- Email and Password edit -->
    div(v-if="edit_mode")
      h3 {{$t('page.profile.h_email_password')}}
      v-btn(color="info" v-if="!password_edit" @click="security_dialog_open=true") {{$t('page.profile.bt_change_email_pwd')}}
      Dialog(:dialog_open.sync="security_dialog_open" persistent)
        v-sheet.pa-1(color="white")
          EditContextTitle(v-if="!email_edit && !password_edit" :edit.sync="security_dialog_open" :label="$t('page.profile.h_email_password')" back_icon="mdi-close")
          EditContextTitle.pt-1(v-if="!password_edit" :edit.sync="email_edit"
            :label="$t('asp.email.label')" :value="email_aspects.email.value")
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
    div
      h2#research_aspects {{$t('page.profile.h_research')}}
      div {{$t('page.profile.research_info')}}
      AspectSet(:aspects="no_domain_aspects" :values.sync="no_domain_values" :mode="edit_mode ? 'edit' : 'view'")
    <!-- domain specific aspects -->
    div(v-if="edit_mode && !$_.isEmpty(domain_specific_aspects)")
      h2#domains {{$t("page.profile.h_domain")}}
      AspectSet(:aspects="domain_specific_aspects" :values.sync="domain_specific_aspects_values" mode="edit")
    div(v-if="!is_visitor")
      v-btn(v-if="!edit_mode" to="/settings" nuxt color="info") {{$t("page.profile.btn_settings")}}
        v-icon(right) mdi-settings
      v-btn(v-if="!edit_mode" color="info" @click="setEdit()") {{$t("page.profile.btn_edit_profile")}}
      div(v-else)
        v-btn(@click="cancelEdit") {{$t('w.cancel')}}
        v-btn(color="success" @click="doneEdit" :disabled="any_invalid") {{$t("page.profile.btn_save")}}
      v-btn(v-if="!edit_mode" color="error" to="/basic/delete_account") {{$t("page.profile.btn_delete")}}
    div(v-if="!edit_mode")
      v-divider.wide_divider
      h2 {{$t("page.profile.h_entries")}}
      EntryListWrapper(
        :wait="waiting"
        :style="main_container_width_style"
        :init_request="true"
        :search_config="entry_search_config")
</template>

<script>

// needs a server reroute plugin or module, that reroutes visitors back to index


import Aspect from "../components/Aspect";
import {EDIT, NO_DOMAIN, USER, VIEW} from "~/lib/consts";

import {mapGetters} from "vuex"
import {extract_unpacked_values} from "~/lib/aspect";
import PersistentStorageMixin from "../components/util/PersistentStorageMixin";

import {ENTRIES_GET_OWN_ENTRIES_UUIDS} from "~/store/entries";
import LoadFileButton from "../components/util/LoadFileButton";
import {base64file_to_blob, common_filesize, route_change_query} from "~/lib/util";
import TriggerSnackbarMixin from "../components/TriggerSnackbarMixin";
import {USER_SET_USER_DATA} from "~/store/user";
import EntryListWrapper from "../components/EntryListWrapper"
import LayoutMixin from "~/components/global/LayoutMixin"
import TypicalAspectMixin from "~/components/aspect_utils/TypicalAspectMixin"
import FixDomainMixin from "~/components/global/FixDomainMixin"
import GoToMixin from "~/components/global/GoToMixin"
import GlobalRoleChip from "~/components/actor/GlobalRoleChip"
import DomainLanguageMixin from "~/components/domain/DomainLanguageMixin";
import AspectSet from "~/components/AspectSet"
import Dialog from "~/components/dialogs/Dialog";
import EditContextTitle from "~/components/util/EditContextTitle";

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
  mixins: [PersistentStorageMixin, TriggerSnackbarMixin, LayoutMixin, TypicalAspectMixin, FixDomainMixin, GoToMixin, DomainLanguageMixin],
  data() {
    const new_pwd = this.asp_password(null, "new")
    return {
      profile_pic_upload_loading: false,
      profile_version_ts: Math.floor(new Date().getTime() / 1000),
      grab_map_selection: false, // when coming back from the map

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
        email: this.asp_email(),
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

      domain_specific_aspects: [],
      domain_specific_aspects_values: {},

      waiting: false,
    }
  },
  created() {
    this.no_domain_aspects = this.$_.cloneDeep(this.$_.get(this.ui_lang_domain_data(NO_DOMAIN), "users.profile.additional_aspects", []))

    if (this.is_fixed_domain) {
      const ui_lang_domain_data = this.ui_lang_domain_data(this.is_fixed_domain)
      this.domain_specific_aspects = this.$_.cloneDeep(this.$_.get(ui_lang_domain_data, "users.profile.additional_aspects", []))
      // todo here call a function that assigns external conditions
    }
    this.reset_edit_values()
  },
  // todo this could help us to get the map location, but not sure where to get it in the lifecycle
  beforeRouteEnter(to, from, next) {
    next(vm => {
      if (from.fullPath === "/map?mode=m_mode_point") {
        vm.grab_map_selection = true
      }
    })
  },
  methods: {
    goto_top() {
      setTimeout(() => this.$vuetify.goTo("body", {
        duration: 300,
        easing: "easeOutCubic"
      }), 50)
    },
    // set_error(aspect_name, error) {
    //   this.$set(this.profile_aspects[aspect], error)
    // },
    reset_edit_values() {
      const user_data = this.$_.cloneDeep(this.user_data)
      for (let aspect of this.profile_aspects) {
        aspect.value = user_data[aspect.name]
      }

      this.email_aspects.email.value = this.user_data.email

      const no_domain_data = this.$_.get(user_data.config_share, "domain.no_domain")
      if (no_domain_data) {
        this.no_domain_values = no_domain_data
      }

      if (this.$_.get(user_data.config_share, `domain.${this.is_fixed_domain}`)) {
        const domain_values = user_data.config_share.domain[this.is_fixed_domain]
        for (let aspect of this.domain_specific_aspects) {
          // aspect.value = domain_values[aspect.name]
          this.domain_specific_aspects_values[aspect.name] = domain_values[aspect.name]
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
      const new_profile = extract_unpacked_values(this.profile_aspects)

      new_profile.domain = {}
      new_profile.domain.no_domain = this.no_domain_values

      if (this.is_fixed_domain) {
        new_profile.domain[this.is_fixed_domain] = this.domain_specific_aspects_values
      }
      this.$api.actor.post_me(new_profile).then(({data}) => {
        this.$store.commit(USER_SET_USER_DATA, data)
        this.persist_user_data()
        // this.setEdit(false)
        this.reset_edit_values()
        this.ok_snackbar("Profile updated")
        this.$router.back()
      }).catch((err) => {
        this.err_error_snackbar(err)
      })
    },
    change_email() {
      const new_email = extract_unpacked_values(this.email_aspects)
      this.email_update_loading = true
      this.$api.actor.change_email(new_email).then(({data}) => {
        this.email_edit = false;
        this.ok_snackbar(data.data)
        this.email_aspects.email.value = new_email.email
        // todo update user_data
        const user_data = this.$_.cloneDeep(this.user_data)
        user_data.email = new_email.email
        this.$store.commit(USER_SET_USER_DATA, user_data)
        this.persist_user_data()
        this.email_aspects.password.value = ""
      }, err => {
        this.err_error_snackbar(err)
      }).finally(() => {
        this.email_update_loading = false
      })
    },
    change_password() {
      const new_password = extract_unpacked_values(this.password_aspects)
      this.$api.actor.change_password(new_password).then(({data}) => {
        this.password_edit = false;
        this.ok_snackbar(this.$t("page.profile.msgs.password_changed"))
      }).catch((err) => {
        this.err_error_snackbar(err)
      })
    },
    profile_pic_added(image) {
      if (image.ok) { // check != undefined, which comes from the (not removable? clearable on the fileinput
        let formData = new FormData();
        formData.append('file', base64file_to_blob(image.meta.type, image.data))
        // formData.append("actor_in", JSON.stringify(extract_unpacked_values({no: 3})))
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
              console.log("CORS error probably ok", err)
            })
          })
          .catch((err) => {
            this.err_error_snackbar(err)
          }).finally(() => {
          this.profile_pic_upload_loading = false
        })
      }
    },
    // email && password

  },
  computed: {
    ...mapGetters({
      user_data: USER,
      own_entries_uuids: ENTRIES_GET_OWN_ENTRIES_UUIDS
    }),
    entry_search_config() {
      return [{name: 'actor', registered_name: this.registered_name},
        {name: "status", value: "draft", "source_name": "local"}
      ]
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
    aspect_mode() {
      return this.edit_mode ? EDIT : VIEW
    },
    is_visitor() {
      return this.$store.getters.is_visitor
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
    }
  },
  watch: {}
}
</script>

<style scoped>

</style>
