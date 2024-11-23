const store = new Vuex.Store({
  state: {
    loggedIn: false,
    role: "",
    id: null,
  },

  mutations: {
    setLogin(state) {
      state.loggedIn = true;
      sessionStorage.setItem('loggedIn', 'true'); // Persist login status
    },
    logout(state) {
      state.loggedIn = false;
      sessionStorage.removeItem('loggedIn'); // Clear session storage on logout
      sessionStorage.removeItem('role'); 
      sessionStorage.removeItem('id');
    },
    setRole(state, role) {
      state.role = role;
      sessionStorage.setItem('role', role); // Persist role
    },
    setUserId(state, id) {
      state.id = id;
      sessionStorage.setItem('id', id);
    },
    initializeStore(state) {
      // Check if `loggedIn`, `id` and `role` exist in sessionStorage and update state
      const loggedIn = sessionStorage.getItem('loggedIn') === 'true';
      const role = sessionStorage.getItem('role');
      const id = sessionStorage.getItem('id');

      state.loggedIn = loggedIn || false;
      state.role = role || "";
      state.id = id || "";
    }
  },
});

export default store;
