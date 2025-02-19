let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

let rotateUp = false;
let rotateDown = false;
let rotateLeft = false;
let rotateRight = false;

const onKeyDown = function (event) {
    switch (event.code) {
        case 'KeyW':
            rotateUp = true;
            break;
        case 'KeyS':
            rotateDown = true;
            break;
        case 'KeyA':
            rotateRight = true;
            break;
        case 'KeyD':
            rotateLeft = true;
            break;

        case 'ArrowUp':
            moveForward = true;
            break;
        case 'ArrowDown':
            moveBackward = true;
            break;
        case 'ArrowLeft':
            moveLeft = true;
            break;
        case 'ArrowRight':
            moveRight = true;
            break;
    }
};

const onKeyUp = function (event) {
    switch (event.code) {
        case 'KeyW':
            rotateUp = false;
            break;
        case 'KeyS':
            rotateDown = false;
            break;
        case 'KeyA':
            rotateRight = false;
            break;
        case 'KeyD':
            rotateLeft = false;
            
            break;
        case 'ArrowUp':
            moveForward = false;
            break;
        case 'ArrowDown':
            moveBackward = false;
            break;
        case 'ArrowLeft':
            moveLeft = false;
            break;
        case 'ArrowRight':
            moveRight = false;
            break;
    }
};

function enableKeyboardControls() {

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
}

function disableKeyboardControls() {
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
}

function updateCamera(delta) {
    const moveSpeed = 100;       
    const rotationSpeed = 10; 

    const camera = potreeViewer.scene.getActiveCamera();
    const view = potreeViewer.scene.view;

    const moveDistance = moveSpeed * delta;

    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.normalize();

    const upVector = new THREE.Vector3(0, 0, 1);
    const sideVector = new THREE.Vector3();
    sideVector.crossVectors(upVector, direction).normalize();

    const fixedZ = view.position.z;

    if (moveForward) {
        view.position.add(direction.clone().multiplyScalar(moveDistance));
    }
    if (moveBackward) {
        view.position.add(direction.clone().multiplyScalar(-moveDistance));
    }
    if (moveLeft) {
        view.position.add(sideVector.clone().multiplyScalar(moveDistance));
    }
    if (moveRight) {
        view.position.add(sideVector.clone().multiplyScalar(-moveDistance));
    }

    view.position.z = fixedZ;

    const rotateAngle = rotationSpeed * delta;

    if (rotateLeft) {
        view.yaw -= rotateAngle;
    }
    if (rotateRight) {
        view.yaw += rotateAngle;
    }
    if (rotateUp) {
        view.pitch += rotateAngle;
    }
    if (rotateDown) {
        view.pitch -= rotateAngle;
    }

    const maxPitch = Math.PI / 2;
    const minPitch = -Math.PI / 2;
    view.pitch = Math.max(minPitch, Math.min(maxPitch, view.pitch));
}


window.updateCamera = updateCamera
window.enableKeyboardControls = enableKeyboardControls
window.disableKeyboardControls = disableKeyboardControls