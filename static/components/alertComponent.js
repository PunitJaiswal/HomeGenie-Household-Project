const alertComponent = {
  template: `
  <div>
    <div v-if="show" :class="'alert alert-' + type" class="alert-box">
      <span>{{ message }}</span>
      <button @click="closeAlert" class="close-btn">&times;</button>
    </div>
  </div>
  `,
  data() {
    return {
      show: false,
      message: '',
      type: 'info',
    };
  },
  methods: {
    showAlert(message, type = 'info') {
      this.message = message;
      this.type = type;
      this.show = true;

      // Auto-hide after 5 seconds
      setTimeout(() => {
        this.show = false;
      }, 5000);
    },
    closeAlert() {
      this.show = false;
    },
  },
};


export default alertComponent;