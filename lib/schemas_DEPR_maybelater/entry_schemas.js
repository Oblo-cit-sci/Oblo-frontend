let basic_meta = {
  title: {
    "type": "string",
    "title": "Title",
    "attrs": {
      "title": "Entry title"
    }
  },
  //creator: "actor",
  owner: {
    "type": "array",
    "title": "Array field",
    "items": {
      "type": "string"
    }
  }
 /* tags: "[str]",
  language: "str",
  translations: "[str]",
  "related resources": "str:url",
  "attached files": "str:url", // maybe like a: title, href
  privacy: "public|followers-only|private",
  access: "[actor]",
  license: "str",
  comments_allowed: "boolean",
  collaboration: {},
  editable: "boolean" */
};

export default {
  meta: basic_meta,
  site: {

  }
};
