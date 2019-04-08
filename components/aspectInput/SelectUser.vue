<template lang="pug">
  div
    Selector(v-bind:options="users", v-bind:selection.sync="selection")
</template>

<script>
  import Selector from "../Selector";
  import {create_options} from "../../lib/common"

  export default {
    name: "SelectUser",
    components: {Selector},
    data() {
      return {
        pref_users: ["cool"],
        selection: null
      }
    },
    computed: {
      users() {
        let users = [];
        console.log("SelectUser, i store", this.$store.state.related_users);
        for (let u of this.$store.state.related_users) {
          // a list of lists (registered_name & public_name)
          let registered_name = u[0];
          let public_name = u[1];
          users.push(create_options({
            title: registered_name,
            slug: registered_name
          }));
          if (public_name !== registered_name) {
              users.push(create_options({
                title: public_name,
                slug: registered_name
              }));
          }
        }
        return users;
      }
    }
  }
</script>

<style scoped>

</style>
