<template lang="pug">
  v-flex(xs12,sm8,md6)

    div {{publicName}}
    v-list
      v-subheader General
      v-list-tile
        v-list-tile-content
          v-list-tile-title @{{name}}
          v-list-tile-sub-title username

      v-list-tile
        v-list-tile-content
          v-list-tile-title {{description}}
          v-list-tile-sub-title Description

      v-list-tile
        v-list-tile-content
          v-list-tile-title {{location}}
          v-list-tile-sub-title Location
      v-divider

      v-list-tile
        v-list-tile-content
          v-list-tile-title
            v-chip(v-for="topic in interested_topics" :key="topic") {{topic}}
              v-icon star
          v-list-tile-sub-title Interested topics
      v-divider
    div(v-if=personal)
      v-btn(color="info") Edit
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
      }
    },
    data: function () {
      return {
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
        interested_topics: ["Climate"]
      }
    }
  }
</script>

<style scoped>

</style>
