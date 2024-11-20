const viewServiceProf = {
    template : `
    <div class='dashboard'>
        <table class="view_table">
            <thead class="table_head">
                <tr>
                    <td colspan="5" style="text-align:center; background-color: #748cab"><h2>{{service.name}}</h2></td>
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
                    <td>{{prof.experience}}</td>
                    <td>{{prof.location}}</td>
                    <td>{{prof.rating}}</td>
                    <td>
                        <button class="view_link" @click="viewUser(prof.id)">View</button>
                        <button class="accept_link" @click="sendRequest(prof.id, service.id)">Request</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    `,
    data() {
        return {
            allServiceProfs: [],
            message: '',
            status: '',
            service: {},
        }
    },
    async mounted() {
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

        const res = await fetch(window.location.origin + '/api/services/' + this.$route.params.id, {
            headers: {
                'Authentication-Token': sessionStorage.getItem('token')
            },
        });
        if (res.ok) {
            this.service = await res.json();
        }
    },
};

export default viewServiceProf;