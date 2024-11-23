const searchProf = {
    template: `
    <div class='dashboard'>
        <!-- Message Flashing -->
        <div v-if="status === 'error'" class='errorMessage'>{{message}}</div>
        <div v-if="status === 'success'" class='successMessage'>{{message}}</div>
        <br><br>
        <h2 style="text-align:left;"><u>Search Professionals:</u></h2>
        <br>
        <div class="search-filter">
            <form @submit.prevent="searchProf" method="POST">
                <input type="text" v-model="name" placeholder="Enter Name">
                <input type="text" v-model="location" placeholder="Enter location">
                <input type="text" v-model="pincode" placeholder="Enter Pincode">
                <button class="accept_link">Search Professional</button>
            </form>
        </div>
        <table v-if="activeProfs.length" class="view_table">
            <thead class="table_head">
                <tr>
                    <td><h3>Name</h3></td>
                    <td><h3>Service Type</h3></td>
                    <td><h3>Location</h3></td>
                    <td><h3>Pincode</h3></td>
                    <td><h3>Action</h3></td>
                </tr>
            </thead>
            <tbody>
                <tr v-for="prof in activeProfs" :key="prof.id">
                    <td>{{prof.name}}</td>
                    <td>{{prof.service_type}}</td>
                    <td>{{prof.location}}</td>
                    <td>{{prof.pincode}}</td>
                    <td>
                        <button class="view_link" @click="openViewForm(prof.id)">View</button> 
                        <button class="accept_link" @click="openAddForm(prof)">Request</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <h3 v-if="!activeProfs.length">No Professionals</h3>
        <br><br>
        <div v-if="showViewForm" class="add_service_form">
            <h2 style="color: maroon; text-align: center; text-decoration: underline;">Professional</h2>
            <br>
            <table class="view_table">
                <thead>
                    <tr>
                        <th><h3>Professional Details</h3></th>
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
                        <td>Date Created</td>
                        <td>{{user.date_created}}</td>
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
                    <tr>
                        <td>Description</td>
                        <td><a :href="user.description">View Document</a></td>
                    </tr>
                </tbody>
            </table>
            <br><br>
            <button class="back_link" @click="showViewForm = false">Back</button>
            <br><br>
        </div>
        <div v-if="showAddForm" class="add_service_form">
            <h2><u>Add New Service</u></h2><br>
            <form @submit.prevent="sendRequest">
                <p class="left-topic"><strong>Professional Name : </strong>{{prof.name}}</p>
                <input class='input-box' type="text" :value="prof.id" readonly hidden/><br>
                <p class="left-topic"><strong>Service Name :</strong>{{prof.service_type}}</p>
                <input class='input-box' type="text" :value="prof.service_id" readonly hidden/><br>
                <h3 class="left-topic">Message :</h3>
                <input class='input-box' type="text" v-model="newRequest.remarks" required/>
                <br><br>
                <!-- Buttons -->
                <button type="submit" class="accept_link">Create Request</button>
                <button type="button" @click="showAddForm = false" class="reject_link">Cancel</button>
            </form>
        </div>
    </div>
    `,
    data() {
        return {
            activeProfs: [],
            message:"",
            status:"",
            name:"",
            location:"",
            pincode:"",
            user:{},
            newRequest:{
                service_id: null,
                professional_id: null,
                customer_id: null,
                remarks: '',
            },
            showAddForm: false,
            showViewForm: false
        };
    },
    methods: {
        // View User
        async viewUser(id) {
            try {
                this.isLoading = true; // Set loading state to true
        
                // Fetch user data before navigating
                const userRes = await fetch(window.location.origin + '/customer/viewProf/' + id, {
                    headers: {
                        'Authentication-Token': sessionStorage.getItem('token')
                    },
                });
                
                if (!userRes.ok) throw new Error('Failed to fetch user data');
                
                // Now, navigate after the data is fetched
                this.$router.push('/viewUser/' + id);
        
            } catch (error) {
                console.error('Error fetching user data:', error);
                alert('Failed to load user data');
            } finally {
                this.isLoading = false; // Set loading state to false
            }
        },
        openAddForm(prof) {
            this.showAddForm = true;
            this.prof = prof;
        },
        async sendRequest() {
            // Populate the newRequest object with the relevant values
            this.newRequest.professional_id = this.prof.id;
            this.newRequest.service_id = this.service.id;
            this.newRequest.remarks = this.newRequest.remarks || '';
            this.newRequest.customer_id = this.customer.id;
    
            const response = await fetch(`${window.location.origin}/api/requests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': sessionStorage.getItem('token'),
                },
                body: JSON.stringify(this.newRequest),
            });
    
            if (response.ok) {
                const result = await response.json();
                alert(result.message || 'Request sent successfully!');
    
                // Mark the professional as requested (optional if needed in UI)
                const prof = this.allServiceProfs.find(prof => prof.id === this.prof.id);
                if (prof) prof.requested = true;
    
                // Close the form after successful submission
                this.showAddForm = false;
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to send request.');
            }
        },
        async searchProf() {
            this.status = ""; // Clear previous status
            this.message = ""; // Clear previous messages
            this.activeProfs = []; // Reset the professional list
            this.loading = true; // Indicate the loading state
    
            const response = await fetch(`${window.location.origin}/searchProf`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': sessionStorage.getItem('token'),
                },
                body: JSON.stringify({
                    name: this.name?.trim() || null, // Send null if the field is empty
                    location: this.location?.trim() || null,
                    pincode: this.pincode?.trim() || null, // Send null if not provided
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                // Handle errors with appropriate message
                this.status = "error";
                this.message = data.message || "Failed to fetch professionals. Please try again.";
                return;
            }
            if (data.results && data.results.length > 0) {
                this.activeProfs = data.results; // Populate results
                this.status = "success";
                this.message = "Professionals searched successfully.";
            } else {
                // No professionals found
                this.activeProfs = [];
                this.status = "error";
                this.message = "No professionals found matching the criteria.";
            }
        },
        async openViewForm(id) {
            const userRes = await fetch(window.location.origin + '/customer/viewProf/' + id, {
                headers: {
                  'Authentication-Token': sessionStorage.getItem('token')
                },
              });
              if (userRes.ok) {
                this.user = await userRes.json();
                this.showViewForm = true; // Open the view form once data is loaded
              } else {
                alert("Failed to load user data");
              }
            },
    },        
    async mounted() {
        // Fetch all professionals
        const profsRes = await fetch(window.location.origin + '/active-prof-list', {
            headers: {
                'Authentication-Token': sessionStorage.getItem('token')
            },
        });
        this.activeProfs = await profsRes.json();
    },
};

export default searchProf;
