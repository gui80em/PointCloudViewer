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
          flex-wrap: wrap;
          gap: 10px;
        }
        .stat-item {
          flex: 1;
          min-width: 120px;
          min-height: 100px;
          background: #fff;
          border: 1px solid #ddd;
          padding: 20px;
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .stat-label {
          position: absolute;
          top: 5px;
          left: 10px;
          font-size: 1rem;
          color: gray;
          text-align: left;
        }
        .stat-value {
          font-size: 2.5rem;
          font-weight: bold;
          line-height: 1.2;
        }
        .stat-change {
          font-size: 0.9rem;
          vertical-align: super;
        }
      </style>
      <div class="container">
        <div class="header">
          <h2 id="sensor-name">Select a sensor</h2>
          
        <div class="chart-container">
          <canvas id="sensorChart"></canvas>
        </div>
        <div id="time-range-selector" class="time-range" style="display:none;">
            <button class="button is-small" data-range="1day">1 Day</button>
            <button class="button is-small" data-range="1week">1 Week</button>
            <button class="button is-small" data-range="1month">1 Month</button>
            <button class="button is-small" data-range="1year">1 Year</button>
            <button class="button is-small" data-range="5years">5 Years</button>
          </div>
        </div>
        <div class="stats-box" id="stats" style="display:none;"></div>
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
    this.shadowRoot.getElementById('sensor-name').innerHTML = `${this.sensor.id} <i class="fa ${this.sensor.icon}"></i> ${this.sensor.title}`;
    this.shadowRoot.getElementById('time-range-selector').style.display = 'block';
    this.shadowRoot.getElementById('stats').style.display = 'block';
  }

  generateDummyData(range) {
    const now = Date.now();
    let points = [];
    let numPoints, interval;
    switch (range) {
      case '1day':
        numPoints = 24;
        interval = 3600 * 1000;
        break;
      case '1week':
        numPoints = 7;
        interval = 24 * 3600 * 1000;
        break;
      case '1month':
        numPoints = 30;
        interval = 24 * 3600 * 1000;
        break;
      case '1year':
        numPoints = 12;
        interval = 30 * 24 * 3600 * 1000;
        break;
      case '5years':
        numPoints = 5;
        interval = 365 * 24 * 3600 * 1000;
        break;
      default:
        numPoints = 24;
        interval = 3600 * 1000;
    }
    for (let i = numPoints - 1; i >= 0; i--) {
      const timestamp = now - i * interval;
      const value = 20 + Math.random() * 10;
      points.push({ timestamp, value });
    }
    return points;
  }

  fetchDataAndRenderChart() {
    const dataKey = `${this.sensor.id}-${this.timeRange}`;
    let dataPoints = this.dataCache[dataKey];
    if (!dataPoints) {
      dataPoints = this.generateDummyData(this.timeRange);
      this.dataCache[dataKey] = dataPoints;
    }
    this.renderChart(dataPoints);
    this.renderStats(dataPoints);
  }

  renderChart(dataPoints) {
    const ctx = this.shadowRoot.getElementById('sensorChart').getContext('2d');

    const chartData = {
      datasets: [{
        label: `${this.sensor.title} Data`,
        data: dataPoints.map(pt => ({ x: pt.timestamp, y: pt.value })),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    };
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
        y: {
          title: { display: false }
        }
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

  renderStats(dataPoints) {
    const values = dataPoints.map(pt => pt.value);
    const sorted = [...values].sort((a, b) => a - b);

    // Full data statistics
    const fullMin = Math.min(...values);
    const fullMax = Math.max(...values);
    const fullMean = values.reduce((a, b) => a + b, 0) / values.length;
    const fullMedian = computeMedian(sorted);

    // Split data into two halves for overall change computation
    const mid = Math.floor(values.length / 2);
    const firstHalf = values.slice(0, mid);
    const secondHalf = values.slice(mid);

    const firstMin = Math.min(...firstHalf);
    const firstMax = Math.max(...firstHalf);
    const firstMean = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const firstMedian = computeMedian([...firstHalf].sort((a, b) => a - b));

    const secondMin = Math.min(...secondHalf);
    const secondMax = Math.max(...secondHalf);
    const secondMean = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const secondMedian = computeMedian([...secondHalf].sort((a, b) => a - b));

    // Compute overall changes for each stat (second half minus first half)
    const changeMin = secondMin - firstMin;
    const changeMax = secondMax - firstMax;
    const changeMean = secondMean - firstMean;
    const changeMedian = secondMedian - firstMedian;

    // Helper function to compute the median of an array
    function computeMedian(arr) {
      const len = arr.length;
      if (len % 2 === 1) {
        return arr[(len - 1) / 2];
      } else {
        return (arr[len/2 - 1] + arr[len/2]) / 2;
      }
    }

    // Helper to format the overall change with a sign and color
    function formatChange(change) {
      const absChange = Math.abs(change).toFixed(2);
      if (change > 0) {
        return { sign: '+', value: absChange, color: 'green' };
      } else if (change < 0) {
        return { sign: '–', value: absChange, color: 'red' };
      } else {
        return { sign: '', value: '0.00', color: 'black' };
      }
    }
    const minChange = formatChange(changeMin);
    const maxChange = formatChange(changeMax);
    const meanChange = formatChange(changeMean);
    const medianChange = formatChange(changeMedian);

    // Build the HTML for the stats grid.
    const statsHTML = /*html*/`
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-label">Minimum</div>
          <div class="stat-value" >
            ${fullMin.toFixed(2)}
            <sup class="stat-change" style="color: ${minChange.color};">${minChange.sign}${minChange.value}</sup>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Maximum</div>
          <div class="stat-value">
            ${fullMax.toFixed(2)}
            <sup class="stat-change" style="color: ${maxChange.color};">${maxChange.sign}${maxChange.value}</sup>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Mean</div>
          <div class="stat-value" >
            ${fullMean.toFixed(2)}
            <sup class="stat-change" style="color: ${meanChange.color};">${meanChange.sign}${meanChange.value}</sup>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Median</div>
          <div class="stat-value" >
            ${fullMedian.toFixed(2)}
            <sup class="stat-change" style="color: ${medianChange.color};">${medianChange.sign}${medianChange.value}</sup>
          </div>
        </div>
      </div>
    `;
    this.shadowRoot.getElementById('stats').innerHTML = statsHTML;
  }
}

customElements.define('sensor-detail', SensorDetail);
