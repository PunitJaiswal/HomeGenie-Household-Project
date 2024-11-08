const navbar = {
    template : `
    <nav>
        <router-link to='/'>Home</router-link>||
        <router-link to='/login'>Login</router-link>||
        <router-link to='/signup'>Signup</router-link>||
        <router-link to='/dashboardCust'>Dashboard</router-link>||
        <a :href="logoutURL">Logout</a>
    </nav>
    `,
    data() {
        return{
            logoutURL : window.location.origin + "/logout"
        };
    },
};



export default navbar;