const profile = {
    template : `
    <div class='dashboard'>
        <div class='container'>
            <div v-if="showViewForm" class="view_box">
                <h2 style="color: maroon; "><u>Profile</u></h2>
                <br>
                <table class="view_table">
                    <thead>
                        <tr>
                            <th v-if='user.roles=="professional"'><h3>Professional Details</h3></th>
                            <th v-if='user.roles=="customer"'><h3>Customer Details</h3></th>
                            <th><h3>Information</h3></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Name</td>
                            <td>{{user.name}}</td>
                        </tr>
                        <tr>
                            <td>Email</td>
                            <td>{{user.email}}</td>
                        </tr>
                        <tr>
                            <td>Username</td>
                            <td>{{user.username}}</td>
                        </tr>
                        <tr>
                            <td>Date Created</td>
                            <td>{{user.date_crated}}</td>
                        </tr>
                        <tr v-if='user.roles=="professional"'>
                            <td>Service Type</td>
                            <td>{{user.service_type}}</td>
                        </tr>
                        <tr v-if='user.roles=="professional"'>
                            <td>Experience</td>
                            <td>{{user.experience}}</td>
                        </tr>
                        <tr>
                            <td>Location</td>
                            <td>{{user.location}}</td>
                        </tr>
                        <tr>
                            <td>Pincode</td>
                            <td>{{user.pincode}}</td>
                        </tr>
                        <tr>
                            <td>Contact</td>
                            <td>{{user.contact}}</td>
                        </tr>
                        <tr v-if='user.roles=="professional"'>
                            <td>Description</td>
                            <td><a :href="user.description">View Document</a></td>
                        </tr>
                    </tbody>
                </table>
                <br><br>
                <button class="view_link" @click="openEditForm(user)">Edit</button>
                <button class="back_link" @click="$router.go(-1)">Back</button>
                <br><br>
            </div>

            <!-- Edit Profile -->
            <div v-if="showEditForm" class="view_box">
                <h2 style="color: maroon; "><u>Edit Profile</u></h2>
                <br>
                <form @submit.prevent="updateUser(user)">
                <table class="view_table">
                    <thead>
                        <tr>
                            <th v-if='user.roles=="professional"'><h3>Professional Details</h3></th>
                            <th v-if='user.roles=="customer"'><h3>Customer Details</h3></th>
                            <th><h3>Information</h3></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Name</td>
                            <td><input class='input-box' v-model="user.name" type="text" required /></td>
                        </tr>
                        <tr>
                            <td>Email</td>
                            <td><input class='input-box' v-model="user.email" type="email" required /></td>
                        </tr>
                        <tr>
                            <td>Username</td>
                            <td><input class='input-box' v-model="user.username" type="text" required /></td>
                        </tr>
                        <tr v-if='user.roles=="professional"'>
                            <td>Service Type</td>
                            <td>
                            <select class='input-box' v-model="user.service_id">
                                <option v-for="service in allServices" :key="service.id" :value="service.id">{{service.name}}</option>
                            </select>
                            </td>
                        </tr>
                        <tr v-if='user.roles=="professional"'>
                            <td>Experience</td>
                            <td><input class='input-box' v-model="user.experience" type="number" required /></td>
                        </tr>
                        <tr>
                            <td>Location</td>
                            <td><input class='input-box' v-model="user.location" type="text" required /></td>
                        </tr>
                        <tr>
                            <td>Pincode</td>
                            <td><input class='input-box' v-model="user.pincode" type="text" required /></td>
                        </tr>
                        <tr>
                            <td>Contact</td>
                            <td><input class='input-box' v-model="user.contact" type="text" required /></td>
                        </tr>
                        <tr v-if='user.roles=="professional"'>
                            <td>Description</td>
                            <td><input class="input-file" type="file" @change="handleFileUpload($event)"></td>
                        </tr>
                    </tbody>
                </table>
                <br><br>
                <button type="submit" class="accept_link">Update Changes</button>
                <button type="button" @click="(showViewForm = true) && (showEditForm = false)" class="reject_link">Cancel</button>
                <br><br>
            </form>
            </div>
            <div v-if="user.roles=='professional'" class='review-box'>
                <h2>All Reviews</h2><br>
                <p v-if="allReview.length"><strong>Overall Rating: </strong>{{user.rating}} ★</p>
                <p v-else>No Reviews</p>
                <div class="review" v-for="review in allReview" :key="review.id">
                    <p>{{review.review}}</p>
                    <p><strong>Rating: </strong>{{review.rating}} ★</p>
                    <p><strong>By: </strong>{{review.customer_name}}</p>
                </div>
            </div>
        </div>
    </div>
    `,
    data(){
        return{
            user: {},
            showEditForm: false,
            showViewForm: true,
            allServices:[],
            service_type: '',
            description:"",
            allReview:[],
        }
    },
    methods : {
        openEditForm(user) {
            this.user = { ...user };
            this.showViewForm = false;
            this.showEditForm = true;        // Show the edit form
        },
        handleFileUpload(event) {
            const file = event.target.files[0];
            if (file) {
                this.description = file;
            } else {
                this.description = null;
            }
        },
        async updateUser(user) {
            const formData = new FormData();
        
            // Append user fields to FormData
            formData.append("name", user.name);
            formData.append("email", user.email);
            formData.append("username", user.username);
            formData.append("location", user.location);
            formData.append("pincode", user.pincode);
            formData.append("contact", user.contact);
        
            if (user.roles === "professional") {
                formData.append("service_id", user.service_id);
                formData.append("experience", user.experience);
        
                // Append the file only if it's selected
                if (this.description) {
                    formData.append("description", this.description);
                }
            }
        
            try {
                const res = await fetch(window.location.origin + '/updateUser/' + user.id, {
                    method: 'PUT',
                    headers: {
                        'Authentication-Token': sessionStorage.getItem('token'),
                    },
                    body: formData,
                });
        
                if (res.ok) {
                    const updatedUser = await res.json();
                    this.showEditForm = false;
                    this.showViewForm = true;
                    this.user = updatedUser; // Update the user object with the response data
                } else {
                    alert("Failed to update user. Please check the inputs.");
                }
            } catch (error) {
                console.error("Error updating user:", error);
            }
        },
    },        
    async mounted() {
        try {
            const userRes = await fetch(window.location.origin + '/viewUser/' + this.$route.params.id, {
                headers: {
                    'Authentication-Token': sessionStorage.getItem('token')
                },
            });
            if (userRes.ok) {
                this.user = await userRes.json();
            } else {
                throw new Error('Failed to fetch user data');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }

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
        try {
            const response = await fetch(window.location.origin + "/api/reviews/professional/" + this.$route.params.id, {
                headers: {
                    "Authentication-Token": sessionStorage.getItem("token")
                }
            });
            if (response.ok) {
                this.allReview = await response.json();
            } else {
                alert("Failed to fetch services");
            }
        } catch (error) {
            console.error("Error fetching services:", error);
        }
    }
};

export default profile;