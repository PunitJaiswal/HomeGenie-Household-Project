import home from '../pages/home.js';
import login from '../pages/login.js';
import signup from '../pages/signup.js';
import logout from '../pages/logout.js';
import profile from '../pages/profile.js';
import dashboardAdmin from '../pages/dashboardAdmin.js';
import dashboardCust from '../pages/dashboardCust.js';
import dashboardProf from '../pages/dashboardProf.js';
import manageService from '../pages/manageService.js';
import viewUser from '../pages/viewUser.js';
import viewServiceProf from '../pages/viewServiceProf.js';

const routes = [
    {path : '/', component : home},
    {path : '/login', component : login},
    {path : '/signup', component : signup},
    {path : '/logout', component : logout},
    {path : '/profile/:id', component : profile},
    {path : '/dashboardAdmin', component : dashboardAdmin},
    {path : '/dashboardCust', component : dashboardCust},
    {path : '/dashboardProf', component : dashboardProf},
    {path : '/manageService', component : manageService},
    {path : '/viewUser/:id', component : viewUser},
    {path : '/viewServiceProf/:id', component : viewServiceProf}
]

const router = new VueRouter({
    routes,
})


export default router;