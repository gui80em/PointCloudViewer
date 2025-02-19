function getRandomSensorIcon() {
    const icons = [
        { icon: "fa-thermometer-half", title: "Temperature" },
        { icon: "fa-tint", title: "Humidity" },
        { icon: "fa-cloud", title: "Atmospheric Pressure" },
        { icon: "fa-leaf", title: "Ground Status" },
        { icon: "fa-sun", title: "Solar" },
        { icon: "fa-bolt", title: "Wind" },
        { icon: "fa-fire", title: "Fire" },
        { icon: "fa-water", title: "Water" }
    ];
    const randomIndex = Math.floor(Math.random() * icons.length);
    const chosen = icons[randomIndex];
    return `<i class="fa ${chosen.icon}" title="${chosen.title}"></i>`;
}


function createSensorAnnotation(sensorId, position) {
    let randomIconHtml = getRandomSensorIcon();
    let elTitle = $(`
        <span>
            <span class="sensor-header" style="display: flex; justify-content: center; padding: 5px 5px; align-items: center">
                ${randomIconHtml}
            </span>
            <div name="data">
                <p>Temperatura: <span class="temperature">--</span>°C</p>
                <p>Humedad: <span class="humidity">--</span>%</p>
                <p>Presión Atm: <span class="pressure">--</span> hPa</p>
                <p><a  href="graph.html">See more...</a></p>
            </div>
        </span>
    `);

    elTitle.find("div[name=data]").hide();

    elTitle.find("span.sensor-header").click(function (e) {

        if (!$(e.target).is('i.fa-refresh')) {
            elTitle.find("div[name=data]").toggle();
        }
    });

    elTitle.find("i.fa-refresh").click(function (e) {
        e.stopPropagation();
        updateSensorData(sensorId, elTitle);
    });

    elTitle.toString = () => `Sensor ${sensorId}`;

    updateSensorData(sensorId, elTitle);

    return new Potree.Annotation({
        position: position,
        title: elTitle
    });

}

function updateSensorData(sensorId, elTitle) {

    const temperature = (20 + Math.random() * 10).toFixed(1);
    const humidity = (50 + Math.random() * 20).toFixed(1);
    const pressure = (1000 + Math.random() * 10).toFixed(1);

    elTitle.find("span.temperature").text(temperature);
    elTitle.find("span.humidity").text(humidity);
    elTitle.find("span.pressure").text(pressure);

}

window.createSensorAnnotation = createSensorAnnotation

