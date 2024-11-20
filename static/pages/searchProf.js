const searchProf = {
    template: `
    <div class='dashboard'>
        <!-- Message Flashing -->
        <div v-if="status === 'error'" class='errorMessage'>{{message}}</div>
        <div v-if="status === 'success'" class='successMessage'>{{message}}</div>
        <br><br>
        <h2 style="text-align:left;"><u>Search Professionals:</u></h2>
        <br>
        <table v-if="activeProfs.length" class="view_table">
            <thead class="table_head">
                <tr>
                    <td><h3>Name</h3></td>
                    <td><h3>Email</h3></td>
                    <td><h3>Service Type</h3></td>
                    <td><h3>Action</h3></td>
                </tr>
            </thead>
            <tbody>
                <tr v-for="prof in activeProfs" :key="prof.id">
                    <td>{{prof.name}}</td>
                    <td>{{prof.email}}</td>
                    <td>{{prof.service_type}}</td>
                    <td>
                        <button class="view_link" @click="viewUser(prof.id)">View</button> 
                        <button class="accept_link" @click="sendApproval(prof.id)" v-if="!prof.active">Activate</button>
                        <button class="reject_link" @click="flagUser(prof.id)" v-if="prof.active">Flag</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <p v-if="!activeProfs.length">No Professionals registered yet</p>
        <br><br><br>
    </div>
    `,
    data() {
        return {
            activeProfs: [],
            message:"",
            status:""
        };
    },
    methods: {
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
        const profsRes = await fetch(window.location.origin + '/active-prof-list', {
            headers: {
                'Authentication-Token': sessionStorage.getItem('token')
            },
        });
        this.activeProfs = await profsRes.json();
    },
};

export default searchProf;
