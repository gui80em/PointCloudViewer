const API_URL = window.API_URL

class SensorDetail extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.sensor = null;
    this.timeRange = '1day';
    this.chart = null;
    this.dataCache = {};
    this.render();
  }

  connectedCallback() {
    document.addEventListener('sensor-selected', (e) => {
      this.sensor = e.detail;
      this.timeRange = '1day';
      this.renderDetail();
      this.fetchDataAndRenderChart();
    });
  }

  render() {
    this.shadowRoot.innerHTML = /*html*/`
      <style>
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
        :host { display: block; }
        .header { margin-bottom: 20px; }
        .chart-container { position: relative; height: 400px; }
        .time-range { margin: 10px 0; }
        .time-range button { margin-right: 5px; }
        .stats-box { margin-top: 20px; }
        .stats-grid {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }
        .stat-item {
          flex: 1;
          min-width: 120px;
          background: #fff;
          border: 1px solid #ddd;
          padding: 10px;
          border-radius: 5px;
          text-align: center;
        }
        .stat-label {
          font-size: 0.9rem;
          color: gray;
        }
        .stat-value {
          font-size: 1.8rem;
          font-weight: bold;
        }
        .stat-change {
          font-size: 0.8rem;
          vertical-align: super;
        }
      </style>
      <div class="container">
        <div class="header">
          <h2 id="sensor-name">Select a sensor</h2>
          <div class="chart-container">
            <canvas id="sensorChart"></canvas>
          </div>
          <div id="time-range-selector" class="time-range" style="display: none;">
            <button class="button is-small" data-range="1day">1 Day</button>
            <button class="button is-small" data-range="1week">1 Week</button>
            <button class="button is-small" data-range="1month">1 Month</button>
            <button class="button is-small" data-range="1year">1 Year</button>
            <button class="button is-small" data-range="5years">5 Years</button>
          </div>
        </div>
        <div class="stats-box" id="stats" style="display: none;"></div>
      </div>
    `;

    this.shadowRoot.querySelectorAll('#time-range-selector button').forEach(btn => {
      btn.addEventListener('click', () => {
        this.timeRange = btn.getAttribute('data-range');
        this.shadowRoot.querySelectorAll('#time-range-selector button').forEach(b => b.classList.remove('is-primary'));
        btn.classList.add('is-primary');
        this.fetchDataAndRenderChart();
      });
    });
  }

  renderDetail() {
    const icons = this.sensor.types
      .map(type => `<i class="fa ${type.icon}" title="${type.title}"></i>`)
      .join(' ');
    this.shadowRoot.getElementById('sensor-name').innerHTML = `${this.sensor.title} ${icons}`;
    this.shadowRoot.getElementById('time-range-selector').style.display = 'block';
    this.shadowRoot.getElementById('stats').style.display = 'block';
  }


  async fetchHistoricalData(sensorId, timeRange) {
    const url = `${API_URL}/api/history/sensors/${sensorId}?timeRange=${timeRange}`;
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching historical data for sensor ${sensorId}:`, error);
      return [];
    }
  }

  async fetchDataAndRenderChart() {
    const dataKey = `${this.sensor.id}-${this.timeRange}`;
    let allReadings = this.dataCache[dataKey];
    if (!allReadings) {
      allReadings = await this.fetchHistoricalData(this.sensor.id, this.timeRange);
      this.dataCache[dataKey] = allReadings;
    }

    let datasets = [];
    let fetchedData = {}; 

    for (const type of this.sensor.types) {
      const typeTitle = type.title;
      const dataPoints = allReadings
        .map(reading => {
          const value = reading.data[typeTitle];
          if (value !== undefined) {
            return { timestamp: reading.createdAt, value };
          }
          return null;
        })
        .filter(pt => pt !== null);

      fetchedData[typeTitle+" "+type.unit] = dataPoints;

      datasets.push({
        label: typeTitle,
        data: dataPoints.map(pt => ({ x: pt.timestamp, y: pt.value })),
        fill: false,
        borderColor: getColorForType(typeTitle),
        tension: 0.1
      });
    }

    this.renderChart(datasets);
    this.renderStats(fetchedData);
  }

  renderChart(datasets) {
    const ctx = this.shadowRoot.getElementById('sensorChart').getContext('2d');
    const chartData = { datasets };
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'time',
          time: {
            tooltipFormat: 'PPpp',
            unit: this.timeRange === '1day' ? 'hour' :
              (this.timeRange === '1week' || this.timeRange === '1month') ? 'day' :
                (this.timeRange === '1year' ? 'month' : 'year')
          },
          title: { display: false }
        },
        y: { title: { display: false } }
      }
    };
    if (this.chart) {
      this.chart.data = chartData;
      this.chart.options = options;
      this.chart.update();
    } else {
      this.chart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: options
      });
    }
  }


  renderStats(fetchedData) {
    let statsHtml = '';
    for (const typeTitle in fetchedData) {
      statsHtml += this.renderStatsForType(fetchedData[typeTitle], typeTitle);
    }
    this.shadowRoot.getElementById('stats').innerHTML = statsHtml;
  }

  renderStatsForType(dataPoints, typeTitle) {
    const values = dataPoints.map(pt => pt.value);
    const sorted = [...values].sort((a, b) => a - b);
    const fullMin = Math.min(...values);
    const fullMax = Math.max(...values);
    const fullMean = values.reduce((a, b) => a + b, 0) / values.length;
    const fullMedian = (sorted.length % 2 === 1)
      ? sorted[Math.floor(sorted.length / 2)]
      : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;

    const mid = Math.floor(values.length / 2);
    const firstHalf = values.slice(0, mid);
    const secondHalf = values.slice(mid);
    const firstMin = Math.min(...firstHalf);
    const firstMax = Math.max(...firstHalf);
    const firstMean = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const firstMedian = (firstHalf.length % 2 === 1)
      ? firstHalf[Math.floor(firstHalf.length / 2)]
      : (firstHalf[firstHalf.length / 2 - 1] + firstHalf[firstHalf.length / 2]) / 2;
    const secondMin = Math.min(...secondHalf);
    const secondMax = Math.max(...secondHalf);
    const secondMean = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const secondMedian = (secondHalf.length % 2 === 1)
      ? secondHalf[Math.floor(secondHalf.length / 2)]
      : (secondHalf[secondHalf.length / 2 - 1] + secondHalf[secondHalf.length / 2]) / 2;

    const changeMin = secondMin - firstMin;
    const changeMax = secondMax - firstMax;
    const changeMean = secondMean - firstMean;
    const changeMedian = secondMedian - firstMedian;

    function formatChange(change) {
      const absChange = Math.abs(change).toFixed(2);
      if (change > 0) {
        return { sign: '+', value: absChange, color: 'green' };
      } else if (change < 0) {
        return { sign: '-', value: absChange, color: 'red' };
      } else {
        return { sign: '', value: '0.00', color: 'black' };
      }
    }
    const minChange = formatChange(changeMin);
    const maxChange = formatChange(changeMax);
    const meanChange = formatChange(changeMean);
    const medianChange = formatChange(changeMedian);

    const statsHTML = /*html*/`
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-label">Minimum (${typeTitle})</div>
          <div class="stat-value">
            ${fullMin.toFixed(2)}
            <sup class="stat-change" style="color: ${minChange.color};">${minChange.sign}${minChange.value}</sup>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Maximum (${typeTitle})</div>
          <div class="stat-value">
            ${fullMax.toFixed(2)}
            <sup class="stat-change" style="color: ${maxChange.color};">${maxChange.sign}${maxChange.value}</sup>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Mean (${typeTitle})</div>
          <div class="stat-value">
            ${fullMean.toFixed(2)}
            <sup class="stat-change" style="color: ${meanChange.color};">${meanChange.sign}${meanChange.value}</sup>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Median (${typeTitle})</div>
          <div class="stat-value">
            ${fullMedian.toFixed(2)}
            <sup class="stat-change" style="color: ${medianChange.color};">${medianChange.sign}${medianChange.value}</sup>
          </div>
        </div>
      </div>
    `;
    return statsHTML;
  }
}

customElements.define('sensor-detail', SensorDetail);


function getColorForType(title) {
  const colors = {
    'Temperature': 'rgb(255, 99, 132)',
    'Humidity': 'rgb(54, 162, 235)',
    'Atmospheric Pressure': 'rgb(255, 206, 86)',
    'Ground Status': 'rgb(75, 192, 192)',
    'Solar': 'rgb(153, 102, 255)',
    'Wind': 'rgb(255, 159, 64)',
    'Fire': 'rgb(255, 69, 0)',
    'Water': 'rgb(0, 191, 255)'
  };
  return colors[title] || 'rgb(75, 192, 192)';
}
