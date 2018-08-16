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
    cameraOrthographic = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 0.1, 50000 );
    setDefaultOrthographicCameraPosition();
    cameraOrthographic.name = "cameraOrthographic";

    cameraPerspective = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.01, 20000 );
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
    document.getElementsByTagName("canvas")[0].addEventListener( 'mouseleave', onDocumentMouseCancel, false );

    document.Instruments.changeInstrument.addEventListener("click", changeInstrument);
    document.Instruments.changeScale.addEventListener("click", changeScale);
    document.Instruments.changeMagnet.addEventListener("click", changeMagnet);
    document.Instruments.changeDoor.addEventListener("click", changeDoor);
    document.Instruments.changeWindow.addEventListener("click", changeWindow);

    document.panelCamera.cameraOrthographic.addEventListener("click", changeCamera);
    document.panelCamera.cameraPerspective.addEventListener("click", changeCamera);
    document.panelCamera.cameraDefault.addEventListener("click", setCameraDefaultPosition);

    document.getElementById('help').addEventListener('click', visibilityHelp, false);
    document.getElementById('file').addEventListener('change', handleFileSelect, false);
    // Get the widthWall input.
    var w = document.getElementById('widthWall');
    designer.widthWall = w.value;
    if (!designer.widthWall) {
        alert('Error: failed to get the widthWall element!');
        designer.widthWall = 20;
        return;
    }
    w.addEventListener('change', function (ev) {
        designer.widthWall = w.value;
        // console.log(lineWidth);
    }, false);

    // Get the heightWall input.
    var h = document.getElementById('heightWall');
    designer.heightWall = h.value;
    if (!designer.heightWall) {
        alert('Error: failed to get the heightWall element!');
        designer.heightWall = 280;
        return;
    }
    h.addEventListener('change', function (ev) {
        designer.heightWall = h.value ;
    }, false);

    // Get the valueScale input.
    var valueSc = document.getElementById('valueScale');
    designer.valueScale = valueSc.value;
    if (!designer.valueScale) {
        alert('Error: failed to get the valueScale element!');
        designer.valueScale = 1;
        return;
    }
    valueSc.addEventListener('change', function (ev) {
        designer.valueScale = valueSc.value;
        designer.calculateScale(designer.positionsScale);
        // console.log(valueScale);
    }, false);

  /*  // Get the sensitivityMagnet input.
    var sensitivityMag = document.getElementById('sensitivityMagnet');
    designer.sensitivity = sensitivityMag.value;
    if (!designer.sensitivity) {
        alert('Error: failed to get the sensitivityMagnet element!');
        designer.sensitivity = 10;
        return;
    }
    sensitivityMag.addEventListener('change', function (ev) {
        designer.sensitivity = sensitivityMag.value;
        // console.log(valueScale);
    }, false);
*/

    // Get the widthDoor input.
    width = document.getElementById('width');
    // designer.widthDoor = 150;
    // designer.widthWindow = 150;

    width.addEventListener('change', function (ev) {
        if (designer.boolDoor) {
            designer.widthDoor = +width.value;
            if (designer.door) {
                designer.door.scale.x = designer.widthDoor;
            }
            if (designer.door2D) {
                designer.door2D.scale.x = designer.widthDoor;
            }
        } else if (designer.boolWindow) {
            designer.widthWindow = +width.value;
            if (designer.window) {
                designer.window.scale.x = designer.widthWindow;
            }
            if (designer.window2D) {
                designer.window2D.scale.x = designer.widthWindow;
            }
        }
    }, false);

    // Get the heightDoor input.
    height = document.getElementById('height');
    // designer.heightDoor = 220;
    // designer.heightWindow = 150;

    height.addEventListener('change', function (ev) {
        if (designer.boolDoor) {
            designer.heightDoor = +height.value;
            if (designer.door) {
                designer.door.scale.y = designer.heightDoor;
            }
        } else if (designer.boolWindow) {
            designer.heightWindow = +height.value;
            if (designer.window) {
                designer.window.scale.y = designer.heightWindow;
            }
        }
    }, false);

    // Get the depthDoor input.
    depth = document.getElementById('depth');
    // designer.depthDoor = 100;
    // designer.depthWindow = 100;

    depth.addEventListener('change', function (ev) {
        if (designer.boolDoor) {
            designer.depthDoor = +depth.value;
            if (designer.door) {
                designer.door.scale.z = designer.depthDoor;
            }
            if (designer.door2D) {
                designer.door2D.scale.y = designer.widthDoor;
            }
        } else if (designer.boolWindow) {
            designer.depthWindow = +depth.value;
            if (designer.window) {
                designer.window.scale.z = designer.depthWindow;
            }
            if (designer.window2D) {
                designer.window2D.scale.y = designer.depthWindow;
            }
        }
    }, false);

    // Get the fromFloorDoor input.
    fromFloor = document.getElementById('fromFloor');
    // designer.fromFloorDoor = 0;
    // designer.fromFloorWindow = 70;

    fromFloor.addEventListener('change', function (ev) {
        if (designer.boolDoor) {
            designer.fromFloorDoor = +fromFloor.value;
        } else if (designer.boolWindow) {
            designer.fromFloorWindow = +fromFloor.value;
        }
    }, false);

    animate();
}

function setTransformControls() {
    transformControl = new THREE.TransformControls( camera, renderer.domElement, false );
    // transformControl.addEventListener( 'change', render );
    transformControl.setSize( transformControl.size * 0.5 );
    scene.add( transformControl );
    // Hiding transform situation is a little in a mess :()
    /* transformControl.addEventListener( 'change', function( e ) {
         cancelHideTransorm();
     } );
     transformControl.addEventListener( 'mouseDown', function( e ) {
         cancelHideTransorm();
     } );
     transformControl.addEventListener( 'mouseUp', function( e ) {
         delayHideTransform();
         var index = 0;
         for (var i = 0; i < groupLinesUpdate.children.length; i++) {
             if (groupLinesUpdate.children[i].name === "line_" + updatedWall.toString()) {
                 index = i;
                 i = groupLinesUpdate.children.length;
             }
         }
         updateExtrudePath(groupLinesUpdate.children[index].geometry.attributes.position.array);
     } );
     transformControl.addEventListener( 'objectChange', function( e ) {
         // console.log(transformControl.object.name);
         updateObject(transformControl.object);
     } );*/

    var arrObjects = designer.groupPoints.children;
    var dragcontrols = new THREE.DragControls( arrObjects, camera, renderer.domElement ); //
    dragcontrols.enabled = true;
    dragcontrols.addEventListener( 'hoveron', function ( event ) {
        transformControl.attach( event.object );
        designer.selectPointObject(transformControl.object);
        /*
                selectedObject = null;
                for (var i = 0; i < groupLinesUpdate.children.length; i++) {
                    groupLinesUpdate.children[i].material.color = new THREE.Color("#d70003");
                }
                for (var i = 0; i < objects.length; i++) {
                    if (objects[i].name.split('_')[0] === "wallsCup") {
                        objects[i].material.color = new THREE.Color("#9cc2d7");
                    }
                }*/
        // cancelHideTransorm();
    } );
    dragcontrols.addEventListener( 'hoveroff', function ( event ) {
        if (transformControl.object !== designer.selectedPoint && transformControl.object) {
            designer.unselectPointObject(transformControl.object);
            transformControl.detach(transformControl.object);
        }
        // delayHideTransform();
    } );
    dragcontrols.addEventListener( 'drag', function ( event ) {

        designer.updateHelperLines(transformControl.object);
        designer.updateObject(transformControl.object);
        // dragEnd();
    } );
    dragcontrols.addEventListener( 'dragend', dragEnd );
    dragcontrols.addEventListener( 'dragstart', function( e ) {
        if (designer.selectedPoint !== transformControl.object && designer.selectedPoint) {
            designer.unselectPointObject(designer.selectedPoint);
            designer.selectedPoint = null;
        }

        designer.mapX.delete(Math.round(transformControl.object.position.x));
        designer.mapY.delete(Math.round(transformControl.object.position.y));
    } );

    /* var hiding;
     function delayHideTransform() {
         cancelHideTransorm();
         hideTransform();
     }
     function hideTransform() {
         hiding = setTimeout( function() {
             transformControl.detach( transformControl.object );
         }, 2500 )
     }
     function cancelHideTransorm() {
         if ( hiding ) clearTimeout( hiding );
     }*/
}

function dragEnd( event ) {
    var objectlines = null;
    if (designer.mapLines.has("line_" + designer.updatedWall.toString())) {
        objectlines = designer.mapLines.get("line_" + designer.updatedWall.toString());
    }
    designer.updateExtrudePath(objectlines.geometry.attributes.position.array);

   designer.lineHorizontal.visible = false;
   designer.lineVertical.visible = false;

    for (var i = 0; i < designer.groupPoints.children.length; i++ ) {
        designer.mapX.set(Math.round(designer.groupPoints.children[i].position.x), designer.groupPoints.children[i].position);
        designer.mapY.set(Math.round(designer.groupPoints.children[i].position.y), designer.groupPoints.children[i].position);
    }
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

function handleFileSelect(evt) {
    evt.preventDefault();
    var file = evt.target.files; // FileList object
    var f = file[0];
    // console.log(f);
    // Only process image files.
    if (!f.type.match('image.*')) {
        alert("Image only please....");
    } else {
        var fileURL = window.URL.createObjectURL(f);
        textureLoader.load(fileURL, function (texture) {
                designer.addBackground(texture);
            }
        );
    }
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
    var intersects = raycaster.intersectObjects(designer.objects, true);
    if ( intersects.length > 0 ) {
        var intersect = intersects[ 0 ];

        var posMouse = new THREE.Vector3();
        posMouse.copy( intersect.point ).add( intersect.face.normal );
        posMouse.divideScalar( 1 ).floor().multiplyScalar( 1 ).addScalar( 1 );

        if (camera.isOrthographicCamera) {
            posMouse.z = 700;
            if (designer.selectedInstr) {
                var obj = {
                    position: posMouse
                };
                posMouse = designer.updateHelperLines(obj);
            } else {
                if (designer.boolDoor) {
                    designer.mouseMoveDoor2D(posMouse);
                } else if (designer.boolWindow) {
                    designer.mouseMoveWindow2D(posMouse);
                } else {
                    designer.mouseMove2D(posMouse);
                }
            }
        } else if (camera.isPerspectiveCamera) {

            if (designer.boolDoor) {
                designer.mouseMoveDoor3D(intersect);
            } else if (designer.boolWindow) {
                designer.mouseMoveWindow3D(intersect);
            } else {
                if (designer.selectedWindow || designer.selectedDoor) {
                    controlsP.enableRotate = false;
                } else {
                    controlsP.enableRotate = true;
                }
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
    var intersects = raycaster.intersectObjects(designer.objects, true);
    if (intersects.length > 0) {
        var intersect = intersects[0];
        if (camera.isOrthographicCamera) {
            if (designer.boolDoor) {
                designer.mouseClickDoor2D(intersect);
            } else if (designer.boolWindow) {
                designer.mouseClickWindow2D(intersect);
            } else {
                designer.mouseClick2D( intersect, event );
            }
        } else if (camera.isPerspectiveCamera) {
            if (designer.boolDoor) {
                designer.mouseClickDoor3D(intersect);
            } else if (designer.boolWindow) {
                designer.mouseClickWindow3D(intersect);
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

function changeInstrument(){
    if (
        camera.isOrthographicCamera &&
        !designer.boolWindow &&
        !designer.boolDoor &&
        !designer.selectedWindow &&
        !designer.selectedDoor
    ) {
        designer.selectedInstr = !designer.selectedInstr;
        designer.selectedScale = false;
        designer.groupLinesScale.visible = false;
        changeColorButton();
        if (designer.count === 0) {
            if (designer.planeBackground) {
                designer.planeBackground.scale.set(1 / designer.scalePlane, 1 / designer.scalePlane, 1 / designer.scalePlane);
            }
        }
    }
}

function changeMagnet(){
    if (
        camera.isOrthographicCamera &&
        !designer.boolWindow &&
        !designer.boolDoor &&
        !designer.selectedWindow &&
        !designer.selectedDoor
    ) {
        designer.boolMagnet = !designer.boolMagnet;
        changeColorButton();
    }
}

function changeDoor(){
    if (
        !designer.selectedDoor &&
        !designer.selectedWindow &&
        !designer.boolMagnet &&
        !designer.selectedInstr &&
        !designer.selectedScale
    ) {
        width.value = designer.widthDoor;
        height.value = designer.heightDoor;
        depth.value = designer.depthDoor;
        fromFloor.value = designer.fromFloorDoor;

        designer.boolDoor = !designer.boolDoor;
        if (designer.boolDoor) {
            designer.boolWindow = false;
            designer.removeCursorWindow2D();
            designer.removeCursorWindow3D();
        } else {
            designer.removeCursorDoor2D();
            designer.removeCursorDoor3D();
        }
        changeColorButton();
    }
}

function changeWindow(){
    if (
        !designer.selectedDoor &&
        !designer.selectedWindow &&
        !designer.boolMagnet &&
        !designer.selectedInstr &&
        !designer.selectedScale
    ) {
        width.value = designer.widthWindow;
        height.value = designer.heightWindow;
        depth.value = designer.depthWindow;
        fromFloor.value = designer.fromFloorWindow;

        designer.boolWindow = !designer.boolWindow;
        if (designer.boolWindow) {
            designer.boolDoor = false;
            designer.removeCursorDoor2D();
            designer.removeCursorDoor3D();
        } else {
            designer.removeCursorWindow2D();
            designer.removeCursorWindow3D();
        }
        changeColorButton();
    }
}

function changeScale(){
    if (
        camera.isOrthographicCamera &&
        !designer.boolWindow &&
        !designer.boolDoor &&
        !designer.selectedWindow &&
        !designer.selectedDoor
    ) {
        designer.groupLinesScale.visible = true;
        designer.selectedScale = !designer.selectedScale;
        designer.selectedInstr = false;
        changeColorButton();
        if (designer.selectedScale) {
            designer.clearPointsScalePosition();
        }
    }
}

function changeColorButton(){
    if (designer.selectedInstr) {
        document.Instruments.changeInstrument.classList.remove("inputInstrumentUnselected");
        document.Instruments.changeInstrument.classList.add("inputInstrumentSelected");
    } else {
        document.Instruments.changeInstrument.classList.remove("inputInstrumentSelected");
        document.Instruments.changeInstrument.classList.add("inputInstrumentUnselected");
    }
    if (designer.selectedScale) {
        document.Instruments.changeScale.classList.remove("inputInstrumentUnselected");
        document.Instruments.changeScale.classList.add("inputInstrumentSelected");
    } else {
        document.Instruments.changeScale.classList.remove("inputInstrumentSelected");
        document.Instruments.changeScale.classList.add("inputInstrumentUnselected");
    }

    if (designer.boolMagnet) {
        document.Instruments.changeMagnet.classList.remove("inputInstrumentUnselected");
        document.Instruments.changeMagnet.classList.add("inputInstrumentSelected");
    } else {
        document.Instruments.changeMagnet.classList.remove("inputInstrumentSelected");
        document.Instruments.changeMagnet.classList.add("inputInstrumentUnselected");
    }

    if (designer.boolDoor) {
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
        if (!designer.selectedDoor && !designer.selectedWindow) {
            document.panelCamera.cameraOrthographic.classList.add("inputInstrumentSelected");
            document.panelCamera.cameraOrthographic.classList.remove("inputInstrumentUnselected");

            document.panelCamera.cameraPerspective.classList.remove("inputInstrumentSelected");
            document.panelCamera.cameraPerspective.classList.add("inputInstrumentUnselected");

            designer.group.rotation.x = 0;
            //     designer.groupExtrude.rotation.x = designer.group.rotation.x;
            designer.groupSubtractDoors.rotation.x = designer.group.rotation.x;
            designer.groupSubtractWindows.rotation.x = designer.group.rotation.x;
            designer.groupProportions.rotation.x = designer.group.rotation.x;

            // designer.groupExtrude.visible = false;
            designer.groupFinishedWalls.visible = false;
            designer.groupPlane.visible = true;
            designer.groupLinesUpdate.visible = true;
            designer.groupLines.visible = true;
            designer.groupPoints.visible = true;
            designer.groupProportions.visible = true;
            designer.groupProportions3D.visible = false;

            designer.groupSubtractDoors.visible = true;
            designer.groupSubtractWindows.visible = true;

            designer.groupDoors.visible = false;
            designer.groupWindows.visible = false;

            transformControl.enabled = true;
            transformControl.visible = true;

            human.visible = false;

            camera = cameraOrthographic;
            setCameraDefaultPosition();

            designer.boolDoor = false;
            designer.boolWindow = false;
            changeColorButton();
            designer.removeCursorDoor3D();
            designer.removeCursorWindow3D();
        }
    } else if (event.srcElement.name === "cameraPerspective") {

        if (!designer.selectedDoor && !designer.selectedWindow) {

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
            designer.groupSubtractDoors.rotation.x = designer.group.rotation.x;
            designer.groupSubtractWindows.rotation.x = designer.group.rotation.x;
            designer.groupProportions.rotation.x = designer.group.rotation.x;

            designer.groupSubtractDoors.visible = false;
            designer.groupSubtractWindows.visible = false;

            designer.groupDoors.visible = true;
            designer.groupWindows.visible = true;

            human.visible = true;
            // designer.groupExtrude.visible = true;
            designer.groupFinishedWalls.visible = true;
            designer.groupPlane.visible = false;
            designer.groupLinesUpdate.visible = false;
            designer.groupLines.visible = false;

            designer.selectedScale = false;
            designer.boolDoor = false;
            designer.boolWindow = false;
            designer.selectedInstr = false;
            changeColorButton();
            designer.removeCursorDoor2D();
            designer.removeCursorWindow2D();

            designer.groupLinesScale.visible = false;

            designer.groupPoints.visible = false;
            designer.groupProportions.visible = false;
            designer.groupProportions3D.visible = true;
            transformControl.enabled = false;
            transformControl.visible = false;

            camera = cameraPerspective;
            setCameraDefaultPosition();

            designer.rebuild();
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
            console.log(" designer.mapLinesWalls",  designer.objects);
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
                if (transformControl.object) {
                    transformControl.detach(transformControl.object);
                }
                var arr = designer.selectedObject.name.split('_');

                designer.removeIntersectObjectsArray(designer.objects, designer.mapWallsCup.get("wallsCup_" + arr[1]));
                designer.removeIntersectObjectsArray(designer.objects, designer.mapWalls.get("walls_" + arr[1]));

                designer.removeObject(designer.groupExtrude, designer.mapWalls.get("walls_" + arr[1]));
                designer.removeObject(designer.groupPlane, designer.mapWallsCup.get("wallsCup_" + arr[1]));
                designer.removeObject(designer.groupLinesUpdate, designer.mapLines.get("line_" + arr[1]));


                for (var i = designer.groupPoints.children.length-1; i > -1; i--) {
                    var name = designer.groupPoints.children[i].name;
                    var a = name.split('_');
                    if (a[1] === arr[1]) {
                        designer.removeIntersectObjectsArray(designer.objects, designer.mapPointObjects.get(designer.groupPoints.children[i].name));
                        designer.removeObject(designer.groupPoints, designer.mapPointObjects.get(designer.groupPoints.children[i].name));
                        designer.removeObject(designer.groupProportions, designer.mapProportions.get(designer.groupProportions.children[i].name));
                    }
                }
                designer.selectedObject = null;
                designer.clearMap ();
            } else  if (designer.selectedDoor) {
                if (transformControl.object) {
                    transformControl.detach(transformControl.object);
                }

                designer.removeIntersectObjectsArray(designer.objects, designer.mapSubtractDoors.get(designer.selectedDoor.name));
                designer.removeObject(designer.groupSubtractDoors, designer.mapSubtractDoors.get(designer.selectedDoor.name));
                designer.mapSubtractDoors.delete(designer.selectedDoor.name);

                if (designer.mapDoors.has(designer.selectedDoor.name)) {
                    designer.removeIntersectObjectsArray(designer.objects, designer.mapDoors.get(designer.selectedDoor.name));
                    designer.removeObject(designer.groupDoors, designer.mapDoors.get(designer.selectedDoor.name));
                    designer.mapDoors.delete(designer.selectedDoor.name);
                    designer.rebuild();
                }

                designer.selectedDoor = null;
                designer.removeObject(designer.groupProportions, designer.mapProportions.get("distance_wall"));
                designer.clearDistanceToPoint();
            } else if (designer.selectedWindow) {
                if (transformControl.object) {
                    transformControl.detach(transformControl.object);
                }

                designer.removeIntersectObjectsArray(designer.objects, designer.mapSubtractWindows.get(designer.selectedWindow.name));
                designer.removeObject(designer.groupSubtractWindows, designer.mapSubtractWindows.get(designer.selectedWindow.name));
                designer.mapSubtractWindows.delete(designer.selectedWindow.name);

                if (designer.mapWindows.has(designer.selectedWindow.name)) {
                    designer.removeIntersectObjectsArray(designer.objects, designer.mapWindows.get(designer.selectedWindow.name));
                    designer.removeObject(designer.groupWindows, designer.mapWindows.get(designer.selectedWindow.name));
                    designer.mapWindows.delete(designer.selectedWindow.name);
                    designer.rebuild();
                }

                designer.selectedWindow = null;
                designer.removeObject(designer.groupProportions, designer.mapProportions.get("distance_wall"));
                designer.clearDistanceToPoint();
            } else {
                if (designer.groupPoints.children.length && transformControl.object) {
                    designer.deletePointObject(transformControl.object);
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