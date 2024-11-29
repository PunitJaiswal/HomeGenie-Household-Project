const statsCust = {
    template : `
    <div class='dashboard'>
        <h1 style="text-align:left; font-size: 6vmin; margin-top:0vmin;"><u>Stats and Graph</u></h1>
        <br>
        <div class='container'>
            <div v-if="requestImageExists">
                <img :src="'./static/images/request_count_by_customer_' + user_id + '.png'" >
            </div>
            <p v-else>No Service Request data available.</p>
            <div v-if="profImageExists">
                <img src="./static/images/professional_count_by_service.png" alt="logo" width="500" height="500">
            </div>
            <p v-else>No Professional data available.</p>
        </div>
    </div>
    `,
    data() {
        return  {
            user_id: sessionStorage.getItem('id'),
            requestImageExists: false,
            profImageExists: false,
        }
    },
    methods: {
        async checkImageExists(imagePath) {
            try {
                const response = await fetch(imagePath, { method: 'HEAD' });
                return response.ok;
            } catch {
                return false;
            }
        },
    },
    async mounted() {
        const res = fetch(window.location.origin + '/customer/graph/' + sessionStorage.getItem('id'), {
            headers: {
                'Authentication-Token': sessionStorage.getItem('token')
            }
        });
        this.requestImageExists = await this.checkImageExists(`./static/images/request_count_by_customer_${this.user_id}.png`);
        this.profImageExists = await this.checkImageExists(`./static/images/professional_count_by_service.png`);
    }
};


export default statsCust;