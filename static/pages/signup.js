import router from "../utils/router.js"

const signup = {
    template : `
    <div class='login-dash'>
        <div class='logo'>
            <h1>HomeGenie</h1>
            <img src="/static/images/logo.png" alt="logo" width="500" height="500">
        </div>
        <div class='login-container'>
            <!-- Message Flashing -->
            <div v-if="status === 'error'" class='errorMessage'>{{message}}</div>
            <div v-if="status === 'success'" class='successMessage'>{{message}}</div>
            <br><br>
            <div class="signup-box">
                <div class='input'>
                    <h2 class='top-heading'>Signup Page</h2><br>
                    <p class='sub-heading'>Email : 
                        <input class='input-box' v-model="email" type="email" placeholder="Enter Email" required />
                    </p><br>
                    <p class='sub-heading'>Name : 
                        <input class='input-box' v-model="name" type="name" placeholder="Enter Name" required />
                    </p><br>
                    <p class='sub-heading'>Username : 
                        <input class='input-box' v-model="username" type="username" placeholder="Enter Username" required />
                    </p><br>
                    <p class='sub-heading'>Password : 
                        <input class='input-box' v-model="password" type="password" placeholder="Enter Password" required />
                    </p><br>
                    <p class='sub-heading'>Choose your Role : 
                        <select class='input-box' v-model="role" placeholder="Select Role">
                            <option value="professional">Professional</option>
                            <option value="customer">Customer</option>
                        </select>
                    </p><br>
                    <div v-if="role ==='professional'">
                        <p class='sub-heading'>Service Type : 
                            <select class='input-box' v-model="service_id" placeholder="Select Service Type">
                                <option v-for="service in allServices" :key="service.id" :value="service.id">{{service.name}}</option>
                            </select>                    
                        </p>
                        <br>
                        <p class='sub-heading'>Experience (in year) : 
                            <input class='input-box' type='number' v-model='experience' placeholder='Enter Experience'>
                        </p><br>
                        <p class='sub-heading'>Location : 
                            <input class='input-box' type='text' v-model='location' placeholder='Enter Location'>
                        </p><br>
                        <p class='sub-heading'>Pincode : 
                            <input class='input-box' type='text' v-model='pincode' placeholder='Enter Pincode'>
                        </p><br>
                        <p class='sub-heading'>Contact No. : 
                            <input class='input-box' type='text' v-model='contact' placeholder='Enter Location'>
                        </p><br>
                        <p class="sub-heading">
                            Description:<input class="input-file" type="file" placeholder="Upload your work description">
                        </p><br>
                    </div>
                    <div v-if="role ==='customer'">
                        <p class='sub-heading'>Location : 
                            <input class='input-box' type='text' v-model='location' placeholder='Enter Location'>
                        </p><br>
                        <p class='sub-heading'>Pincode : 
                            <input class='input-box' type='text' v-model='pincode' placeholder='Enter Pincode'>
                        </p><br>
                        <p class='sub-heading'>Contact No. : 
                            <input class='input-box' type='text' v-model='contact' placeholder='Enter Contact No.'>
                        </p><br>
                    </div>
                    <button class='submit-btn' @click="submitInfo">Signup</button>
                </div>
                <br>
                <p> Already Registered?
                    <router-link to='/login'>Login</router-link>
                </p>
                <br>
            </div>
        </div>
    </div>
    `,
    data () {
        return {
            allServices: [],
            email : "",
            password : "",
            username : "",
            name : "",
            role : "",
            description:"",
            service_id:"",
            experience:"",
            location:"",
            pincode:"",
            contact:"",
            message:"",
            status:""
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
                    description: this.description,
                    service_id: this.service_id,
                    experience: this.experience,
                    location: this.location,
                    pincode: this.pincode,
                    contact: this.contact,
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
    async mounted() {
        try {
            const response = await fetch(window.location.origin + "/api/services", {
                headers: {
                    "Authentication-Token": sessionStorage.getItem("token")
                }
            });
            if (response.ok) {
                this.allServices = await response.json();
            } else {
                alert("Failed to fetch services");
            }
        } catch (error) {
            console.error("Error fetching services:", error);
        }
    },
};


export default signup;