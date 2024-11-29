import alertComponent from "../components/alertComponent.js";

const dashboardAdmin = {
    template: `
    <div class='dashboard'>
        <!-- Message Flashing -->
        <alertComponent ref='alert' />
        
        <h1 style="text-align:left; font-size: 6vmin; margin-top:0vmin;"><u>Welcome Admin,</u></h1>
        <div class="search-filter">
            <form @submit.prevent="searchUser" method="POST">
                <input type="text" v-model="name" placeholder="Enter Name">
                <input type="text" v-model="location" placeholder="Enter location">
                <input type="text" v-model="pincode" placeholder="Enter Pincode">
                <button class="accept_link">Search User</button>
            </form>
        </div>
        <table v-if="allProfs.length" class="view_table">
            <thead class="table_head">
                <tr>
                    <td colspan="7" style="text-align:center; background-color: #748cab">
                        <h2>All Professionals</h2>
                    </td>
                </tr>
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
        <br>
        <table v-if="allCusts.length" class="view_table">
            <thead class="table_head">
                <tr>
                    <td colspan="7" style="text-align:center; background-color: #748cab">
                        <h2>All Customers</h2>
                    </td>
                </tr>
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
                this.$refs.alert.showAlert('User Activated', 'success')
            }
            const custsRes = await fetch(window.location.origin + '/all-cust-list', {
                headers: {
                    'Authentication-Token': sessionStorage.getItem('token')
                },
            });
            this.allCusts = await custsRes.json();
            const profsRes = await fetch(window.location.origin + '/all-prof-list', {
                headers: {
                    'Authentication-Token': sessionStorage.getItem('token')
                },
            });
            this.allProfs = await profsRes.json();
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
                this.$refs.alert.showAlert("User Flagged", "error");
            }
            const custsRes = await fetch(window.location.origin + '/all-cust-list', {
                headers: {
                    'Authentication-Token': sessionStorage.getItem('token')
                },
            });
            this.allCusts = await custsRes.json();
            const profsRes = await fetch(window.location.origin + '/all-prof-list', {
                headers: {
                    'Authentication-Token': sessionStorage.getItem('token')
                },
            });
            this.allProfs = await profsRes.json();
        },
        // Search User
        async searchUser() {
            this.status = ""; 
            this.message = "";
            this.activeProfs = [];
            this.loading = true;
            
            const response = await fetch(`${window.location.origin}/searchUser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': sessionStorage.getItem('token'),
                },
                body: JSON.stringify({
                    name: this.name?.trim() || null,
                    location: this.location?.trim() || null,
                    pincode: this.pincode?.trim() || null,
                    role: this.role || null,
                }),
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                this.status = "error";
                this.message = data.message || "Failed to fetch professionals. Please try again.";
                this.$refs.alert.showAlert('User Searched Successfully', 'success')
            }
    
            if (data.customers.length > 0 || data.professionals.length > 0) {
                this.allCusts = data.customers;
                this.allProfs = data.professionals;
                this.status = "success";
                this.message = "Users searched successfully.";
            } else {
                this.allProfs = [];
                this.allCusts = [];
                this.status = "error";
                this.message = "No Users found matching the criteria.";
            }
        },
        
        // View User
        async viewUser(id) {
            // Fetch user data before navigating
            const userRes = await fetch(window.location.origin + '/viewUser/' + id, {
                headers: {
                    'Authentication-Token': sessionStorage.getItem('token')
                },
            });
            
            if (!userRes.ok) throw new Error('Failed to fetch user data');
            
            this.$router.push('/viewUser/' + id);
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
    components: {
        alertComponent,
    }
};

export default dashboardAdmin;
