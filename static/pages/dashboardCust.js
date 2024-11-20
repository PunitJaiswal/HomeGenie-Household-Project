import Service from "../components/service.js";

const dashboardCust = {
  template: `
  <div class="dashboard">
    <h1><u>Customer Dashboard</u></h1>
    <br><br>
    <h2><u>All Services</u></h2>
    <br><br>
    <div class="container">
      <div v-for="service in allService" :key="service.id" class="items">
        <h2><u>{{ service.name }}</u></h2>
        <br>
        <p><strong>Description:</strong> {{ service.description }}</p>
        <br>
        <p><strong>Base Price:</strong> {{ service.base_price }} Rs.</p>
        <p><strong>Time Required:</strong> {{ service.time_required }} hr</p>
        <br>
        <button @click="viewService(service.id)" class="back_link">View Professionals</button>
      </div>
    </div>
  </div>
  `,
  data() {
    return {
      allService: [],
    };
  },
  methods: {
    viewService(serviceId) {
      // Use Vue Router's programmatic navigation
      this.$router.push('/viewServiceProf/' + serviceId);
    },
  },
  async mounted() {
    try {
      const res = await fetch(window.location.origin + "/api/services", {
        headers: {
          "Authentication-Token": sessionStorage.getItem("token"),
        },
      });

      if (!res.ok) {
        throw new Error(`Error fetching services: ${res.statusText}`);
      }

      const data = await res.json();
      this.allService = data;
    } catch (error) {
      console.error(error.message);
      alert("Failed to load services. Please try again later.");
    }
  },
  components: { Service },
};

export default dashboardCust;
