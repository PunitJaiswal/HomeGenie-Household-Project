const login = {
    template: `
        <div class="login_box">
            <h3>Email</h3>
            <input v-model="email" type="email" placeholder="Enter Email" required />
            <p>Password</p>
            <input v-model="password" type="password" placeholder="Enter Password" required />
            <button @click="submitInfo">Login</button>
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
            const res = await fetch(url + '/login', {
                method : 'POST',
                headers : {
                    "Content-Type" : "application/json",
                },
                body : JSON.stringify({email : this.email, password : this.password}),
            });
            if (res.ok) {
                this.$router.push('/profile');
            } else{
                console.error('Login Failed');
            }
        },
    }
};

export default login;