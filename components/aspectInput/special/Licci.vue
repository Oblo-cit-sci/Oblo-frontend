<template lang="pug">
  div
    v-expansion-panel(expand v-model="licciPanel")
      v-expansion-panel-content(v-for="(licci, index) in liccis" :key="licci.licci")
        template(v-slot:header)
          div {{licci.licci}}
        div
          TextLong(v-bind:aspect="licciCommentAspect"
            v-bind:value.sync="licci.comment"
            v-on:update-required="updateRequired")
          v-btn(small :color="dirColor(licci,1)" @click="licci.direction = 1") Increase
            v-icon(right) arrow_upward
          v-btn(small :color="dirColor(licci,-1)" @click="licci.direction = -1") Decrease
            v-icon(right) arrow_downward
          br
          v-btn(@click.stop="openDriverDialogFor(licci)") add driver
          v-dialog(width="500" v-model="DriverDialogOpen")
            TreleafPicker(:tree="options" v-on:selected="SelectDriver($event)")
          v-btn(color="warning" @click="openRemoveLicciDialog(index)") Remove Licci
          v-dialog(v-model="removeLicciDialogOpen" max-width="300px" lazy=true)
            v-card
              v-card-title Remove Licci
              v-card-text Are you sure you want to remove the LICCI {{getRemoveLicci}}?
              v-card-actions
                v-btn(flat color="warning") Don't delete it
                v-btn(color="error") Yes, delete it
          v-subheader Drivers
          div(v-for="(driver,DIndex) in licci.drivers" :key="driver.driver")
            h4
              span {{driver.driver}}
              v-btn(flat icon color="warning" @click="removeDriver(licci, DIndex)")
                v-icon clear
            TextLong(v-bind:aspect="licciCommentAspect"
              v-bind:value.sync="driver.comment"
              v-on:update-required="updateRequired")
          v-divider
    v-btn(@click.stop="LicciDialogOpen = true") add Licci
    v-dialog(width="500" v-model="LicciDialogOpen" lazy=true)
      TreleafPicker(:tree="options" v-on:selected="SelectLicci")
</template>

<script>

  const ld = require("lodash");
  import TreleafPicker from "../../TreleafPicker";
  import AspectMixin from "../AspectMixin";
  import TextLong from "../TextLong";

  export default {
    name: "Licci",
    components: {TextLong, TreleafPicker},
    mixins: [AspectMixin],
    data() {
      return {
        liccis: [],
        searchLicci: "",
        licciCommentAspect:  {"attr": {"max": 400}, "name": "Comment", "type": "str", "description": ""},
        LicciDialogOpen: false,
        DriverDialogOpen: false,
        addDriverForLicci: null,
        removeLicciDialogOpen: false,
        removeLicciSelectIndex: null,
        licciPanel: []
      }
    },
    created() {
      this.options = this.$store.state.codes["liccis"];
    },
    methods: {
      addLicci(name, id) {
        this.liccis.push({
          licci: name,
          id: id,
          direction: 0,
          drivers: [],
          comment: ""
        })
      },
      addDriver(licci, name, id) {
        licci.drivers.push({
          driver: name,
          id: id,
          comment: ""
        })
      },
      openDriverDialogFor(licci) {
        console.log(licci);
        this.addDriverForLicci = licci;
        this.DriverDialogOpen = true
      },
      SelectLicci(licci) {
        this.addLicci(licci.name, licci.id);
        this.LicciDialogOpen = false;
        ld.fill(this.licciPanel, false);
        this.licciPanel.push(true);
      },
      SelectDriver(driver) {
        this.DriverDialogOpen = false;
        this.addDriver(this.addDriverForLicci, driver.name, driver.id);
      },
      dirColor(licci, dir) {
        //console.log(licci.direction, dir);
        if(licci.direction === 0) {
          return "red darken-1";
        } else if(licci.direction === 1 && dir === 1) {
          return "green"
        } else if(licci.direction === -1 && dir === -1) {
          return "green"
        }
      },
      openRemoveLicciDialog(index) {
        this.removeLicciDialogOpen = true;
        this.removeLicciSelectIndex = index;
      },
      removeLicci(index) {
        this.liccis.splice(index,1);
        this.removeLicciDialogOpen = false;
      },
      removeDriver(licci, DIndex) {
        licci.drivers.splice(DIndex);
      },
      updateRequired(bla) {
        console.log("updateRequired", bla);
      }
    },
    computed: {
      getRemoveLicci() {
        if(this.removeLicciSelectIndex !== null)
          return this.liccis[this.removeLicciSelectIndex].licci;
        else
          return "";
      }

    }
  }
</script>

<style scoped>

</style>
