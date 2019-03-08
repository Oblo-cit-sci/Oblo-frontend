<template lang="pug">
  v-flex(xs12,sm8,md6)

    v-text-field(v-if="edit_mode", "outline", label="public name" v-model="edits.public_name")
    div(v-else) {{profile.public_name}}
    v-list
      v-subheader General

      v-list-tile
        v-list-tile-content
          v-list-tile-title @{{profile.username}}
          v-list-tile-sub-title username

      v-textarea(v-if="edit_mode", "outline", label="description" v-model="edits.description")
      v-list-tile(v-else)
        v-list-tile-content
          v-list-tile-title {{profile.description}}
          v-list-tile-sub-title Description

      v-text-field(v-if="edit_mode", "outline", label="location"  v-model="edits.location")
      v-list-tile(v-else)
        v-list-tile-content
          v-list-tile-title {{profile.location}}
          v-list-tile-sub-title Location

      v-divider
      v-subheader Interested topics
      Taglist(:tags="profile.interested_topics")

      v-divider

      v-tabs(v-model="selected_tab" v-if="!edit_mode")
        v-tab Entries
        v-tab follows
        v-tab following
        v-tab Groups
        v-tab Roles

    div(v-if="personal")

      v-btn(v-if="!edit_mode" color="info" @click="setEdit") Edit
      div(v-else)
        v-btn(color="warning" @click="cancelEdit") Cancel
        v-btn(color="success" @click="doneEdit") Save

</template>

<script>

  import Taglist from "../../components/Taglist.vue"

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
      is_personal: function () {
        //console.log(this.$root._route.params.profile);
        // console.log(this.$store.state.user.username);

        return this.$route.params.profile === this.$store.state.user.username;
        // console.log(this.$root._route.params.profile);
      },
      setEdit: function () {
        this.edit_mode = true;

        for(let value of editable) {
          this.edits[value] = this.profile[value];
        }
      },
      cancelEdit: function () {
        this.edit_mode = false;
      },
      doneEdit: function () {
        this.edit_mode = false;
        for(let value of editable) {
          this.profile[value] = this.edits[value];
        }
      }
    },
    data: function () {
      return {
        edit_mode: false,
        selected_tab: 0,
        personal: this.is_personal(),
        profile: {
          username: "ramin",
          public_name: "ramin- the dev",
          description: "the only hacker around. Comes and say HI!",
          location: "Barcelona, Spain",
          entries: [],
          following: [],
          followers: [],
          groups: [],
          roles: [],
          organizations: [],
          settings: [],
          interested_topics: [
            {name: "Climate", icon: "star"},
            {name: "Open Science", icon: "room"},
            {name: "Critical Engineering", icon: "settings"},
            {name: "Eastern Philosophy", icon: "search"}],
        },
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
