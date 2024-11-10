import router from "../utils/router.js"

const signup = {
    template : `
    <div class='dashboard'>
        <div class='logo'>
            <h1>HomeGenie</h1>
            <img src="/static/images/logo.png" alt="logo" width="500" height="500">
        </div>
        <div class="login-box">
            <h1>Signup Page</h1>
            <h3>Email</h3>
            <input class='input-box' v-model="email" type="email" placeholder="Enter Email" required />
            <h3>Name</h3>
            <input class='input-box' v-model="name" type="name" placeholder="Enter Name" required />
            <h3>Username</h3>
            <input class='input-box' v-model="username" type="username" placeholder="Enter Username" required />
            <h3>Password</h3>
            <input class='input-box' v-model="password" type="password" placeholder="Enter Password" required />
            <br/></br>
            <h3>Choose your Role:</h3>
            <select class='input-box' v-model="role">
                <option value="professional">Professional</option>
                <option value="customer">Customer</option>
            </select>
            <br><br>
            <button class='submit' @click="submitInfo">Signup</button>
            <p> Already Registered?
                <router-link to='/login'>Login</router-link>
            </p>
        </div>
    </div>
    `,
    data () {
        return {
            email : "",
            password : "",
            username : "",
            name : "",
            role : "",
        };
    },
    methods : {
        async submitInfo() {
            const url = window.location.origin;
            const res = await fetch(url + '/signup', {
                method : 'POST',
                headers: {
                    "Content-Type" : 'application/json',
                },
                body : JSON.stringify({
                    email : this.email,
                    password : this.password,
                    role : this.role,
                    name : this.name,
                    username : this.username,
                }),
                credentials : 'same-origin',
            });
            
            if (res.ok) {
                const data = await res.json();
                console.log(data);
                router.push('login');
            }
            else{
                const errorData = await res.json();
                console.error('signup failed', errorData)
            }
        },
    },

};


export default signup;