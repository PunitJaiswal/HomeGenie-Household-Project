const service = {
    template: `
      <div>
          <div class="service-card" @click="openPopup">
              <div>
                  <h3>{{ name }}</h3>
                  <p>{{ description }}</p>
              </div>
              <div>
                  <small> Base Price : {{ base_price }}</small>
                  <small> Time Required : {{ time_required }} hrs</small>
              </div>
          </div>
  
          <div v-if='showPopup'>
            <div>
              <h3>{{ name }}</h3>
              <p>{{ description }}</p>
            </div>
            <div>
                <small> Base Price : {{ base_price }}</small>
                <small> Time Required : {{ time_required }} hrs</small>
            </div>
            <button @click="closePopup">Close</button>
              </div>
          </div>
      </div>
      `,
      props: {
          name: {
            type: String,
            required: true,
          },
          description: {
            type: String,
            required: true,
          },
          base_price: {
            type: Number,
            required: true,
          },
          time_required: {
            type: Number,
            required: true,
          },
      },
      data () {
          return {
              showPopup : false,
          }
          },
      methods : {
          openPopup() {
              this.showPopup = true;
          },
          closePopup() {
              this.showPopup = false;
          },
      },
      
      mounted() {
          const style = document.createElement("style");
          style.textContent = `
          .service-card {
              max-width: 600px;
              margin: auto;
              background-color : lightgrey;
              margin-bottom : 5px;
              padding-left : 10px;
              border-radius: 15px;
              transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
          }
          .study-resource-card:hover {
              transform: scale(1.02);
              box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
          }
          `;
          document.head.appendChild(style);
      },
  };
  
  

export default service;