const template = document.createElement('template');

template.innerHTML = /*html*/`
    <style>
    @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

    #toggle-button-container {
        position: absolute;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
    }
    
    #toggle-button {
        display: flex;
        background-color: #f0f0f0;
        border-radius: 10px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
        overflow: hidden;
    }

    .toggle-option {
        padding: 10px;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 40px;
        height: 35px;
    }

    .separator {
        width: 1px;
        background-color: #ccc;
    }

    #toggle-button i {
        font-size: 24px;
        color: #888;
    }

    #toggle-button .selected {
        background-color: #dcdcdc;
        color: #000;
        transition: background-color 0.3s, color 0.3s;
    }

    </style>
    <div id="toggle-button-container">
        <div id="toggle-button">
            <div class="toggle-option" id="pointcloud-option">
                <i class="fa fa-cloud pointcloud-icon" aria-hidden="true"></i>
            </div>
            <div class="separator"></div>
            <div class="toggle-option" id="orthophoto-option">
                <i class="fa fa-map navigation-icon" aria-hidden="true"></i>
            </div>
            <div class="separator"></div>
            <div class="toggle-option" id="navigation-option">
                <i class="fa fa-street-view navigation-icon" aria-hidden="true"></i>
            </div>
        </div>
    </div>
`;

class ToggleButtonComponent extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });

        shadow.appendChild(template.content.cloneNode(true));

        this.currentMode = 'pointcloud';

        this.pointcloudOption = shadow.getElementById('pointcloud-option');
        this.navigationOption = shadow.getElementById('navigation-option');
        this.orthophotoOption = shadow.getElementById('orthophoto-option');

        this.updateToggleButton = this.updateToggleButton.bind(this);
        this.toggleMode = this.toggleMode.bind(this);

        this.pointcloudOption.addEventListener('click', () => {
            this.toggleMode('pointcloud');
        });

        this.navigationOption.addEventListener('click', () => {
            this.toggleMode('navigation');
        });

        this.orthophotoOption.addEventListener('click', () => {
            this.toggleMode('orthophoto');
        });

        this.updateToggleButton();
    }

    toggleMode(selectedOption) {   
        this.currentMode = selectedOption;

        this.dispatchEvent(new CustomEvent('change', { detail: { mode: this.currentMode } }));
        this.updateToggleButton();
    }

    updateToggleButton() {
        if (this.currentMode === 'pointcloud') {
            this.pointcloudOption.classList.add('selected');
            this.navigationOption.classList.remove('selected');
            this.orthophotoOption.classList.remove('selected');
        } else if (this.currentMode === 'navigation') {
            this.pointcloudOption.classList.remove('selected');
            this.navigationOption.classList.add('selected');
            this.orthophotoOption.classList.remove('selected');
        } else {
            this.pointcloudOption.classList.remove('selected');
            this.navigationOption.classList.remove('selected');
            this.orthophotoOption.classList.add('selected');
        }
    }
}

customElements.define('toggle-button', ToggleButtonComponent);
