<template lang="pug">
  v-flex(xs12 sm10)
    v-list
      v-list-item(three-line)
        v-list-item-content
          v-list-item-title @{{$store.state.user.user_data.registered_name}}
          v-list-item-subtitle username
        v-list-item-action
          v-chip(outlined disabled small) {{$store.state.user.user_data.global_role}}
      v-subheader General information
      Aspect(v-for="aspect in profile_aspects" :key="aspect.name" :aspect="aspect" :ext_value.sync="aspect.value" :edit="edit_mode" :mode="mode")
      v-file-input(
        v-if="edit_mode"
        label="Avatar"
        accept="image/png, image/jpeg, image/bmp"
        @change="avatar_added($event)"
        prepend-icon="mdi-camera")
      v-divider

      //Taglist(:tags="$store.state.user.user_data.interested_topics")
      <!--      Aspect(:aspect="profile_aspects.interested_topics" :value.sync="profile_aspects.interested_topics.value" :edit="edit_mode" :mode="mode")-->
      v-divider
      //v-tabs(v-model="selected_tab" v-if="!edit_mode")
        //v-tab follows
        //v-tab following
        //v-tab Groups
        //v-tab Roles
    div(v-if="!visitor")
      v-btn(v-if="!edit_mode" color="info" @click="setEdit") Edit
      div(v-else)
        v-btn(color="warning" @click="cancelEdit") Cancel
        v-btn(color="success" @click="doneEdit") Save
    v-divider
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

  export default {
    name: "profile",
    components: {
      EntryPreviewList,
      Aspect,
      Taglist
    },
    mixins: [PersistentStorageMixin],
    created() {
      console.log("profile created")
      this.reset_edit_values()
    },
    methods: {
      reset_edit_values() {
        const user_data = this.$_.cloneDeep(this.user_data)
        for (let aspect of this.profile_aspects) {
          if (aspect.name === "interested_topics") {
            aspect.value = [...user_data[aspect.name]]
          } else {
            aspect.value = user_data[aspect.name]
          }
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
        console.log(new_profile)
        this.$api.post_actor__me(new_profile).then(({data}) => {
          console.log(data)
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
            type: "str",
            attr: {
              max: 80,
              unpacked: true
            },
            value: ""
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
            {name: "default_privacy", description: "Choose a default privacy for all your entries"}),
          Object.assign(license_aspect(this.$store, ["cc_licenses"]),
            {name: "default_license", description: "Choose a default license for your entries"})
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
      }
    }
  }
</script>

<style scoped>

</style>
