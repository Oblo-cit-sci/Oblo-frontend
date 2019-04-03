<template lang="pug">
  v-layout(column='' justify-center='' align-center='')
    v-flex(xs12='' sm8='' md6='')
      h1 {{entryType.title}}
      h3 {{entryType.description}}
      div(v-for="(aspect, index) in entryType.aspects" :key="index")
        component(v-bind:is="aspectComponent(aspect)"
          v-bind:aspect="aspect"
          v-on:update="aspect_value")
      v-btn(v-bind:disabled="!complete" color="success" :loading="sending") submit
      div {{!complete}}
</template>

<script>

  import Basic from "~~/components/aspectInput/Basic";
  import TextShort from "~~/components/aspectInput/TextShort";
  import TextLong from "~~/components/aspectInput/TextLong";
  import DateAspect from "~~/components/aspectInput/DateAspect";
  import Location from "~~/components/aspectInput/Location";
  import ListOf from "~~/components/aspectInput/ListOf";

  export default {
    name: "slug",
    components: {Basic, TextShort, TextLong, Location, ListOf},
    asyncData(context) {
      //console.log(context);
      return {
        slug: context.params.slug,
        entryType: context.store.state.available_entries[context.params.slug]
      }
    },
    created() {
    },
    data() {
      return {
        sending: false
      };
    },
    computed: {
      complete() {
        return this.title !== "";
      }
    },
    methods: {
      aspectComponent(aspect) {
        if (aspect.type === "str") {
          let attributes = aspect.attr || {};
          let max = attributes.max || 8000; // or make this explicit in python
          if (max < 100) {
            console.log("TextShort aspect");
            return TextShort;
          } else {
            console.log("TextLong aspect");
            return TextLong;
          }
        } else if(aspect.type === "date") {
            console.log("date aspect");
            return DateAspect;
        } else if(aspect.type === "gps") {
          console.log("gps aspect");
          return Location;
        } else if(aspect.type === "list") {
          return ListOf
        }
        return Basic;
      },
      aspect_value(aspect) {
        console.log("slug", aspect)
      }
    }
  }
</script>

<style scoped>

</style>
