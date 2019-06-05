<template lang="pug">
  v-flex(xs12 sm8 md6)
    Aspect(:aspect="profile_aspects.public_name" :value.sync="edits.public_name" :edit="edit_mode")
    v-list
      v-subheader General
      v-list-tile(three-line)
        v-list-tile-content
          v-list-tile-title @{{$store.state.user.user_data.registered_name}}
          v-list-tile-sub-title username
        v-list-tile-action
          v-chip(outline disabled small) {{$store.state.user.user_data.global_role}}
      Aspect(:aspect="profile_aspects.description" :value.sync="edits.description" :edit="edit_mode")
      Aspect(:aspect="profile_aspects.location" :value.sync="edits.location" :edit="edit_mode")
      v-divider
      v-subheader Interested topics
      Taglist(:tags="$store.state.user.user_data.interested_topics")
      v-divider
      v-tabs(v-model="selected_tab" v-if="!edit_mode")
        v-tab follows
        v-tab following
        v-tab Groups
        v-tab Roles
    v-btn(v-if="!edit_mode" color="info" @click="setEdit") Edit
    div(v-else)
      v-btn(color="warning" @click="cancelEdit") Cancel
      v-btn(color="success" @click="doneEdit") Save

</template>

<script>

  // needs a server reroute plugin or module, that reroutes visitors back to index

  import Taglist from "../components/Taglist.vue"
  import Aspect from "../components/Aspect";

  let editable = [
    "public_name", "description", "location", "interested_topics"
  ];

  export default {
    name: "profile",
    components: {
      Aspect,
      Taglist
    },
    validate({params}) {
      // Must be a number
      // console.log(params.profile);
      return true;
    },
    created() {
      this.reset_edit_values()
    },
    methods: {
      reset_edit_values() {
        for (let value of editable) {
          this.edits[value] = {value: this.$store.state.user.user_data[value]}
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
        console.log("posting")
        this.$axios.post("/update_profile", this.raw_values()).then(({data}) => {
          console.log(data);
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
            name: "description",
            description: "",
            type: "str",
            attr: {
              max: 980
            }
          },
          location: {
            name: "location",
            description: "main location",
            type: "str",
            attr: {
              max: 80
            }
          }
        },
        edits: {
          public_name: {},
          description: {},
          location: {},
          interested_topics: {}
        }
      }
    }
  }
</script>

<style scoped>

</style>
