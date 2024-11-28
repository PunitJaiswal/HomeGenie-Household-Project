import alertComponent from "../components/alertComponent.js";
import Service from "../components/service.js";

const dashboardCust = {
    template: `
    <div class="dashboard">
        <alertComponent ref='alert' />

        <h1 style="text-align:left; font-size: 6vmin; margin-top:0vmin;"><u>Welcome {{self.name}},</u></h1>
        <br><br>
        <h2 style="font-size:5vmin; text-align:center;"><u>All Services</u></h2>
        <br><br>
        <div class="container">
            <div v-for="service in allService" :key="service.id" class="items">
                <h2><u>{{ service.name }}</u></h2>
                <br>
                <p><strong>Description:</strong> {{ service.description }}</p>
                <br>
                <p><strong>Base Price:</strong> {{ service.base_price }} Rs.</p>
                <p><strong>Time Required:</strong> {{ service.time_required }} hr</p>
                <br>
                <button @click="viewService(service.id)" class="back_link">View Professionals</button>
            </div>
        </div>
        <br><br>
        <table v-if="allRequests.length" class="view_table">
            <thead class="table_head">
                <tr>
                    <td colspan="7" style="text-align:center; background-color: #748cab">
                        <h2>Send Requests</h2>
                    </td>
                </tr>
                <tr>
                    <td style="width:25vmin;"><h3>Professional Name</h3></td>
                    <td><h3>Service Type</h3></td>
                    <td style="width:35vmin;"><h3>Message</h3></td>
                    <td><h3>Date of Request</h3></td>
                    <td><h3>Status</h3></td>
                    <td><h3>Action</h3></td>
                    <td><h3>Date of Completion</h3></td>
                </tr>
            </thead>
            <tbody>
                <tr v-for="req in allRequests" :key="req.id">
                    <td>{{req.prof_name}}</td>
                    <td>{{req.service_type}}</td>
                    <td>{{req.remarks}}</td>
                    <td>{{req.date_of_request}}</td>
                    <td class="pending-word" v-if="req.status ==='Pending'"><h3>{{req.status}}</h3></td>
                    <td class="rejected-word" v-if="req.status ==='Rejected'"><h3>{{req.status}}</h3></td>
                    <td class="accepted-word" v-if="req.status ==='Accepted'"><h3>{{req.status}}</h3></td>
                    <td class="completed-word" v-if="req.status ==='Closed'"><h3>{{req.status}}</h3></td>
                    <td>
                        <button class="view_link" v-if="req.status === 'Pending'" @click="openEditForm(req)">Edit</button>
                        <button class="reject_link" v-if="req.status === 'Pending'" @click="deleteRequest(req)">Cancel</button>
                        <button class="accept_link" v-if="req.status === 'Accepted'" @click="openRatingForm(req)">Mark Completed</button>
                        <p v-if="req.status === 'Closed'">-----------------------</p>
                    </td>
                    <td>{{req.date_of_completion}}</td>
                </tr>
            </tbody>
        </table>
        <h2 v-if="!allRequests.length">No Request sent yet</h2>
        <div v-if="showEditForm" class="add_service_form">
            <h2><u>Update Request</u></h2><br>
            <form @submit.prevent="updateRequest(newRequest)">
                <p class="left-topic"><strong>Professional Name : </strong>{{newRequest.professional_id}}</p>
                <input class='input-box' type="text" :value="newRequest.id" readonly hidden/><br>
                <p class="left-topic"><strong>Service Name :</strong>{{newRequest.service_id}}</p>
                <input class='input-box' type="text" :value="newRequest.service_id" readonly hidden/><br>
                <h3 class="left-topic">Message :</h3>
                <input class='input-box' type="text" v-model="newRequest.remarks" required/>
                <br><br>
                <!-- Buttons -->
                <button type="submit" class="accept_link">Update</button>
                <button type="button" @click="showEditForm = false" class="reject_link">Cancel</button>
            </form>
        </div>
        <div v-if="showRatingForm" class="add_service_form">
          <h2><u>Rate Professional</u></h2><br>
          <form @submit.prevent="sendRating">
            <div class="rating-container">
              <span v-for="star in stars" :key="star"
                    :class="['star', { filled: star <= rating }]"
                    @click="setRating(star)">
                ★
              </span>
            </div>
            <input class='input-box' type="text" :value="newRequest.professional_id" readonly hidden/><br>
            <textarea rows="4" v-model="review" cols="50" placeholder="Enter your Review here..."></textarea>
            <br><br>
            <button type="submit" class="accept_link">Submit</button>
            <button type="button" @click="showRatingForm = false" class="reject_link">Cancel</button>
          </form>
        </div>
  </div>
  `,
  data() {
    return {
      self:{},
      allService: [],
      allRequests: [],
      showEditForm: false,
      showRatingForm: false,
      rating: 0,
      stars: [1, 2, 3, 4, 5],
      review:"",
      newRequest :{},
    };
  },
  methods: {
    viewService(serviceId) {
      // Use Vue Router's programmatic navigation
      this.$router.push("/viewServiceProf/" + serviceId);
    },
    openEditForm(request) {
      this.newRequest = { ...request };
      this.showEditForm = true;
    },
    async updateRequest(request) {
      console.log(request);
      const res = await fetch(window.location.origin + '/api/requests/update/' + request.id, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': sessionStorage.getItem('token'),
          },
          body: JSON.stringify(request)
      });
      if (res.ok) {
          const updatedRequest = await res.json();
          const index = this.allRequests.findIndex(req => req.id === request.id);
          this.allRequests[index] = updatedRequest;
          this.showEditForm=false;
          this.$refs.alert.showAlert('Request Updated Successfully', 'success')
      }
      // update allRequests
      const reqs = await fetch(window.location.origin + "/api/requests/customer/" + sessionStorage.getItem('id'), {
        headers: {
          "Authentication-Token": sessionStorage.getItem("token"),
      }
      });
      const requests = await reqs.json();
      this.allRequests = requests;
    },
    async deleteRequest(req) {
      const res = await fetch(window.location.origin + '/api/requests/delete/' + req.id, {
          method: 'DELETE',
          headers: {
              'Authentication-Token': sessionStorage.getItem('token'),
          },
      });
      if (res.ok) {
          this.$refs.alert.showAlert('Request Deleted', 'error')
      } else {
          const error = await res.json();
          this.$refs.alert.showAlert('Failed to delete request', 'error')
      }
      // update allRequests
      const reqs = await fetch(window.location.origin + "/api/requests/customer/" + sessionStorage.getItem('id'), {
        headers: {
          "Authentication-Token": sessionStorage.getItem("token"),
      }
      });
      const requests = await reqs.json();
      this.allRequests = requests;
  },
  openRatingForm(request) {
    this.showRatingForm = true;
    this.newRequest = { ...request };
  },
  setRating(star) {
    this.rating = star;
  },
  async sendRating() {
    const ratingData = {
      professional_id: this.newRequest.professional_id,
      customer_id: this.newRequest.customer_id,
      request_id: this.newRequest.id,
      rating: this.rating,
      review: this.review,
    };
    const res = await fetch(window.location.origin + '/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authentication-Token': sessionStorage.getItem('token'),
      },
      body: JSON.stringify(ratingData),
    });
    if (res.ok) {
      this.$refs.alert.showAlert('Review Submitted Successfully', 'info')
      this.showRatingForm = false;
    } else {
      const error = await res.json();
      this.$refs.alert.showAlert('Failed to send rating', 'error')
    }
    const reqs = await fetch(window.location.origin + "/api/requests/customer/" + sessionStorage.getItem('id'), {
      headers: {
        "Authentication-Token": sessionStorage.getItem("token"),
    }
    });
    const requests = await reqs.json();
    this.allRequests = requests;
  },
},
  async mounted() {
      const res = await fetch(window.location.origin + "/api/services", {
        headers: {
          "Authentication-Token": sessionStorage.getItem("token"),
        },
      });
      if (!res.ok) {
        throw new Error(`Error fetching services: ${res.statusText}`);
      }
      const data = await res.json();
      this.allService = data;

      // Fetch requests for the customer
      const reqs = await fetch(window.location.origin + "/api/requests/customer/" + sessionStorage.getItem('id'), {
        headers: {
          "Authentication-Token": sessionStorage.getItem("token"),
      }
      });
      const requests = await reqs.json();
      this.allRequests = requests;
      
      // Fetch self
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
      Service,
      alertComponent,
    },
};

export default dashboardCust;
