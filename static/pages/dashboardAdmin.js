const dashboardAdmin = {
    template: `
    <div class='dashboard'>
        <!-- Message Flashing -->
        <div v-if="status === 'error'" class='errorMessage'>{{message}}</div>
        <div v-if="status === 'success'" class='successMessage'>{{message}}</div>
        <div class="search-filter">
            <form @submit.prevent="searchUser" method="POST">
                <input type="text" v-model="name" placeholder="Enter Name">
                <input type="text" v-model="location" placeholder="Enter location">
                <input type="text" v-model="pincode" placeholder="Enter Pincode">
                <button class="accept_link">Search User</button>
            </form>
        </div>
        <h1 style="text-align:left;"><u> Admin Dashboard </u></h1>
        <br><br>
        <h2 style="text-align:left;"><u>All Professionals:</u></h2>
        <br>
        <table v-if="allProfs.length" class="view_table">
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
                <tr v-for="prof in allProfs" :key="prof.id">
                    <td>{{prof.name}}</td>
                    <td>{{prof.service_type}}</td>
                    <td>{{prof.location}}</td>
                    <td>{{prof.pincode}}</td>
                    <td>
                        <button class="view_link" @click="viewUser(prof.id)">View</button> 
                        <button class="accept_link" @click="sendApproval(prof.id)" v-if="!prof.active">Activate</button>
                        <button class="reject_link" @click="flagUser(prof.id)" v-if="prof.active">Flag</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <h3 v-if="!allProfs.length">No Professionals</h3>
        <br><br><br>
        <h2 style="text-align:left;"><u>All Customers:</u></h2>
        <br>
        <table v-if="allCusts.length" class="view_table">
            <thead class="table_head">
                <tr>
                    <td><h3>Name</h3></td>
                    <td><h3>Location</h3></td>
                    <td><h3>Pincode</h3></td>
                    <td><h3>Action</h3></td>
                </tr>
            </thead>
            <tbody>
                <tr v-for="cust in allCusts" :key="cust.email">
                    <td>{{cust.name}}</td>
                    <td>{{cust.location}}</td>
                    <td>{{cust.pincode}}</td>
                    <td>
                        <button class="view_link" @click="viewUser(cust.id)">View</button> 
                        <button class="accept_link" @click="sendApproval(cust.id)" v-if="!cust.active">Unflag</button>
                        <button class="reject_link" @click="flagUser(cust.id)" v-if="cust.active">Flag</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <h3 v-if="!allCusts.length">No Customers</h3>
    </div>
    `,
    data() {
        return {
            inactiveProfs: [],
            allProfs: [],
            allCusts: [],
            message:"",
            status:"",
            name:"",
            location:"",
            pincode:"",
            role:""
        };
    },
    methods: {
        async sendApproval(id) {
            const res = await fetch(window.location.origin + '/activate-user/' + id, {
                headers: {
                    'Authentication-Token': sessionStorage.getItem('token'),
                },
            });
            if (res.ok) {
                this.message = "User activated";
                this.status = 'success';
                alert('User activated');
            }
        },
        // Block/Flag User
        async flagUser(id) {
            const res = await fetch(window.location.origin + '/flag-user/' + id, {
                headers: {
                    'Authentication-Token': sessionStorage.getItem('token'),
                },
            });
            if (res.ok) {
                this.message = "User flagged";
                this.status = 'error';
                alert('User flagged');
            }
        },
        // Search User
        async searchUser() {
            this.status = ""; // Clear previous status
            this.message = ""; // Clear previous messages
            this.activeProfs = []; // Reset the professional list
            this.loading = true; // Indicate the loading state
            
            const response = await fetch(`${window.location.origin}/searchUser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': sessionStorage.getItem('token'),
                },
                body: JSON.stringify({
                    name: this.name?.trim() || null, // Send null if the field is empty
                    location: this.location?.trim() || null,
                    pincode: this.pincode?.trim() || null,
                    role: this.role || null, // Send null if not provided
                }),
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                // Handle errors with appropriate message
                this.status = "error";
                this.message = data.message || "Failed to fetch professionals. Please try again.";
                return;
            }
    
            // Handle success response
            if (data.customers.length > 0 || data.professionals.length > 0) {
                this.allCusts = data.customers;
                this.allProfs = data.professionals;
                this.status = "success";
                this.message = "Users searched successfully.";
            } else {
                // No Users found
                this.allProfs = [];
                this.allCusts = [];
                this.status = "error";
                this.message = "No Users found matching the criteria.";
            }
        },

        // View User
        async viewUser(id) {
            try {
                this.isLoading = true; // Set loading state to true
        
                // Fetch user data before navigating
                const userRes = await fetch(window.location.origin + '/viewUser/' + id, {
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
    },
    async mounted() {
        // Fetch all professionals
        const profsRes = await fetch(window.location.origin + '/all-prof-list', {
            headers: {
                'Authentication-Token': sessionStorage.getItem('token')
            },
        });
        this.allProfs = await profsRes.json();

        // Fetch all customers
        const custsRes = await fetch(window.location.origin + '/all-cust-list', {
            headers: {
                'Authentication-Token': sessionStorage.getItem('token')
            },
        });
        this.allCusts = await custsRes.json();
    },
};

export default dashboardAdmin;
