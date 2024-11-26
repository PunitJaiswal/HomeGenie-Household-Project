const statsCust = {
    template : `
    <div class='dashboard'>
        <h1 style="text-align:left; font-size: 6vmin; margin-top:0vmin;"><u>Stats and Graph</u></h1>
        <div class='container'>
            <img :src="'./static/images/request_count_by_customer_' + user_id + '.png'" >
            <img src="./static/images/professional_count_by_service.png" alt="logo" width="500" height="500">
        </div>
    </div>
    `,
    data() {
        return  {
            user_id: sessionStorage.getItem('id')
        }
    },
    mounted() {
        const res = fetch(window.location.origin + '/customer/graph/' + sessionStorage.getItem('id'), {
            headers: {
                'Authentication-Token': sessionStorage.getItem('token')
            }
        });
    }
};


export default statsCust;