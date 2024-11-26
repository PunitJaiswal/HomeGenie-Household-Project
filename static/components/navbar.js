const navbar = {
    template : `
    <nav v-if='state.loggedIn' class='navbar'>
        <img src="/static/images/navbar_logo2.png" alt="logo" width="200" height="40">
        <h2 v-if="state.loggedIn && state.role === 'admin'"> Admin Dashboard </h2>
        <h2 v-if="state.loggedIn && state.role === 'customer'"> Customer Dashboard </h2>
        <h2 v-if="state.loggedIn && state.role === 'professional'"> Professional Dashboard </h2>
        <div>
            <router-link v-if="state.loggedIn && state.role === 'admin'" to='/dashboardAdmin'>Dashboard</router-link>
            <router-link v-if="state.loggedIn && state.role === 'admin'" to='/manageService'>Manage Service</router-link>
            <router-link v-if="state.loggedIn && state.role === 'customer'" to='/dashboardCust'>Dashboard</router-link>
            <router-link v-if="state.loggedIn && state.role === 'professional'" to='/dashboardProf'>Dashboard</router-link>
            
            <router-link v-if='state.loggedIn && state.role === "admin"' to='/statsAdmin'> Stats </router-link>
            <router-link v-if='state.loggedIn && state.role === "customer"' to='/statsCust'> Stats </router-link>
            <router-link v-if='state.loggedIn && state.role === "professional"' to='/statsProf'> Stats </router-link>
            
            <router-link v-if='state.loggedIn && state.role === "customer"' to='/searchProf'><i class="fa-solid fa-magnifying-glass"></i> Search </router-link>
            <router-link v-if="state.loggedIn && !(state.role === 'admin')" :to="'/profile/' + state.id"><i class="fa-solid fa-user"></i> Profile</router-link>
            <button v-if="state.loggedIn" @click="logout">Logout</button>
        </div>
    </nav>
    `,
    data() {
        return {
            url: window.location.origin + "/logout",
        };
    },
    computed: {
        state() {
            return this.$store.state;
        },
    },
    methods: {
        logout() {
            sessionStorage.clear();
            this.$store.commit('logout');
            this.$store.commit('setRole', null);
            this.$router.replace('/');
        }
    },
    
};

export default navbar;
