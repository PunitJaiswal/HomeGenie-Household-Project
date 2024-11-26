import alertComponent from "../components/alertComponent.js";

const dashboardProf = {
    template : `
    <div class='dashboard'>
        <alertComponent ref='alert' />

        <h1 style="text-align:left; font-size: 6vmin; margin-top:0vmin;"><u>Welcome {{self.name}},</u></h1>
        <br><br>
        <h2 style="text-align:left;"><u>All Requests</u></h2>
        <br>
        <table v-if="allRequests.length" class="view_table">
            <thead class="table_head">
                <tr>
                    <td><h3>Customer Name</h3></td>
                    <td><h3>Message</h3></td>
                    <td><h3>Location</h3></td>
                    <td><h3>Action</h3></td>
                    <td><h3>Rating</h3></td>
                </tr>
            </thead>
            <tbody>
                <tr v-for="request in allRequests" :key="request.id">
                    <td>{{request.customer_name}}</td>
                    <td>{{request.remarks}}</td>
                    <td>{{request.location}}</td>
                    <td>
                        <button v-if="request.status === 'Pending'" class="accept_link" @click="acceptRequest(request.id)" >Accept</button>
                        <button v-if="request.status === 'Pending'" class="reject_link" @click="rejectRequest(request.id)" >Reject</button>
                        <h3 class="rejected-word" v-if="request.status == 'Rejected'">{{request.status}}</h3>
                        <h3 class="completed-word" v-if="request.status == 'Closed'">{{request.status}}</h3>
                        <h3 class="accepted-word" v-if="request.status == 'Accepted'">{{request.status}}</h3>
                    </td>
                    <td v-if="request.status === 'Closed'">{{request.rating}}</td>
                    <td v-else>Not Provided yet</td>
                </tr>
            </tbody>
        </table>
        <h3 v-if="!allRequests.length">No Request recieved yet</h3>
    </div>
    `,
    data() {
        return {
            self:{},
            allRequests : [],
        };
    },
    methods : {
      async acceptRequest(id) {
        const res = await fetch(window.location.origin + '/api/requests/accept/' + id, {
            method : 'PUT',
            headers : {
                'Authentication-Token' : sessionStorage.getItem('token')
            },
        });
        const data = await res.json();
        this.allRequests = this.allRequests.filter(request => {
            return request.id !== id
        });
        // Flash alert
        this.$refs.alert.showAlert('Request Accepted', 'success')
        // update allRequests
        const res2 = await fetch(window.location.origin + '/api/requests/professional/' + sessionStorage.getItem('id'), {
            headers : {
                'Authentication-Token' : sessionStorage.getItem('token')
            },
        });
        const data2 = await res2.json();
        this.allRequests = data2;
    },
    async rejectRequest(id) {
        const res = await fetch(window.location.origin + '/api/requests/reject/' + id, {
            method : 'PUT',
            headers : {
                'Authentication-Token' : sessionStorage.getItem('token')
            },
        });
        const data = await res.json();
        this.allRequests = this.allRequests.filter(request => {
            return request.id !== id
        });
        // Flash alert
        this.$refs.alert.showAlert('Request Rejected', 'error');
        const res2 = await fetch(window.location.origin + '/api/requests/professional/' + sessionStorage.getItem('id'), {
            headers : {
                'Authentication-Token' : sessionStorage.getItem('token')
            },
        });
        const data2 = await res2.json();
        this.allRequests = data2;
        },
    },
    async mounted() {
        const res = await fetch(window.location.origin + '/api/requests/professional/' + sessionStorage.getItem('id'), {
            headers : {
                'Authentication-Token' : sessionStorage.getItem('token')
            },
        });
        const data = await res.json();
        this.allRequests = data;

        const userRes = await fetch(window.location.origin + '/viewUser/' + sessionStorage.getItem('id'), {
            headers: {
                'Authentication-Token': sessionStorage.getItem('token')
            },
        });
        if (userRes.ok) {
            this.self = await userRes.json();
        }
    },
    components: {
        alertComponent,
    }
};


export default dashboardProf;