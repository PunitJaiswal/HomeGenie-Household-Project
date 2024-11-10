import Service from "../components/service.js"

const dashboardProf = {
    template : `
    <div>
        <h1> Professional Dashboard </h1>
        <h2> New Services </h2>
        <div v-for="service in allServices">
            <Service :name="service.name" :description="service.description" :base_price="service.base_price" :time_required="service.time_required" />
        </div>
    </div>
    `,
    data() {
        return {
            newServices : [],
            allServices :[],
        };
    },
    async mounted() {
        const res = await fetch(window.location.origin + '/api/resources', {
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