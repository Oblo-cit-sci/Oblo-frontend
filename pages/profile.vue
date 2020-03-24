<template lang="pug">
  v-flex#top(xs12 sm10 md10)
    v-row
      v-col
        div Username: {{$store.state.user.user_data.registered_name}}
        v-chip(outlined disabled small) {{$store.state.user.user_data.global_role}}
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
              @fileload="profile_pic_added($event)")
    h2 General information
    v-row(v-for="aspect in profile_aspects" :key="aspect.name")
      v-col(cols=10)
        Aspect(:aspect="aspect" :ext_value.sync="aspect.value" :edit="edit_mode" :mode="mode")
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
      v-btn(v-if="password_edit" color="success" @click="change_password") Save password
      v-divider.wide_divider
    div(v-if="!visitor")
      v-btn(v-if="!edit_mode" color="info" @click="setEdit") Edit profile
      div(v-else)
        v-btn(@click="cancelEdit") Cancel
        v-btn(color="success" @click="doneEdit") Save
    div(v-if="!edit_mode")
      v-divider.wide_divider
      h2 Your Entries
      EntryPreviewList(:entries="own_entries_uuids" :total_count="own_entries_uuids.length")
</template>

<script>

  // needs a server reroute plugin or module, that reroutes visitors back to index

  import goTo from 'vuetify/lib/services/goto'

  import Taglist from "../components/Taglist.vue"
  import Aspect from "../components/Aspect";
  import {EDIT, VIEW} from "../lib/consts";
  import {USER_SET_USER_DATA} from "../lib/store_consts";

  import {mapGetters} from "vuex"
  import {extract_unpacked_values} from "../lib/aspect";
  import PersistentStorageMixin from "../components/PersistentStorageMixin";
  import EntryPreviewList from "../components/EntryPreviewList";

  import {ENTRIES_GET_OWN_ENTRIES_UUIDS} from "../store/entries";
  import {license_aspect, password_aspect, password_confirm_aspect, privacy_aspect} from "../lib/typical_aspects";
  import LoadFileButton from "../components/LoadFileButton";
  import {base64file_to_blob} from "../lib/util";
  import TriggerSnackbarMixin from "../components/TriggerSnackbarMixin";
  import {USER_GET_USER_DATA} from "../store";

  export default {
    name: "profile",
    components: {
      EntryPreviewList,
      LoadFileButton,
      Aspect,
      Taglist
    },
    mixins: [PersistentStorageMixin, TriggerSnackbarMixin],
    data: function () {
      return {
        profile_pic_upload_loading: false,
        profile_version_ts: Math.floor(new Date().getTime()/1000),
        grab_map_selection: false, // when coming back from the map
        edit_mode: false,
        password_edit: false,
        selected_tab: 0,
        profile_aspects: [
          {
            name: "public_name",
            label: "Public name",
            description: "",
            type: "str",
            attr: {
              max: 40,
              unpacked: true
            },
            value: ""
          },
          {
            name: "description",
            label: "Description",
            description: "",
            type: "str",
            attr: {
              max: 980,
              unpacked: true
            },
            value: ""
          },
          {
            name: "location",
            label: "Location",
            description: "main location",
            type: "location",
            attr: {
              max: 80,
              unpacked: true,
              input: ["search"]
            },
            value: null
          },
          // {
          //   name: "Interested topics",
          //   description: "LICCIs you are interested in",
          //   type: "multiselect",
          //   items: ["empty upsi"],
          //   attr: {
          //     unpacked: true
          //   },
          //   value: []
          // },
          {
            name: "email",
            label: "Email address",
            description: "",
            type: "str",
            attr: {
              max: 90,
              unpacked: true,
              extra: {
                rules: [
                  v => !!v || 'E-mail is required',
                  v => /.+@.+\..+/.test(v) || 'E-mail must be valid'
                ]
              }
            },
            value: ""
          },
          Object.assign(privacy_aspect(),
            {name: "default_privacy", label:"Default privacy", description: "Choose a default privacy for all your entries"}),
          Object.assign(license_aspect(this.$store, ["cc_licenses"]),
            {name: "default_license", label:"Default License", description: "Choose a default license for your entries"})
        ],
        password_aspects: {
          actual_password: Object.assign(this.$_.cloneDeep(password_aspect()),{name:"actual_password", label: "Actual password"}),
          password: this.$_.cloneDeep(password_aspect()),
          password_confirm: this.$_.merge(this.$_.cloneDeep(password_confirm_aspect()), {attr: {extra:{rules: [
                  v => v === this.password_aspects.password.value || "Passwords do not match"
                ]}}}),
        }
      }
    },
    created() {
      this.reset_edit_values()
    },
    // todo this could help us to get the map location, but not sure where to get it in the lifecycle
    beforeRouteEnter(to, from, next) {
      next(vm => {
        if(from.fullPath === "/map?mode=m_mode_point") {
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
        }),50)
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
        }).catch((err) => {
          console.log("err", err)
          this.error_snackbar("Something went wrong")
        }).finally(() => {
          this.goto_top()
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
              this.profile_version_ts= Math.floor(new Date().getTime()/1000)
            })
            .catch(function () {
              this.ok_snackbar("Something went wrong")
            }).finally(() => {
            this.profile_pic_upload_loading = false
          })
        }
      }
    },
    computed: {
      ...mapGetters({user_data: USER_GET_USER_DATA, own_entries_uuids: ENTRIES_GET_OWN_ENTRIES_UUIDS}),
      mode() {
        return this.edit_mode ? EDIT : VIEW
      },
      visitor() {
        return this.$store.getters.visitor
      },
      profile_pic() {
        return this.$api.url_actor__$registered_name__profile_pic(this.user_data.registered_name) + "?q=" + this.profile_version_ts
      }
    }
  }
</script>

<style scoped>

</style>
