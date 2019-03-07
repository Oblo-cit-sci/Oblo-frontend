<template lang="pug">
  v-layout(column='' justify-center='' align-center='')
    v-flex(xs12='' sm8='' md6='')
      div(v-if='selected_type!==null')
        v-btn(color='warning' @click='select_back') back
        v-btn(v-if='!create_entry' color='success' @click='show_create') create {{selected_type}}
      div(v-if='!create_entry')
        div(v-for='a in actions' :key='a.title')
          v-btn(color='info' @click='select(a.site)') {{a.title}}
      div(v-show='create_entry')
        FormSchema.form(ref='formSchema' v-model='model' @submit.prevent='')
        .buttons
          v-btn(color='info' @click='cancel_create') cancel
          v-btn(color='info' @click='create') create
</template>

<script>

  import BasicTypes from '../lib/licci/all.js'
  import Translate from '../lib/licci/translations.js'
  import Definitions from '../lib/licci/definitions.js'


  import FormSchema from '../lib/formschema/FormSchema.js'

  // failed try to import eerything from a folder...
  // import t from '../lib/licci_c'

  //

  const role_classes = {
    "admin": BasicTypes.admin,
    "editor": BasicTypes.editor,
    "user": BasicTypes.user
  };

  export default {
    name: "CreateEntry",
    async fetch({store, params}) {

    },
    created() {
      // console.log("created");
    },
    methods: {
      select_back() {
        this.selected_type = this.last_selected.pop();
        this.cancel_create();
      },
      actions_from(obj) {
        //console.log(obj);
        let actions = obj.actions;
        // console.log(obj);
        let action_btns = [];
        for(let a of actions) {
          // console.log("*",a, BasicTypes[a]);
          if(!BasicTypes.hasOwnProperty(a)) {
            console.log(a, "is not defined in all.js. - SKIPPING");
            continue;
          }
          action_btns.push({
            // TODO robust translation with fallback. make both arrays robust to missing values
            "title": Translate.translate(BasicTypes[a].title),
            "site": a
          })
        }
        return action_btns
      },
      select(e) {
        console.log("select", e);
        this.last_selected.push(this.selected_type);
        this.selected_type = e;
        this.cancel_create();
      },
      show_create() {
        this.create_entry = true;
        console.log(this.selected_type);
        let test_schema = {
          "$schema": "http://json-schema.org/draft-04/schema#",
          "type": "object",
          "title": Translate.translate(BasicTypes[this.selected_type].title),//"Newsletter Subscription",
          "description": Definitions[this.selected_type] || "",
          "properties": {
          "name": {
            "type": "string",
              "minLength": 8,
              "maxLength": 80,
              "title": "Full Name",
              "attrs": {
              "placeholder": "Your Full Name",
                "title": "Please enter your full name"
            }
          }
        },
          "additionalProperties": false,
          "required": ["name"]
        };
        this.schema = test_schema;
        this.$refs.formSchema.load(this.schema);
      },
      cancel_create() {
        this.model = {};
        this.create_entry = false;
      },
      create() {

      }
    },
    data() {
      // console.log(this.$store);
      // console.log()
      // check if by a query param heck, user creates something they are not allowed
      return {
        last_selected: [],
        selected_type: null,
        create_entry: false,
        schema: null,
        model: {}
      }
    },
    computed: {
      actions: function () {
        // let sel_type = this.$root._route.query.type;
        let action_btns = [];
        console.log("options from", this.selected_type);
        if(!this.selected_type) {
          let global_role = this.$store.state.global_role;
          console.log("using role default options", global_role);
          action_btns = this.actions_from(role_classes[this.$store.state.global_role]);
        } else {
          console.log(BasicTypes[this.selected_type]);
          action_btns = this.actions_from(BasicTypes[this.selected_type]);
        }
        // console.log("final", action_btns);

        return action_btns;
      }
    },
    components: { FormSchema }
  }
</script>

<style scoped>


</style>
