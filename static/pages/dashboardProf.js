import Service from "../components/service.js"

const dashboardProf = {
    template : `
    <div class='dashboard'>
        <h1><u>Professional Dashboard</u></h1>
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
      }  
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
    },
    async mounted() {
        const res = await fetch(window.location.origin + '/api/requests/professional/' + sessionStorage.getItem('id'), {
            headers : {
                'Authentication-Token' : sessionStorage.getItem('token')
            },
        });
        try {
            const data = await res.json();
            this.allRequests = data;
        } catch(e) {
            console.log('Error in converting to json');
        }  
    },
};


export default dashboardProf;