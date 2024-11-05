import navbar from './components/navbar.js'
import router from './utils/router.js'

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
        navbar,
    },
})