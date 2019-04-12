<template lang="pug">
  v-flex(xs12,sm8,md6)
    v-text-field(v-if="edit_mode", "outline", label="public name" v-model="edits.public_name")
    div(v-else) {{$store.state.user_data.public_name}}
    v-list
      v-subheader General

      v-list-tile(three-line)
        v-list-tile-content
          v-list-tile-title @{{$store.state.user_data.registered_name}}
          v-list-tile-sub-title username

        v-list-tile-action
          v-chip(outline disabled small) {{$store.state.user_data.global_role}}

      v-textarea(v-if="edit_mode", "outline", label="description" v-model="edits.description")
      v-list-tile(v-else)
        v-list-tile-content
          v-list-tile-title {{$store.state.user_data.description}}
          v-list-tile-sub-title Description

      v-text-field(v-if="edit_mode", "outline", label="location"  v-model="edits.location")
      v-list-tile(v-else)
        v-list-tile-content
          v-list-tile-title {{$store.state.user_data.location}}
          v-list-tile-sub-title Location

      v-divider
      v-subheader Interested topics
      Taglist(:tags="$store.state.user_data.interested_topics")

      v-divider

      v-tabs(v-model="selected_tab" v-if="!edit_mode")
        v-tab Entries
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

  import Taglist from "../components/Taglist.vue"

  let editable = [
    "public_name", "description", "location", "interested_topics"
  ];

  export default {
    name: "profile",
    components: {
      Taglist
    },
    validate({params}) {
      // Must be a number
      // console.log(params.profile);
      return true;
    },
    methods: {
      setEdit: function () {
        this.edit_mode = true;
        for (let value of editable) {
          this.edits[value] = this.$store.state.user_data[value];
        }
      },
      cancelEdit: function () {
        this.edit_mode = false;
      },
      doneEdit: function () {
        this.$axios.post("/update_profile", this.edits).then(({data}) => {
          console.log(data);
          if (data.status === "error") {
            this.errorMsg = data.msg
          } else if (data.status === true) {
            console.log("update ok", data.user_data);
            this.$store.commit("set_user_data", data.user_data);
            this.edit_mode = false;
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
        edits: {
          public_name: "",
          description: "",
          location: "",
          interested_topics: []
        }
      }
    }
  }
</script>

<style scoped>

</style>
