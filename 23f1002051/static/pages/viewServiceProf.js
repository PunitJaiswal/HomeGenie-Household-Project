import alertComponent from "../components/alertComponent.js";

const viewServiceProf = {
    template: `
    <div class='dashboard'>
        <alertComponent ref='alert' />
        <table class="view_table">
            <thead class="table_head">
                <tr>
                    <td colspan="5" style="text-align:center; background-color: #748cab">
                        <h2>{{service.name}}</h2>
                    </td>
                </tr>
                <tr>
                    <td><h3>Name</h3></td>
                    <td><h3>Experience</h3></td>
                    <td><h3>Location</h3></td>
                    <td><h3>Rating</h3></td>
                    <td><h3>Action</h3></td>
                </tr>
            </thead>
            <tbody>
                <tr v-for="prof in allServiceProfs" :key="prof.id">
                    <td>{{prof.name}}</td>
                    <td>{{prof.experience}} years</td>
                    <td>{{prof.location}}</td>
                    <td>{{prof.rating || "Not Rated"}}</td>
                    <td>
                        <button class="view_link" @click="openViewForm(prof.id)">View</button>
                        <button class="accept_link" @click="openAddForm(prof)">Request</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <div v-if=!allServiceProfs.length>
            <h2 style="text-align:center;">No professionals available for this service.</h2>
        </div>
        <div v-if="showAddForm" class="add_service_form">
            <h2><u>Add New Service</u></h2><br>
            <form @submit.prevent="sendRequest">
                <p class="left-topic"><strong>Professional Name : </strong>{{prof.name}}</p>
                <input class='input-box' type="text" :value="prof.id" readonly hidden/><br>
                <p class="left-topic"><strong>Service Name :</strong>{{service.name}}</p>
                <input class='input-box' type="text" :value="service.id" readonly hidden/><br>
                <h3 class="left-topic">Message :</h3>
                <input class='input-box' type="text" v-model="newRequest.remarks" required/>
                <br><br>
                <!-- Buttons -->
                <button type="submit" class="accept_link">Create Request</button>
                <button type="button" @click="showAddForm = false" class="reject_link">Cancel</button>
            </form>
        </div>
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
    </div>
    `,

    data() {
        return {
            allServiceProfs: [],
            service: {},
            customer: {},
            showAddForm: false,
            prof : {},
            newRequest:{
                service_id: null,
                professional_id: null,
                customer_id: null,
                remarks: '',
            },
            user:{},
            showViewForm: false
        };
    },
    methods: {
        openAddForm(prof) {
            this.showAddForm = true;
            this.prof = prof;
        },
        async sendRequest() {
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
                this.$refs.alert.showAlert(result.message, result.status)
                this.showAddForm = false;
            } else {
                const error = await response.json();
                this.$refs.alert.showAlert(error.message, 'error')
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
              this.showViewForm = true;
            } else {
              alert("Failed to load user data");
            }
        },
        
    },
    async mounted() {
        // Fetch all professionals for the service via service_id
        const response = await fetch(window.location.origin + '/viewServiceProf/' + this.$route.params.id, {
            headers: {
                'Authentication-Token': sessionStorage.getItem('token')
            },
        });
        if (response.ok) {
            this.allServiceProfs = await response.json();
        } else {
            alert('Failed to fetch services');
        }
        
        // Fetch service details
        const res = await fetch(window.location.origin + '/api/services/' + this.$route.params.id, {
            headers: {
                'Authentication-Token': sessionStorage.getItem('token')
            },
        });
        if (res.ok) {
            this.service = await res.json();
        }

        // Fetch Customer details
        const custRes = await fetch(window.location.origin + '/viewUser/' + sessionStorage.getItem('id'), {
            headers: {
                'Authentication-Token': sessionStorage.getItem('token')
            },
        });
        if (custRes.ok) {
            this.customer = await custRes.json();
        }
    },
    components: {
        alertComponent,
    }
};

export default viewServiceProf;