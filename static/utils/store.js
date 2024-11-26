const store = new Vuex.Store({
  state: {
    loggedIn: false,
    role: "",
    id: null,
    alertMessage: "",
    alertType : "",
  },

  mutations: {
    setLogin(state) {
      state.loggedIn = true;
      sessionStorage.setItem('loggedIn', 'true');
    },
    logout(state) {
      state.loggedIn = false;
      sessionStorage.removeItem('loggedIn');
      sessionStorage.removeItem('role'); 
      sessionStorage.removeItem('id');
    },
    setRole(state, role) {
      state.role = role;
      sessionStorage.setItem('role', role);
    },
    setUserId(state, id) {
      state.id = id;
      sessionStorage.setItem('id', id);
    },
    initializeStore(state) {
      const loggedIn = sessionStorage.getItem('loggedIn') === 'true';
      const role = sessionStorage.getItem('role');
      const id = sessionStorage.getItem('id');

      state.loggedIn = loggedIn || false;
      state.role = role || "";
      state.id = id || "";
    },
    SET_ALERT(state, payload) {
      state.alertMessage = payload.message;
      state.alertType = payload.type;
    },
  },
  actions: {
    triggerAlert({ commit }, { message, type }) {
        commit('SET_ALERT', { message, type });
    },
  },
});

export default store;
