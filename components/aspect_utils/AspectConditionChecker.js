import {
  attr,
  check_condition_value, unpack
} from "~/lib/aspect";
import {new_value_getter} from "~/lib/entry";
import { VALUE} from "~/lib/consts";

export default {
  name: "AspectConditionChecker",
  methods: {
    _condition_fail(aspect, conditionals) {
      // console.log("_condition_fail", conditionals)
      if(conditionals === undefined) {
        console.trace()
      }
      // console.log("aspect-condition fail check", aspect.name)
      // console.log("...", attr(aspect).condition, aspect_loc, entry_uuid, conditionals)
      if (attr(aspect).hasOwnProperty("condition")) {
        // console.log(`aspect-condition fail check '${aspect.name}': loc: ${aspect_loc}, uuid: ${entry_uuid}`)
        // console.log("conditionals:",conditionals)
        return !this.check_recursive_condition(aspect.attr.condition, conditionals)
      } else {
        return false
      }
    },
    simple_check_recursive_condition(condition, conditionals) {
      if (Array.isArray(condition)) {
        const method = condition[0].toLowerCase()
        if (condition.length < 2 || !["and", "or"].includes(method)) {
          console.log("Wrong condition format", condition)
        }
        const conditions = condition.slice(1)
        if (method === "and") {
          return conditions.every(c => this.simple_check_recursive_condition(c, conditionals))
        } else {
          return conditions.some(c => this.simple_check_recursive_condition(c, conditionals))
        }
      } else {
        return this.simple_check_single_condition(condition, conditionals)
      }
    },
    simple_check_single_condition(condition, conditionals) {
      const condition_value = this.$_.get(new_value_getter(conditionals, condition.aspect), VALUE)
      return check_condition_value(condition_value, condition)
    },
    check_recursive_condition(condition, conditionals) {
      // console.log("condition check", aspect_loc)
      if (Array.isArray(condition)) {
        const method = condition[0].toLowerCase()
        if (condition.length < 2 || !["and", "or"].includes(method)) {
          console.log("Wrong condition format", condition)
        }
        const conditions = condition.slice(1)
        if (method === "and") {
          return conditions.every(c => this.check_recursive_condition(c, conditionals))
        } else {
          return conditions.some(c => this.check_recursive_condition(c, conditionals))
        }
      } else {
        return this.check_single_condition(condition, conditionals)
      }
    },
    check_single_condition(condition, conditionals) {
      const packed_values = new_value_getter(conditionals, condition.aspect)
      const condition_value = this.$_.get(packed_values, VALUE)
      return check_condition_value(condition_value, condition)
    }
  }
}
