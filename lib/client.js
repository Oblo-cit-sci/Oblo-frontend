
import Basic from "~~/components/aspectInput/Basic";
import TextShort from "~~/components/aspectInput/TextShort";
import IntAspect from "~~/components/aspectInput/IntAspect";
import TextLong from "~~/components/aspectInput/TextLong";
import DateAspect from "~~/components/aspectInput/DateAspect";
import Location from "~~/components/aspectInput/Location";
import ListOf from "~~/components/aspectInput/ListOf";
import SelectUser from "~~/components/aspectInput/SelectUser";
import TreeSelect from "~~/components/aspectInput/TreeSelect";



export function MAspectComponent(aspect)  {
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
  } else if (aspect.type === "tree") {
    return TreeSelect
  } else if (aspect.type.startsWith("!")) {
    return aspect.type.substring(1);
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
  console.log("complete!", entryType, aspect_values);

  if(!entryType.content.hasOwnProperty("activities")){

    return {}
  } else {
    !entryType.content.activities.hasOwnProperty(step)
    // here more processing?
    return entryType.content.activities[step];
  }
}


export async function recent_entries(axios) {
  // console.log("calling recent_entries");
  return await axios.get(`/timeline`).then((res) => {
    return res.data;
  })
    .catch((e) => {
      return ({statusCode: 404, message: 'Post not found'})
    });
}

export async function initialize(axios, store) {
  let {data} = await axios.get("/init");
  store.commit("init", data.result);
  if (data.result.user_data !== null) {
    store.commit("login", data.result.user_data);
  }

  let recent = await recent_entries(axios);
  store.commit("set_entries", recent.result);
  update_known_entrytypes(recent.result, axios, store);
}


function update_known_entrytypes(entries, axios, store) {
  let missing_types = [];
  for(let e of entries) {
    if(!store.state.entry_type_slug_index_dict.hasOwnProperty(e.parent_type)) {
      console.log("missing type", e.parent_type);
      //missing_types.push()
    }
  }
}


export async function get_entrytpe_aspects(store, type_slug, axios) {
  const state = store.state;
  if(store.state.entry_type_slug_index_dict.hasOwnProperty(type_slug)) {
    const index = state.entry_type_slug_index_dict[type_slug];
    return state.available_entries[index];
  } else {
    console.log("type not found", type_slug);
    let { data } = await axios.get("/entrytype", {
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
  }
  else return "";
}

export function server_icon_path(icon_sub_path) {
  return "http://localhost:5000/f/icons/"+icon_sub_path;
}

export function get_entrytpe(entrytype_slug, store) {
  let index = store.state.entry_type_slug_index_dict[entrytype_slug];
  return store.state.available_entries[index];
}
