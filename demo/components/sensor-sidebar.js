const API_URL = window.API_URL

class SensorSidebar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.sensors = [];
  }

  connectedCallback() {
    this.fetchSensors();
  }

  async fetchSensors() {
    try {
      const response = await axios.get(`${API_URL}/api/sensors`);
      this.sensors = response.data;
      this.render();
      this.initializeSideBar();
      this.selectSensorFromUrl() || this.selectFirstSensor();
    } catch (error) {
      console.error('Error fetching sensors:', error);
    }
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
        :host {
          display: block;
        }
        .sensor-info {
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
          padding: 0 10px;
        }
        .sensor-item:hover {
          background: #e8f4f8;
        }
        .sensor-item.active {
          background: #00d1b2;
          color: white;
        }
      </style>
      <ul class="menu-list" style="list-style: none; padding: 0;">
        <div class="head">Sensors</div>
        ${this.sensors.map(sensor => `
          <li class="sensor-item" data-id="${sensor._id}" data-title="${sensor.name}">
            <div class="sensor-info">
              <strong>${sensor.name}</strong>
              ${sensor.types.map(type => `<i class="fa ${type.icon}" title="${type.title}"></i>`).join(' ')}
            </div>
          </li>
        `).join('')}
      </ul>
    `;
  }

  initializeSideBar() {
    const sensorItems = this.shadowRoot.querySelectorAll('.sensor-item');
    sensorItems.forEach(item => {
      item.addEventListener('click', () => this.selectSensor(item));
    });
  }

  selectSensor(item) {
    this.shadowRoot.querySelectorAll('.sensor-item').forEach(el => el.classList.remove('active'));
    item.classList.add('active');
    const sensorId = item.getAttribute('data-id');
    const sensor = this.sensors.find(s => s._id === sensorId);

    window.history.pushState({}, '', `?sensor=${sensorId}`);

    const event = new CustomEvent('sensor-selected', {
      detail: { id: sensorId, title: sensor.name, types: sensor.types },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  selectSensorFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const sensorId = params.get('sensor');
    if (sensorId) {
      const item = this.shadowRoot.querySelector(`.sensor-item[data-id="${sensorId}"]`);
      if (item) {
        this.selectSensor(item);
        return true;
      }
    }
    return false;
  }

  selectFirstSensor() {
    const firstItem = this.shadowRoot.querySelector('.sensor-item');
    if (firstItem) {
      this.selectSensor(firstItem);
    }
  }

  selectFirstSensor() {
    const firstItem = this.shadowRoot.querySelector('.sensor-item');
    if (firstItem) {
      this.selectSensor(firstItem);
    }
  }
}

customElements.define('sensor-sidebar', SensorSidebar);
