class SensorList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.sensors = [
      { id: 1, icon: "fa-thermometer-half", title: "Temperature", time: "12:00 PM" },
      { id: 2, icon: "fa-tint", title: "Humidity", time: "12:05 PM" },
      { id: 3, icon: "fa-cloud", title: "Atmospheric Pressure", time: "12:10 PM" },
      { id: 4, icon: "fa-leaf", title: "Ground Status", time: "12:15 PM" },
      { id: 5, icon: "fa-sun", title: "Solar", time: "12:20 PM" },
      { id: 6, icon: "fa-bolt", title: "Wind", time: "12:25 PM" },
      { id: 7, icon: "fa-water", title: "Water", time: "12:35 PM" }
    ];
    this.render();
    this.initializeSideBar();
    this.selectFirstSensor();
  }

  render() {
    this.shadowRoot.innerHTML = /*html*/`
        <style>
          @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

          .head {

            font-size: 2em;
            padding: 20px;
            border-bottom: 1px solid #ddd;
            font-weight: bold;
          }

          .menu-list {  
            margin: 0;  
            width: 300px;
            height: 100%;
            border-right: 1px solid #ddd;
            overflow-y: auto;
            background: #f9f9f9;
          }
          :host { display: block; }
          
          .sensor-info{
            margin-left: 20px;
            display: flex; 
            gap: 8px;
            align-items: center;
            
          }

          .sensor-item { 
            font-family: Arial, sans-serif;
            height: 55px;
            display: flex;
            align-items: center;
            border-bottom: 1px solid #ddd;
            cursor: pointer;
            font-size: 1em;
          }
          .sensor-item:hover {
            background: #e8f4f8;
          }
          .sensor-item.active {
            background: #00d1b2;
            color: white;
          }
  
        </style>
         
        <ul class="menu-list" style="list-style:none; padding:0;">
          <div class="head">
            Sensors
          </div>
          ${this.sensors.map(sensor => `
            <li class="sensor-item" data-id="${sensor.id}" data-title="${sensor.title}">
              <div class="sensor-info">
                <strong>${sensor.id}</strong>
                <i class="fa ${sensor.icon}"></i> 
                <strong>${sensor.title}</strong>
              </div>
            </li>
          `).join('')}
        </ul>
      `;
  }
  initializeSideBar() {
    this.shadowRoot.querySelectorAll('.sensor-item').forEach(item => {
      item.addEventListener('click', () => this.selectSensor(item));
    });
  }

  selectSensor(item) {
    this.shadowRoot.querySelectorAll('.sensor-item').forEach(el => el.classList.remove('active'));
    item.classList.add('active');

    const sensorId = item.getAttribute('data-id');
    const sensor = this.sensors.find(s => s.id == sensorId);

    const event = new CustomEvent('sensor-selected', {
      detail: { id: sensorId, title: sensor.title, icon: sensor.icon },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  selectFirstSensor() {
    const item = this.shadowRoot.querySelectorAll('.sensor-item')[2];
    if (item) {
      this.selectSensor(item);
      
      setTimeout(() => {
        const sensorId = item.getAttribute('data-id');
        const sensor = this.sensors.find(s => s.id == sensorId);
  
        const event = new CustomEvent('sensor-selected', {
          detail: { id: sensorId, title: sensor.title, icon: sensor.icon },
          bubbles: true,
          composed: true
        });
        this.dispatchEvent(event);
      }, 0);
    }
  }
  
}
customElements.define('sensor-sidebar', SensorList);