<template lang="pug">
  v-flex(xs12 sm8 md6)
    v-list
      v-list-tile(three-line)
        v-list-tile-content
          v-list-tile-title @{{$store.state.user.user_data.registered_name}}
          v-list-tile-sub-title username
        v-list-tile-action
          v-chip(outline disabled small) {{$store.state.user.user_data.global_role}}
      v-subheader General
      Aspect(:aspect="profile_aspects.public_name" :value.sync="edits.public_name" :edit="edit_mode" :mode="mode")
      Aspect(:aspect="profile_aspects.description" :value.sync="edits.description" :edit="edit_mode" :mode="mode")
      Aspect(:aspect="profile_aspects.location" :value.sync="edits.location" :edit="edit_mode" :mode="mode")
      v-divider
      //Taglist(:tags="$store.state.user.user_data.interested_topics")
      Aspect(:aspect="profile_aspects.interested_topics" :value.sync="edits.interested_topics" :edit="edit_mode" :mode="mode")
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

  let editable = [
    "public_name", "description", "location", "interested_topics"
  ];

  export default {
    name: "profile",
    components: {
      Aspect,
      Taglist
    },
    middleware(context) {
      console.log("profile-middleware", context)
      context.app.router.push("/visitor")
    },
    validate({params}) {
      // Must be a number
      // console.log(params.profile);
      return true;
    },
    created() {
      console.log("profile created")
      this.reset_edit_values()
    },
    methods: {
      reset_edit_values() {
        for (let value of editable) {
          // todo test if this is required
          if(value === "interested_topics") {
            this.edits[value] = {value: [...this.$store.state.user.user_data[value]]}
          } else {
            this.edits[value] = {value: this.$store.state.user.user_data[value]}
          }
        }
      },
      setEdit: function () {
        this.edit_mode = true
        /*  for (let value of editable) {
            this.edits[value] = this.$store.state.user.user_data[value];
          }*/
      },
      cancelEdit: function () {
        this.edit_mode = false;
        this.reset_edit_values()
      },
      raw_values() {
        return this.$_.mapValues(this.edits, (value) => {
          //console.log(k,this.edits[k])
          return value.value
        })
      },
      doneEdit: function () {
        console.log("posting", this.raw_values())
        this.$axios.post("/update_profile", this.raw_values()).then(({data}) => {
          if (!data.status) {
            this.errorMsg = data.msg
          } else if (data.status) {
            //console.log("update ok", data.user.user_data);
            this.$store.commit("user/set_user_data", data.result.user_data);
            this.edit_mode = false
          }
        }).catch((err) => {
          console.log("err", err)
        })
      }
    },
    data: function () {
      return {
        edit_mode: false,
        selected_tab: 0,
        profile_aspects: {
          public_name: {
            name: "public name",
            description: "",
            type: "str",
            attr: {
              max: 40
            }
          },
          description: {
            name: "Description",
            description: "",
            type: "str",
            attr: {
              max: 980
            }
          },
          location: {
            name: "Location",
            description: "main location",
            type: "str",
            attr: {
              max: 80
            }
          },
          interested_topics: {
            name: "Interested topics",
            description: "LICCIs you are interested in",
            type: "multiselect",
            items: "*liccis_flat",
            attr: {}
          }
        },
        edits: {
          public_name: {},
          description: {},
          location: {},
          interested_topics: {}
        }
      }
    },
    computed: {
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
