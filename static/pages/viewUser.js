const viewUser = {
    template : `
    <div class='dashboard'>
        <div class='container'>
            <div class="view_box">
                <h1 style="color: maroon; text-align: center; text-decoration: underline;">Campaign</h1>
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
                            <td>Date Created</td>
                            <td>{{user.date_crated}}</td>
                        </tr>
                        <tr v-if='user.roles=="professional"'>
                            <td>Service Id</td>
                            <td>{{user.service_id}}</td>
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
                            <td><a href="#">View Document</a></td>
                        </tr>
                    </tbody>
                </table>
                <br><br>
                <button class="accept_link" @click="sendApproval(user.id)" v-if="!user.active && user.roles === 'professional'">Activate</button>
                <button class="accept_link" @click="sendApproval(user.id)" v-if="!user.active && user.roles==='customer'">UnFlag</button>
                <button class="reject_link" @click="flagUser(user.id)" v-if="user.active">Flag</button>
                <button class="view_link" @click="$router.go(-1)">Back</button>
                <br><br>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            user: {}
        }
    },
    methods: {
        async sendApproval(id) {
            const res = await fetch(window.location.origin + '/activate-user/' + id, {
                headers: {
                    'Authentication-Token': sessionStorage.getItem('token'),
                },
            });
            if (res.ok) {
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
                alert('User flagged');
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
    },
}

export default viewUser;