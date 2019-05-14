<template lang="pug">
  div
    Selector(v-bind:options="users", v-on:selection="selection" :min=1 :max=1)
</template>

<script>
  import Selector from "../Selector";
  import AspectMixin from "./AspectMixin";
  import {create_options} from "../../lib/common"
  import Title_Description from "../Title_Description";

  // Title_Description(:="title_description()")
  export default {
    name: "SelectUser",
    mixins: [AspectMixin],
    components: {Title_Description, Selector},
    computed: {
      users() {
        let users = [];
        //console.log("SelectUser, i store", this.$store.state.related_users);
        // TODO remove oneself from that list
        for (let u of this.$store.state.related_users) {
          // a list of lists (registered_name & public_name)
          let registered_name = u[0];
          let public_name = u[1];
          if(this.$store.state.user_data.registered_name === registered_name)
            continue;
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
    },
    methods: {
      selection(item) {
        console.log("user selection", item);
        this.i_value = item;
        this.$emit("update:value", this.i_value);
      },
    }

  }
</script>

<style scoped>

</style>
