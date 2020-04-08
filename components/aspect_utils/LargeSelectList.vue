<template lang="pug">
  div
    div {{selected}}
    v-item-group(v-model="selected")
      v-item.select_item(v-for="a in options" :key="a.name" v-slot:default="{ toggle }")
        v-card(@click="toggle" outlined)
          v-img.card_img(src="https://cdn.vuetifyjs.com/images/cards/store.jpg")
          v-card-title {{a.name}}
          v-card-text.card_text {{a.description}}
</template>

<script>
  export default {
    name: "LargeSelectList",
    data() {
      return {
        selected: null,
        options: [
          {
            name: "adsadkldklaskldklklf daslkldaskld djsakjdkjskdjkjdas dasjkdjksjad ",
            description: "kjdkasjdkjakdjakdjksadkasdjksakjdkasjdkjakdjakdjksadkasdjksakjdkasjdkjakdjakdjksadkasdjksa" +
              "kjdkasjdkjakdjakdjksadkasdjksa"
          },
          {
            name: "b",
            description: "kjdkasjdkjakdjakdjksadkasdjksa"
          },
          {
            name: "c",
            description: "kjdkasjdkjakdjakdjksadkasdjksa"
          }
        ]
      }
    }
  }
</script>

<style scoped>

  .select_item {
    width: 400px;
    margin: 3px;
  }

  .card_img {
    margin: 1%;
    float: left;
    max-width: 120px;
  }

  .card_text {
    margin-top: 2%;
    clear: left;
  }
</style>
