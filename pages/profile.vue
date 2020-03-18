<template lang="pug">
  v-flex(xs12 sm10 md10)
    v-row
      v-col
        div Username: {{$store.state.user.user_data.registered_name}}
        v-chip(outlined disabled small) {{$store.state.user.user_data.global_role}}
      v-col
        v-row
          v-img(:src="avatar" max-height=200 contain)
        v-row(style="margin-top:-10%" v-if="edit_mode")
          v-col(offset=7)
            <!--              v-btn(-->
            <!--              color="#d0b482D8"-->
            <!--              class="white&#45;&#45;text"-->
            <!--              fab-->
            <!--              top)-->
            <!--                v-icon mdi-camera-->
            LoadFileButton(:btn_props="{fab:true}" label="" btn_icon="mdi-camera")
    h2 General information
    v-row(v-for="aspect in profile_aspects" :key="aspect.name")
      v-col(cols=10)
        Aspect(:aspect="aspect" :ext_value.sync="aspect.value" :edit="edit_mode" :mode="mode")
    v-file-input(
      v-if="edit_mode"
      label="Avatar"
      accept="image/png, image/jpeg, image/bmp"
      @change="avatar_added($event)"
      prepend-icon="mdi-camera")
      //Taglist(:tags="$store.state.user.user_data.interested_topics")
      <!--      Aspect(:aspect="profile_aspects.interested_topics" :value.sync="profile_aspects.interested_topics.value" :edit="edit_mode" :mode="mode")-->
      //v-tabs(v-model="selected_tab" v-if="!edit_mode")
        //v-tab follows
        //v-tab following
        //v-tab Groups
        //v-tab Roles
    div(v-if="!visitor")
      v-btn(v-if="!edit_mode" color="info" @click="setEdit") Edit profile
      div(v-else)
        v-btn(color="warning" @click="cancelEdit") Cancel
        v-btn(color="success" @click="doneEdit") Save
    div(v-if="!edit_mode")
      v-divider.wide_divider
      h2 Your Entries
      EntryPreviewList(:entries="own_entries_uuids" :total_count="own_entries_uuids.length")
</template>

<script>

  // needs a server reroute plugin or module, that reroutes visitors back to index

  import Taglist from "../components/Taglist.vue"
  import Aspect from "../components/Aspect";
  import {EDIT, VIEW} from "../lib/consts";
  import {USER_GET_USER_DATA, USER_SET_USER_DATA} from "../lib/store_consts";

  import {mapGetters} from "vuex"
  import {extract_unpacked_values} from "../lib/aspect";
  import PersistentStorageMixin from "../components/PersistentStorageMixin";
  import EntryPreviewList from "../components/EntryPreviewList";

  import {ENTRIES_GET_OWN_ENTRIES_UUIDS} from "../store/entries";
  import {license_aspect, privacy_aspect} from "../lib/typical_aspects";
  import LoadFileButton from "../components/LoadFileButton";
  import FileLoadMixin from "../components/FileLoadMixin";

  export default {
    name: "profile",
    components: {
      EntryPreviewList,
      LoadFileButton,
      Aspect,
      Taglist
    },
    mixins: [PersistentStorageMixin, FileLoadMixin],
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
      reset_edit_values() {
        const user_data = this.$_.cloneDeep(this.user_data)
        for (let aspect of this.profile_aspects) {
          aspect.value = user_data[aspect.name]
        }
      },
      setEdit: function () {
        this.edit_mode = true
      },
      cancelEdit: function () {
        this.edit_mode = false;
        this.reset_edit_values()
      },
      doneEdit: function () {
        const new_profile = extract_unpacked_values(this.profile_aspects)
        this.$api.post_actor__me(new_profile).then(({data}) => {
          this.$store.commit(USER_SET_USER_DATA, data)
          this.persist_user_data()
          this.edit_mode = false;
          this.reset_edit_values()
        }).catch((err) => {
          console.log("err", err)
        })
      },
      avatar_added(image) {
        if (image) { // check != undefined, which comes from the (not removable? clearable on the fileinput
          let formData = new FormData();
          formData.append('file', image)
          // for(let a of formData.values()) {
          //   console.log(a)
          // }
          // this.$api.post_actor__avatar(formData)
          //   .then(function () {
          //     console.log('SUCCESS!!');
          //   })
          //   .catch(function () {
          //     console.log('FAILURE!!');
          //   });


          formData.append("actor_in", JSON.stringify(extract_unpacked_values({no: 3})))
          this.$api.post_actor__form_test(formData)
            .then(function () {
              console.log('SUCCESS!!');
            })
            .catch(function () {
              console.log('FAILURE!!');
            });
        }
      }
    },
    data: function () {
      return {
        grab_map_selection: false, // when coming back from the map
        edit_mode: false,
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
          {
            name: "Interested topics",
            description: "LICCIs you are interested in",
            type: "multiselect",
            items: ["empty upsi"],
            attr: {
              unpacked: true
            },
            value: []
          },
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
        ]
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
      avatar() {
        return this.$api.url_actor__$registered_name__avatar(this.user_data.registered_name)
      }
    }
  }
</script>

<style scoped>

</style>
