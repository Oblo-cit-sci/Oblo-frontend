<template lang="pug">
  div
    v-textarea(v-model="input" solo @keydown="keydown")
    //v-btn(@click="exec") run
</template>

<script>
/**
 * simply put it after an Aspect.
 * shift + Enter to exec
 */
export default {
  name: "AspectConsole",
  mixins: [],
  components: {},
  props: {
    aspect_elem_id: {
      type: String,
      required: false,
      default: "console_aspect"
    }
  },
  data() {
    return {
      input: "",
      aspect: null
    }
  },
  computed: {},
  created() {
    this.aspect = document.getElementById(this.aspect_elem_id)
    const my_id = this._uid
    const parent_kids = this.$parent.$children
    // console.log(parent_kids)
    // find index of this component in parent's children
    const index = parent_kids.findIndex(child => child._uid === my_id)
    // console.log(index)
    // get the child before this one
    const prev_child = parent_kids[index - 1]
    // console.log("prev_child", prev_child, prev_child._name)
    // check if the prev_child _name is Aspect
    if (prev_child._name === "<Aspect>") {
      // if it is, then we can use its aspect
      this.aspect = prev_child
      this.aspect_component = this.aspect.$refs["aspect_component"]
      // console.log("found aspect", this.aspect)
    }
  },
  methods: {
    exec() {
      try {
        eval(this.input)
      } catch (e) {
        console.error(e)
      }

    },
    keydown(e) {
      if(e.shiftKey && e.key === "Enter") {
        this.exec()
      }
    }
  }
}
</script>

<style scoped>

</style>
