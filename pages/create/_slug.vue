<template lang="pug">
  v-layout(column='' justify-center='' align-center='')
    v-flex(xs12='' sm8='' md6='')
      h1 {{entryType.title}}
      div {{entryType.description}}
      br
      div(v-for="(aspect, index) in entryType.aspects" :key="index")
        component(v-bind:is="aspectComponent(aspect)"
          v-bind:aspect="aspect"
          v-bind:value.sync="aspects_values[aspect.name]")
      License
      Privacy
      v-btn(color="secondary" @click="save") save draft
      v-btn(v-bind:disabled="!complete" color="success" :loading="sending" @click="send") submit
      div {{complete}}
</template>
<script>

  import Basic from "~~/components/aspectInput/Basic";
  import TextShort from "~~/components/aspectInput/TextShort";
  import IntAspect from "~~/components/aspectInput/IntAspect";
  import TextLong from "~~/components/aspectInput/TextLong";
  import DateAspect from "~~/components/aspectInput/DateAspect";
  import Location from "~~/components/aspectInput/Location";
  import ListOf from "~~/components/aspectInput/ListOf";
  import SelectUser from "~~/components/aspectInput/SelectUser";
  import License from "../../components/License";
  import Privacy from "../../components/Privacy";

  export default {
    name: "slug",
    components: {Privacy, License, Basic, TextShort, TextLong, Location, ListOf, IntAspect},
    asyncData(context) {
      return {
        slug: context.params.slug,
        entryType: context.store.state.selected_creation_type
      }
    },
    created() {
      if (this.$route.query.hasOwnProperty("draft_id")) {
        this.draft_id = this.$route.query.draft_id;
        for (let aspect of this.entryType.aspects) {
          this.aspects_values[aspect.name] = this.$store.state.drafts[this.draft_id].aspects_values[aspect.name];
        }
      } else {
        for (let aspect of this.entryType.aspects) {
          this.aspects_values[aspect.name] = null;
        }
      }
    },
    data() {
      return {
        sending: false,
        aspects_values: {}
      }
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
            return TextShort;
          } else {
            return TextLong;
          }
        } else if (aspect.type === "int") {
          console.log("int aspect");
          return IntAspect;
        } else if (aspect.type === "@user") {
          return SelectUser;
        } else if (aspect.type === "date") {
          return DateAspect;
        } else if (aspect.type === "gps") {
          return Location;
        } else if (aspect.type === "list") {
          return ListOf
        }
        return Basic;
      },
      /*aspect_value(aspect) {
        this.aspects_values[aspect.aspect.name] = aspect.value || null;
        // console.log(this.aspects_values)
      },*/
      send() {
        this.sending = true;
        const data = {
          entryType: this.slug,
          aspects: this.aspects_values
        };
        this.$axios.post("/create_entry", data).then((res) => {
          this.sending = false;
          console.log(res.data);
          this.$store.commit("set_snackbar", {message: res.data.msg, ok: res.data.status});

          if(this.hasOwnProperty("draft_id")) {
            this.$store.commit("remove_draft", this.draft_id);
          }
          this.$router.push("/");
        }).catch((err) => {
          console.log("error");
        })
      },
      save() { // draft
        let create = false;
        if(!this.hasOwnProperty("draft_id")) {
          create = true;
          this.draft_id = this.$store.state.drafts.length;
        }
        let draft_data = {
          slug: this.slug,
          draft_id: this.draft_id,
          entryType: this.entryType,
          title: this.entryType.title + ": " + this.aspects_values.title,
          aspects_values: this.aspects_values
        };
        this.$store.commit("set_snackbar", {message: "Draft saved", ok: true});
        if(create) {
          this.$store.commit("create_draft", draft_data);
        } else {
          this.$store.commit("save_draft", draft_data);
        }
        this.$router.push("/");
      }
    }
  }
</script>

<style scoped>

</style>
