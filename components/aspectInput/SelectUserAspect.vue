<template lang="pug">
  div
    SingleSelect(:options="users" :selection.sync="i_value")
</template>

<script>
  import AspectMixin from "./AspectMixin";
  import Title_Description from "../Title_Description";
  import SingleSelect from "../SingleSelect";

  // Title_Description(:="title_description()")
  export default {
    name: "SelectUserAspect",
    mixins: [AspectMixin],
    components: {SingleSelect, Title_Description},
    computed: {
      users() {
        console.log("making users...")
        let users = [];
        //console.log("SelectUser, i store", this.$store.state.related_users);
        // TODO remove oneself from that list
        for (let u of this.$store.state.related_users) {
          // is it me?
          let registered_name = u[0];
          let public_name = u[1];
          if(this.$store.state.user.user_data.registered_name === registered_name) {
            continue;
          }

          users.push({
            text: public_name,
            value: registered_name
          });
        }
        //console.log(users)
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
