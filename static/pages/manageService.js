import alertComponent from "../components/alertComponent.js";

const manageService = {
    template: `
    <div class='dashboard'>
        <alertComponent ref='alert' />
        <div style="display: flex; justify-content: space-between;">
            <h1><u>Manage Services</u></h1>
            <button style="text-align:right; height:5vmin;" class='view_link' @click='getServiceCsv'>Get CSV File</button>
        </div>
        <br>
        <table v-if="allServices.length" class="view_table">
            <thead class="table_head">
                <tr>
                    <td colspan="7" style="text-align:center; background-color: #748cab">
                        <h2>All Services</h2>
                    </td>
                </tr>
                <tr>
                    <td><h3>Name</h3></td>
                    <td><h3>Description</h3></td>
                    <td><h3>Base Price (Rs.)</h3></td>
                    <td><h3>Time Required</h3></td>
                    <td><h3>Action</h3></td>
                </tr>
            </thead>
            <tbody>
                <tr v-for="service in allServices" :key="service.id">
                    <td>{{service.name}}</td>
                    <td>{{service.description}}</td>
                    <td>{{service.base_price}}</td>
                    <td>{{service.time_required}} hr</td>
                    <td>
                        <button @click="openEditForm(service)" class="view_link">Update</button> 
                        <button @click="deleteService(service.id)" class="reject_link">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <h3 v-if="!allServices.length">No Service registered yet</h3>
        <br><br>
        <p class="add_logo" v-if="!showAddForm" @click="showAddForm = true"><i class="fa-solid fa-circle-plus"></i></p>

        <!-- Add Service Form -->
        <div v-if="showAddForm" class="add_service_form">
            <h2><u>Add New Service</u></h2><br>
            <form @submit.prevent="createService">
                <h3 class="left-topic">Name:</h3>
                <input class='input-box' type="text" v-model="newService.name" required /><br>
                <h3 class="left-topic">Description:</h3>
                <input class='input-box' type="text" v-model="newService.description" /><br>
                <h3 class="left-topic">Base Price (Rs.):</h3>
                <input class='input-box' type="number" v-model="newService.base_price" required /><br>
                <h3 class="left-topic">Time Required (hr):</h3>
                <input class='input-box' type="number" v-model="newService.time_required" required /><br><br>
                <button type="submit" class="accept_link">Add Service</button>
                <button type="button" @click="showAddForm = false" class="reject_link">Cancel</button>
            </form>
        </div>

        <!-- Update Service Form -->
        <div v-if="showEditForm" class="add_service_form">
            <h2><u>Update Service</u></h2><br>
            <form @submit.prevent="updateService(newService)">
                <h3 class="left-topic">Name:</h3>
                <input class='input-box' type="text" v-model="newService.name" required /><br>
                <h3 class="left-topic">Description:</h3>
                <input class='input-box' type="text" v-model="newService.description" /><br>
                <h3 class="left-topic">Base Price (Rs.):</h3>
                <input class='input-box' type="number" v-model="newService.base_price" required /><br>
                <h3 class="left-topic">Time Required (hr):</h3>
                <input class='input-box' type="number" v-model="newService.time_required" required /><br><br>
                <!--buttons-->
                <button type="submit" class="accept_link">Update Service</button>
                <button type="button" @click="showEditForm = false" class="reject_link">Cancel</button>
            </form>
        </div>

        <div style="text-align:left;">
            <div style="justify-content: space-between; display: flex; height:5vmin;">
                <h2><u>All Service Requests</u></h2>
                <br>
                <button class='view_link' @click='getServiceRequest'>Get CSV File</button>
            </div>
            <br>
            <table v-if="allRequests.length" class="view_table">
                <thead class="table_head">
                    <tr>
                        <td colspan="7" style="text-align:center; background-color: #748cab">
                            <h2>All Service Requests</h2>
                        </td>
                    </tr>
                    <tr>
                        <td><h3>Service Name</h3></td>
                        <td><h3>Customer Name</h3></td>
                        <td><h3>Professional Name</h3></td>
                        <td><h3>Message</h3></td>
                        <td><h3>Status</h3></td>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="request in allRequests" :key="request.id">
                        <td>{{request.service_type}}</td>
                        <td>{{request.cust_name}}</td>
                        <td>{{request.prof_name}}</td>
                        <td>{{request.remarks}}</td>
                        <td class='pending-word' v-if="request.status == 'Pending'"><strong>{{request.status}}</strong></td>
                        <td class='accepted-word' v-if="request.status == 'Accepted'"><strong>{{request.status}}</strong></td>
                        <td class='rejected-word' v-if="request.status == 'Rejected'"><strong>{{request.status}}</strong></td>
                        <td class='completed-word' v-if="request.status == 'Closed'"><strong>{{request.status}}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    `,
    data() {
        return {
            allServices:[],
            showAddForm:false,
            showEditForm:false,
            addlogo:true,
            newService:{
                name: '',
                description: '',
                base_price: null,
                time_required: null
            },
            allRequests:[],
        };
    },
    methods: {
        async createService() {
            const res = await fetch(window.location.origin + '/api/services', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': sessionStorage.getItem('token'),
                },
                body: JSON.stringify(this.newService)
            });
            if (res.ok) {
                const createdService = await res.json();
                this.allServices.push(createdService);
                this.showAddForm = false;
                this.newService = {
                    name: '',
                    description: '',
                    base_price: null,
                    time_required: null
                };
                this.$refs.alert.showAlert('Service Added Successfully', 'success')
            }
            // Update allServices
            const response = await fetch(window.location.origin + '/api/services', {
                headers: {
                    'Authentication-Token': sessionStorage.getItem('token')
                },
            });
            if (response.ok) {
                this.allServices = await response.json();
            }
        },

        openEditForm(service) {
            this.newService = { ...service };
            this.showEditForm = true;
        },
        async updateService(service) {
            const res = await fetch(window.location.origin + '/api/services/update/' + service.id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': sessionStorage.getItem('token'),
                },
                body: JSON.stringify(service)
            });
            if (res.ok) {
                const updatedService = await res.json();
                const index = this.allServices.findIndex(s => s.id === service.id);
                this.allServices[index] = updatedService;
                this.showEditForm=false;
                this.$refs.alert.showAlert('Service Updated Successfully', 'success');
            }
            // update allServices
            const response = await fetch(window.location.origin + '/api/services', {
                headers: {
                    'Authentication-Token': sessionStorage.getItem('token')
                },
            });
            if (response.ok) {
                this.allServices = await response.json();
            }
        },
        async deleteService(id) {
            const res = await fetch(window.location.origin + '/api/services/delete/' + id, {
                method: 'DELETE',
                headers: {
                    'Authentication-Token': sessionStorage.getItem('token'),
                },
            });
            if (res.ok) {
                this.$refs.alert.showAlert('Service deleted', 'error');
            } else {
                const error = await res.json();
                this.$refs.alert.showAlert('Failed to delete service', 'error')
            }
            // Update allServices
            const response = await fetch(window.location.origin + '/api/services', {
                headers: {
                    'Authentication-Token': sessionStorage.getItem('token')
                },
            });
            if (response.ok) {
                this.allServices = await response.json();
            }
        },
        async getServiceRequest() {
            const res = await fetch(window.location.origin + '/create-service-request', {
                headers: {
                    'Authentication-Token': sessionStorage.getItem('token'),
                },
            });
            const task_id = (await res.json()).task_id

            const interval = setInterval(async() => {
                const res = await fetch(window.location.origin + '/get-service-request/' + task_id, {
                    headers: {
                        'Authentication-Token': sessionStorage.getItem('token'),
                    },
                });
                if (res.ok) {
                    window.open(`${window.location.origin}/get-service-request/${task_id}`);
                    clearInterval(interval);
                    this.$refs.alert.showAlert('CSV File Downloaded', 'info')
                }
            }, 1000);
        },
        async getServiceCsv() {
            const res = await fetch(window.location.origin + '/create-service-csv', {
                headers: {
                    'Authentication-Token': sessionStorage.getItem('token'),
                },
            });
            const task_id = (await res.json()).task_id

            const interval = setInterval(async() => {
                const res = await fetch(window.location.origin + '/get-service-csv/' + task_id, {
                    headers: {
                        'Authentication-Token': sessionStorage.getItem('token'),
                    },
                });
                if (res.ok) {
                    window.open(`${window.location.origin}/get-service-csv/${task_id}`);
                    clearInterval(interval);
                    this.$refs.alert.showAlert('CSV File Downloaded', 'info')
                }
            }, 1000);
        }
    },
    async mounted() {
        const response = await fetch(window.location.origin + '/api/services', {
            headers: {
                'Authentication-Token': sessionStorage.getItem('token')
            },
        });
        if (response.ok) {
            this.allServices = await response.json();
        } else {
            this.$refs.alert.showAlert('Failed to fetch services', 'error')
        }
        // Get all Service Request
        const res = await fetch(window.location.origin + '/api/requests/admin', {
            headers: {
                'Authentication-Token': sessionStorage.getItem('token')
            },
        });
        if (res.ok) {
            this.allRequests = await res.json();
        }
        else {
            console.log('No requests available');
        }
    },
    components: {
        alertComponent,
    }
};

export default manageService;
