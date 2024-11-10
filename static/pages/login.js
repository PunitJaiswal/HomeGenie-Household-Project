const login = {
    template: `
    <div class="dashboard">
        <div class='logo'>
            <h1> HomeGenie </h1>
            <img src="/static/images/logo.png" alt="logo" width="500" height="500">
        </div>
        <div class="login-box">
            <div>
                <h3>Email</h3>
                <input class='input-box' v-model="email" type="email" placeholder="Enter Email" required />
            </div>
            <div>
                <h3>Password</h3>
                <input class='input-box' v-model="password" type="password" placeholder="Enter Password" required />
            </div>
            <br>
            <div>
                <button class='submit' @click="submitInfo">Login</button>
            </div>
            <p> Not Register?
                <router-link to='/signup'>Signup</router-link>
            </p>
        </div>
    </div>
    `,
    data() {
        return {
            email : "",
            password : "",
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
                sessionStorage.setItem('token', data.token)
                sessionStorage.setItem('role', data.role)
                sessionStorage.setItem('email', data.email)
                sessionStorage.setItem('id', data.id)
                
                this.$store.commit('setLogin', true)
                this.$store.commit('setRole', data.role)

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
            } else{
                const errorData = await res.json();
                console.error('Login Failed', errorData);
            }
        },
    },
    
};

export default login;