function aspect_default_value(aspect) {

  if(aspect.type.startsWith("!")) {
    return aspect.default;
  }

  switch (aspect.type) {
    case "str":
      return "";
    case "int":
      // todo could also check attr.min
      return 0;
    case "@user":
      return null;
    case "date":
      // TODO now?
      return new Date();
    case "gps":
      return null;
      /*return {
        lon: 0,
        lat: 0
      };*/
    case "list":
      return [];
    case "tree":
      return {};
    default:
      console.log("Warning trying to ge default value of aspect of unknown type", aspect);
      return null;
  }
}

// not sure if this class is actually usefull..
export default class Entry {

  constructor(init) {
    this.entry_type = init.entry_type; // maybe out later...
    this.type_slug = init.entry_type.slug;
    this.draft_id = init.draft_id;
    this.entry_id = init.entry_id || init.draft_id; // until its submitted
    this.aspects_values = init.aspects_values || this.default_values();
    this.license = init.license;
    this.privacy = init.privacy;
    this.title = init.title || this.get_draft_title();
  }

  get_draft_title() {
    return Entry.draft_title(this.entry_type.title, this.aspects_values.title, this.draft_id);
  }

  static draft_title(entry_type_title, title_aspect, draft_id) {
    let title = entry_type_title + ": ";
    let title_value = title_aspect;
    // todo simplify after aspects_value defaults...
    if (title_value === "") {
      title += draft_id;
    } else {
      title += title_value;
    }
    return title;
  }

  get_store_data() {
    return {
      type_slug: this.type_slug,
      title: this.title,
      draft_id:  this.draft_id,
      entry_id: this.draft_id, // until its submitted
      aspects_values: this.aspects_values,
    }
  }

  default_values() {
    let values = {};
    let aspects = this.entry_type.content.aspects;
    for(let aspect_i in aspects) {
      let aspect = aspects[aspect_i];
      values[aspect.name] = aspect_default_value(aspect);
    }
    console.log("DVals", values);
    return values;
  }

}
