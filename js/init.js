var container;

var camera, cameraOrthographic, cameraPerspective, scene, renderer, controlsO, controlsP, transformControl;

var mouseX = 0, mouseY = 0;

var clock = new THREE.Clock();

var wallsObject = [];

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
    window.onload = init;
};

shaders.load( 'vertexShaderLoader' , 'vertexShLoader' , 'vertex' );
shaders.load( 'fragmentShaderLoader' , 'fragmentShLoader' , 'fragment' );

var rollOverMesh, rollOverMaterial, floor, group, groupPlane, groupExtrude, groupLines, groupPointsArray, groupLinesUpdate, groupPointsScale, groupLinesScale;
var objects = [];
var selectedObject = null;
var selectedPoint = null;
var line, lineRect, lineDown, lineScale, positions, positionsRect, positionsDown, positionsUp, positionsScale;
var count = 0;
var count1 = 0;
var countScale = 0;
var widthWall = 20;
var heightWall = 100;
var valueScale = 1;
// var lengthScale = 0;
var scale = 1;
var numWalls = 0;
var updatedWall = 0;
var planeBackground;
var tempCoord = new THREE.Vector2();

var textureSpritePointScale;

var selectedInstr = false;
var selectedScale = false;

var posMouse = new THREE.Vector3();
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

    // container = document.createElement( 'div' );
    document.body.appendChild( container );

     var frustumSize = 1000;
     var aspect = window.innerWidth / window.innerHeight;
     cameraOrthographic = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 0.1, 50000 );
    // cameraOrthographic = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 2000 );
    setDefaultOrthographicCameraPosition();
    cameraOrthographic.name = "cameraOrthographic";
    // cameraOrthographic.position.y = 100;
    // cameraOrthographic.lookAt( new THREE.Vector3(0,0,0));


    cameraPerspective = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.01, 20000 );
    setDefaultPerspectiveCameraPosition();
    cameraPerspective.name = "cameraPerspective";
    // cameraPerspective.position.y = 100;
    // cameraPerspective.lookAt( new THREE.Vector3(0,0,0));
    camera = cameraOrthographic;
    // scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color( "#cff7ff" );
    // scene.fog = new THREE.Fog( "#cff7ff", 5000, 10000 );
    scene.name = "MainScene";

    group = new THREE.Object3D();
    group.name = "groupObjects";
    scene.add(group);

    groupPlane = new THREE.Object3D();
    groupPlane.name = "groupPlane";
    scene.add(groupPlane);

    groupExtrude = new THREE.Object3D();
    groupExtrude.name = "groupExtrude";
    groupExtrude.visible = false;
    scene.add(groupExtrude);

    groupLines = new THREE.Object3D();
    groupLines.name = "groupLines";
    scene.add(groupLines);

    groupLinesUpdate = new THREE.Object3D();
    groupLinesUpdate.name = "groupLinesUpdate";
    scene.add(groupLinesUpdate);

    groupLinesScale = new THREE.Object3D();
    groupLinesScale.name = "groupLinesScale";
    scene.add(groupLinesScale);

    groupPointsScale = [];

    groupPointsArray = [];

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

    // model
    var geometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
    // geometry.rotateX(-Math.PI / 2);
    var material = new THREE.MeshBasicMaterial({color: '#effffc'/*, side: THREE.DoubleSide*/});
    floor = new THREE.Mesh(geometry, material);
    floor.receiveShadow = true;
    floor.name = 'floor';
    objects.push( floor );
    group.add(floor);

 /*   var pointsMaterial = new THREE.PointsMaterial( {
        color: '#0080ff',
        size: 2,
        alphaTest: 0.5
    } );
    var points = new THREE.Points( geometry, pointsMaterial );
    points.position.z += 1;
    points.name = "points";
    scene.add( points );*/

    // createWalls();

 /*   var rollOverGeo = new THREE.PlaneBufferGeometry( 1, 1 );
    rollOverMaterial = new THREE.MeshBasicMaterial( { color: '#ff0000', opacity: 0.5, transparent: true } );
    rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
    rollOverMesh.name = "rollOverMesh";
    scene.add( rollOverMesh );*/

   /* var MAX_POINTS = 500;
    positions = new Float32Array(MAX_POINTS * 3);
    positionsRect = new Float32Array(MAX_POINTS * 3);
    positionsUp = new Float32Array(2 * 3);
    positionsDown = new Float32Array(2 * 3);*/

    addLines();
    addScaleLine();
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
    container.appendChild( renderer.domElement );

    set2DControl();
    set3DControl();
    setTransformControls();
    container.addEventListener( 'mousemove', onDocumentMouseMove, false );
    window.addEventListener( 'resize', onWindowResize, false );
    document.addEventListener( 'keydown', onKeyDown, false );
    container.addEventListener( 'mouseup', onDocumentMouseDown, false );

    document.Instruments.changeInstrument.addEventListener("click", instrument);
    document.Instruments.changeScale.addEventListener("click", changeScale);

    document.panelCamera.cameraOrthographic.addEventListener("click", changeCamera);
    document.panelCamera.cameraPerspective.addEventListener("click", changeCamera);
    document.panelCamera.cameraDefault.addEventListener("click", setCameraDefaultPosition);

    document.getElementById('help').addEventListener('click', visibilityHelp, false);
    document.getElementById('file').addEventListener('change', handleFileSelect, false);
    // Get the widthWall input.
    var width = document.getElementById('widthWall');
    widthWall = width.value;
    if (!widthWall) {
        alert('Error: failed to get the widthWall element!');
        widthWall = 20;
        return;
    }
    width.addEventListener('change', function (ev) {
        widthWall = width.value;
        // console.log(lineWidth);
    }, false);

    // Get the heightWall input.
    var height = document.getElementById('heightWall');
    heightWall = height.value;
    if (!heightWall) {
        alert('Error: failed to get the heightWall element!');
        heightWall = 280;
        return;
    }
    height.addEventListener('change', function (ev) {
        heightWall = height.value;
        // console.log(heightWall);
    }, false);

    // Get the valueScale input.
    var valueSc = document.getElementById('valueScale');
    valueScale = valueSc.value;
    if (!valueScale) {
        alert('Error: failed to get the valueScale element!');
        valueScale = 1;
        return;
    }
    valueSc.addEventListener('change', function (ev) {
        valueScale = valueSc.value;
        // console.log(valueScale);
    }, false);

    animate();
}

function visibilityHelp(event) {

    var helpPanel = document.getElementById('help-panel');
    if (helpPanel.style.visibility === "hidden") {
        helpPanel.style.visibility = "visible";
    } else {
        helpPanel.style.visibility = "hidden";
    }
}

function setTransformControls() {
    transformControl = new THREE.TransformControls( camera, renderer.domElement, false );
    transformControl.addEventListener( 'change', render );
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

    var dragcontrols = new THREE.DragControls( groupPointsArray, camera, renderer.domElement ); //
    dragcontrols.enabled = true;
    dragcontrols.addEventListener( 'hoveron', function ( event ) {
        transformControl.attach( event.object );
        transformControl.object.scale.set(1.5, 1.5, 1.5);
        transformControl.object.material.color = new THREE.Color("#00d40f");
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
        if (transformControl.object !== selectedPoint && transformControl.object) {
            transformControl.object.scale.set(1.0, 1.0, 1.0);
            transformControl.object.material.color = new THREE.Color("#ff0000");
            transformControl.detach(transformControl.object);
        }
        // delayHideTransform();
    } );
    dragcontrols.addEventListener( 'drag', function ( event ) {
        updateObject(transformControl.object);
        dragEnd();
    } );
    // dragcontrols.addEventListener( 'dragend', dragEnd );

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
    var index = 0;
    for (var i = 0; i < groupLinesUpdate.children.length; i++) {
        if (groupLinesUpdate.children[i].name === "line_" + updatedWall.toString()) {
            index = i;
            i = groupLinesUpdate.children.length;
        }
    }
    updateExtrudePath(groupLinesUpdate.children[index].geometry.attributes.position.array);
}

function updateObject(object) {

    var arr = object.name.split('_');
    var num = +arr[0];
    updatedWall = +arr[1];
    var position;
    var index = 0;
    for (var i = 0; i < groupLinesUpdate.children.length; i++) {
        if (groupLinesUpdate.children[i].name === "line_" + arr[1]) {
            position = groupLinesUpdate.children[i].geometry.attributes.position.array;
            index = i;
            i = groupLinesUpdate.children.length;
        }
    }

    var length = position.length / 3;
    if (num === 0) {
        position[(length-1) * 3 + 0] = object.position.x;
        position[(length-1) * 3 + 1] = object.position.y;
        position[(length-1) * 3 + 2] = object.position.z;

        position[num * 3 + 0] = object.position.x;
        position[num * 3 + 1] = object.position.y;
        position[num * 3 + 2] = object.position.z;
    } else {
        position[num * 3 + 0] = object.position.x;
        position[num * 3 + 1] = object.position.y;
        position[num * 3 + 2] = object.position.z;
    }
    groupLinesUpdate.children[index].geometry.attributes.position.needsUpdate = true;
    // console.log("!!!!!!!!!!!!", groupPointsArray);
}

function deleteObject(object) {

    var arr = object.name.split('_');
    var num = +arr[0];
    updatedWall = +arr[1];
    var indexDeleteElement;
    var position;
    var index = 0;
    for (var i = 0; i < groupLinesUpdate.children.length; i++) {
        if (groupLinesUpdate.children[i].name === "line_" + arr[1]) {
            position = groupLinesUpdate.children[i].geometry.attributes.position.array;
            index = i;
            i = groupLinesUpdate.children.length;
        }
    }
    var length = position.length / 3;

    if (num === 0) {
        var array =  Array.prototype.slice.call(position);
        array.splice(num * 3, 3);
        array.splice((length-2) * 3, 3);

        scene.remove(scene.getObjectByName(object.name));
        for (var i = 0; i < groupPointsArray.length; i++ ) {
            var name = groupPointsArray[i].name;

            var arr = name.split('_');
            if (+arr[1] === updatedWall) {
                if (+arr[0] === num) {
                    indexDeleteElement = i;
                } else if (+arr[0] > num) {
                    var n = +arr[0];
                    n--;
                    if (n < 0) {
                        n = 0
                    }
                    groupPointsArray[i].name = n.toString() + "_" + arr[1];
                }
            }
        }
        groupPointsArray.splice(indexDeleteElement, 1);

        position[(length-1) * 3 + 0] = array[0];
        position[(length-1) * 3 + 1] = array[1];
        position[(length-1) * 3 + 2] = array[2];
    } else {
        var array =  Array.prototype.slice.call(position);
        array.splice(num * 3, 3);

        scene.remove(scene.getObjectByName(object.name));
        for (var i = 0; i < groupPointsArray.length; i++ ) {
            var name = groupPointsArray[i].name;
            var arr = name.split('_');
            if (+arr[1] === updatedWall) {
                if (+arr[0] === num) {
                    indexDeleteElement = i;
                } else if (+arr[0] > num) {
                    var n = +arr[0];
                    n--;
                    if (n < 0) {
                        n = 0
                    }
                    groupPointsArray[i].name = n.toString() + "_" + arr[1];
                }
            }
        }
        groupPointsArray.splice(indexDeleteElement, 1);
    }
    for (var i = 0; i < array.length; i++ ) {
        position[i] = array[i];
    }
    // console.log("!!!!!!!!!!!!!!", groupPointsArray);
    position[(length-2) * 3 + 0] = array[0];
    position[(length-2) * 3 + 1] = array[1];
    position[(length-2) * 3 + 2] = array[2];
    transformControl.detach( transformControl.object );
    groupLinesUpdate.children[index].geometry.attributes.position.needsUpdate = true;

    if (array.length) {
        updateExtrudePath(position);
    }
    if (!array.length) {
        removeObject(groupExtrude, "walls_" + updatedWall.toString());
        removeObject(groupPlane, "wallsCup_" + updatedWall.toString());
        removeObject(groupLinesUpdate, "line_" + updatedWall.toString());
        if (
            !groupExtrude.children.length &&
            !groupPlane.children.length &&
            !groupLinesUpdate.children.length
        ) {
            numWalls = 0;
        }
    }
}

function set2DControl() {
    controlsO = new THREE.TrackballControls( cameraOrthographic, renderer.domElement );
    controlsO.noRotate = true;
    controlsO.panSpeed = 2.0;
    controlsO.dynamicDampingFactor = 1.0;
}

function set3DControl() {
    controlsP = new THREE.OrbitControls( cameraPerspective, renderer.domElement );
    controlsP.maxPolarAngle = Math.PI / 2.1;
    // controlsP.minDistance = 10;
    controlsP.maxDistance = 4000;
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
                addBackground(texture);
            }
        );
    }
}

function addScaleLine() {
    var geometry = new THREE.BufferGeometry();
    positionsScale = new Float32Array(2 * 3);
    geometry.addAttribute('position', new THREE.BufferAttribute(positionsScale, 3));
    var material = new THREE.LineBasicMaterial({
        color: '#ff0200',
        linewidth: 20,
        // transparent: true,
    });
    lineScale = new THREE.Line(geometry, material);
    lineScale.name = "lineScale";
    groupLinesScale.add(lineScale);
}

function addLines() {
// LINE
// geometry
    var geometry = new THREE.BufferGeometry();
    var MAX_POINTS = 500;
    positions = new Float32Array(MAX_POINTS * 3);
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));

// material
    var material = new THREE.LineBasicMaterial({
        color: '#2b3f8b',
        linewidth: 20,
        transparent: true
    });

// line
    line = new THREE.Line(geometry, material);
    line.name = "line";
    groupLines.add(line);

/////////////////////////
    var geometry = new THREE.BufferGeometry();
    positionsRect = new Float32Array(MAX_POINTS * 3);
    geometry.addAttribute('position', new THREE.BufferAttribute(positionsRect, 3));

// material
    var material = new THREE.LineBasicMaterial({
        color: '#2b3f8b',
        linewidth: 20,
        transparent: true
    });

// line
    lineRect = new THREE.Line(geometry, material);
    lineRect.name = "lineRect";
    groupLines.add(lineRect);

//////////////////////////
    var geometry = new THREE.BufferGeometry();
    positionsDown = new Float32Array(MAX_POINTS * 3);
    geometry.addAttribute('position', new THREE.BufferAttribute(positionsDown, 3));

// material
    var material = new THREE.LineBasicMaterial({
        color: '#2b3f8b',
        linewidth: 20,
        transparent: true
    });

// line
    lineDown = new THREE.LineSegments(geometry, material);
    lineDown.name = "lineDown";
    groupLines.add(lineDown);
}

function addPointObject(x, y ,z, num) {
   /* var pointsMaterial = new THREE.PointsMaterial( {
        map: textureSpritePoints,
        color: '#96d7ff',
        size: 30,
        alphaTest: 0.5
    } );
    var points = new THREE.Points( geometry, pointsMaterial );
    // points.position.z += 1;
    points.name = "points";
    groupPointsArray.add( points );
    // console.log("!!!!!!!!!!!!", groupPointsArray);*/
    var pointGeometry = new THREE.SphereBufferGeometry( 5, 8, 8 );
    var pointMaterial = new THREE.MeshBasicMaterial( { color: '#ff0000', opacity: 0.5, transparent: true } );
    var point = new THREE.Mesh( pointGeometry, pointMaterial );
    point.name = num.toString() + "_" + numWalls;
    point.position.set(x, y ,z);
    groupPointsArray.push(point);
    scene.add( point );
    transformControl.attach( point );
}
// update line
function updateLine(coord) {

    if(event.shiftKey) {
        if (Math.abs(positions[count * 3 - 6] - coord.x) <= Math.abs(positions[count * 3 - 5] - coord.y)) {
            positions[count * 3 - 3] = positions[count * 3 - 6];
            positions[count * 3 - 2] = coord.y;
            positions[count * 3 - 1] = coord.z;
            posMouse.set(positions[count * 3 - 3], positions[count * 3 - 2], positions[count * 3 - 1])
        } else {
            positions[count * 3 - 3] = coord.x;
            positions[count * 3 - 2] = positions[count * 3 - 5];
            positions[count * 3 - 1] = coord.z;
            posMouse.set(positions[count * 3 - 3], positions[count * 3 - 2], positions[count * 3 - 1])
        }
    } /*else if(event.ctrlKey) {
        if ((positions[count * 3 - 6] - coord.x) <= 0) {
            positions[count * 3 - 3] = coord.y;
            positions[count * 3 - 2] = coord.y;
            positions[count * 3 - 1] = coord.z;
            rollOverMesh.position.set(positions[count * 3 - 3], positions[count * 3 - 2], positions[count * 3 - 1])
        } else {
            positions[count * 3 - 3] = coord.x;
            positions[count * 3 - 2] = coord.x;
            positions[count * 3 - 1] = coord.z;
            rollOverMesh.position.set(positions[count * 3 - 3], positions[count * 3 - 2], positions[count * 3 - 1])
        }
    }*/ else {
        positions[count * 3 - 3] = coord.x;
        positions[count * 3 - 2] = coord.y;
        positions[count * 3 - 1] = coord.z;
        posMouse.set(positions[count * 3 - 3], positions[count * 3 - 2], positions[count * 3 - 1])
    }
    line.geometry.attributes.position.needsUpdate = true;
    // console.log("positions", positions);
    updateRectangle( posMouse, widthWall / scale);
}

function updateLineScale(coord) {

    if(event.shiftKey) {
        if (Math.abs(positionsScale[countScale * 3 - 6] - coord.x) <= Math.abs(positionsScale[countScale * 3 - 5] - coord.y)) {
            positionsScale[countScale * 3 - 3] = positionsScale[countScale * 3 - 6];
            positionsScale[countScale * 3 - 2] = coord.y;
            positionsScale[countScale * 3 - 1] = coord.z;
            // rollOverMesh.position.set(positionsScale[countScale * 3 - 3], positionsScale[countScale * 3 - 2], positionsScale[countScale * 3 - 1])
        } else {
            positionsScale[countScale * 3 - 3] = coord.x;
            positionsScale[countScale * 3 - 2] = positionsScale[countScale * 3 - 5];
            positionsScale[countScale * 3 - 1] = coord.z;
            // rollOverMesh.position.set(positionsScale[countScale * 3 - 3], positionsScale[countScale * 3 - 2], positionsScale[countScale * 3 - 1])
        }
    } else {
        positionsScale[countScale * 3 - 3] = coord.x;
        positionsScale[countScale * 3 - 2] = coord.y;
        positionsScale[countScale * 3 - 1] = coord.z;
        // rollOverMesh.position.set(positionsScale[countScale * 3 - 3], positionsScale[countScale * 3 - 2], positionsScale[countScale * 3 - 1])
    }

    lineScale.geometry.attributes.position.needsUpdate = true;
     for (var i = 0; i < groupPointsScale.length; i++) {
         groupPointsScale[i].geometry.attributes.position.needsUpdate = true;
     }
}

// add point
function addPoint(coord){
    positions[count * 3 + 0] = coord.x;
    positions[count * 3 + 1] = coord.y;
    positions[count * 3 + 2] = coord.z;
    count++;
    line.geometry.setDrawRange(0, count);
    updateLine(coord);

    if ( count !== 0) {
        addRectangle(coord, widthWall);
    }
}

function addPointScale(coord){
    positionsScale[countScale * 3 + 0] = coord.x;
    positionsScale[countScale * 3 + 1] = coord.y;
    positionsScale[countScale * 3 + 2] = coord.z;
    countScale++;
    if (countScale >= 2) {
        countScale = 2;
    }
    lineScale.geometry.setDrawRange(0, countScale);
    updateLineScale(coord);

    var geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', new THREE.BufferAttribute(positionsScale, 3));
    var pointsMaterial = new THREE.PointsMaterial( {
       map: textureSpritePointScale,
       color: '#ffffff',
       size: 50,
       alphaTest: 0.5,
   } );
   var points = new THREE.Points( geometry, pointsMaterial );
   // points.position.z += 1;
   points.name = "points";
   groupPointsScale.push( points );

   groupLinesScale.add( points );
}

function clearPointsPosition(){
   positions = [];
   positionsRect = [];
   positionsDown = [];
   positionsUp = [];

   count = 0;
   count1 = 0;

   removeLines(groupLines);

   addLines();
}

function clearPointsScalePosition(){
   positionsScale[0] = 0;
   positionsScale[1] = 0;
   positionsScale[2] = 0;
   positionsScale[3] = 0;
   positionsScale[4] = 0;
   positionsScale[5] = 0;
   countScale = 0;
   lineScale.geometry.attributes.position.needsUpdate = true;
    for (var i = 0; i < groupPointsScale.length; i++) {
        groupPointsScale[i].geometry.attributes.position.needsUpdate = true;
        groupPointsScale[i].visible = false;
    }
}

function clearLastPointsPosition(){
   if ( count <= 2) {
       clearPointsPosition();
   } else {
       positions[count * 3 - 6] = positions[count * 3 - 3];
       positions[count * 3 - 5] = positions[count * 3 - 2];
       positions[count * 3 - 4] = positions[count * 3 - 1];

       positions[count * 3 - 3] = 0;
       positions[count * 3 - 2] = 0;
       positions[count * 3 - 1] = 0;

       positionsRect[count1 * 3 - 9] = positionsRect[count1 * 3 - 3];
       positionsRect[count1 * 3 - 8] = positionsRect[count1 * 3 - 2];
       positionsRect[count1 * 3 - 7] = positionsRect[count1 * 3 - 1];

       positionsRect[count1 * 3 - 12] = positionsRect[count1 * 3 - 6];
       positionsRect[count1 * 3 - 11] = positionsRect[count1 * 3 - 5];
       positionsRect[count1 * 3 - 10] = positionsRect[count1 * 3 - 4];

       positionsRect[count1 * 3 - 3] = 0;
       positionsRect[count1 * 3 - 2] = 0;
       positionsRect[count1 * 3 - 1] = 0;

       positionsRect[count1 * 3 - 6] = 0;
       positionsRect[count1 * 3 - 5] = 0;
       positionsRect[count1 * 3 - 4] = 0;

       positionsDown[count1 * 3 - 9] = positionsDown[count1 * 3 - 3];
       positionsDown[count1 * 3 - 8] = positionsDown[count1 * 3 - 2];
       positionsDown[count1 * 3 - 7] = positionsDown[count1 * 3 - 1];

       positionsDown[count1 * 3 - 12] = positionsDown[count1 * 3 - 6];
       positionsDown[count1 * 3 - 11] = positionsDown[count1 * 3 - 5];
       positionsDown[count1 * 3 - 10] = positionsDown[count1 * 3 - 4];

       positionsDown[count1 * 3 - 3] = 0;
       positionsDown[count1 * 3 - 2] = 0;
       positionsDown[count1 * 3 - 1] = 0;

       positionsDown[count1 * 3 - 6] = 0;
       positionsDown[count1 * 3 - 5] = 0;
       positionsDown[count1 * 3 - 4] = 0;

       count--;
       count1 -= 2;

       var currentWall = {
           x0: positions[count * 3 - 9],
           y0: positions[count * 3 - 8],
           z0: positions[count * 3 - 7],
           x1: positions[count * 3 - 6],
           y1: positions[count * 3 - 5],
           z1: positions[count * 3 - 4],
       };

       var vectors = getVectors(currentWall, widthWall / scale);

       tempCoord.x = vectors.d.x;
       tempCoord.y = vectors.d.y;

       updateLine(new THREE.Vector3(positions[count * 3 - 3], positions[count * 3 - 2], positions[count * 3 - 1]));
       line.geometry.setDrawRange(0, count);
       lineRect.geometry.setDrawRange(0, count1);
       lineDown.geometry.setDrawRange(0, count1);
   }
}

function addBackground(texture){
   if (planeBackground) {
       removeObject(group, "planeBackground");
   }
   var geometry = new THREE.PlaneGeometry(texture.image.width, texture.image.height);
   var material = new THREE.MeshBasicMaterial({map: texture, transparent: true, opacity: 0.25});
   planeBackground = new THREE.Mesh(geometry, material);
   planeBackground.name = 'planeBackground';
   planeBackground.position.z = 2;
   group.add(planeBackground);
}

function addRectangle(coord, depth) {

   var currentWall = {
       x0: positions[count * 3 - 6],
       y0: positions[count * 3 - 5],
       z0: positions[count * 3 - 4],
       x1: coord.x,
       y1: coord.y,
       z1: coord.z,
   };

   var vectors = getVectors(currentWall, depth);

       positionsRect[count1 * 3 + 0] = vectors.d.x;
       positionsRect[count1 * 3 + 1] = vectors.d.y;
       positionsRect[count1 * 3 + 2] = coord.z;

       tempCoord.x = positionsRect[count1 * 3 - 3];
       tempCoord.y = positionsRect[count1 * 3 - 2];

   positionsDown[count1 * 3 + 0] = vectors.d.x;
   positionsDown[count1 * 3 + 1] = vectors.d.y;
   positionsDown[count1 * 3 + 2] = coord.z;

   positionsDown[count1 * 3 + 3] = vectors.d.x;
   positionsDown[count1 * 3 + 4] = vectors.d.y;
   positionsDown[count1 * 3 + 5] = coord.z;

       count1++;
       positionsRect[count1 * 3 + 0] = vectors.d.x;
       positionsRect[count1 * 3 + 1] = vectors.d.y;
       positionsRect[count1 * 3 + 2] = coord.z;

   positionsDown[count1 * 3 + 0] = vectors.d.x;
   positionsDown[count1 * 3 + 1] = vectors.d.y;
   positionsDown[count1 * 3 + 2] = coord.z;

   positionsDown[count1 * 3 + 3] = vectors.d.x;
   positionsDown[count1 * 3 + 4] = vectors.d.y;
   positionsDown[count1 * 3 + 5] = coord.z;

       count1++;
       lineRect.geometry.setDrawRange(0, count1);
       lineDown.geometry.setDrawRange(0, count1);
}

function updateRectangle(coord, depth) {
   var previousWall = {
       x0: positions[count * 3 - 9],
       y0: positions[count * 3 - 8],
       z0: positions[count * 3 - 7],
       x1: positions[count * 3 - 6],
       y1: positions[count * 3 - 5],
       z1: positions[count * 3 - 4],
   };
   var currentWall = {
       x0: positions[count * 3 - 6],
       y0: positions[count * 3 - 5],
       z0: positions[count * 3 - 4],
       x1: coord.x,
       y1: coord.y,
       z1: coord.z,
   };

   var angle = getAngle(
         new THREE.Vector2(previousWall.x0 - previousWall.x1, previousWall.y0 - previousWall.y1),
         new THREE.Vector2(currentWall.x0 - currentWall.x1, currentWall.y0 - currentWall.y1)
   );
   // console.log("angle", angle);
   //2.5 <

   var vectors = getVectors(currentWall, depth);
   var vectors1 = getVectors(previousWall, depth);
   var xcv = (vectors.NvectorA.dot( vectors1.NvectorA ));
   // console.log("xcv", xcv);

   var f = new THREE.Vector2(
       (positions[count * 3 - 6] - ((tempCoord.x) ? (tempCoord.x + vectors.b.x) / 2 : vectors.b.x)),
       (positions[count * 3 - 5] - ((tempCoord.y) ? (tempCoord.y + vectors.b.y) / 2 : vectors.b.y))
   );
   f = f.normalize();
   // console.log("f", f);

   var mLen = depth / (f.dot( vectors.NvectorA ));
   // console.log("mLen = "+mLen);

   var nS1 = f.multiplyScalar(mLen * depth);

   var O = new THREE.Vector2();
   O.addVectors(new THREE.Vector2(positions[count * 3 - 6], positions[count * 3 - 5]), nS1);

   if (vectors.NvectorA.length()) {
       if (Math.acos(angle) <= 2.5) {
           positionsRect[count1 * 3 - 3] = vectors.d.x;
           positionsRect[count1 * 3 - 2] = vectors.d.y;
           positionsRect[count1 * 3 - 1] = coord.z;

           positionsRect[count1 * 3 - 6] = vectors.d.x;
           positionsRect[count1 * 3 - 5] = vectors.d.y;
           positionsRect[count1 * 3 - 4] = coord.z;

           positionsRect[count1 * 3 - 9] = O.x;
           positionsRect[count1 * 3 - 8] = O.y;
           positionsRect[count1 * 3 - 7] = coord.z;

           positionsRect[count1 * 3 - 12] = O.x;
           positionsRect[count1 * 3 - 11] = O.y;
           positionsRect[count1 * 3 - 10] = coord.z;

           positionsDown[count1 * 3 - 12] = O.x;
           positionsDown[count1 * 3 - 11] = O.y;
           positionsDown[count1 * 3 - 10] = coord.z;

           positionsDown[count1 * 3 - 9] = currentWall.x0;
           positionsDown[count1 * 3 - 8] = currentWall.y0;
           positionsDown[count1 * 3 - 7] = coord.z;

           positionsDown[count1 * 3 - 6] = vectors.d.x;
           positionsDown[count1 * 3 - 5] = vectors.d.y;
           positionsDown[count1 * 3 - 4] = coord.z;

           positionsDown[count1 * 3 - 3] = currentWall.x1;
           positionsDown[count1 * 3 - 2] = currentWall.y1;
           positionsDown[count1 * 3 - 1] = coord.z;
       } else {
           positionsRect[count1 * 3 - 3] = vectors.d.x;
           positionsRect[count1 * 3 - 2] = vectors.d.y;
           positionsRect[count1 * 3 - 1] = coord.z;

           positionsRect[count1 * 3 - 6] = vectors.d.x;
           positionsRect[count1 * 3 - 5] = vectors.d.y;
           positionsRect[count1 * 3 - 4] = coord.z;

           /////
          /* positionsRect[count1 * 3 - 9] = vectors.b.x;
           positionsRect[count1 * 3 - 8] = vectors.b.y;
           positionsRect[count1 * 3 - 7] = coord.z;

           positionsRect[count1 * 3 - 12] = vectors1.d.x;
           positionsRect[count1 * 3 - 11] = vectors1.d.y;
           positionsRect[count1 * 3 - 10] = coord.z;*/

            positionsRect[count1 * 3 - 9] = O.x;
            positionsRect[count1 * 3 - 8] = O.y;
            positionsRect[count1 * 3 - 7] = coord.z;

            positionsRect[count1 * 3 - 12] = O.x;
            positionsRect[count1 * 3 - 11] = O.y;
            positionsRect[count1 * 3 - 10] = coord.z;

            positionsDown[count1 * 3 - 12] = O.x;
            positionsDown[count1 * 3 - 11] = O.y;
            positionsDown[count1 * 3 - 10] = coord.z;

            positionsDown[count1 * 3 - 9] = currentWall.x0;
            positionsDown[count1 * 3 - 8] = currentWall.y0;
            positionsDown[count1 * 3 - 7] = coord.z;

            positionsDown[count1 * 3 - 6] = vectors.d.x;
            positionsDown[count1 * 3 - 5] = vectors.d.y;
            positionsDown[count1 * 3 - 4] = coord.z;

            positionsDown[count1 * 3 - 3] = currentWall.x1;
            positionsDown[count1 * 3 - 2] = currentWall.y1;
            positionsDown[count1 * 3 - 1] = coord.z;

        }
    } else {

       /* positionsDown[count * 3 - 3] = positionsDown[count * 3 - 6];
        positionsDown[count * 3 - 2] = positionsDown[count * 3 - 5];
        positionsDown[count * 3 - 1] = positionsDown[count * 3 - 4];*/

       /* positionsRect[count1 * 3 - 3] = positionsRect[count1 * 3 - 6];
        positionsRect[count1 * 3 - 2] = positionsRect[count1 * 3 - 5];
        positionsRect[count1 * 3 - 1] = positionsRect[count1 * 3 - 4];

        positionsRect[count1 * 3 - 9] = positionsRect[count1 * 3 - 12];
        positionsRect[count1 * 3 - 8] = positionsRect[count1 * 3 - 11];
        positionsRect[count1 * 3 - 7] = positionsRect[count1 * 3 - 10];*/
    }

    lineRect.geometry.attributes.position.needsUpdate = true;
    lineDown.geometry.attributes.position.needsUpdate = true;
}

function getAngle(v1, v2) {
    var cosA = v1.dot(v2)/(v1.length() * v2.length());
    if (cosA) {
        return cosA;
    } else {
        return 0;
    }
}

function getVectors(vector, depth) {

    var NvectorA = new THREE.Vector2(-(vector.y0 - vector.y1), (vector.x0 - vector.x1));
    NvectorA = NvectorA.normalize();

    var nS = NvectorA.multiplyScalar(depth);
    var a, b, c, d;
    var p0 = new THREE.Vector2( vector.x0, vector.y0 );
    var p1 = new THREE.Vector2( vector.x1, vector.y1 );

    a = new THREE.Vector2();
    a.subVectors(p0, nS);

    b = new THREE.Vector2();
    b.addVectors(p0, nS);

    c = new THREE.Vector2();
    c.subVectors(p1, nS);
    d = new THREE.Vector2();
    d.addVectors(p1, nS);
    return {
        a: a,
        b: b,
        c: c,
        d: d,
        NvectorA: NvectorA
    }
}

function removeObject( groupObject, objectName ) {

        for (var i = 0; i < groupObject.children.length; i++) {
            var obj = groupObject.children[i];
            if (obj.name === objectName) {
                groupObject.remove(obj);

                if (obj.geometry) {
                    obj.geometry.dispose();
                }
                if (obj.material) {
                    obj.material.dispose();
                }
                if (obj.texture) {
                    obj.texture.dispose();
                }
                return;
            }
        }
}

function removeLines( groupObject ) {
    for (var i = 0; i < groupObject.children.length; i++) {
        var obj = groupObject.children[i];
            groupObject.remove(obj);
            if (obj.geometry) {
                obj.geometry.dispose();
            }
            if (obj.material) {
                obj.material.dispose();
            }
            if (obj.texture) {
                obj.texture.dispose();
            }
    }
    groupObject.children = [];
}

function updateExtrudePath(position) {

    removeObject(groupExtrude, "walls_" + updatedWall.toString());
    removeObject(groupPlane, "wallsCup_" + updatedWall.toString());
    removeObject(groupLinesUpdate, "line_" + updatedWall.toString());
    // console.log("!!!", updatedWall);

     var pathPts = [];

    for (var i = 0; i < position.length / 3; i++) {

        if (i !== 0) {
            if (
                position[i * 3 + 0] === position[i * 3 + 3] &&
                position[i * 3 + 1] === position[i * 3 + 4] &&
                position[i * 3 + 2] === position[i * 3 + 5]
            ) {
                // console.log("!!!");
            } else {
                pathPts.push(new THREE.Vector2(position[i * 3 + 0], position[i * 3 + 1]));
            }

        } else {
            pathPts.push(new THREE.Vector2(position[i * 3 + 0], position[i * 3 + 1]));
        }
    }
        var inputShape = new THREE.Shape(pathPts);
        var extrudeSettings = {depth: heightWall, bevelEnabled: false, steps: 1};
        addShape(inputShape, extrudeSettings, "#9cc2d7", "#39424e", 0, 0, 0, 0, 0, 0, scale, updatedWall);
        addLineShape(inputShape, extrudeSettings, "#d70003", 0, 0, 0, 0, 0, 0, 1, updatedWall);
}

function extrudePath() {

    var num = 0;
    var pathPts = [];

    for (var i = 0; i < count; i++) {
        pathPts.push( new THREE.Vector2 ( positions[i * 3 + 0], positions[i * 3 + 1] ) );
        addPointObject(positions[i * 3 + 0], positions[i * 3 + 1], positions[i * 3 + 2], num);
        num++;
    }

    for (var i = count1 - 1; i > -1; i--) {

        if (i !== count1 - 1) {
            if (
                positionsRect[i * 3 + 0] === positionsRect[i * 3 + 3] &&
                positionsRect[i * 3 + 1] === positionsRect[i * 3 + 4] &&
                positionsRect[i * 3 + 2] === positionsRect[i * 3 + 5]
            ) {
                // console.log("!!!");
            } else {
                pathPts.push(new THREE.Vector2(positionsRect[i * 3 + 0], positionsRect[i * 3 + 1]));
                addPointObject(positionsRect[i * 3 + 0], positionsRect[i * 3 + 1], positionsRect[i * 3 + 2], num);
                num++;
            }

        } else {
            pathPts.push(new THREE.Vector2(positionsRect[i * 3 + 0], positionsRect[i * 3 + 1]));
            addPointObject(positionsRect[i * 3 + 0], positionsRect[i * 3 + 1], positionsRect[i * 3 + 2], num);
            num++;
        }
    }

    var inputShape = new THREE.Shape( pathPts );
    var extrudeSettings = { depth: heightWall / scale, bevelEnabled: false, steps: 1 };
    addShape( inputShape, extrudeSettings, "#9cc2d7", "#39424e", 0, 0, 0, 0, 0, 0, scale, numWalls );
    addLineShape( inputShape, extrudeSettings, "#d70003", 0, 0, 0, 0, 0, 0, 1, numWalls );
    numWalls++;
}

function addLineShape( shape, extrudeSettings, color, x, y, z, rx, ry, rz, s, nameWall ) {
    // lines
    shape.autoClose = true;
    var points = shape.getPoints();
    var geometryPoints = new THREE.BufferGeometry().setFromPoints( points );
    // solid line
    var line = new THREE.Line( geometryPoints, new THREE.LineBasicMaterial( { color: color, linewidth: 10, transparent: true } ) );
    line.position.set( x, y, z + 500 );
    line.rotation.set( rx, ry, rz );
    line.scale.set( s, s, s );
    line.name = "line_" + nameWall.toString();
    groupLinesUpdate.add( line );
}

function addShape( shape, extrudeSettings, colorCup, colorWall, x, y, z, rx, ry, rz, s, nameWall ) {
    // extruded shape
    var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
    var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: colorWall/*, transparent: true*/ } ) );
    mesh.position.set( x, y, z );
    mesh.rotation.set( rx, ry, rz );
    mesh.scale.set( s, s, s );
    mesh.name = "walls_" + nameWall.toString();
    // mesh.castShadow = true;
    objects.push(mesh);
    groupExtrude.add( mesh );
    // transformControl.attach( mesh );
    // flat shape
    var geometry = new THREE.ShapeBufferGeometry( shape );
    var mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: colorCup/*, wireframe: true*/ } ) );
    mesh.position.set( x, y, z + 700 );
    mesh.rotation.set( rx, ry, rz );
    mesh.scale.set( 1, 1, 1 );
    mesh.name = "wallsCup_" + nameWall.toString();
    objects.push(mesh);
    groupPlane.add( mesh );
    //points
}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    cameraOrthographic.aspect = window.innerWidth / window.innerHeight;
    cameraOrthographic.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event ) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera( mouse, cameraOrthographic );
    var intersects = raycaster.intersectObjects(objects, true);
    if ( intersects.length > 0 ) {
        var intersect = intersects[ 0 ];
      /*  rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
        rollOverMesh.position.divideScalar( 1 ).floor().multiplyScalar( 1 ).addScalar( 1 );
        rollOverMesh.position.z = 700;*/       
        posMouse.copy( intersect.point ).add( intersect.face.normal );
        posMouse.divideScalar( 1 ).floor().multiplyScalar( 1 ).addScalar( 1 );
        posMouse.z = 700;
        if (selectedInstr) {
            document.body.style.cursor = 'crosshair';
            if (count !== 0) {
                updateLine(posMouse);
            }
        } else  if (selectedScale) {
            document.body.style.cursor = 'crosshair';
            if (countScale !== 0) {
                // console.log("!!!!!!!", positionsScale);
                updateLineScale(posMouse);
            }
        } else {
            document.body.style.cursor = 'auto';
        }
    } else {
        document.body.style.cursor = 'auto';
    }
    // console.log("positions", positions);

}

function leftClick( event ) {
        // event.preventDefault();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, cameraOrthographic);
        var intersects = raycaster.intersectObjects(objects, true);
        if (intersects.length > 0) {
            if (camera.isOrthographicCamera) {
            var intersect = intersects[0];         
            var arr = intersect.object.name.split('_');
            /* rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
            rollOverMesh.position.divideScalar( 1 ).floor().multiplyScalar( 1 ).addScalar( 0 );*/

            if (intersect.object.name === "floor") {
                if (selectedPoint) {
                    selectedPoint.scale.set(1.0, 1.0, 1.0);
                    selectedPoint.material.color = new THREE.Color("#ff0000");
                    transformControl.detach(selectedPoint);
                    selectedPoint = null;
                }
            }
                if (selectedInstr) {
                    if (positions[count * 3 - 6] === posMouse.x &&
                        positions[count * 3 - 5] === posMouse.y &&
                        positions[count * 3 - 4] === posMouse.z) {
                        // selectedInstr = false;
                        count--;
                        count1 -= 2;
                        extrudePath();
                        clearPointsPosition();
                        instrument();
                        selectedObject = null;
                        selectedPoint = null;
                    } else {
                        if (count === 0) {
                            addPoint(posMouse);
                            calculateScale(positionsScale);
                        }
                        addPoint(posMouse);
                    }
                } else if (selectedScale) {
                    if (positionsScale[countScale * 3 - 3] === posMouse.x &&
                        positionsScale[countScale * 3 - 2] === posMouse.y &&
                        positionsScale[countScale * 3 - 1] === posMouse.z) {
                        selectedScale = false;
                        changeColorButton();
                    } else {
                        if (countScale === 0) {
                            addPointScale(posMouse);
                        }
                        addPointScale(posMouse);
                    }
                } else if (transformControl.object) {
                    if (selectedPoint !== transformControl.object && selectedPoint) {
                        selectedPoint.scale.set(1.0, 1.0, 1.0);
                        selectedPoint.material.color = new THREE.Color("#ff0000");
                        /* transformControl.detach(selectedPoint);*/
                        selectedPoint = null;
                    }
                    selectedPoint = transformControl.object;
                    selectedObject = null;
                    // console.log("!!!!!!!!!!!", selectedPoint);
                    selectedPoint.scale.set(1.5, 1.5, 1.5);
                    transformControl.object.material.color = new THREE.Color("#00d40f");
                    for (var i = 0; i < groupLinesUpdate.children.length; i++) {
                        groupLinesUpdate.children[i].material.color = new THREE.Color("#d70003");
                    }
                    for (var i = 0; i < objects.length; i++) {
                        if (objects[i].name.split('_')[0] === "wallsCup") {
                            objects[i].material.color = new THREE.Color("#9cc2d7");
                        }
                    }
                } else {
                    // console.log("!!!!!!!!!!!", transformControl.object);
                }
                if (arr[0] === "wallsCup" && !selectedInstr && !selectedScale) {
                    if (transformControl.object) {
                        transformControl.object.scale.set(1.0, 1.0, 1.0);
                        transformControl.object.material.color = new THREE.Color("#ff0000");
                        transformControl.detach(transformControl.object);
                        selectedPoint = null;
                    }
                    selectedObject = intersect.object;
                    for (var i = 0; i < objects.length; i++) {
                        if (objects[i].name === "wallsCup_" + arr[1]) {
                            objects[i].material.color = new THREE.Color("#3fd343");
                        } else {
                            if (objects[i].name.split('_')[0] === "wallsCup") {
                                objects[i].material.color = new THREE.Color("#9cc2d7");
                            }
                        }
                    }
                    for (var i = 0; i < groupLinesUpdate.children.length; i++) {
                        if (groupLinesUpdate.children[i].name === "line_" + arr[1]) {
                            groupLinesUpdate.children[i].material.color = new THREE.Color("#302fd4");
                        } else {
                            groupLinesUpdate.children[i].material.color = new THREE.Color("#d70003");
                        }
                    }
                    // selectedObject.material.color = "#1dff00";
                } else {

                    selectedObject = null;
                    for (var i = 0; i < objects.length; i++) {
                        if (objects[i].name.split('_')[0] === "wallsCup") {
                            objects[i].material.color = new THREE.Color("#9cc2d7");
                        }
                    }
                    for (var i = 0; i < groupLinesUpdate.children.length; i++) {
                        groupLinesUpdate.children[i].material.color = new THREE.Color("#d70003");
                    }
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

function animate() {
    if( RESOURCES_LOADED == false ){
        requestAnimationFrame(animate);
        var deltaTime = clock.getDelta();
        loadingScreen.planeLoader.material.uniforms.time.value += deltaTime;
        renderer.render(loadingScreen.scene, loadingScreen.cameraOrthographic);
        return; // Stop the function here.
    }


    requestAnimationFrame( animate );
    //////
    var deltaTime = clock.getDelta()*100.;
    var time = Date.now() * 0.01;
    //////

    if (camera.isOrthographicCamera) {
        controlsP = null;
        controlsO.update();
    } else if (camera.isPerspectiveCamera) {
        controlsO = null;
        controlsP.update();
    }
    //////
    render();
}

function render() {
    renderer.render( scene, camera );
}

function instrument(){
    if (camera.isOrthographicCamera) {
        selectedInstr = !selectedInstr;
        selectedScale = false;
        groupLinesScale.visible = false;
        changeColorButton();
    }
}

function calculateScale(posMouse){
    var l = getLength(posMouse);
    if (l) {
        scale = valueScale / l;
    }
}

function getLength(posMouse){
    var vec = new THREE.Vector3(posMouse[0] - posMouse[3], posMouse[1] - posMouse[4], posMouse[2] - posMouse[5]);
    var l = vec.length();
    // console.log("l", l);
    return l;
}

function changeScale(){
    if (camera.isOrthographicCamera) {
        groupLinesScale.visible = true;
        selectedScale = !selectedScale;
        selectedInstr = false;
        changeColorButton();
        if (selectedScale) {
            clearPointsScalePosition();
        }
    }
}

function changeColorButton(){
    if (selectedInstr) {
        document.Instruments.changeInstrument.classList.remove("inputInstrumentUnselected");
        document.Instruments.changeInstrument.classList.add("inputInstrumentSelected");
    } else {
        document.Instruments.changeInstrument.classList.remove("inputInstrumentSelected");
        document.Instruments.changeInstrument.classList.add("inputInstrumentUnselected");
    }
    if (selectedScale) {
        document.Instruments.changeScale.classList.remove("inputInstrumentUnselected");
        document.Instruments.changeScale.classList.add("inputInstrumentSelected");
    } else {
        document.Instruments.changeScale.classList.remove("inputInstrumentSelected");
        document.Instruments.changeScale.classList.add("inputInstrumentUnselected");
    }
}

function changeCamera(event){
    selectedInstr = false;
    changeColorButton();
    clearPointsPosition();
    if (event.srcElement.name === "cameraOrthographic") {

        document.panelCamera.cameraOrthographic.classList.add("inputInstrumentSelected");
        document.panelCamera.cameraOrthographic.classList.remove("inputInstrumentUnselected");

        document.panelCamera.cameraPerspective.classList.remove("inputInstrumentSelected");
        document.panelCamera.cameraPerspective.classList.add("inputInstrumentUnselected");

        group.rotation.x = 0;
        group.scale.set(1, 1, 1);
        groupExtrude.rotation.x = group.rotation.x;
        groupExtrude.visible = false;
        groupPlane.visible = true;
        groupLinesUpdate.visible = true;
        groupLines.visible = true;
        visibledChildObject(groupPointsArray, true);
        transformControl.enabled = true;
        transformControl.visible = true;

        camera = cameraOrthographic;
        setDefaultOrthographicCameraPosition();
        set2DControl();
    } else if (event.srcElement.name === "cameraPerspective") {

        document.panelCamera.cameraPerspective.classList.add("inputInstrumentSelected");
        document.panelCamera.cameraPerspective.classList.remove("inputInstrumentUnselected");

        document.panelCamera.cameraOrthographic.classList.remove("inputInstrumentSelected");
        document.panelCamera.cameraOrthographic.classList.add("inputInstrumentUnselected");

        group.rotation.x = -Math.PI / 2;
        group.scale.set(scale, scale, scale);
        groupExtrude.rotation.x = group.rotation.x
        groupExtrude.visible = true;
        groupPlane.visible = false;
        groupLinesUpdate.visible = false;
        groupLines.visible = false;

        selectedScale = false;
        changeColorButton();
        groupLinesScale.visible = false;

        visibledChildObject(groupPointsArray, false);
        transformControl.enabled = false;
        transformControl.visible = false;

        camera = cameraPerspective;
        setDefaultPerspectiveCameraPosition();
        set3DControl();
    }
}

function setCameraDefaultPosition () {
    if (camera.isPerspectiveCamera) {
        setDefaultPerspectiveCameraPosition();
        set3DControl();
    } else if (camera.isOrthographicCamera) {
        setDefaultOrthographicCameraPosition ();
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

function visibledChildObject ( parentObject,  visible) {
    for (var i = 0; i < parentObject.length; i++) {
        parentObject[i].visible = visible;
    }
}

function onKeyDown ( event ) {
    switch ( event.keyCode ) {
        case 82: // r
            break;
        case 83: // s
            break;
        case 84: // t
            break;
        case 27: // esc
            clearLastPointsPosition();
            break;
        case 46: // delete
            // console.log("!!!!!!!!!!!", selectedPoint);
            if (selectedObject) {
                if (transformControl.object) {
                    transformControl.detach(transformControl.object);
                }
                var arr = selectedObject.name.split('_');

                for (var i = 0; i < objects.length; i++) {
                    if (objects[i].name === selectedObject.name || objects[i].name === "wallsCup_" + arr[1]) {
                        objects.splice(i, 1);
                        i = objects.length;
                    }
                }
                removeObject(groupExtrude, selectedObject.name);
                removeObject(groupPlane, "wallsCup_" + arr[1]);
                removeObject(groupLinesUpdate, "line_" + arr[1]);

                var index = null;
                var j = 0;
                for (var i = 0; i < groupPointsArray.length; i++ ) {
                    var name = groupPointsArray[i].name;
                    var a = name.split('_');
                    if (a[1] === arr[1]) {
                        if (index === null) {
                            index = i;
                        }
                        scene.remove(scene.getObjectByName(groupPointsArray[i].name));
                        j++;
                    }
                }
                groupPointsArray.splice(index, j);
                selectedObject = null;
            } else {
                if (groupPointsArray.length && transformControl.object) {
                    deleteObject(transformControl.object);
                }
            }
            break;
        case 37: // left
            if (selectedPoint) {
                selectedPoint.position.x -= 1;
                updateObject(selectedPoint);
                dragEnd();
            }
            break;
        case 38: // up
            if (selectedPoint) {
                selectedPoint.position.y += 1;
                updateObject(selectedPoint);
                dragEnd();
            }
            break;
        case 39: // right
            if (selectedPoint) {
                selectedPoint.position.x += 1;
                updateObject(selectedPoint);
                dragEnd();
            }
            break;
        case 40: // down
            if (selectedPoint) {
                selectedPoint.position.y -= 1;
                updateObject(selectedPoint);
                dragEnd();
            }
            break;
    }
}