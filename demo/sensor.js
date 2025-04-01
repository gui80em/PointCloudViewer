const API_URL = window.API_URL

async function fetchSensors() {

    const bb = window.pointcloudBB;
    const min = bb.min;
    const max = bb.max;
    const response = await axios.get(
        `${API_URL}/api/sensors?minX=${min.x}&maxX=${max.x}&minY=${min.y}&maxY=${max.y}&minZ=${min.z}&maxZ=${max.z}`
    );

    return response.data;

}

function createSensorAnnotation(sensor, position) {

    let iconHtml = sensor.types.map(type => {
        return `<i class="fa ${type.icon}" title="${type.title}"></i>`
    }).join(' ');

    let dataHtml = sensor.types.map(type => {
        let className = type.title.toLowerCase().replace(/\s+/g, '');
        return `<p>${type.title}: <span class="${className}">--</span>${type.unit}</p>`;
    }).join('');
    
    let elSensor = $(`
        <span>
            <span class="sensor-header" style="display: flex; justify-content: center; padding: 5px; align-items: center; gap: 5px;">
                ${iconHtml}
            </span>
            <div name="data">
                ${dataHtml}
                <p><a href="graph.html?sensor=${sensor._id}">See more...</a></p>
            </div>
        </span>
    `);

    elSensor.find("div[name=data]").hide();

    // Toggle the extra data when the header is clicked.
    elSensor.find("span.sensor-header").click(function (e) {
        if (!$(e.target).is('i.fa-refresh')) {
            elSensor.find("div[name=data]").toggle();
        }
    });

    elSensor.toString = () => `Sensor ${sensor._id}`;

    // Fetch and update the sensor data immediately.
    updateSensorData(sensor._id, elSensor);
    setInterval(() => {
        updateSensorData(sensor._id, elSensor);
    }, 60000);
    return new Potree.Annotation({
        position: position,
        title: elSensor
    });
}


async function updateSensorData(sensorId, elSensor) {
    try {
      const response = await axios.get(`${API_URL}/api/real/sensors/${sensorId}`);
      const reading = response.data;
      const data = reading.data;
      
      for (const key in data) {
        if (data.hasOwnProperty(key)) {      
          const className = key.toLowerCase().replace(/\s+/g, '');
          elSensor.find(`span.${className}`).text(data[key]);
        }
      }
    } catch (error) {
      console.error(`Error fetching sensor data for sensor ${sensorId}:`, error);
    }
  }
  
async function loadSensors() {

    const sensors = await fetchSensors()

    sensors.forEach(sensor => {
        const position = new THREE.Vector3(sensor.location.x, sensor.location.y, 1);
        potreeViewer.scene.annotations.add(createSensorAnnotation(sensor, position));
    });

}

window.loadSensors = loadSensors

