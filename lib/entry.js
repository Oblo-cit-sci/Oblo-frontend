export default class Entry {

  constructor(init) {
    this.entry_type = init.entry_type; // maybe out later...
    this.type_slug = init.entry_type.slug;
    this.draft_id = init.draft_id;
    this.entry_id = init.entry_id || init.draft_id; // until its submitted
    this.aspects_values = init.aspects_values;
    this.license = init.license;
    this.privacy = init.privacy;
    this.title = init.title || this.get_draft_title();
  }

  get_draft_title() {
    let title = this.entry_type.title + ": ";
    let title_value = this.aspects_values.title;
    // todo simplify after aspects_value defaults...
    if (title_value === "" || title_value === null) {
      title += this.draft_id;
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

}
