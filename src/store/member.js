const getDefaultState = () => {
  return {};
};

const defaultState = getDefaultState();

const actions = {};

const mutations = {};

const getters = {
  codeToName: (state, getters, rootState) => (codeIdx, code) => {
    let commonCode = rootState.code.catchCodes.array;

    return (
      commonCode[codeIdx].find(
        (codeDetail) => codeDetail.code === code.toString()
      )?.name || ''
    );
  },
};

export default {
  namespaced: true,
  state: defaultState,
  getters,
  actions,
  mutations,
};
