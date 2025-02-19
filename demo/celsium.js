function loadCelsium(element_id = 'cesiumContainer') {
    window.cesiumViewer = new Cesium.Viewer(element_id, {
        useDefaultRenderLoop: false,
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        navigationHelpButton: false,
        imageryProvider: Cesium.createOpenStreetMapImageryProvider({ url: 'https://a.tile.openstreetmap.org/' }),
        terrainShadows: Cesium.ShadowMode.DISABLED,
    });
}

function loop(timestamp) {
    requestAnimationFrame(loop);

    const delta = potreeViewer.clock.getDelta();
    
    updateCamera(delta);
 
    potreeViewer.update(delta, timestamp);
    potreeViewer.render();

    if (window.toMap !== undefined) {
        let camera = potreeViewer.scene.getActiveCamera();
        let pPos = new THREE.Vector3(0, 0, 0).applyMatrix4(camera.matrixWorld);
        let pRight = new THREE.Vector3(600, 0, 0).applyMatrix4(camera.matrixWorld);
        let pUp = new THREE.Vector3(0, 600, 0).applyMatrix4(camera.matrixWorld);
        let pTarget = potreeViewer.scene.view.getPivot();

        let toCes = (pos) => {
            let xy = [pos.x, pos.y];
            let height = pos.z;
            let deg = toMap.forward(xy);
            let cPos = Cesium.Cartesian3.fromDegrees(...deg, height);
            return cPos;
        };

        let cPos = toCes(pPos);
        let cUpTarget = toCes(pUp);
        let cTarget = toCes(pTarget);

        let cDir = Cesium.Cartesian3.subtract(cTarget, cPos, new Cesium.Cartesian3());
        let cUp = Cesium.Cartesian3.subtract(cUpTarget, cPos, new Cesium.Cartesian3());

        cDir = Cesium.Cartesian3.normalize(cDir, new Cesium.Cartesian3());
        cUp = Cesium.Cartesian3.normalize(cUp, new Cesium.Cartesian3());

        cesiumViewer.camera.setView({
            destination: cPos,
            orientation: {
                direction: cDir,
                up: cUp
            }
        });

        let aspect = potreeViewer.scene.getActiveCamera().aspect;
        if (aspect < 1) {
            let fovy = Math.PI * (potreeViewer.scene.getActiveCamera().fov / 180);
            cesiumViewer.camera.frustum.fov = fovy;
        } else {
            let fovy = Math.PI * (potreeViewer.scene.getActiveCamera().fov / 180);
            let fovx = Math.atan(Math.tan(0.5 * fovy) * aspect) * 2
            cesiumViewer.camera.frustum.fov = fovx;
        }
    }

    cesiumViewer.render();
}

window.loop = loop
window.loadCelsium = loadCelsium