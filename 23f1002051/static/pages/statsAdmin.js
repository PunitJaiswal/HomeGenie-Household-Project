const statsAdmin = {
    template : `
    <div class='dashboard'>
        <h1 style="text-align:left; font-size: 6vmin; margin-top:0vmin;"><u>Admin Stats</u></h1>
        <br>
        <table class="stat_table">
            <thead>
              <tr>
                <th>Total Services</th>
                <th>Total Service Professionals</th>
                <th>Total Customers</th>
                <th>Total Requests</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{{counts[0]}}</td>
                <td>{{counts[1]}}</td>
                <td>{{counts[2]}}</td>
                <td>{{counts[3]}}</td>
              </tr>
            </tbody>
        </table>
        <br>
        <div class='container'>
            <img src="./static/images/category_count.png" alt="logo" width="600" height="400">
            <img src="./static/images/professional_count_by_service.png" alt="logo" width="600" height="400">
            <img src="./static/images/request_count_by_service.png" alt="logo" width="500" height="370">
            <img src="./static/images/active_professional.png" alt="logo" width="370" height="370">
            <img src="./static/images/active_customer.png" alt="logo" width="370" height="370">
        </div>
    </div>
    `,
    data() {
      return {
        counts : [],
      }
    },
    async mounted() {
        const res = fetch(window.location.origin + '/admin/graph', {
            headers: {
                'Authentication-Token': sessionStorage.getItem('token')
            }
        });
        const resCount = await fetch(`${window.location.origin}/count_entities`, {
          headers: {
              'Authentication-Token': sessionStorage.getItem('token'),
          },
      });

      if (resCount.ok) {
          this.counts = await resCount.json();
      } else {
          console.error('Failed to fetch counts:', resCount.statusText);
      }
  }
};

export default statsAdmin;