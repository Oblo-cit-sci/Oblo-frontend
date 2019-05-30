import Basic from "~~/components/aspectInput/Basic";
import TextShort from "~~/components/aspectInput/TextShort";
import IntAspect from "~~/components/aspectInput/IntAspect";
import TextLong from "~~/components/aspectInput/TextLong";
import DateAspect from "~~/components/aspectInput/DateAspect";
import Location from "~~/components/aspectInput/Location";

import SelectUser from "~~/components/aspectInput/SelectUser";
import TreeSelect from "~~/components/aspectInput/TreeSelect";
import AspectPageButton from "../components/aspectInput/AspectPageButton";
import List from "../components/aspectInput/List";
import Map from "../components/aspectInput/Map";
import UrlAspect from "~~/components/aspectInput/Url";
import Select from "../components/aspectInput/Select";

import TextShort_appendButton from "../components/aspectInput/TextShort_appendButton";
import CompositeAspect from "../components/aspectInput/CompositeAspect";
import UrlView from "../components/aspectInput/composite_views/UrlView";
import ListOf from "../components/aspectInput/ListOf";

const ld = require("lodash");

// todo use another function for clearAlt to keep this fct cleaner
export function MAspectComponent(aspect, ignore_page = false, clearAlt = false) {
  let attr = aspect.attr || {};
  let view = attr.view || "inline";

  if (view === "page" && !ignore_page) {
    return AspectPageButton;
  } else if (view === "inline" || ignore_page) {
    if (aspect.type === "str") {
      let max = aspect.attr.max || 8000; // or make this explicit in python
      if (max < 100) {
        if (clearAlt) {
          return TextShort_appendButton;
        } else {
          return TextShort;
        }
      } else {
        return TextLong;
      }
    } else if (aspect.type === "url") {
      return UrlAspect;
    } else if (aspect.type === "int") {
      return IntAspect;
    } else if (aspect.type === "@user") {
      return SelectUser;
    } else if (aspect.type === "date") {
      return DateAspect;
    } else if (aspect.type === "gps") {
      return Location;
    } else if (aspect.type === "list") {
      return MListAspectComponent(aspect);
    } else if (aspect.type === "map") {
      return Map;
    } else if (aspect.type === "composite") {
      return CompositeAspect;
    } else if (aspect.type === "select") {
      return Select;
    } else if (aspect.type === "tree") {
      return TreeSelect;
    } else if (aspect.type.startsWith("!")) {
      return aspect.type.substring(1);
    }
  }
  return Basic;
}

function MListAspectComponent(aspect) {
  let item_type = aspect.items;

  console.log("list with", typeof (item_type))
  if (typeof (item_type) === "string") {
    let passed_options = aspect.items;
    // a "*" means, lookup code and set the values as options
    // todo does not have to be a string only, can also be a composite, which is marked as page-aspect
    // or maybe no, and the smartness is in attr e.g. "attr.view = page"

    if (typeof (passed_options) === "string") {
      let type_char = passed_options.charAt(0);
      // Select from code
      if (type_char === "*") {
        //passed_options = this.$store.state.codes[passed_options.substring(1)];
        // console.log("taking code for list", given_options.substring(1));
        console.log("TODO!!! code options", passed_options);
        return List
      }
      if (type_char === "$") {
        //console.log("entry aggregator");
        //this.create = true;
        return ListOf;
      }
      if (passed_options === "composite") {
        return ListOf
      }
    }
    return List
  }
  return List;
}

function composite_views(name) {
  if (name === "url") {
    return UrlView;
  } else
    return CompositeAspect;
}

// todo use another function for clearAlt to keep this fct cleaner
export function MAspectComponentView(aspect) {
  let attr = aspect.attr || {};
  let view = attr.view || "inline";
  if (view === "page") {
    return AspectPageButton;
  } else if (view === "inline") {
    if (aspect.type === "str") {
      let max = attr.max || 8000; // or make this explicit in python
      if (max < 100) {
        return TextShort;
      } else {
        return TextLong;
      }
    } else if (aspect.type === "url") {
      return UrlAspect;
    } else if (aspect.type === "int") {
      return IntAspect;
    } else if (aspect.type === "@user") {
      return SelectUser;
    } else if (aspect.type === "date") {
      return DateAspect;
    } else if (aspect.type === "gps") {
      return Location;
    } else if (aspect.type === "list") {
      return List
    } else if (aspect.type === "composite") {
      return composite_views(aspect.view_type || aspect.type);
    } else if (aspect.type === "tree") {
      return TreeSelect;
    } else if (aspect.type.startsWith("!")) {
      return aspect.type.substring(1);
    }
  }
  return Basic;
}


export function complete_activities(entryType, step, aspect_values) {
  /*
  curcial symbols:
  #Bla refers to the aspect value.
  depending on the type, it will select, slug:... or uuid:...
  BUT THIS IS HAPPENEING ON THE SERVER SO, THEY STAY

  @self
  is the user: so it will insert: registered_name
  although again, the server can take care of that. maybe it verifies

  this.... can modify the data model e.g. assigning reviewers, owners, ...


  step: says what triggered the activity (e.g. send)
  */
  //console.log("complete!", entryType, aspect_values);

  if (!entryType.content.hasOwnProperty("activities")) {

    return {}
  } else {
    !entryType.content.activities.hasOwnProperty(step)
    // here more processing?
    return entryType.content.activities[step];
  }
}


export async function timeline_entries(axios) {
  // console.log("calling recent_entries");
  return await axios.get(`/timeline`).then((res) => {
    return res.data;
  })
    .catch((e) => {
      return ({statusCode: 404, message: 'Post not found'})
    });
}

export async function initialize(axios, store) {
  let {data} = await axios.get("/init")
  store.commit("init", data.result)
  let timeline = await timeline_entries(axios)
  store.commit("entries/add_timeline_entries", timeline.result)
}

export async function get_entrytpe(store, type_slug, axios) {
  if (store.state.entry_types.has(type_slug)) {
    return store.state.entry_types.get(type_slug);
  } else {
    console.log("type not found", type_slug);
    let {data} = await axios.get("/entrytype", {
      params: {
        type_slug: type_slug
      }
    });
    // TODO make it a commit fct
    store.commit("entrytype", data.result);
    return data.result;
  }
//  this.$store.getters.entrytype_aspects(this.entry.parent_type)// this.$store.state.entrytype_aspects(this.entry.parent_type, this.$store.state, this.$axios);
}

export function license_icon(license, store) {
  if (store.state.codes.hasOwnProperty("licenses")) {
    let license_data = store.state.codes.licenses[license];
    if (license_data !== undefined) {
      //console.log(license_data.svg);
      return server_icon_path(license_data.svg);
    } else {
    }
  } else return "";
}

export function server_icon_path(icon_sub_path) {
  return "http://localhost:5000/f/icons/" + icon_sub_path;
}

export function strip_default_aspects(aspects) {
  // todo findout why the object keys are numbers, conversion from map to object?.
  // anyway empty
  const drop = ["title", "description"];
  return ld.filter(aspects, (o) => {
    return drop.indexOf(o.name) === -1
  });
}

export function draft_url(state, draft_id) {
  const draft = state.edrafts.drafts[draft_id];
  return "/create/" + draft.type_slug + "/" + draft_id;
}

export function string_list2options(values) {
  return ld.map(values, (c) => {
    return {text: c, value: c}
  })
}

export function object_list2options(values, text_from, value_from) {
  return ld.map(values, (c) => {
    return Object.assign(c, {text: c[text_from], value: c[value_from]})
  })
}

export function get_codes_as_options(state, code_name) {
  code_name = code_name.substring(1)
  const code_parts = code_name.split("/")
  let codes_raw = state.codes
  for (let part of code_parts) {
    codes_raw = codes_raw[part]
  }
  return string_list2options(codes_raw)
}

export function check_relations(entry_type) {
  // could be attr.condition or items="#..."
  const aspects = entry_type.content.aspects
  let relations = {} // key: which one, value: receives which other value, k -> v
  for (let aspect of aspects) {
    // TODO MAGIC prop
    if (aspect.attr.hasOwnProperty("condition")) {
      relations[aspect.name] = aspect.attr.condition.aspect
    }
  }
  return relations
}

// TODO this should actually be a getter in the drafts, entry store
export function get_entries_of_type(store, type) {
  let relevant_drafts = ld.filter(store.state.edrafts.drafts, (d) => {
    return d.type_slug === type
  })
  let relevant_entries = ld.filter(store.state.entries.fetched_entries, (d) => {
    return d.type_slug === type
  })
  return relevant_drafts
}

export function entries_as_options(entries) {
  return ld.map(entries, (e) => {
    return {text: e.title, value: e.entry_id}
  })
}
