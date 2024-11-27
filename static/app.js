import router from "./utils/router.js";
import Navbar from "./components/navbar.js";
import store from "./utils/store.js";
import alertComponent from "./components/alertComponent.js";


new Vue({
    el: '#app',
    template: `
        <div>
            <alertComponent ref="alert" />
            <navbar />
            <router-view />
        </div>
    `,
    router,
    store,
    created() {
        this.$store.commit('initializeStore');
        
        this.$store.subscribe((mutation, state) => {
            if (mutation.type === 'SET_ALERT') {
                const { message, type } = mutation.payload;
                this.$nextTick(() => {
                    if (this.$refs.alert) {
                        console.log("Calling showAlert from store subscription");
                        this.$refs.alert.showAlert(message, type);
                    } else {
                        console.error("Alert component is still not available when calling showAlert.");
                    }
                });
            }
        });
    },
    mounted() {
        console.log(this.$refs);
    },     
    components: {
        Navbar,
        alertComponent,
    },
});
