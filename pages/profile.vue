<template lang="pug">
  v-flex#top(xs12 sm10 md10)
    v-row
      v-col
        div {{$t("_global.asp_username.label")}}: {{user_data.registered_name}}
        v-chip(outlined disabled small) {{user_data.global_role}}
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
    h2 {{$t('profile.h1')}}
    v-row(v-for="aspect in profile_aspects" :key="aspect.name")
      v-col(cols=10)
        Aspect(:aspect="aspect"
          :ext_value.sync="aspect.value"
          @update:error="aspect.error = $event"
          :mode="mode")
    div(v-if="edit_mode")
      h3 Password
      v-btn(color="warning" v-if="!password_edit" @click="password_edit=true") Change password
      div(v-if="password_edit")
        v-row(v-for="a of password_aspects" :key="a.name")
          v-col(cols=10)
            Aspect(
              :aspect="a"
              :ext_value.sync="a.value"
              @update:error="a.error = $event"
              :extra="{clearable:false}"
              mode="edit")
      v-btn(v-if="password_edit" @click="password_edit=false") Cancel
      v-btn(v-if="password_edit" color="success" @click="change_password" :disabled="any_password_invalid") Save password
      v-divider.wide_divider
    div(v-if="!is_visitor")
      v-btn(v-if="!edit_mode" to="/settings" nuxt) Settings
      v-btn(v-if="!edit_mode" color="info" @click="setEdit") Edit profile
      div(v-else)
        v-btn(@click="cancelEdit") Cancel
        v-btn(color="success" @click="doneEdit" :disabled="any_invalid") Save
      v-btn(v-if="!edit_mode" color="error" to="/basic/delete_account") Delete account
    div(v-if="!edit_mode")
      v-divider.wide_divider
      h2 Your Entries
      EntryListWrapper(
        :wait="waiting"
        :style="main_container_width_style"
        :init_request="true"
        :configuration="{required:[{name:'actor', registered_name:user_data.registered_name}]}")
</template>

<script>

  // needs a server reroute plugin or module, that reroutes visitors back to index

  import goTo from 'vuetify/lib/services/goto'

  import Taglist from "../components/global/Taglist.vue"
  import Aspect from "../components/Aspect";
  import {EDIT, USER, VIEW} from "~/lib/consts";

  import {mapGetters} from "vuex"
  import {extract_unpacked_values} from "~/lib/aspect";
  import PersistentStorageMixin from "../components/util/PersistentStorageMixin";
  import EntryPreviewList from "../components/entry/EntryPreviewList";

  import {ENTRIES_GET_OWN_ENTRIES_UUIDS} from "~/store/entries";
  import {license_aspect, privacy_aspect} from "~/lib/typical_aspects";
  import LoadFileButton from "../components/util/LoadFileButton";
  import {base64file_to_blob, common_filesize} from "~/lib/util";
  import TriggerSnackbarMixin from "../components/TriggerSnackbarMixin";
  import {USER_SET_USER_DATA} from "~/store/user";
  import EntryListWrapper from "../components/EntryListWrapper"
  import LayoutMixin from "~/components/global/LayoutMixin"
  import TypicalAspectMixin from "~/components/aspect_utils/TypicalAspectMixin"

  export default {
    name: "profile",
    components: {
      EntryListWrapper,
      EntryPreviewList,
      LoadFileButton,
      Aspect,
      Taglist
    },
    mixins: [PersistentStorageMixin, TriggerSnackbarMixin, LayoutMixin, TypicalAspectMixin],
    data() {
      const new_pwd = this.password("new")
      return {
        profile_pic_upload_loading: false,
        profile_version_ts: Math.floor(new Date().getTime() / 1000),
        grab_map_selection: false, // when coming back from the map
        edit_mode: false,
        password_edit: false,
        selected_tab: 0,
        profile_aspects: [
          {
            name: "public_name",
            label: this.$t("profile.asp_public_name"),
            description: "",
            type: "str",
            attr: {
              max: 30,
              unpacked: true,
              extra: {
                rules: [
                  v => v && v.length >= 2 || 'Public name must have at 2 characters',
                  v => v && v.length <= 30 || 'Public name can have at most 30 characters',
                ]
              }
            },
            value: "",
            error: false
          },
          {
            name: "description",
            label: this.$t("profile.asp_description"),
            description: "Write something about yourself and about your background",
            type: "str",
            attr: {
              max: 980,
              unpacked: true
            },
            value: ""
          },
          // {
          //   name: "location",
          //   label: "Location",
          //   description: "Where are you based?",
          //   type: "location",
          //   attr: {
          //     max: 80,
          //     unpacked: true,
          //     input: ["search"]
          //   },
          //   value: null
          // },
          this.email(),
          Object.assign(privacy_aspect(),
            {
              name: "default_privacy",
              label: this.$("_global.asp_default_privacy.label"),
              description: this.$("_global.asp_default_privacy.descr")
            }),
          Object.assign(license_aspect(this.$store, ["cc_licenses"]),
            {
              name: "default_license",
              label: this.$("_global.asp_default_license.label"),
              description: this.$("_global.asp_default_license.descr")
            })
        ],
        password_aspects: {
          actual_password: this.password("current"),
          password: new_pwd,
          password_confirm: this.password_confirm(new_pwd, "new")
        },
        waiting: false,
      }
    },
    created() {
      this.reset_edit_values()
    },
    // todo this could help us to get the map location, but not sure where to get it in the lifecycle
    beforeRouteEnter(to, from, next) {
      next(vm => {
        if (from.fullPath === "/map?mode=m_mode_point") {
          console.log("MAP!")
          vm.grab_map_selection = true
        }
      })
    },
    methods: {
      goto_top() {
        setTimeout(() => goTo("body", {
          duration: 300,
          easing: "easeOutCubic"
        }), 50)
      },
      reset_edit_values() {
        const user_data = this.$_.cloneDeep(this.user_data)
        for (let aspect of this.profile_aspects) {
          aspect.value = user_data[aspect.name]
        }
      },
      setEdit: function () {
        this.edit_mode = true
        this.goto_top()
      },
      cancelEdit: function () {
        this.edit_mode = false;
        this.reset_edit_values()
        this.goto_top()
      },
      doneEdit: function () {
        const new_profile = extract_unpacked_values(this.profile_aspects)
        this.$api.post_actor__me(new_profile).then(({data}) => {
          this.$store.commit(USER_SET_USER_DATA, data)
          this.persist_user_data()
          this.edit_mode = false;
          this.reset_edit_values()
          this.ok_snackbar("Profile updated")
        }).catch((err) => {
          console.log("err", err)
          this.error_snackbar("Something went wrong")
        }).finally(() => {
          this.goto_top()
        })
      },
      change_password() {
        const new_password = extract_unpacked_values(this.password_aspects)
        this.$api.post_actor__change_password(new_password).then(({data}) => {
          this.password_edit = false;
          this.ok_snackbar("Password updated")
          this.goto_top()
        }).catch((err) => {
          console.log("err", err)
          const msg = this.$_.get(err.response, "data.error.msg", "Something went wrong")
          this.error_snackbar(msg)
        })
      },
      profile_pic_added(image) {
        if (image.ok) { // check != undefined, which comes from the (not removable? clearable on the fileinput
          let formData = new FormData();
          formData.append('file', base64file_to_blob(image.meta.type, image.data))
          // formData.append("actor_in", JSON.stringify(extract_unpacked_values({no: 3})))
          this.profile_pic_upload_loading = true
          this.$api.post_profile_pic(formData)
            .then(() => {
              // request the avatar to refill the browser cache
              this.profile_version_ts = Math.floor(new Date().getTime() / 1000)
              this.$axios.get(this.$api.url_actor__$registered_name__avatar(this.user_data.registered_name), {
                withCredentials: false,
                headers: {
                  "accept": "image/jpeg"
                }
              }).catch(err => {
                console.log("CORS error probably ok")
              })
            })
            .catch(() => {
              this.error_snackbar("Something went wrong")
            }).finally(() => {
            this.profile_pic_upload_loading = false
          })
        }
      }
    },
    computed: {
      ...mapGetters({user_data: USER, own_entries_uuids: ENTRIES_GET_OWN_ENTRIES_UUIDS}),
      mode() {
        return this.edit_mode ? EDIT : VIEW
      },
      is_visitor() {
        return this.$store.getters.is_visitor
      },
      profile_pic() {
        return this.$api.url_actor__$registered_name__profile_pic(this.user_data.registered_name) + "?q=" + this.profile_version_ts
      },
      any_password_invalid() {
        return this.$_.some(this.password_aspects, (a) => a.hasOwnProperty("error") && a.error)
      },
      profile_pic_max_size() {
        return common_filesize(5, "MB")
      },
      any_invalid() {
        return this.$_.some(this.profile_aspects, (a) => a.hasOwnProperty("error") && a.error)
      }
    }
  }
</script>

<style scoped>

</style>
