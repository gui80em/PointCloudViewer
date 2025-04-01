class MaterialSelector extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
  
    connectedCallback() {
      this.render();
      this.setupOptions();
      this.initializeSelectMenu();
    }
  
    render() {
      this.shadowRoot.innerHTML = /*html*/`
        <style>
          @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
  
          #potree_toolbar {
            position: absolute;
            z-index: 10000;
            right: 20px;
            top: 20px;
            background-color: rgba(255, 255, 255, 0.95);
            color: #333;
            padding: 5px;
            border-radius: 8px;
            font-family: system-ui;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 120px;
          }
  
          .potree_toolbar_label {
            font-size: 0.9em;
            color: #555;
            font-weight: bold;
            margin-bottom: 0.4em;
            text-align: center;
          }
  
          .select-container {
            position: relative;
            width: 90%;
          }
  
          #optMaterial {
            padding: 0.5em;
            padding-right: 2em;
            border-radius: 5px;
            border: 1px solid #ccc;
            background-color: #f9f9f9;
            color: #333;
            font-size: 0.9em;
            width: 100%;
            box-sizing: border-box;
            cursor: pointer;
            appearance: none; 
            -moz-appearance: none;
            -webkit-appearance: none;
          }
  
          /* Custom dropdown icon */
          .icon {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            pointer-events: none;
            color: #888;
          }
        </style>
  
        <div id="potree_toolbar">
          <div class="potree_toolbar_label">
            Indices
          </div>
          <div class="select-container">
            <select id="optMaterial"></select>
            <i class="fas fa-caret-down icon"></i>
          </div>
        </div>
      `;
    }
  
    setupOptions() {
      //const options = [ "rgb" ];
      // const options = [
      //        "rgba", "re", "r", "g", "cig", "cire", "ndvi", "ndre", "rvi",
      //        "gndvi", "psri", "sci", "ngrdi", "cvi", "elevation", "indices"
      //    ];
      const options = [
          "rgb", "ndvi"
      ];

      const attributeSelection = this.shadowRoot.querySelector('#optMaterial');
      options.forEach(option => {
        const elOption = document.createElement('option');
        elOption.value = option;
        elOption.textContent = option;
        attributeSelection.appendChild(elOption);
      });
    }
  
    initializeSelectMenu() {
      const attributeSelection = this.shadowRoot.querySelector('#optMaterial');
      attributeSelection.addEventListener('change', (event) => {
        const selectedValue = event.target.value;

        for (const pointcloud of potreeViewer.scene.pointclouds) {
          pointcloud.visible = false;
        }

        const selectedPointCloud = potreeViewer.scene.pointclouds.find(pointcloud => {
          return pointcloud.name === selectedValue;
        });
        
        if (selectedPointCloud) {
          selectedPointCloud.visible = true;
        }
      });
    }
  }
  
  customElements.define('material-selector', MaterialSelector);
  