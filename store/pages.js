export const state = () => ({
  pages: {}
});

export const mutations = {
  set_page(state, page, page_state) {
    pages[page] = page_state
  }
}
