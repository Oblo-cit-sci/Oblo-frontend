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
    component(
      :is="aspectComponent(aspect, mode)"
      v-bind:aspect="aspect"
      v-bind:value="raw_value"
      :extra="extra"
      :edit="edit"
      :disabled="disabled"
      :mode="mode"
      v-on:update:value="emit_up($event)"
      v-on:aspectAction="aspectAction($event)")
    div(v-if="!use_regular")
      Title_Description(v-bind="title_description(aspect.attr.alternative)")
      component(v-bind:is="aspectComponent(aspect.attr.alternative)"
        v-bind:aspect="aspect.attr.alternative"
        v-on:update:value="emit_up($event)")
</template>

<script>

  import {EDIT, ENTRYACTION, TITLE_CHANGED, VIEW} from "../lib/consts";

  //       v-on:entryAction="$emit('entryAction',$event)"

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
      extra: {
        type: Object,
        default: () => {
          return {}
        }
      },
      extra_update: {
        type: Boolean
      }
    },
    data() {
      return {
        edit: false,
        has_alternative: false,
        use_regular: true,
        condition: null,
        condition_fail: false,
      }
    },
    created() {
      console.log("aspect " + this.aspect.name + " created with value", this.value)
      this.has_alternative = this.aspect.attr.hasOwnProperty("alternative")
      if (this.aspect.attr.mode === VIEW || this.mode === VIEW) {
        // sets always to VIEW, nothing really
      } else { // edit
        this.edit = true
      }
      if (this.aspect.attr.hasOwnProperty("condition")) {
        this.condition = this.aspect.attr.condition
      }
    },
    // boolean check is not required, since "false" is the default
    computed: {
      raw_value() {
        return this.value.value
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
          title: !this.extra.no_title ? aspect_descr.name || "" : "",
          description: aspect_descr.description || ""
        }
      },
      aspectAction(event) {
        this.$emit('aspectAction', event)
      },
      aspectComponent(aspect_descr, mode) {
        // todo false, false are just default, ... better a config obj
        return MAspectComponent(aspect_descr, false, mode)
      },
      emit_up(event) {
        this.value.value = event
        this.$emit('update:value', Object.assign(this.$_.cloneDeep(this.value), {value : event}))
        if (this.extra.is_title || false) {
          this.$emit(ENTRYACTION, {action: TITLE_CHANGED, value: event})
        }
      }
    },
    watch: {
      mode(val) {
        this.edit = val === EDIT
      },
      use_regular(val) {
        this.value.value = aspect_default_value(this.aspect)
        if(!val) {
          this.$emit('update:value',{value: this.value.value, regular: false})
          this.value.regular = false
        } else {
          this.$emit('update:value',{value: this.value.value})
          delete this.value.regular
        }
      },
      extra_update(val) {
        if (this.condition) {
          if (!this.extra.condition || !this.extra.condition.value) {
            this.condition_fail = false
          } else {
            const compare = this.condition.compare || "equal"
            let v = null
            switch (compare) {
              case "equal":
                v = this.extra.condition.value !== this.aspect.attr.condition.value
                break
              case "unequal":
                v = this.extra.condition.value === this.aspect.attr.condition.value
                break
            }
            this.condition_fail = v;
          }
        }
      }
    }
  }

  import {aspect_default_value, MAspectComponent, pack_value} from "../lib/entry";

  import Title_Description from "./Title_Description";
</script>

<style scoped>
  .composite {
    border-left: 2px #8080806b solid;
    padding-left: 5px;
  }

</style>
