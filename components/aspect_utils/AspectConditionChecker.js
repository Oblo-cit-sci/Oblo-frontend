import {
  aspect_loc_str2arr,
  attr,
  check_condition_value,
  fix_index,
  get_list_index,
  loc_prepend
} from "~/lib/aspect";
import {new_value_getter} from "~/lib/entry";
import {EDIT, ENTRY, VALUE} from "~/lib/consts";

export default {
  name: "AspectConditionChecker",
  methods: {
    _condition_fail(aspect, aspect_loc, mode, entry_uuid, conditionals) {
      // console.log("aspect-condition fail check", aspect.name)
      // console.log("...", attr(aspect).condition, aspect_loc, entry_uuid, conditionals)
      if (attr(aspect).hasOwnProperty("condition")) {
        // console.log(`aspect-condition fail check '${aspect.name}': loc: ${aspect_loc}, uuid: ${entry_uuid}`)
        // console.log("conditionals:",conditionals)
        return !this.check_recursive_condition(aspect.attr.condition, aspect_loc, mode, entry_uuid, conditionals)
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
    check_recursive_condition(condition, aspect_loc, mode, entry_uuid, conditionals) {
      // console.log("condition check", aspect_loc)
      if (Array.isArray(condition)) {
        const method = condition[0].toLowerCase()
        if (condition.length < 2 || !["and", "or"].includes(method)) {
          console.log("Wrong condition format", condition)
        }
        const conditions = condition.slice(1)
        if (method === "and") {
          return conditions.every(c => this.check_recursive_condition(c, aspect_loc, mode, entry_uuid, conditionals))
        } else {
          return conditions.some(c => this.check_recursive_condition(c, aspect_loc, mode, entry_uuid, conditionals))
        }
      } else {
        return this.check_single_condition(condition, aspect_loc, mode, entry_uuid, conditionals)
      }
    },
    check_single_condition(condition, aspect_loc, mode, entry_uuid, conditionals) {
      let condition_value = null
      // debugger
      if (conditionals) {
        // console.log(new_value_getter(conditionals, condition.aspect))
        console.log("new condition checker", condition.aspect)
        condition_value = this.$_.get(new_value_getter(conditionals, condition.aspect), VALUE)
      } else if (aspect_loc) {
        // console.log("single cond check: cond:", condition.aspect)
        let aspect_location = loc_prepend(mode === EDIT ? EDIT : ENTRY, entry_uuid,
          aspect_loc_str2arr(condition.aspect))
        // console.log("single cond check: loc:", aspect_loc, aspect_location)
        fix_index(aspect_location, get_list_index(aspect_loc))
        console.log("single cond check: loc:", aspect_loc, aspect_location)
        condition_value = this.$store.getters["entries/value"](aspect_location)
        // console.log("single cond check: val:", condition_value)
      } else {
        console.log(`condition for aspect ... cannot be checked. no aspect_loc and no conditionals`)
        return false
      }
      // console.log("condition check:", condition, condition_value)
      // console.log("check_single_condition", this.aspect.name, "condition_value", condition_value, check_condition_value(condition_value, condition))
      return check_condition_value(condition_value, condition)
    }
  }
}
