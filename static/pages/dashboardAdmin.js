const dashboardAdmin = {
    template: `
    <div class='dashboard'>
    <!-- Message Flashing -->
    <div v-if="status === 'error'" class='errorMessage'>{{message}}</div>
    <div v-if="status === 'success'" class='successMessage'>{{message}}</div>
    <br><br>
        <h1 style="text-align:left;"><u> Admin Dashboard </u></h1>
        <br><br>
        <h2 style="text-align:left;"><u>All Professionals:</u></h2>
        <br>
        <table v-if="allProfs.length" class="view_table">
            <thead class="table_head">
                <tr>
                    <td><h3>Name</h3></td>
                    <td><h3>Email</h3></td>
                    <td><h3>Action</h3></td>
                </tr>
            </thead>
            <tbody>
                <tr v-for="prof in allProfs" :key="prof.id">
                    <td>{{prof.name}}</td>
                    <td>{{prof.email}}</td>
                    <td>
                        <button class="view_link" @click="viewUser(prof.id)">View</button> 
                        <button class="accept_link" @click="sendApproval(prof.id)" v-if="!prof.active">Activate</button>
                        <button class="reject_link" @click="flagUser(prof.id)" v-if="prof.active">Flag</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <p v-if="!allProfs.length">No Professionals registered yet</p>
        <br><br><br>
        <h2 style="text-align:left;"><u>All Customers:</u></h2>
        <br>
        <table v-if="allCusts.length" class="view_table">
            <thead class="table_head">
                <tr>
                    <td><h3>Name</h3></td>
                    <td><h3>Email</h3></td>
                    <td><h3>Action</h3></td>
                </tr>
            </thead>
            <tbody>
                <tr v-for="cust in allCusts" :key="cust.email">
                    <td>{{cust.name}}</td>
                    <td>{{cust.email}}</td>
                    <td>
                        <button class="view_link" @click="viewUser(cust.id)">View</button> 
                        <button class="accept_link" @click="sendApproval(cust.id)" v-if="!cust.active">Unflag</button>
                        <button class="reject_link" @click="flagUser(cust.id)" v-if="cust.active">Flag</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <p v-if="!allCusts.length">No Customers registered yet</p>
    </div>
    `,
    data() {
        return {
            inactiveProfs: [],
            allProfs: [],
            allCusts: [],
            message:"",
            status:""
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
