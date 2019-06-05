<template lang="pug">
  v-layout(column='' justify-center='' align-center='')
    v-flex(xs12='' sm8='' md6='')
      v-list
        v-list-tile
          v-list-tile-title {{entry.title}}
          v-list-tile-sub-title {{entry_type.title}}
        v-list-tile(@click="$router.push('/')")
          v-list-tile-title By {{entry.creator}}
          v-list-tile-sub-title At {{entry.creation_timestamp}}
        v-list-tile
          v-list-tile-title
            v-img(:src="license_icon(entry.license)"  class="subtilte_img licenseIcon")
        v-list-tile(dense)
          v-list-tile-title Description
        v-textarea(readonly solo flat  :value="entry.description")
        v-flex(xs12 sm12 md12 text-xs-center)
          v-chip(v-for="tag in entry.tags" :key="tag.id" @click="tag_select") {{tag.title}}
            v-icon star
      ActorList(:actors="entry.actors")
      div(v-if="entry_type_aspects !== null")
        div(v-for="(aspect, index) in entry_type_aspects" :key="index")
          component(v-bind:is="aspectComponent(aspect)"
            v-bind:aspect="aspect"
            v-bind:value="entry.content.aspects[aspect.name]"
            :edit="false")
      div(v-else)
        div no aspects?
      div
        v-btn(v-if="editable" color="success" @click="edit") Edit

</template>

<script>

    //
  import ActorList from "../../components/ActorList";

  const ld = require('lodash');

  import { get_entrytpe, license_icon, strip_default_aspects } from "../../lib/client";
  import {MAspectComponentView} from "../../lib/client";

  export default {
    name: "entryview",
    components: {ActorList},
    async fetch(context) {
      // maybe before_create, to see if it has been fetched already
      let uuid =  context.params.entry_view;
      if (context.store.state.fetched_entries) {
        let {data} = await context.$axios.get("/entry/"+uuid);
        // console.log("fetched", data);
        context.store.commit("add_fetched_entry", data.result)
      }
    },
    asyncData(context) {
      return {
        uuid: context.params.entry_view,
      }
    },
    data() {
      return {
        entry: null,
        entry_type: {},
        entry_type_aspects: null,
        editable: null
      }
    },
    methods: {
      aspectComponent(aspect) {
        return MAspectComponentView(aspect);
      },
      license_icon(license) {
        return license_icon(license, this.$store);
      },
      edit() {
        this.$router.push("/edit/"+ this.uuid);
      },
      tag_select() {
        console.log("tag selected");
      }
    },
    beforeMount() {
      this.entry = this.$store.state.fetched_entries[this.uuid];
      get_entrytpe(this.$store, this.entry.parent_type, this.$axios).then((res) => {
        this.entry_type = res;
        this.entry_type_aspects = {... this.entry_type.content.aspects};
        this.entry_type_aspects = strip_default_aspects(this.entry_type_aspects);
        //console.log("A", this.entry_type_aspects);
      });
      //console.log(this.$store.getters.name);
      const res = ld.find(ld.concat(this.entry.actors.owners, this.entry.actors.collaborators), (a) => {return a.registered_name === this.$store.getters.name; })
      this.editable = this.entry.editable && res !== undefined;
    },
    created() {

      //console.log(res);
    }
  }
</script>

<style scoped>

    .licenseIcon {
      width: 80px;
      height: 30px;
    }
</style>
