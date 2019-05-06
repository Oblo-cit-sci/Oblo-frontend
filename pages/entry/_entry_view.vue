<template lang="pug">
  v-layout(column='' justify-center='' align-center='')
    v-flex(xs12='' sm8='' md6='')
      v-list
        v-list-tile
          v-list-tile-title {{entry.title}}
          v-list-tile-sub-title {{entry.parent_type}}
        v-list-tile(@click="$router.push('/')")
          v-list-tile-title By {{entry.creator}}
          v-list-tile-sub-title At {{entry.creation_timestamp}}
        v-list-tile
          v-list-tile-title
            v-img(class="licenseIcon" :src="license_icon(entry.license)"  class="subtilte_img")
        v-list-tile(dense)
          v-list-tile-title Description
        v-textarea(readonly solo flat auto-grow :value="entry.description")
        v-flex(xs12 sm12 md12 text-xs-center)
          v-chip(v-for="tag in entry.tags" :key="tag.id" @click="tag_select") {{tag.title}}
            v-icon star
      ActorList(:actors="entry.actors")
      div(v-if="entry_type_aspects !== null")
        div(v-for="(aspect, index) in entry_type_aspects.aspects" :key="index")
          component(v-bind:is="aspectComponent(aspect)"
            v-bind:aspect="aspect"
            v-bind:value="entry.aspects[aspect.name]"
            v-bind:edit=false)
      div
        v-btn(v-if="editable" color="success" @click="edit") Edit

</template>

<script>

    //
  import ActorList from "../../components/ActorList";

  const ld = require('lodash');

  import { MAspectComponent, get_entrytpe_aspects } from "../../lib/client";

  export default {
    name: "entryview",
    components: {ActorList},
    async fetch(context) {
      // maybe before_create, to see if it has been fetched already
      let uuid =  context.params.entry_view;
      if (context.store.state.fetched_entries) {
        let {data} = await context.$axios.get("/entry/"+uuid);
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
        entry_type_aspects:null,
        editable: null
      }
    },
    methods: {
      aspectComponent(aspect) {
        return MAspectComponent(aspect);
      },
      license_icon(license) {
        if (this.$store.state.codes.hasOwnProperty("licenses")) {
          let license_data = this.$store.state.codes.licenses[license];
          if (license_data !== undefined) {
            return license_data.icon
          } else {
          }
        }
        else return "";
      },
      edit() {
        this.$router.push("/edit/"+ this.uuid);
      },
      tag_select() {
        console.log("tag selected");
      }
    },
    created() {
      this.entry = this.$store.state.fetched_entries[this.uuid];
      get_entrytpe_aspects(this.$store, this.entry.parent_type, this.$axios).then((res) => {
        console.log("CR", res);
        this.entry_type_aspects = res;
      });

      //console.log(this.$store.getters.name);
      const res = ld.find(ld.concat(this.entry.actors.owners, this.entry.actors.collaborators), (a) => {return a.registered_name === this.$store.getters.name; })
      this.editable = this.entry.editable && res !== undefined;
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
