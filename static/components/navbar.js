const navbar = {
    template : `
    <nav>
        <!-- <router-link to='/'>Home</router-link> -->
        <!-- <router-link v-if="!state.loggedIn" to='/login'>Login</router-link> -->
        <router-link v-if="state.loggedIn && state.role==='admin'" to='/dashboardAdmin'>Dashboard</router-link>
        <router-link v-if="state.loggedIn && state.role==='customer'" to='/dashboardCust'>Dashboard</router-link>
        <router-link v-if="state.loggedIn && state.role==='professional'" to='/dashboardProf'>Dashboard</router-link>
        <router-link v-if="state.loggedIn" to='/profile'>Profile</router-link>
        <button v-if="state.loggedIn" @click="logout">Logout</button>
    </nav>
    `,
    data() {
        return{
            url : window.location.origin + "/logout",
        };
    },
    computed : {
        state() {
            return this.$store.state;
        },
    },
    methods : {
        logout() {
            sessionStorage.clear();
            this.$store.commit('logout')
            this.$store.commit('setRole', null)
            this.$router.replace('/')
        }
    }
};


export default navbar;