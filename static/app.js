import router from "./utils/router.js"
import Navbar from "./components/navbar.js"
import store from "./utils/store.js"


new Vue({
    el : '#app',
    template: `
    <div>
        <navbar/>
        <router-view/>
    </div>
    `,
    router,
    store,
    components : {
        Navbar,
    },
});