const dashboardAdmin = {
    template : `
    <div>
        <h1><u> Admin Dashboard </u></h1>
        <h2> All Professionals </h2>
        <div v-for="user in allProfs">
            <p>email : {{user.email}} </p>
        </div>
        <h2> All Customers </h2>
        <div v-for="user in allCusts">
            <p>email : {{user.email}} </p>
        </div>
    </div> 
    `,
    data() {
        return {
            inactiveProfs : [],
            allProfs : [],
            allCusts : [],
        };
    },
    methods : {
        async sendApproval(id) {
        const res = await fetch(window.location.origin + '/activate-prof/'+ id, {
            headers : {
                'Authentication-Token' : sessionStorage.getItem('token'),
            },
        });
        if (res.ok) {
            alert('Professional activated');
        }
    },
    },
    async mounted() {
            const res = await fetch(window.location.origin + '/inactive-prof-list', {
                headers : {
                    'Authentication-Token' : sessionStorage.getItem('token')
                },
            });
            this.inactiveProfs = await res.json();
            
            // Get all Professionals List
            const resNew = await fetch(window.location.origin + '/all-prof-list', {
                headers : {
                    'Authentication-Token' : sessionStorage.getItem('token')
                },
            });
            this.allProfs = await resNew.json();

            // Get all Customers List
            const allCusts = await fetch(window.location.origin + '/all-cust-list', {
                headers : {
                    'Authentication-Token' : sessionStorage.getItem('token')
                },
            });
            this.allCusts = await allCusts.json();
        },
};


export default dashboardAdmin;