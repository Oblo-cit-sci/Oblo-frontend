<template>
  <div>
    <div v-for="a in actions" :key="a.title">
      <v-btn color="info" :to="'/CreateEntry?type=' + a.site">{{a.title}}</v-btn>
    </div>
  </div>
</template>

<script>

  import Site from '../lib/licci/site.js'
  import Village from '../lib/licci/village.js'
  import Admin from '../lib/licci/admin.js'
  import Editor from '../lib/licci/editor.js'
  import User from '../lib/licci/user.js'
  import Investigator from '../lib/licci/investigator.js'

  const role_classes = {
    "admin": Admin,
    "editor": Editor,
    "user": User
  };

  const all_types = {
    "site": Site,
    "village": Village,
    "investigator": Investigator
  };

  export default {
    name: "CreateEntry",
    async fetch({store, params}) {
      console.log(store.state.counter)
    },
    created() {
      // console.log("created");
    },
    methods: {
      actions_from(obj) {
        //console.log(obj);
        let actions = obj.actions;
        // console.log(obj);
        let action_btns = [];
        for(let a of actions) {
          console.log("*",a, all_types[a]);
          action_btns.push({
            "title": this.$store.state.ui_text[all_types[a].title],
            "site": a
          })
        }
        return action_btns
      }
    },
    data() {

      // console.log(this.$store);
      // console.log()

      let sel_type = this.$root._route.query.type;
      let action_btns = [];
      if(!sel_type) {
        console.log("using role default options");
        action_btns = this.actions_from(role_classes[this.$store.state.global_role]);
      }

      console.log("final", action_btns);
      // check if by a query param heck, user creates something they are not allowed
      return {
        "sel_type": sel_type,
        "sel_options": [
          "village"
        ],
        actions: action_btns
      }
    }
  }
</script>

<style scoped>


</style>
