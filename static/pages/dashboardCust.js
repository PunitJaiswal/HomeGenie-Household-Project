import service from "../components/service.js";

const dashboardCust = {
  template: `<div> 
            <h1>Student Dashboard</h1>
            <div v-for="service in allService">   
                    <service :name="service.name" :description="service.description" :base_price="service.base_price" :time_required="service.time_required"/>
            </div>
    </div>`,
  data() {
    return {
      allService: [],
    };
  },
  async mounted() {
    const res = await fetch(window.location.origin + "/api/resources", {
      headers: {
        "Authentication-Token": sessionStorage.getItem("token"),
      },
    });
    const data = await res.json();
    this.allService = data;
  },
  components: { service },
};

export default dashboardCust;