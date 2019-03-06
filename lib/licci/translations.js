export default {
  ui_text: {
    "site": "Site",
    "village": "Village",
    "investigator": "Investigator",
    "village info card": "Village Information Card",
    "focus_group": "Focus Group Discussion"
  },
  languages: ["en"],
  translate(word, lang) {
    // TODO more...
    let trans = this.ui_text[word] || word;
    return trans;
  }
}
