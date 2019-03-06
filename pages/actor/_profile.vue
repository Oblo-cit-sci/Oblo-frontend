<template lang="pug">
  v-flex(xs12,sm8,md6)
    div {{publicName}}
    v-list
      v-list-tile
        v-list-tile-content Username
        v-list-tile-content {{name}}

      v-list-tile
        v-list-tile-content Description
        v-list-tile-content {{description}}
      v-list-tile
        v-list-tile-content Location
        v-list-tile-content {{location}}
    div(v-if=personal)
      v-btn(color="info") Edit
</template>
<script>

  /*



    <div v-if="personal">
      Your profile
    </div>
  </v-flex>

   */

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
        console.log("+++", this.$route);
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
        settings: {}
      }
    }
  }
</script>

<style scoped>

</style>
