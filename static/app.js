import router from "./utils/router.js"
import Navbar from "./components/navbar.js"

new Vue({
    el : '#app',
    template: `
    <div>
        <navbar/>
        <router-view/>
    </div>
    `,
    router,
    components : {
        Navbar,
    },
});