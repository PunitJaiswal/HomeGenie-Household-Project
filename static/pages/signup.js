import router from "../utils/router.js"

const signup = {
    template : `
        <div class="signup-page">
            <h1>Signup Page</h1>
            <p>Email</p>
            <input v-model="email" type="email" placeholder="Enter Email" required />
            <p>Name</p>
            <input v-model="name" type="name" placeholder="Enter Name" required />
            <p>Username</p>
            <input v-model="username" type="username" placeholder="Enter Username" required />
            <p>Password</p>
            <input v-model="password" type="password" placeholder="Enter Password" required />
            <br/></br>
            <label for="roles">Choose your Role:</label>
            <select v-model="role">
                <option value="professional">Professional</option>
                <option value="customer">Customer</option>
            </select>
            <button @click="submitInfo">Signup</button>
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