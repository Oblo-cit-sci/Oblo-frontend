<template lang="pug">
  v-layout(column='' justify-center='' align-center='')
    v-flex(xs12='' sm8='' md6='')
      h1 {{entryType.title}}
      h3 {{entryType.description}}
      div(v-for="(aspect, index) in entryType.aspects" :key="index")
        component(v-bind:is="aspectComponent(aspect)"
          v-bind:aspect="aspect"
          v-on:update="aspect_value")
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


  export default {
    name: "slug",
    components: {Basic, TextShort, TextLong, Location, ListOf, IntAspect},
    asyncData(context) {
      //console.log(context);
      return {
        slug: context.params.slug,
        entryType: context.store.state.available_entries[context.params.slug]
      }
    },
    created() {
      for(let aspect of this.entryType.aspects) {
        this.aspects_values[aspect.name] = null;
      }
    },
    data() {
      return {
        sending: false,
        aspects_values: {},
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
            return TextShort;
          } else {
            return TextLong;
          }
        } else if(aspect.type === "int") {
          return IntAspect;
        } else if(aspect.type === "@user") {
          return SelectUser;
        } else if(aspect.type === "date") {
            return DateAspect;
        } else if(aspect.type === "gps") {
          return Location;
        } else if(aspect.type === "list") {
          return ListOf
        }
        return Basic;
      },
      aspect_value(aspect) {
        this.aspects_values[aspect.aspect.name] = aspect.value || null;
        console.log(this.aspects_values)
      },
      send() {
        console.log("sending");
        this.sending = true;
        this.$axios.post("/create_entry", this.aspects_values).then((res) => {
          this.sending = false;
          this.$store.commit("set_snackbar", {message: res.data.msg, status: res.data.status})
          this.$router.push("/");
        }).catch((err) => {
          console.log("error");
        })
      }
    }
  }
</script>

<style scoped>

</style>
