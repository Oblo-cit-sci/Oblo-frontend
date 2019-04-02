<template lang="pug">
  v-layout(column='' justify-center='' align-center='')
    v-flex(xs12='' sm8='' md6='')
      h1 {{entryType.title}}
      h3 {{entryType.description}}
      div {{entryType}}

      div(v-for="(aspect, index) in entryType.aspects" :key="index")
        component(v-bind:is="aspectComponent(aspect)" v-bind:aspect="aspect")
</template>

<script>
  /*

["title", {"attr": {"max": 5000}, "name": "description", "type": "str"}, {"name": "observation time", "type": "date"}, {"name": "licci", "type": "list"}]
   */


  import Basic from "~~/components/aspectInput/Basic";
  import TextShort from "~~/components/aspectInput/TextShort";
  import TextLong from "~~/components/aspectInput/TextLong";
  import DateAspect from "~~/components/aspectInput/DateAspect";
  //import DatePicker from "../../components/Datepicker";

  const default_aspects = [
    {"title": {"attr": {"max": 5000}, "type": "str"}}];

  export default {
    name: "slug",
    components: {Basic, TextShort, TextLong},
    // TODO this is temporary, for development
    async fetch({store, $axios}) { // {store, params}
      //console.log("CreateEntry.fetch store len", Object.keys(store.state.user_data.available_entries).length);
      if (Object.keys(store.state.available_entries).length === 0) {
        const {data} = await $axios.get("/available_create_entries");
        if (data.status === "ok") {
          store.commit("available_create_entries", data.result.templates);
        }
      }
    },
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
      return {aspects: default_aspects};
    }, methods: {
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
        }
        return Basic;
      }
    }
  }
</script>

<style scoped>

</style>
