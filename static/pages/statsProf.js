const statsProf = {
    template : `
    <div class='dashboard'>
        <h1 style="text-align:left; font-size: 6vmin; margin-top:0vmin;"><u>Stats and Graph,</u></h1>
        <br>
        <div class='container'>
            <div v-if="requestImageExists">
                <img :src="'./static/images/request_count_by_professional_' + user_id + '.png'" alt="Service Requests Chart" width="500" height="500">
            </div>
            <p v-else>No Service Request data available.</p>

            <div v-if="ratingImageExists">
                <img :src="'./static/images/rating_for_professional_' + user_id + '.png'" alt="Ratings Chart" width="500" height="500">
            </div>
            <p v-else>No rating data available for this professional.</p>
        </div>
    </div>

    `,
    data() {
        return {
            user_id: sessionStorage.getItem('id'), // Example user_id
            requestImageExists: false,
            ratingImageExists: false,
        };
    },
    methods: {
        async checkImageExists(imagePath) {
            try {
                const response = await fetch(imagePath, { method: 'HEAD' });
                return response.ok; // Returns true if the image exists (status 200)
            } catch {
                return false; // If an error occurs, assume the image doesn't exist
            }
        },
    },
    async mounted() {
        const res = fetch(window.location.origin + '/professional/graph/' + sessionStorage.getItem('id'), {
            headers: {
                'Authentication-Token': sessionStorage.getItem('token')
            }
        });
        // Check if the request count image exists
        this.requestImageExists = await this.checkImageExists(`./static/images/request_count_by_professional_${this.user_id}.png`);
        
        // Check if the rating image exists
        this.ratingImageExists = await this.checkImageExists(`./static/images/rating_for_professional_${this.user_id}.png`);
    },
};


export default statsProf;