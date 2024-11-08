const login = {
    template: `
        <div class="login_box">
            <div>
                <h3>Email</h3>
                <input v-model="email" type="email" placeholder="Enter Email" required />
            </div>
            <div>
                <p>Password</p>
                <input v-model="password" type="password" placeholder="Enter Password" required />
            </div>
            <div>
                <button @click="submitInfo">Login</button>
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
                
                this.$router.push('/dashboardCust');
            } else{
                const errorData = await res.json();
                console.error('Login Failed', errorData);
            }
        },
    }
};

export default login;