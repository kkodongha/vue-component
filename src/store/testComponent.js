const defaultState = () => ({
  storeText: null,
});

const actions = {};

const mutations = {
  setStoreText(state, payload) {
    state.storeText = payload;
  },
  /** state 초기화 */
  clearState(state) {
    Object.assign(state, defaultState());
  },
};

const getters = {
  storeText: (state) => state.storeText,
};

export default {
  namespaced: true,
  state: defaultState,
  getters,
  mutations,
  actions,
};
