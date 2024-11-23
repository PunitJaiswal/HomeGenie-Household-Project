const manageService = {
    template: `
    <div class='dashboard'>
        <h2 style="text-align:left;"><u>All Services</u></h2>
        <br>
        <table v-if="allServices.length" class="view_table">
            <thead class="table_head">
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
        
        <div style="text-align:left;">
            <h2><u>Get All Service Requests</u></h2>
            <br>
            <button class='accept_link' @click='getServiceRequest'>Get CSV File</button>
        </div>

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
            }
        },
        openEditForm(service) {
            this.newService = { ...service }; // Clone the service to avoid direct mutation
            this.showEditForm = true;        // Show the edit form
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
                alert('Service Deleted');
            } else {
                const error = await res.json();
                alert('Error: ' + (error.message || 'Failed to delete service'));
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
                }
            }, 100);
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
            alert('Failed to fetch services');
        }
    },        
};

export default manageService;
