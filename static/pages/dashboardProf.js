import Service from "../components/service.js"

const dashboardProf = {
    template : `
    <div class='dashboard'>
        <h1><u>Professional Dashboard</u></h1>
        <br><br>
        <h2 style="text-align:left;"><u>All Services</u></h2>
        <br>
        <table v-if="allServices.length" class="view_table">
            <thead class="table_head">
                <tr>
                    <td><h3>Name</h3></td>
                    <td><h3>Description</h3></td>
                    <td><h3>Base Price (Rs.)</h3></td>
                    <td><h3>Time Required</h3></td>
                </tr>
            </thead>
            <tbody>
                <tr v-for="service in allServices" :key="service.id">
                    <td>{{service.name}}</td>
                    <td>{{service.description}}</td>
                    <td>{{service.base_price}}</td>
                    <td>{{service.time_required}} hr</td>
                </tr>
            </tbody>
        </table>
        <h3 v-if="!allServices.length">No Service registered yet</h3>
    </div>
    `,
    data() {
        return {
            newServices : [],
            allServices :[],
        };
    },
    async mounted() {
        const res = await fetch(window.location.origin + '/api/services', {
            headers : {
                'Authentication-Token' : sessionStorage.getItem('token')
            },
        });
        try {
            const data = await res.json();
            this.allServices = data;
        } catch(e) {
            console.log('Error in converting to json');
        }  
    },
    components : { Service },
};


export default dashboardProf;