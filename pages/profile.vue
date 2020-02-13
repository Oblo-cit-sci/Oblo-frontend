<template lang="pug">
  v-flex(xs12 sm8 md6)
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
        :rules="avatar_rules"
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

  export default {
    name: "profile",
    components: {
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
      // raw_values() {
      //   return this.$_.mapValues(this.edits, (value) => {
      //     //console.log(k,this.edits[k])
      //     return value.value
      //   })
      // },
      doneEdit: function () {
        console.log("posting", this.profile_aspects)
        const new_profile = extract_unpacked_values(this.profile_aspects)
        this.$axios.post("/actor/me", new_profile).then(({data}) => {
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
        console.log(image)
        let formData = new FormData();
        formData.append('file', image);
        this.$axios.post( '/single-file',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        ).then(function(){
          console.log('SUCCESS!!');
        })
          .catch(function(){
            console.log('FAILURE!!');
          });

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
          }]
      }
    },
    computed: {
      ...mapGetters({user_data: USER_GET_USER_DATA}),
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
