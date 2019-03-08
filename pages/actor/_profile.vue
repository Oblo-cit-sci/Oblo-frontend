<template lang="pug">
  v-flex(xs12,sm8,md6)

    v-text-field(v-if="edit_mode", "outline", label="public name")
    div(v-else) {{publicName}}
    v-list
      v-subheader General

      v-list-tile
        v-list-tile-content
          v-list-tile-title @{{name}}
          v-list-tile-sub-title username

      v-textarea(v-if="edit_mode", "outline", label="description")
      v-list-tile(v-else)
        v-list-tile-content
          v-list-tile-title {{description}}
          v-list-tile-sub-title Description

      v-text-field(v-if="edit_mode", "outline", label="location")
      v-list-tile(v-else)
        v-list-tile-content
          v-list-tile-title {{location}}
          v-list-tile-sub-title Location

      v-divider
      v-subheader Interested topics

      v-chip(v-for="topic in interested_topics" :key="topic") {{topic}}
        v-icon star

      v-divider

      v-tabs(v-model="selected_tab")
        v-tab Entries
        v-tab follows
        v-tab following
        v-tab Groups

    div(v-if="personal")
      v-btn(color="info" @click="setEdit") Edit
</template>
<script>

  export default {
    name: "profile",
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
        this.edit_mode = !this.edit_mode;
      }
    },
    data: function () {
      return {
        edit_mode: false,
        selected_tab: 0,
        personal: this.is_personal(),
        name: "ramin",
        "publicName": "ramin",
        description: "the only hacker around. Comes and say HI!",
        location: "Barcelona, Spain",
        "interestedTopics": [],
        enries: [],
        following: [],
        followers: [],
        groups: [],
        roles: [],
        organizations: [],
        settings: {},
        interested_topics: ["Climate", "Open Science", "Critical Engineering", "Eastern Philosophy"]
      }
    }
  }
</script>

<style scoped>

</style>
