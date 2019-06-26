
export default {
  data(){
    return {
      min: null,
      max: null
    }
  },
  methods: {
    set_min_max() {
      const attr = this.aspect.attr
      for(let v of ["min", "max"]) {
        if(attr[v] !== undefined) {
          this[v] = attr[v]
        } else if(attr.number !== undefined) {
          this[v] = attr.number
        }
      }
    }
  },
  computed: {
    requieres_more_color() {
      return this.min && this.i_value.length < this.min ? "success" : undefined
    }
  }
}
