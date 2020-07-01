export default {
  name: "Select2Mixin",
  computed: {
    multiple() {
      return this.aspect.type === "multiselect"
    },
    chips() {
      return this.$_.get(this.aspect.attr, "chips", true)
    },
    options() {
      return [{value: "a-val", text: "A"}, {value: "b-val", text: "B"}]
    },
    selection_index: {
      get() {
        return this.value
      },
      set(val) {
        let up = null
        if (this.multiple) {
          up = this.$_.filter(this.options, (o, i) => val.includes(i)).map(v => v.value)
        } else {
          up = this.proper_up_val(this.options[val])
        }
        this.update_value(up)
      }
    },
    selection: {
      get() {
        if (this.multiple) {
          const temp_val = this.value || []
          return this.options.filter(o => temp_val.includes(o.value))//this.value.map(v => this.$_.findIndex(this.options, o => o === v))
        } else {
          return this.$_.findIndex(this.options, o => o === this.value)
        }
      },
      set(val) {
        let up = null
        if (this.multiple) {
          up = this.$_.filter(this.options, (o, i) => val.includes(o.value)).map(v => this.proper_up_val(v))
        } else {
          up = this.proper_up_val(this.$_.find(this.options, o => o.value === val))
        }
        this.update_value(up)
      }
    }
  },
  methods: {
    proper_up_val(selection) {
      return selection.value
    }
  }
}
