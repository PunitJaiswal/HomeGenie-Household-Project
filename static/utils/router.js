import home from '../pages/home.js';
import login from '../pages/login.js';
import signup from '../pages/signup.js';
import logout from '../pages/logout.js';
import profile from '../pages/profile.js';
import store from '../utils/store.js';
import dashboardAdmin from '../pages/dashboardAdmin.js';
import dashboardCust from '../pages/dashboardCust.js';
import dashboardProf from '../pages/dashboardProf.js';
import manageService from '../pages/manageService.js';
import viewUser from '../pages/viewUser.js';
import viewServiceProf from '../pages/viewServiceProf.js';
import searchProf from '../pages/searchProf.js';

const routes = [
    {path : '/', component : home},
    {path : '/login', component : login},
    {path : '/signup', component : signup},
    {path : '/logout', component : logout},
    {path : '/profile/:id', component : profile, meta:{requiresLogin: true}},
    {path : '/dashboardAdmin', component : dashboardAdmin, meta : {requiresLogin: true}},
    {path : '/dashboardCust', component : dashboardCust, meta : { requiresLogin: true}},
    {path : '/dashboardProf', component : dashboardProf, meta: { requiresLogin: true}},
    {path : '/manageService', component : manageService, meta: { requiresLogin: true}},
    {path : '/viewUser/:id', component : viewUser, meta: { requiresLogin: true }},
    {path : '/viewServiceProf/:id', component : viewServiceProf, meta: { requiresLogin: true }},
    {path : '/searchProf', component : searchProf, meta: { requiresLogin: true }},
]

const router = new VueRouter({
    routes,
})

router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresLogin)) {
        if (!sessionStorage.getItem('token')) {
            next({ path: '/login' });
        } else if (to.meta.role && to.meta.role !== store.state.role) {
            next({path : '/'});
        } else {
            next();
        }
    } else {
        next();
    }
});


export default router;