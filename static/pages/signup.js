import alertComponent from "../components/alertComponent.js";
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
            <alertComponent ref='alert' />
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
                    <select v-model="role" class='input-box'>
                        <option value="" disabled selected>Select Role</option>
                        <option value="professional">Professional</option>
                        <option value="customer">Customer</option>
                    </select>
                    </p><br>
                    <div v-if="role ==='professional'">
                        <p class='sub-heading'>Service Type : 
                            <select class='input-box' v-model="service_id">
                                <option value="" disabled selected>Select Service Type</option>
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
                            <input class='input-box' type='text' v-model='contact' placeholder='Enter Contact No.'>
                        </p><br>
                        <p class="sub-heading">
                            Description:<input class="input-file" type="file" @change="handleFileUpload($event)">
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
                            <input class='input-box' v-model='contact' type='text' placeholder='Enter Contact No.'>
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
        handleFileUpload(event) {
            const file = event.target.files[0];
            if (file) {
                this.description = file; // Store the file object
            } else {
                this.description = null; // Clear file if nothing is selected
            }
        },
        async submitInfo() {
            const formData = new FormData();
        
            // Append all text data
            formData.append('email', this.email);
            formData.append('password', this.password);
            formData.append('role', this.role);
            formData.append('name', this.name);
            formData.append('username', this.username);
            formData.append('service_id', this.service_id);
            formData.append('experience', this.experience);
            formData.append('location', this.location);
            formData.append('pincode', this.pincode);
            formData.append('contact', this.contact);
        
            // Append the file
            if (this.description) {
                formData.append('description', this.description); 
            }
        
            const url = window.location.origin;
            const res = await fetch(url + '/signup', {
                method: 'POST',
                body: formData, 
                credentials: 'same-origin', 
            });
        
            if (res.ok) {
                const data = await res.json();
                this.$refs.alert.showAlert('User Registered Successfully', 'success')
                router.push('login'); 
            } else {
                const errorData = await res.json();
                console.error('Signup failed', errorData);
                this.$refs.alert.showAlert(errorData.message, errorData.status)
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
    components: {
        alertComponent,
    }
};


export default signup;