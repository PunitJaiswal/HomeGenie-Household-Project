const login = {
    template: `
    <div class="login-dash">
        <div class='logo'>
            <h1> HomeGenie </h1>
            <img src="/static/images/logo.png" alt="logo" width="500" height="500">
        </div>
        
        <div class='login-container'>
            <!-- Message Flashing -->
            <div v-if="status === 'error'" class='errorMessage'>{{message}}</div>
            <div v-if="status === 'success'" class='successMessage'>{{message}}</div>
            <br><br>
            <div class="login-box">
                <h2 class='top-heading'> Login </h2><br>
                <div>
                    <p class="sub-heading">Email</p>
                    <input class='input-box' v-model="email" type="email" placeholder="Enter Email" required />
                    <br><br>
                    <p class="sub-heading">Password</p>
                    <input class='input-box' v-model="password" type="password" placeholder="Enter Password" required />
                    <br>
                    <button class='submit-btn' @click="submitInfo">Login</button>
                </div>
                <br>
                <p> Not Register?
                    <router-link to='/signup'>Signup</router-link>
                </p>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            email : "",
            password : "",
            message : '',
            status : ''
        };
    },
    methods : {
        async submitInfo() {
            const url = window.location.origin;
            const res = await fetch(url + '/user-login', {
                method : 'POST',
                headers : {
                    "Content-Type" : "application/json",
                },
                body : JSON.stringify({email : this.email, password : this.password}),
            });
            if (res.ok) {
                const data = await res.json();
                if (data.token && data.role && data.email && data.id) {
                    sessionStorage.setItem('token', data.token)
                    sessionStorage.setItem('role', data.role)
                    sessionStorage.setItem('email', data.email)
                    sessionStorage.setItem('id', data.id)
                    
                    this.$store.commit('setLogin', true)
                    this.$store.commit('setRole', data.role)
                    this.$store.commit('setUserId', data.id)
                    
                    switch (data.role) {
                        case "customer":
                            this.$router.push('/dashboardCust');
                            break;
                        case 'professional':
                            this.$router.push('/dashboardProf');
                            break;
                        case 'admin':
                            this.$router.push('/dashboardAdmin');
                            break;
                    }
                } else {
                    this.message = data.message;
                    this.status = data.status
                }
            } else{
                this.message = data.message
                this.status = data.status
            }
        },
    },
    
};

export default login;