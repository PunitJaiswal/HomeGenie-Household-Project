const viewServiceProf = {
    template: `
    <div class='dashboard'>
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
                        <button class="view_link" @click="viewUser(prof.id)">View</button>
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
        };
    },
    methods: {
        openAddForm(prof) {
            this.showAddForm = true;
            this.prof = prof;
        },
        async sendRequest() {
            // Populate the newRequest object with the relevant values
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
                alert(result.message || 'Request sent successfully!');
    
                // Mark the professional as requested (optional if needed in UI)
                const prof = this.allServiceProfs.find(prof => prof.id === this.prof.id);
                if (prof) prof.requested = true;
    
                // Close the form after successful submission
                this.showAddForm = false;
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to send request.');
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
};

export default viewServiceProf;