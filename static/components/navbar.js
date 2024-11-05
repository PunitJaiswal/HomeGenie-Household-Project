const navbar = {
    template : `
    <nav>
        <router-link to='/'></router-view>
        <router-link to='/login'>Login</router-view>
        <router-link to='/signup'>Signup</router-view>
        <router-link to='/logout'>Logout</router-view>
    </nav>
    `,
    data() {
        return{
            url : window.location.origin + "/logout"
        }
    }
};



export default navbar;