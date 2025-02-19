class NavigationInstructions extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });

        shadow.innerHTML = /*html*/`
        <style>
           #instructions {
            display: none;
            align-items: flex-start; 
            justify-content: center;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8); 
            color: #fff;
            z-index: 1000;
        }

        .instructions-content {
            margin-top: 10%; 
            text-align: center;
            max-width: 400px;
            width: 80%;
        }

        #instructions p {
            margin: 10px 0;
            font-family: "system-ui";
        }

        .controls-info {
            margin-top: 20px;
        }

        .key {
            display: inline-block;
            padding: 5px 10px;
            margin: 0 2px;
            background: #444;
            border-radius: 4px;
            color: #fff;
            font-weight: bold;
            font-size: 16px;
        }

        </style>
        <div id="instructions">
            <div class="instructions-content">
                <div class="controls-info">
                    <p>
                        <span class="key">W</span>
                        <span class="key">A</span>
                        <span class="key">S</span>
                        <span class="key">D</span> — Rotación
                    </p>
                    <p>
                        <span class="key">
                            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2L5 9h5v13h4V9h5z"></path></svg>
                        </span>
                        <span class="key">
                            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12 22l7-7h-5V2h-4v13H5z"></path></svg>
                        </span>
                        <span class="key">
                            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M2 12l7 7v-5h13v-4H9V5z"></path></svg>
                        </span>
                        <span class="key">
                            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M22 12l-7-7v5H2v4h13v5z"></path></svg>
                        </span> — Navegación
                    </p>
                    <p>Haz clic para comenzar</p>
                </div>
            </div>
        </div>
        `;

        this.instructions = shadow.getElementById('instructions');

        this.instructions.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('start-navigation'));
            this.hideInstructions();
        });
    }

    showInstructions() {
        this.instructions.style.display = 'flex';
    }

    hideInstructions() {
        this.instructions.style.display = 'none';
    }
}

customElements.define('navigation-instructions', NavigationInstructions);
