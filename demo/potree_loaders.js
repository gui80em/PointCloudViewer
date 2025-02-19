function loadPotree(pointcloud_file, visible_pointcloud = "rgb", element_id = "potree_render_area") {
    window.potreeViewer = new Potree.Viewer(document.getElementById(element_id), {
        useDefaultRenderLoop: false
    });
    potreeViewer.setEDLEnabled(true);
    potreeViewer.setFOV(60);
    potreeViewer.setPointBudget(3_000_000);
    potreeViewer.setMinNodeSize(50);
    potreeViewer.loadSettingsFromURL();
    potreeViewer.setBackground(null);
    potreeViewer.useHQ = true;

    potreeViewer.loadGUI(() => {
        potreeViewer.setLanguage('es');
    });

    return new Promise((resolve, reject) => {
        Potree.loadPointCloud(pointcloud_file, "rgb", function (e) {
            let scene = potreeViewer.scene;
            let pointcloud = e.pointcloud;

            pointcloud.visible = pointcloud.name === visible_pointcloud;

            scene.addPointCloud(e.pointcloud);
            pointcloud.position.z = 0;

            let mapProjection = proj4.defs("WGS84");
            pointcloud.projection = "+proj=utm +zone=30 +datum=WGS84 +units=m +no_defs +type=crs";
            window.toMap = proj4(pointcloud.projection, mapProjection);
            window.toScene = proj4(mapProjection, pointcloud.projection);

            let bb = potreeViewer.getBoundingBox();

            console.log(bb)
            proj4(pointcloud.projection, mapProjection, bb.min.toArray());
            proj4(pointcloud.projection, mapProjection, bb.max.toArray());

            let boxCenter = pointcloud.pcoGeometry.tightBoundingBox.getCenter(new THREE.Vector3());
            window.globalCenter = boxCenter.clone().add(pointcloud.position);

            resolve();
        });
    });
}


function loadTexture(texture_file, visible = false) {
    const loader = new THREE.GLTFLoader();
    const dracoLoader = new THREE.DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    loader.setDRACOLoader(dracoLoader);
    return new Promise((resolve, reject) => {
        loader.load(
            texture_file,
            function (gltf) {
                gltf.scene.traverse(function (node) {
                    if (node.isMesh) {
                        node.material.side = THREE.DoubleSide;
                        node.material.needsUpdate = true;
                        node.frustumCulled = false;
                        node.material.depthTest = false;
                    }
                });
                const box = new THREE.Box3().setFromObject(gltf.scene);
                const size = new THREE.Vector3();
                box.getSize(size);
                const center = new THREE.Vector3();
                box.getCenter(center);

                const baseOffset = center.z - (size.z / 2);

                gltf.scene.name = "texture"

                gltf.scene.position.set(globalCenter.x, globalCenter.y, -baseOffset);

                potreeViewer.scene.scene.add(gltf.scene);

                gltf.scene.visible = visible

                //TODO: skip
                window.textureBB = box.clone();

                if (window.toMap) {
                    let minGeo = window.toMap.forward([box.min.x, box.min.y]);
                    let maxGeo = window.toMap.forward([box.max.x, box.max.y]);
                    window.textureGeoBB = {
                        minLon: minGeo[0],
                        minLat: minGeo[1],
                        maxLon: maxGeo[0],
                        maxLat: maxGeo[1]
                    };
                }

                setCameraToTextureTopSideView()

                resolve()
            },
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% cargado');
            },
            function (error) {
                console.error('Error al cargar el modelo:', error);
                reject()
            }
        )
    })
}

async function loadOrthophoto(orthophoto_file) {
    return new Promise((resolve, reject) => {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
            orthophoto_file,
            (texture) => {

                if (!window.textureBB) {
                    console.error("Texture bounding box is not available.");
                    reject("No texture bounding box.");
                    return;
                }

                const size = new THREE.Vector3();
                window.textureBB.getSize(size);
                const center = new THREE.Vector3();
                window.textureBB.getCenter(center);


                const geometry = new THREE.PlaneGeometry(size.x, size.y);

                const material = new THREE.MeshBasicMaterial({
                    map: texture,
                    side: THREE.DoubleSide
                });

                const plane = new THREE.Mesh(geometry, material);

                if (window.globalCenter) {
                    plane.position.set(window.globalCenter.x, window.globalCenter.y, 1);
                } else {
                    plane.position.copy(center);
                }

                potreeViewer.scene.scene.add(plane);

                window.orthophotoPlane = plane;
                plane.visible = false;

                resolve();
            },
            undefined,
            (error) => {
                console.error("Error loading orthophoto:", error);
                reject(error);
            }
        );
    });
}

function visibleOrthophoto() {
    if (window.orthophotoPlane) {
        window.orthophotoPlane.visible = true;
    }
}

function hiddenOrthophoto() {
    if (window.orthophotoPlane) {
        window.orthophotoPlane.visible = false;
    }
}



function visiblePointCloud(name = "") {
    potreeViewer.scene.pointclouds[0].visible = true
}

function hiddenPointCloud() {
    potreeViewer.scene.pointclouds[0].visible = false
}

function visibleTexture() {
    const texture = potreeViewer.scene.scene.getObjectByName('texture');
    if (texture) {
        texture.visible = true;
    } else {
        console.warn('El modelo no ha sido cargado aún.');
    }
}

function hiddenTexture() {
    const texture = potreeViewer.scene.scene.getObjectByName('texture');
    if (texture) {
        texture.visible = false;
    } else {
        console.warn('El modelo no ha sido cargado aún.');
    }
}

function setCameraToTextureSideView() {

    const texture = potreeViewer.scene.scene.getObjectByName('texture');

    if (texture) {
        const box = new THREE.Box3().setFromObject(texture);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        const cameraPosition = new THREE.Vector3(
            center.x - (size.x / 4),
            center.y,
            center.z + 3
        );

        potreeViewer.scene.view.position.copy(cameraPosition);
        potreeViewer.scene.view.lookAt(center);

    } else {
        console.warn('El modelo no ha sido cargado aún.');
    }
}

function setCameraToTextureTopSideView(height = 100) {
    const texture = potreeViewer.scene.scene.getObjectByName('texture');
    if (texture) {
        const box = new THREE.Box3().setFromObject(texture);
        const center = new THREE.Vector3();
        box.getCenter(center);


        const cameraPosition = new THREE.Vector3(
            center.x,
            center.y - 200,
            center.z + height
        );

        potreeViewer.scene.view.position.copy(cameraPosition);
        potreeViewer.scene.view.lookAt(center);
    } else {
        console.warn('El modelo de textura no ha sido cargado aún.');
    }
}

function setCameraToTextureTopView(height = 100) {
    const texture = potreeViewer.scene.scene.getObjectByName('texture');
    if (texture) {
        const box = new THREE.Box3().setFromObject(texture);
        const center = new THREE.Vector3();
        box.getCenter(center);


        const cameraPosition = new THREE.Vector3(
            center.x,
            center.y,
            center.z + height
        );

        potreeViewer.scene.view.position.copy(cameraPosition);
        potreeViewer.scene.view.lookAt(center);
    } else {
        console.warn('El modelo de textura no ha sido cargado aún.');
    }
}

function getRandomPointsInBoundingBox(numPoints) {
    const bb = potreeViewer.getBoundingBox();
    const points = [];
    for (let i = 0; i < numPoints; i++) {
        const tX = (Math.random() + Math.random() + Math.random()) / 3;
        const tY = (Math.random() + Math.random() + Math.random()) / 3;
        //const tZ = (Math.random() + Math.random() + Math.random()) / 3;

        const x = THREE.MathUtils.lerp(bb.min.x, bb.max.x, tX);
        const y = THREE.MathUtils.lerp(bb.min.y, bb.max.y, tY);
        const z = 2;
        //const z = THREE.MathUtils.lerp(bb.min.z, bb.max.z, tZ);
        points.push(new THREE.Vector3(x, y, z));
    }
    return points;
}

window.getRandomPointsInBoundingBox = getRandomPointsInBoundingBox

window.setCameraToTextureSideView = setCameraToTextureSideView
window.setCameraToTextureTopView = setCameraToTextureTopView
window.setCameraToTextureTopSideView = setCameraToTextureTopSideView

window.visiblePointCloud = visiblePointCloud
window.hiddenPointCloud = hiddenPointCloud
window.visibleTexture = visibleTexture
window.hiddenTexture = hiddenTexture
window.visibleOrthophoto = visibleOrthophoto;
window.hiddenOrthophoto = hiddenOrthophoto;
window.loadPotree = loadPotree
window.loadTexture = loadTexture
window.loadOrthophoto = loadOrthophoto;