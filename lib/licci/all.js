export default {
  entry: {
    meta: {
      title: "str",
      creator: "actor",
      owner: "actor",
      tags: "[str]",
      language: "str",
      translations: "[str]",
      "related resources": "str:url",
      "attached files": "str:url", // maybe like a: title, href
      privacy: "public|followers-only|private",
      access: "[actor]",
      license: "str",
      comments_allowed: "boolean",
      collaboration: {},
      editable: "boolean"
    }
  },
  admin: {
    "type": "collection",
    "title": "Admin",
    "fields": {
      "name": "",
      "username": "",
    },
    "actions": [
      "site", "village", "investigator"
    ]
  },
  "editor": {
    "type": "collection",
    "title": "Edior",
    "fields": {
      "name": "",
      "username": "",
    },
    "actions": [
      "entry"
    ]
  },
  "investigator": {
    "type": "collection",
    "title": "investigator",
    "fields": {
      "name": "",
      "username": "",
    },
    "actions": [
    ]
  },
  "site": {
    "type": "template",
    "title": "site",
    "actions": [
      "village"
    ],
    "references": [
      "assigned investigator",
      "villages"
    ]
  },
  "village": {
    "type": "template",
    "title": "village",
    "actions": [
      "village information card", "household"
    ]
  },
  "user": {
    "type": "collection",
    "title": "User",
    "fields": {
      "name": "",
      "username": "",
    },
    "actions": [
    ]
  },
  "village information card": {
    "type": "collection",
    "title": "village info card",
    "actions": [
    ]
  },
  "household": {
    "title": "household",
    "actions": [
    ]
  }
};
