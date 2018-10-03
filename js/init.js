var container;

var designer;

var camera, cameraOrthographic, cameraPerspective, scene, renderer, controlsO, controlsP, transformControl;

var human;

var clock = new THREE.Clock();

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2(), INTERSECTED;

var textureLoader;
var loadingManager = null;
var RESOURCES_LOADED = false;
var loadingScreen;
var shaders = new ShaderLoader('glsl', 'glsl');
shaders.shaderSetLoaded = function(){
    init();
};

shaders.load( 'vertexShaderLoader' , 'vertexShLoader' , 'vertex' );
shaders.load( 'fragmentShaderLoader' , 'fragmentShLoader' , 'fragment' );

// var human;
var floor, group, groupPlane, groupExtrude, groupLines, groupPoints, groupLinesUpdate, groupLinesScale;

var planeBackground;

var textureSpritePointScale;

var width, height, depth, fromFloor;

var rollOverMesh1, rollOverMesh2, rollOverMesh3, rollOverMesh4;
function init() {
    loadingScreen = {
        scene: new THREE.Scene(),
        cameraOrthographic: new THREE.PerspectiveCamera(90, 1280/720, 0.1, 100),
        hemiLight: new THREE.HemisphereLight( 0xffffff, 0xffffff, 1.6 ),
        planeLoader: new THREE.Mesh(
            new THREE.PlaneGeometry(80, 80),
            new THREE.ShaderMaterial({
                uniforms: {
                    time:       { value: 0.0 },
                    speed:      { value: 2.0 },
                    uvScale:    { value: new THREE.Vector2(1.0, 1.0) },
                    brightness: { value: 1.0 },
                    color:      { value: new THREE.Vector3(0.05, 0.19, 0.2) },
                    popSize:    { value: 0.15 },
                    baseSize:   { value: 0.89 },
                    radius:     { value: 0.18 }
                },
                vertexShader: shaders.vertexShaders.vertexShLoader,
                fragmentShader: shaders.fragmentShaders.fragmentShLoader
            })
        )
    };
    // Set up the loading screen's scene.
    // It can be treated just like our main scene.
    loadingScreen.planeLoader.position.set(0,0,5);
    loadingScreen.cameraOrthographic.position.set(0,0,50);
    loadingScreen.cameraOrthographic.lookAt(loadingScreen.planeLoader.position);
    loadingScreen.scene.add(loadingScreen.planeLoader);
    loadingScreen.hemiLight.name = "hemiLight";
    loadingScreen.hemiLight.color.setHSL( 0.6, 1, 0.6 );
    loadingScreen.hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
    loadingScreen.hemiLight.position.set( 0, 50, 0 );
    loadingScreen.scene.add(  loadingScreen.hemiLight );
    loadingManager = new THREE.LoadingManager();

    loadingManager.onProgress = function(item, loaded, total){
        console.log(item, loaded, total);
    };

    loadingManager.onLoad = function(){
        console.log("loaded all resources");
        RESOURCES_LOADED = true;
    };

    textureLoader = new THREE.TextureLoader(loadingManager);
    textureSpritePointScale = textureLoader.load( "textures/sprites/triangle.png" );

    container = document.getElementById('container');
    document.body.appendChild( container );

    var frustumSize = 1000;
    var aspect = window.innerWidth / window.innerHeight;
    cameraOrthographic = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 0.001, 50000 );
    setDefaultOrthographicCameraPosition();
    cameraOrthographic.name = "cameraOrthographic";

    cameraPerspective = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.001, 20000 );
    setDefaultPerspectiveCameraPosition();
    cameraPerspective.name = "cameraPerspective";

    camera = cameraOrthographic;
    // scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color( "#cff7ff" );
    // scene.fog = new THREE.Fog( "#cff7ff", 5000, 10000 );
    scene.name = "MainScene";

    //light
    var ambient = new THREE.AmbientLight( '#d2d2d2' );
    ambient.name = "ambientLight";
    scene.add( ambient );
    //
    var hemiLight = new THREE.HemisphereLight( '#ffffff', '#ffffff', 1.5 );
    hemiLight.name = "hemiLight";
    hemiLight.color.setHSL( 0.6, 1, 0.6 );
    hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
    hemiLight.position.set( 5000, 5000, 0 );
    scene.add( hemiLight );
    //
    var dirLight = new THREE.DirectionalLight( '#ffffff', 1.0 );
    dirLight.name = "dirLight";
    dirLight.color.setHSL( 0.1, 1, 0.95 );
    dirLight.position.set( 0, 1000, 1000 );
    dirLight.position.multiplyScalar( 30 );
    scene.add( dirLight );
    // dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    var d = 50;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.camera.far = 3500;
    dirLight.shadow.bias = -0.0001;

      var geom = new THREE.BoxBufferGeometry( 50, 180, 20 );
  var mat = new THREE.MeshBasicMaterial( { color: '#088277', opacity: 0.5, transparent: true } );
  human = new THREE.Mesh( geom, mat );
  human.name = "human";
  human.position.y = 90;
  human.visible = false;
  scene.add( human );

    ////
    renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true, precision: "highp" });
    // renderer.sortObjects = false;
    renderer.setClearColor('#6b97a1', 1.0);
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.physicallyBasedShading = true;
    /*   renderer.shadowMap.enabled = true;
       renderer.shadowMapAutoUpdate = true;
       renderer.shadowMap.type = THREE.PCFSoftShadowMap;
       renderer.shadowMap.shadowMapSoft = true;*/
    designer = new ControlDesigner(textureSpritePointScale);
    scene.add(designer);

    container.appendChild( renderer.domElement );

    set2DControl();
    set3DControl();
    setTransformControls();

    document.getElementsByTagName("canvas")[0].addEventListener( 'mousemove', onDocumentMouseMove, false );
    window.addEventListener( 'resize', onWindowResize, false );
    document.addEventListener( 'keydown', onKeyDown, false );
    document.getElementsByTagName("canvas")[0].addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.getElementsByTagName("canvas")[0].addEventListener( 'mouseup', onDocumentMouseCancel, false );
  //  document.getElementsByTagName("canvas")[0].addEventListener( 'mouseleave', onDocumentMouseCancel, false );

    document.Instruments.changeDoor.addEventListener("click", changeDoor);
    document.Instruments.changeWindow.addEventListener("click", changeWindow);

    document.panelCamera.cameraOrthographic.addEventListener("click", changeCamera);
    document.panelCamera.cameraPerspective.addEventListener("click", changeCamera);
    document.panelCamera.cameraDefault.addEventListener("click", setCameraDefaultPosition);

    document.getElementById('help').addEventListener('click', visibilityHelp, false);

    animate();
}

function setTransformControls() {
    transformControl = new THREE.TransformControls( camera, renderer.domElement );
    transformControl.showX = false;
    transformControl.showY = false;
    transformControl.showZ = false;

    transformControl.setSize( transformControl.size * 0.5 );
    scene.add( transformControl );

    var arrObjects = designer.groupPoints.children;
    var dragcontrols = new THREE.DragControls( arrObjects, camera, renderer.domElement ); //
    dragcontrols.enabled = true;
    dragcontrols.addEventListener( 'hoveron', function ( event ) {
        designer.hoverOnPointObject(event.object);
    } );
    dragcontrols.addEventListener( 'hoveroff', function ( event ) {
            designer.hoverOffPointObject(designer.hoverOnObject);
    } );
    dragcontrols.addEventListener( 'drag', function ( event ) {
       designer.updateHelperLines(event.object);
       drag(event.object);
    } );
    dragcontrols.addEventListener( 'dragend', dragEnd );
    dragcontrols.addEventListener( 'dragstart', function( event ) {
        transformControl.attach( event.object );
        designer.selectPointObject(transformControl.object);
    } );

}

function drag( object ) {
   transformControl.attach( object );
   designer.updateLinePath(transformControl.object);
}

function dragEnd( event ) {
    designer.endUpdateLinePath(transformControl);
    // designer.updateExtrudePathX();
    designer.lineHorizontal.visible = false;
    designer.lineVertical.visible = false;

    // designer.mapX.clear();
    // designer.mapY.clear();
   /* for (var i = 0; i < designer.groupPoints.children.length; i++ ) {
        designer.mapX.set(designer.groupPoints.children[i].position.x, designer.groupPoints.children[i].position);
        designer.mapY.set(designer.groupPoints.children[i].position.y, designer.groupPoints.children[i].position);
    }*/
}

function visibilityHelp(event) {

    var helpPanel = document.getElementById('help-panel');
    if (helpPanel.style.visibility === "hidden") {
        helpPanel.style.visibility = "visible";
    } else {
        helpPanel.style.visibility = "hidden";
    }
}

function set2DControl() {
    if (!controlsO) {
        controlsO = new THREE.TrackballControls(cameraOrthographic, renderer.domElement);
    }
    controlsO.reset();
    controlsO.target.set(0,0,0);
    controlsO.noRotate = true;
    controlsO.panSpeed = 2.0;
    controlsO.dynamicDampingFactor = 1.0;
}

function set3DControl() {
    if (!controlsP) {
        controlsP = new THREE.OrbitControls(cameraPerspective, renderer.domElement);
    }
    controlsP.reset();
    controlsP.maxPolarAngle = Math.PI / 2.1;
    controlsP.maxDistance = 4000;
    controlsP.screenSpacePanning = false;
}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event ) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects(designer.objects, false);
    if ( intersects.length > 0 ) {
        var intersect = intersects[ 0 ];
// console.log(intersect.object.name);
        var posMouse = new THREE.Vector3();
        posMouse.copy( intersect.point );
        posMouse.divideScalar( 1 ).floor().multiplyScalar( 1 ).addScalar( 1 );

        if (camera.isOrthographicCamera) {
            posMouse.z = 700;
            if (designer.selectedInstr) {
                var obj = {
                    position: posMouse
                };
                posMouse = designer.updateHelperLines(obj);
            } else {
                if (designer.boolCursor) {
                    designer.mouseMoveCursor2D(posMouse);
                } else {
                    designer.mouseMove2D(posMouse);
                }
            }
        } else if (camera.isPerspectiveCamera) {

            if (designer.boolCursor) {
                designer.mouseMoveCursor3D(intersect);
            } else {
                designer.mouseMove3D(intersect);
            }
        }
        designer.mouseMove(posMouse);
    } else {
        document.body.style.cursor = 'auto';
    }

}

function leftClick( event ) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(designer.objects, false);
    if (intersects.length > 0) {
        var intersect = intersects[0];
        // console.log(intersect.object.name);
        if (camera.isOrthographicCamera) {
            if (designer.boolCursor) {
                designer.mouseClickCursor2D(intersect);
            } else {
                designer.mouseClick2D( intersect, event );
            }
        } else if (camera.isPerspectiveCamera) {
            if (designer.boolCursor) {
                designer.mouseClickCursor3D(intersect);
            } else {
                designer.mouseClick3D( intersect );
            }
        }
    } else {
        document.body.style.cursor = 'auto';
    }
}

function onDocumentMouseDown( event ) {
    if (event.which == 1) {
        leftClick(event);
    } else if (event.which == 2) {

    } else if (event.which == 3) {

    }
}

function onDocumentMouseCancel( event ) {
    event.preventDefault();
    designer.mouseCancel(event);
    controlsP.enableRotate = true;
}

function animate() {
    if( RESOURCES_LOADED == false ){
        requestAnimationFrame(animate);
        var deltaTime = clock.getDelta();
        loadingScreen.planeLoader.material.uniforms.time.value += deltaTime;
        renderer.render(loadingScreen.scene, loadingScreen.cameraOrthographic);
        return; // Stop the function here.
    }


    requestAnimationFrame( animate );
    if (camera.isOrthographicCamera) {
        controlsO.update();
    }
    //////
    render();
}

function render() {
    renderer.render( scene, camera );
}

function changeDoor(){
    if (
        !designer.selectedSubtractObject &&
        !designer.boolMagnet &&
        !designer.selectedInstr &&
        !designer.selectedScale
    ) {
        designer.boolCursor = !designer.boolCursor;
        designer.setPropertiesCursor();
        changeColorButton();
    }
}

function changeWindow(){

}

function changeColorButton(){

    if (designer.boolCursor) {
        document.Instruments.changeDoor.classList.remove("inputInstrumentUnselected");
        document.Instruments.changeDoor.classList.add("inputInstrumentSelected");
    } else {
        document.Instruments.changeDoor.classList.remove("inputInstrumentSelected");
        document.Instruments.changeDoor.classList.add("inputInstrumentUnselected");
    }

    if (designer.boolWindow) {
        document.Instruments.changeWindow.classList.remove("inputInstrumentUnselected");
        document.Instruments.changeWindow.classList.add("inputInstrumentSelected");
    } else {
        document.Instruments.changeWindow.classList.remove("inputInstrumentSelected");
        document.Instruments.changeWindow.classList.add("inputInstrumentUnselected");
    }
}

function changeCamera(event){
    designer.selectedInstr = false;
    changeColorButton();
    designer.clearPointsPosition();
    if (event.srcElement.name === "cameraOrthographic") {
        if (!designer.selectedSubtractObject) {
            designer.menu2D.visibleMenu();
            document.panelCamera.cameraOrthographic.classList.add("inputInstrumentSelected");
            document.panelCamera.cameraOrthographic.classList.remove("inputInstrumentUnselected");

            document.panelCamera.cameraPerspective.classList.remove("inputInstrumentSelected");
            document.panelCamera.cameraPerspective.classList.add("inputInstrumentUnselected");

            designer.group.rotation.x = 0;
            //     designer.groupExtrude.rotation.x = designer.group.rotation.x;
            designer.groupSubtract.rotation.x = designer.group.rotation.x;
            designer.groupProportions.rotation.x = designer.group.rotation.x;

            designer.groupExtrude.visible = false;
            designer.groupFinishedWalls.visible = false;
            designer.groupPlane.visible = true;
            designer.groupLinesUpdate.visible = true;
            designer.groupLines.visible = true;
            designer.groupPoints.visible = true;
            designer.groupProportions.visible = true;
            designer.groupProportions3D.visible = false;

            designer.groupSubtract.visible = true;

            designer.groupSubtractObjects.visible = false;

            transformControl.enabled = true;
            transformControl.visible = true;

            human.visible = false;

            camera = cameraOrthographic;
            setCameraDefaultPosition();

            designer.boolCursor = false;
            designer.setPropertiesCursor();
            changeColorButton();
        }
    } else if (event.srcElement.name === "cameraPerspective") {
        if (!designer.selectedSubtractObject) {
            designer.menu2D.hiddenMenu();
            if (transformControl.object) {
                transformControl.detach(transformControl.object);
            }

            if (designer.selectedObject) {
                designer.unselectObject(designer.selectedObject);
                designer.selectedObject = null;
            }

            if (designer.selectedPoint) {
                designer.unselectPointObject(designer.selectedPoint);
                designer.selectedPoint = null;
            }

            document.panelCamera.cameraPerspective.classList.add("inputInstrumentSelected");
            document.panelCamera.cameraPerspective.classList.remove("inputInstrumentUnselected");

            document.panelCamera.cameraOrthographic.classList.remove("inputInstrumentSelected");
            document.panelCamera.cameraOrthographic.classList.add("inputInstrumentUnselected");

            designer.group.rotation.x = -Math.PI / 2;
            //    designer.groupExtrude.rotation.x = designer.group.rotation.x;
            designer.groupSubtract.rotation.x = designer.group.rotation.x;
            designer.groupProportions.rotation.x = designer.group.rotation.x;

            designer.groupSubtract.visible = false;

            designer.groupSubtractObjects.visible = true;

            human.visible = false;
            // designer.groupExtrude.visible = true;
            designer.groupFinishedWalls.visible = true;
            designer.groupPlane.visible = false;
            designer.groupLinesUpdate.visible = false;
            designer.groupLines.visible = false;

            designer.selectedScale = false;
            designer.selectedInstr = false;

            designer.boolCursor = false;
            designer.setPropertiesCursor();
            changeColorButton();

            designer.groupLinesScale.visible = false;

            designer.groupPoints.visible = false;
            designer.groupProportions.visible = false;
            designer.groupProportions3D.visible = true;
            transformControl.enabled = false;
            transformControl.visible = false;

            camera = cameraPerspective;
            setCameraDefaultPosition();

            // designer.rebuildAll();
        }
    }
}

function setCameraDefaultPosition () {
    if (camera.isPerspectiveCamera) {
        setDefaultPerspectiveCameraPosition();
        camera.position.copy(cameraPerspective.position);
        camera.rotation.copy(cameraPerspective.rotation);
        set3DControl();
    } else if (camera.isOrthographicCamera) {
        setDefaultOrthographicCameraPosition ();
        camera.position.copy(cameraOrthographic.position);
        camera.rotation.copy(cameraOrthographic.rotation);
        set2DControl();
    }
}

function setDefaultOrthographicCameraPosition () {
    cameraOrthographic.position.set(0,0,1000);
    cameraOrthographic.rotation.set(0,0,0);
}

function setDefaultPerspectiveCameraPosition () {
    cameraPerspective.position.set(1800,1800,1800);
    cameraPerspective.rotation.set(0,0,0);
}

function onKeyDown ( event ) {
    switch ( event.keyCode ) {
        case 82: // r
            // console.log(" designer.mapX",  designer.mapX);
            // console.log(" designer.mapY",  designer.mapY);
            // console.log(" groupSubtract",  designer.groupSubtract);
            console.log("    objects",  designer.objects);
            break;
        case 83: // s
            break;
        case 84: // t
            break;
        case 27: // esc
            designer.clearLastPointsPosition();
            break;
        case 46: // delete
            if (designer.selectedObject) {
                designer.deleteSelectedObject(transformControl);
            } else  if (designer.selectedSubtractObject) {
                designer.deleteSelectedSubtractObject(transformControl);
            } else {
                if (designer.groupPoints.children.length && transformControl.object) {
                    designer.deletePointObject(transformControl);
                }
            }
            break;
        case 37: // left
            if (designer.selectedPoint) {
                designer.selectedPoint.position.x -= 1;
                designer.updateObject(designer.selectedPoint);
                dragEnd();
            }
            break;
        case 38: // up
            if (designer.selectedPoint) {
                designer.selectedPoint.position.y += 1;
                designer.updateObject(designer.selectedPoint);
                dragEnd();
            }
            break;
        case 39: // right
            if (designer.selectedPoint) {
                designer.selectedPoint.position.x += 1;
                designer.updateObject(designer.selectedPoint);
                dragEnd();
            }
            break;
        case 40: // down
            if (designer.selectedPoint) {
                designer.selectedPoint.position.y -= 1;
                designer.updateObject(designer.selectedPoint);
                dragEnd();
            }
            break;
    }
}