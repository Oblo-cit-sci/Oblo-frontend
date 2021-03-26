export const PAGE_INDEX = "index"
export const PAGE_DOMAIN = "domain"
export const PAGE_PROFILE = "profile"
export const PAGE_ENTRY = "entry"
export const PAGE_LOGIN = "login"
export const PAGE_ABOUT = "about"

export  const all_pages_n_actions = [
  {icon: 'mdi-home', t_title: 'comp.menu.home', to: '/', name:"index"},
  {icon: 'mdi-account', t_title: 'comp.menu.profile', to: '/profile', name:"profile"},
  {icon: 'mdi-flask-empty-outline', t_title: 'comp.menu.tests', to: '/tests', name:"tests"},
  {icon: 'mdi-account-check', t_title: 'comp.menu.register', to: '/register', name:"register"},
  {icon: 'mdi-login', t_title: 'comp.menu.login', to: '/login', name:"login"},
  {icon: 'mdi-logout', t_title: 'comp.menu.logout', to: "/logout", name:"logout"},
  {icon: "mdi-account-group", t_title:"comp.menu.users", to: "/users", name:"users"},
  {icon: "mdi-translate", t_title:"comp.menu.translate", to: "/translate/setup", name:"translate"},
  {icon: "mdi-book-open-outline", t_title:"comp.menu.user_guide", to:"/user_guide", name: "user_guide"},
  {icon: "mdi-information-outline", t_title: "comp.menu.about", to: {path:"/about", query:{}}, name:"about"},
  {icon: "mdi-bee-flower", t_title: "comp.menu.offline_settings", to:"/offline_settings", name:"offline_settings"}
  // {icon: 'note_add', title: 'Create Entry', to: '/CreateEntry'},
  // OUT FOR 6.17 {icon: "fa-edit", title: "Create notes", to: "/EntrytypeNotes"},
  // {icon: 'flip_to_front', title: 'Entrytypes', to: '/CreateEntrytype'},
  // {icon: 'computer', title: 'Aspectbuild', to: '/AspectBuild'},
  // {icon: 'mdi-laptop', title: 'Codes', to: '/Codes'},
  // {icon: "mdi-fruit-watermelon", t_title:"comp.menu.admin", to: "/admin"},
  // {icon: 'mdi-settings', title: 'Settings', to: '/settings'}
  /*{icon: "build",title: "debug", to: "/StoreDebug"}*/
]


