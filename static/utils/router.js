import home from '../pages/home.js';
import login from '../pages/login.js';
import signup from '../pages/signup.js';
import logout from '../pages/logout.js';


const routes = [
    {path : '/', component : home},
    {path : '/login', component : login},
    {path : '/signup', component : signup},
    {path : '/logout', component : logout}
]

const router = new VueRouter({
    routes,
})


export default router;