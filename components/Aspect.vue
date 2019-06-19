<template lang="pug">
  div(
    :class="[{ composite: aspect.type === 'composite', }]")
    Title_Description(
      v-bind="title_description(aspect)"
      :disabled="disabled"
      :mode="mode")
    v-switch(v-if="has_alternative"
      v-model="use_regular"
      :label="use_regular ? `regular value`:`alternative value`"
      color="primary")
    component(v-bind:is="aspectComponent(aspect, mode)"
      v-bind:aspect="aspect"
      v-bind:value="raw_value"
      v-bind:extra="extra"
      :edit="edit"
      :disabled="disabled"
      :mode="mode"
      v-on:create_ref="$emit('create_ref',$event)"
      v-on:update:value="emit_up($event)"
      v-on:entryAction="$emit('entryAction',$event)")
    div(v-if="!use_regular")
      Title_Description(v-bind="title_description(aspect.attr.alternative)")
      component(v-bind:is="aspectComponent(aspect.attr.alternative)"
        v-bind:aspect="aspect.attr.alternative"
        v-bind:value="raw_value"
        v-on:update:value="$emit('update:value', {value:$event})")
</template>

<script>

  import {EDIT, VIEW} from "../lib/consts";

  export default {
    name: "Aspect",
    components: {
      Title_Description
    },
    props: {
      mode: {
        type: String,
        default: "view"
      },
      aspect: Object,
      value: Object, // a wrapper, which  might encode "exceptional_value"
      extra: Object,
      condition: Object,
      update_req: { // if the aspect needs to be send up, cuz its "required" or needs to be passed to other aspects (conditions)
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        //  i_value: {}
        edit: false,
        has_alternative: false,
        use_regular: true
      }
    },
    created() {
      this.has_alternative = this.aspect.attr.hasOwnProperty("alternative")
      if (this.aspect.attr.mode === VIEW || this.mode === VIEW) {
        // sets always to VIEW, nothing really
      } else { // edit
        this.edit = true
      }
    },
    // boolean check is not required, since "false" is the default
    computed: {
      raw_value() {
        if (this.value.regular || true)
          return this.value.value
        else {
          // todo some extra value
          return aspect_default_value(this.aspect)
        }
      },
      condition_fail() {
        //console.log("E U ", this.aspect.name, this.condition)

        if(!this.condition || !this.condition.val) {
          return false
        } else {
          //console.log("checking")
          return this.condition.val !== this.aspect.attr.condition.value
        }
        /*return this.extra !== undefined
        if(this.aspect.attr.hasOwnProperty("condition")) {
          console.log("condition check", this.aspect.name)
        }*/
      },
      disabled() {
        return !this.use_regular || this.condition_fail
      }
    },
    methods: {
      title_description(aspect_descr) {
        if (!aspect_descr.hasOwnProperty("name")) {
          //console.log("warning: aspect", aspect_descr, "has no name")
        }
        if (!aspect_descr.hasOwnProperty("description")) {
          //console.log("warning: aspect", this.aspect, "has no description")
        }
        return {
          title: aspect_descr.name || "",
          description: aspect_descr.description || ""
        }
      },
      aspectComponent(aspect_descr, mode) {
        // todo false, false are just default, ... better a config obj
        return MAspectComponent(aspect_descr, false, mode)
      },
      emit_up(event) {
        this.$emit('update:value', {value:event})
        if(this.update_req) {
          this.$emit('req', {aspect: this.aspect.name, value:event})
        }
      }
    },
    watch: {
      /*condition(condition_var) {
        console.log("condition UP", condition_var, "vs.", this.aspect.attr.condition.value)
        this.condition_fail = condition_var.val !== this.aspect.attr.condition.value
      }*/
      mode(val) {
       this.edit = val === EDIT
      }
    }
  }

  import {aspect_default_value, entry_ref, get_local_entry, MAspectComponent} from "../lib/entry";

  import Title_Description from "./Title_Description";
</script>

<style scoped>
  .composite {
    border-left: 2px #8080806b solid;
    padding-left: 5px;
  }

</style>
