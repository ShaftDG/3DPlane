function ControlDesigner(textureSpritePointScale) {
    THREE.Object3D.apply(this);
    this.name = "ControlDesigner";

    this.textureSpritePointScale = textureSpritePointScale;

    this.planeBackground = null;

    this.selectedObject = null;
    this.selectedPoint = null;

    this.selectedWindow = null;
    this.selectedDoor = null;

    this.lineHorizontal = null;
    this.lineVertical = null;

    this.lineDistance = null;

    this.boolDoor = false;
    this.boolWindow = false;

    this.widthDoor = 100;
    this.heightDoor = 210;
    this.depthDoor = 20;

    this.widthWindow = 150;
    this.heightWindow = 150;
    this.depthWindow = 20;

    this.fromFloorDoor = 0;
    this.fromFloorWindow = 60;

    this.radiusClick = 2;

    this.magnetX = null;
    this.magnetY = null;
    this.boolMagnet = false;
    this.sensitivity = 10;
    this.line = null;
    this.lineRect = null;
    this.lineDown = null;
    this.lineScale = null;
    this.positions = null;
    this.positionsRect = null;
    this.positionsDown = null;
    this.positionsScale = null;

    this.count = 0;
    this.count1 = 0;
    this.countScale = 0;
    this.scalePlane = 1;
    this.numWalls = 0;
    this.updatedWall = 0;
    this.tempCoord = new THREE.Vector2();
    this.widthWall = 20;
    this.heightWall = 100;
    this.valueScale = 1;

    this.selectedInstr = false;
    this.selectedScale = false;

    this.objects = [];

    this.posMouse = new THREE.Vector3();

    this.mapWallsCup = new Map();
    this.mapDoors = new Map();
    this.mapWindows = new Map();
    this.mapSubtractDoors = new Map();
    this.mapSubtractWindows = new Map();
    this.mapWalls = new Map();
    this.mapLinesWalls = new Map();
    this.mapLines = new Map();
    this.mapGroup = new Map();
    this.mapProportions = new Map();
    this.mapPointObjects = new Map();

    this.mapX = new Map();
    this.mapY = new Map();

    this.group = new THREE.Object3D();
    this.group.name = "groupObjects";
    this.add(this.group);

    this.groupPlane = new THREE.Object3D();
    this.groupPlane.name = "groupPlane";
    this.add(this.groupPlane);

    this.groupExtrude = new THREE.Object3D();
    this.groupExtrude.name = "groupExtrude";
    this.groupExtrude.visible = false;
    this.add(this.groupExtrude);

    this.groupFinishedWalls = new THREE.Object3D();
    this.groupFinishedWalls.name = "groupFinishedWalls";
    this.groupFinishedWalls.visible = false;
    this.add(this.groupFinishedWalls);

    this.groupSubtractWindows = new THREE.Object3D();
    this.groupSubtractWindows.name = "groupSubtractWindows";
    // this.groupSubtractWindows.visible = false;
    this.add(this.groupSubtractWindows);

    this.groupSubtractDoors = new THREE.Object3D();
    this.groupSubtractDoors.name = "groupSubtractDoors";
    // this.groupSubtractDoors.visible = false;
    this.add(this.groupSubtractDoors);

    this.groupLines = new THREE.Object3D();
    this.groupLines.name = "groupLines";
    this.add(this.groupLines);

    this.groupLinesUpdate = new THREE.Object3D();
    this.groupLinesUpdate.name = "groupLinesUpdate";
    this.add(this.groupLinesUpdate);

    this.groupLinesScale = new THREE.Object3D();
    this.groupLinesScale.name = "groupLinesScale";
    this.add(this.groupLinesScale);

    this.groupPointsScale = [];

    this.groupPoints = new THREE.Object3D();
    this.groupPoints.name = "groupPoints";
    this.add(this.groupPoints);

    this.groupProportions = new THREE.Object3D();
    this.groupProportions.name = "groupProportions";
    this.add(this.groupProportions);

    this.groupProportions3D = new THREE.Object3D();
    this.groupProportions3D.name = "groupProportions3D";
    this.add(this.groupProportions3D);

    this.groupDoors = new THREE.Object3D();
    this.groupDoors.name = "groupDoors";
    this.add(this.groupDoors);

    this.groupWindows = new THREE.Object3D();
    this.groupWindows.name = "groupWindows";
    this.add(this.groupWindows);

    // model
    var geometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
    // geometry.rotateX(-Math.PI / 2);
    var material = new THREE.MeshBasicMaterial({color: '#effffc'/*, side: THREE.DoubleSide*/});
    this.floor = new THREE.Mesh(geometry, material);
    this.floor.receiveShadow = true;
    this.floor.name = "floor";
    this.objects.push( this.floor );
    this.mapGroup.set(this.floor.name, this.floor);
    this.group.add(this.floor);

    this.addHelperLine();
    this.addLines();
    this.addScaleLine();
}

ControlDesigner.prototype = Object.create(THREE.Object3D.prototype);
ControlDesigner.prototype.constructor = ControlDesigner;

ControlDesigner.prototype.addBackground = function (texture){
    if (this.planeBackground) {
        this.removeObject(this.group, this.mapGroup.get("planeBackground"));
    }
    var geometry = new THREE.PlaneGeometry(texture.image.width, texture.image.height);
    var material = new THREE.MeshBasicMaterial({map: texture, transparent: true, opacity: 0.25});
    this.planeBackground = new THREE.Mesh(geometry, material);
    this.planeBackground.name = "planeBackground";
    this.planeBackground.position.z = 2;
    this.mapGroup.set(this.planeBackground.name, this.planeBackground);
    this.group.add(this.planeBackground);
};

/////////////// 2D
                // Scale
ControlDesigner.prototype.addPointScale = function (coord){
    this.positionsScale[this.countScale * 3 + 0] = coord.x;
    this.positionsScale[this.countScale * 3 + 1] = coord.y;
    this.positionsScale[this.countScale * 3 + 2] = coord.z;
    this.countScale++;
    if (this.countScale >= 2) {
        this.countScale = 2;
    }
    this.lineScale.geometry.setDrawRange(0, this.countScale);
    this.updateLineScale(coord);

    var geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', new THREE.BufferAttribute(this.positionsScale, 3));
    var pointsMaterial = new THREE.PointsMaterial( {
        map: this.textureSpritePointScale,
        color: '#ffffff',
        size: 50,
        alphaTest: 0.5,
    } );
    var points = new THREE.Points( geometry, pointsMaterial );
    // points.position.z += 1;
    points.name = "points";
    this.groupPointsScale.push( points );

    this.groupLinesScale.add( points );
};

ControlDesigner.prototype.addScaleLine = function () {
    var geometry = new THREE.BufferGeometry();
    this.positionsScale = new Float32Array(2 * 3);
    geometry.addAttribute('position', new THREE.BufferAttribute(this.positionsScale, 3));
    var material = new THREE.LineBasicMaterial({
        color: '#ff0200',
        linewidth: 20,
        // transparent: true,
    });
    this.lineScale = new THREE.Line(geometry, material);
    this.lineScale.name = "lineScale";
    this.groupLinesScale.add(this.lineScale);
};

ControlDesigner.prototype.updateLineScale = function (coord) {

    if(event.shiftKey) {
        if (Math.abs(this.positionsScale[this.countScale * 3 - 6] - coord.x) <= Math.abs(this.positionsScale[this.countScale * 3 - 5] - coord.y)) {
            this.positionsScale[this.countScale * 3 - 3] = this.positionsScale[this.countScale * 3 - 6];
            this.positionsScale[this.countScale * 3 - 2] = coord.y;
            this.positionsScale[this.countScale * 3 - 1] = coord.z;
            this.posMouse.set(this.positionsScale[this.countScale * 3 - 3], this.positionsScale[this.countScale * 3 - 2], this.positionsScale[this.countScale * 3 - 1]);
        } else {
            this.positionsScale[this.countScale * 3 - 3] = coord.x;
            this.positionsScale[this.countScale * 3 - 2] = this.positionsScale[this.countScale * 3 - 5];
            this.positionsScale[this.countScale * 3 - 1] = coord.z;
            this.posMouse.set(this.positionsScale[this.countScale * 3 - 3], this.positionsScale[this.countScale * 3 - 2], this.positionsScale[this.countScale * 3 - 1]);
        }
    } else {
        this.positionsScale[this.countScale * 3 - 3] = coord.x;
        this.positionsScale[this.countScale * 3 - 2] = coord.y;
        this.positionsScale[this.countScale * 3 - 1] = coord.z;
        this.posMouse.set(this.positionsScale[this.countScale * 3 - 3], this.positionsScale[this.countScale * 3 - 2], this.positionsScale[this.countScale * 3 - 1]);
    }

    this.lineScale.geometry.attributes.position.needsUpdate = true;
    for (var i = 0; i < this.groupPointsScale.length; i++) {
        this.groupPointsScale[i].geometry.attributes.position.needsUpdate = true;
    }
};

ControlDesigner.prototype.clearPointsScalePosition = function (){
    this.positionsScale[0] = 0;
    this.positionsScale[1] = 0;
    this.positionsScale[2] = 0;
    this.positionsScale[3] = 0;
    this.positionsScale[4] = 0;
    this.positionsScale[5] = 0;
    this.countScale = 0;
    this.lineScale.geometry.attributes.position.needsUpdate = true;
    for (var i = 0; i < this.groupPointsScale.length; i++) {
        this.groupPointsScale[i].geometry.attributes.position.needsUpdate = true;
        this.groupPointsScale[i].visible = false;
    }
};


                // Drawing
ControlDesigner.prototype.addLines = function () {
// LINE
// geometry
    var geometry = new THREE.BufferGeometry();
    var MAX_POINTS = 500;
    this.positions = new Float32Array(MAX_POINTS * 3);
    geometry.addAttribute('position', new THREE.BufferAttribute(this.positions, 3));

// material
    var material = new THREE.LineBasicMaterial({
        color: '#2b3f8b',
        linewidth: 20,
        transparent: true
    });

// this.line
    this.line = new THREE.Line(geometry, material);
    this.line.name = "line";
    this.groupLines.add(this.line);

/////////////////////////
    var geometry = new THREE.BufferGeometry();
    this.positionsRect = new Float32Array(MAX_POINTS * 3);
    geometry.addAttribute('position', new THREE.BufferAttribute(this.positionsRect, 3));

// material
    var material = new THREE.LineBasicMaterial({
        color: '#2b3f8b',
        linewidth: 20,
        transparent: true
    });

// this.line
    this.lineRect = new THREE.Line(geometry, material);
    this.lineRect.name = "lineRect";
    this.groupLines.add(this.lineRect);

//////////////////////////
    var geometry = new THREE.BufferGeometry();
    this.positionsDown = new Float32Array(MAX_POINTS * 3);
    geometry.addAttribute('position', new THREE.BufferAttribute(this.positionsDown, 3));

// material
    var material = new THREE.LineBasicMaterial({
        color: '#2b3f8b',
        linewidth: 20,
        transparent: true
    });

// this.line
    this.lineDown = new THREE.LineSegments(geometry, material);
    this.lineDown.name = "lineDown";
    this.groupLines.add(this.lineDown);
};

ControlDesigner.prototype.addRectangle = function (coord, depth) {

    var currentWall = {
        x0: this.positions[this.count * 3 - 6],
        y0: this.positions[this.count * 3 - 5],
        z0: this.positions[this.count * 3 - 4],
        x1: coord.x,
        y1: coord.y,
        z1: coord.z,
    };

    var vectors = this.getVectors(currentWall, depth);

    this.positionsRect[this.count1 * 3 + 0] = vectors.c.x;
    this.positionsRect[this.count1 * 3 + 1] = vectors.c.y;
    this.positionsRect[this.count1 * 3 + 2] = coord.z;

    this.tempCoord.x = this.positionsRect[this.count1 * 3 - 3];
    this.tempCoord.y = this.positionsRect[this.count1 * 3 - 2];

    this.positionsDown[this.count1 * 3 + 0] = vectors.c.x;
    this.positionsDown[this.count1 * 3 + 1] = vectors.c.y;
    this.positionsDown[this.count1 * 3 + 2] = coord.z;

    this.positionsDown[this.count1 * 3 + 3] = vectors.c.x;
    this.positionsDown[this.count1 * 3 + 4] = vectors.c.y;
    this.positionsDown[this.count1 * 3 + 5] = coord.z;

    this.count1++;
    this.positionsRect[this.count1 * 3 + 0] = vectors.c.x;
    this.positionsRect[this.count1 * 3 + 1] = vectors.c.y;
    this.positionsRect[this.count1 * 3 + 2] = coord.z;

    this.positionsDown[this.count1 * 3 + 0] = vectors.c.x;
    this.positionsDown[this.count1 * 3 + 1] = vectors.c.y;
    this.positionsDown[this.count1 * 3 + 2] = coord.z;

    this.positionsDown[this.count1 * 3 + 3] = vectors.c.x;
    this.positionsDown[this.count1 * 3 + 4] = vectors.c.y;
    this.positionsDown[this.count1 * 3 + 5] = coord.z;

    this.count1++;
    this.lineRect.geometry.setDrawRange(0, this.count1);
    this.lineDown.geometry.setDrawRange(0, this.count1);
};

ControlDesigner.prototype.addPoint = function (coord){

    this.posMouse.copy(coord);
    if (this.count !== 0) {
        this.mapX.set(Math.round(this.positions[this.count * 3 - 3]),
            new THREE.Vector3(this.positions[this.count * 3 - 3], this.positions[this.count * 3 - 2], this.positions[this.count * 3 - 1]));
        this.mapY.set(Math.round(this.positions[this.count * 3 - 2]),
            new THREE.Vector3(this.positions[this.count * 3 - 3], this.positions[this.count * 3 - 2], this.positions[this.count * 3 - 1]));
    }

    this.positions[this.count * 3 + 0] = coord.x;
    this.positions[this.count * 3 + 1] = coord.y;
    this.positions[this.count * 3 + 2] = coord.z;
    this.count++;

    this.line.geometry.setDrawRange(0, this.count);
    this.updateLine(coord);

    if ( this.count !== 0) {
        this.addRectangle(coord, this.widthWall);
    }
};

ControlDesigner.prototype.updateLine = function (coord) {
        if (event.shiftKey) {
            if (Math.abs(this.positions[this.count * 3 - 6] - coord.x) <= Math.abs(this.positions[this.count * 3 - 5] - coord.y)) {
                this.positions[this.count * 3 - 3] = this.positions[this.count * 3 - 6];
                this.positions[this.count * 3 - 2] = coord.y;
                this.positions[this.count * 3 - 1] = coord.z;
                this.posMouse.set(this.positions[this.count * 3 - 3], this.positions[this.count * 3 - 2], this.positions[this.count * 3 - 1])
            } else {
                this.positions[this.count * 3 - 3] = coord.x;
                this.positions[this.count * 3 - 2] = this.positions[this.count * 3 - 5];
                this.positions[this.count * 3 - 1] = coord.z;
                this.posMouse.set(this.positions[this.count * 3 - 3], this.positions[this.count * 3 - 2], this.positions[this.count * 3 - 1])
            }
        } /*else if(event.ctrlKey) {
        if ((this.positions[this.count * 3 - 6] - coord.x) <= 0) {
            this.positions[this.count * 3 - 3] = coord.y;
            this.positions[this.count * 3 - 2] = coord.y;
            this.positions[this.count * 3 - 1] = coord.z;
            rollOverMesh.position.set(this.positions[this.count * 3 - 3], this.positions[this.count * 3 - 2], this.positions[this.count * 3 - 1])
        } else {
            this.positions[this.count * 3 - 3] = coord.x;
            this.positions[this.count * 3 - 2] = coord.x;
            this.positions[this.count * 3 - 1] = coord.z;
            rollOverMesh.position.set(this.positions[this.count * 3 - 3], this.positions[this.count * 3 - 2], this.positions[this.count * 3 - 1])
        }
    }*/ else {
            this.positions[this.count * 3 - 3] = coord.x;
            this.positions[this.count * 3 - 2] = coord.y;
            this.positions[this.count * 3 - 1] = coord.z;
            this.posMouse.set(this.positions[this.count * 3 - 3], this.positions[this.count * 3 - 2], this.positions[this.count * 3 - 1])
        }
    this.line.geometry.attributes.position.needsUpdate = true;
    this.updateRectangle(this.posMouse, this.widthWall);
};

ControlDesigner.prototype.updateRectangle = function (coord, depth) {
    var previousWall = {
        x0: this.positions[this.count * 3 - 9],
        y0: this.positions[this.count * 3 - 8],
        z0: this.positions[this.count * 3 - 7],
        x1: this.positions[this.count * 3 - 6],
        y1: this.positions[this.count * 3 - 5],
        z1: this.positions[this.count * 3 - 4],
    };
    var currentWall = {
        x0: this.positions[this.count * 3 - 6],
        y0: this.positions[this.count * 3 - 5],
        z0: this.positions[this.count * 3 - 4],
        x1: coord.x,
        y1: coord.y,
        z1: coord.z,
    };

    var angle = this.getAngle(
        new THREE.Vector2(previousWall.x0 - previousWall.x1, previousWall.y0 - previousWall.y1),
        new THREE.Vector2(currentWall.x0 - currentWall.x1, currentWall.y0 - currentWall.y1)
    );
    // console.log("angle", angle);
    //2.5 <

    var vectors = this.getVectors(currentWall, depth);
    var vectors1 = this.getVectors(previousWall, depth);
    var xcv = (vectors.NvectorA.dot( vectors1.NvectorA ));
    // console.log("xcv", xcv);

    var f = new THREE.Vector2(
        (this.positions[this.count * 3 - 6] - ((this.tempCoord.x) ? (this.tempCoord.x + vectors.a.x) / 2 : vectors.a.x)),
        (this.positions[this.count * 3 - 5] - ((this.tempCoord.y) ? (this.tempCoord.y + vectors.a.y) / 2 : vectors.a.y))
    );
    f = f.normalize();
    // console.log("f", f);

    var mLen = depth / (f.dot( vectors.NvectorA ));
    // console.log("mLen = "+mLen);

    var nS1 = f.multiplyScalar(mLen * depth);

    var O = new THREE.Vector2();
    O.subVectors(new THREE.Vector2(this.positions[this.count * 3 - 6], this.positions[this.count * 3 - 5]), nS1);

    if (vectors.NvectorA.length()) {
        if (Math.acos(angle) <= 2.5) {
            this.positionsRect[this.count1 * 3 - 3] = vectors.c.x;
            this.positionsRect[this.count1 * 3 - 2] = vectors.c.y;
            this.positionsRect[this.count1 * 3 - 1] = coord.z;

            this.positionsRect[this.count1 * 3 - 6] = vectors.c.x;
            this.positionsRect[this.count1 * 3 - 5] = vectors.c.y;
            this.positionsRect[this.count1 * 3 - 4] = coord.z;

            this.positionsRect[this.count1 * 3 - 9] = O.x;
            this.positionsRect[this.count1 * 3 - 8] = O.y;
            this.positionsRect[this.count1 * 3 - 7] = coord.z;

            this.positionsRect[this.count1 * 3 - 12] = O.x;
            this.positionsRect[this.count1 * 3 - 11] = O.y;
            this.positionsRect[this.count1 * 3 - 10] = coord.z;

            this.positionsDown[this.count1 * 3 - 12] = O.x;
            this.positionsDown[this.count1 * 3 - 11] = O.y;
            this.positionsDown[this.count1 * 3 - 10] = coord.z;

            this.positionsDown[this.count1 * 3 - 9] = currentWall.x0;
            this.positionsDown[this.count1 * 3 - 8] = currentWall.y0;
            this.positionsDown[this.count1 * 3 - 7] = coord.z;

            this.positionsDown[this.count1 * 3 - 6] = vectors.c.x;
            this.positionsDown[this.count1 * 3 - 5] = vectors.c.y;
            this.positionsDown[this.count1 * 3 - 4] = coord.z;

            this.positionsDown[this.count1 * 3 - 3] = currentWall.x1;
            this.positionsDown[this.count1 * 3 - 2] = currentWall.y1;
            this.positionsDown[this.count1 * 3 - 1] = coord.z;
        } else {
            this.positionsRect[this.count1 * 3 - 3] = vectors.c.x;
            this.positionsRect[this.count1 * 3 - 2] = vectors.c.y;
            this.positionsRect[this.count1 * 3 - 1] = coord.z;

            this.positionsRect[this.count1 * 3 - 6] = vectors.c.x;
            this.positionsRect[this.count1 * 3 - 5] = vectors.c.y;
            this.positionsRect[this.count1 * 3 - 4] = coord.z;

            /////
            /* this.positionsRect[this.count1 * 3 - 9] = vectors.a.x;
             this.positionsRect[this.count1 * 3 - 8] = vectors.a.y;
             this.positionsRect[this.count1 * 3 - 7] = coord.z;

             this.positionsRect[this.count1 * 3 - 12] = vectors1.c.x;
             this.positionsRect[this.count1 * 3 - 11] = vectors1.c.y;
             this.positionsRect[this.count1 * 3 - 10] = coord.z;*/

            this.positionsRect[this.count1 * 3 - 9] = O.x;
            this.positionsRect[this.count1 * 3 - 8] = O.y;
            this.positionsRect[this.count1 * 3 - 7] = coord.z;

            this.positionsRect[this.count1 * 3 - 12] = O.x;
            this.positionsRect[this.count1 * 3 - 11] = O.y;
            this.positionsRect[this.count1 * 3 - 10] = coord.z;

            this.positionsDown[this.count1 * 3 - 12] = O.x;
            this.positionsDown[this.count1 * 3 - 11] = O.y;
            this.positionsDown[this.count1 * 3 - 10] = coord.z;

            this.positionsDown[this.count1 * 3 - 9] = currentWall.x0;
            this.positionsDown[this.count1 * 3 - 8] = currentWall.y0;
            this.positionsDown[this.count1 * 3 - 7] = coord.z;

            this.positionsDown[this.count1 * 3 - 6] = vectors.c.x;
            this.positionsDown[this.count1 * 3 - 5] = vectors.c.y;
            this.positionsDown[this.count1 * 3 - 4] = coord.z;

            this.positionsDown[this.count1 * 3 - 3] = currentWall.x1;
            this.positionsDown[this.count1 * 3 - 2] = currentWall.y1;
            this.positionsDown[this.count1 * 3 - 1] = coord.z;

        }
    } else {

        /* this.positionsDown[this.count * 3 - 3] = this.positionsDown[this.count * 3 - 6];
         this.positionsDown[this.count * 3 - 2] = this.positionsDown[this.count * 3 - 5];
         this.positionsDown[this.count * 3 - 1] = this.positionsDown[this.count * 3 - 4];*/

        /* this.positionsRect[this.count1 * 3 - 3] = this.positionsRect[this.count1 * 3 - 6];
         this.positionsRect[this.count1 * 3 - 2] = this.positionsRect[this.count1 * 3 - 5];
         this.positionsRect[this.count1 * 3 - 1] = this.positionsRect[this.count1 * 3 - 4];

         this.positionsRect[this.count1 * 3 - 9] = this.positionsRect[this.count1 * 3 - 12];
         this.positionsRect[this.count1 * 3 - 8] = this.positionsRect[this.count1 * 3 - 11];
         this.positionsRect[this.count1 * 3 - 7] = this.positionsRect[this.count1 * 3 - 10];*/
    }

    if (this.count > 1) {

        if (this.positions[this.count * 3 - 6] === this.positions[this.count * 3 - 3] &&
            this.positions[this.count * 3 - 5] === this.positions[this.count * 3 - 2] &&
            this.positions[this.count * 3 - 4] === this.positions[this.count * 3 - 1]) {

        } else {
            this.removeObject(this.groupProportions, this.mapProportions.get(((this.count - 2)*2).toString() + "_" + this.numWalls.toString()));
            var start = new THREE.Vector2(this.positions[this.count * 3 - 6], this.positions[this.count * 3 - 5], this.positions[this.count * 3 - 4]);
            var end = new THREE.Vector2(this.positions[this.count * 3 - 3], this.positions[this.count * 3 - 2], this.positions[this.count * 3 - 1]);
            this.positionProportions(start, end, (this.count - 2)*2, this.numWalls.toString());

            this.removeObject(this.groupProportions, this.mapProportions.get(((this.count-2)*2+1 ).toString() + "_" + this.numWalls.toString()));
            var end = new THREE.Vector2(this.positionsRect[this.count1 * 3 - 9], this.positionsRect[this.count1 * 3 - 8], this.positionsRect[this.count1 * 3 - 7]);
            var start = new THREE.Vector2(this.positionsRect[this.count1 * 3 - 3], this.positionsRect[this.count1 * 3 - 2], this.positionsRect[this.count1 * 3 - 1]);
            this.positionProportions(start, end, (this.count-2)*2+1 , this.numWalls.toString());

            if (this.count > 2) {
                this.removeObject(this.groupProportions, this.mapProportions.get(((this.count-2)*2-1).toString() + "_" + this.numWalls.toString()));
                var end = new THREE.Vector2(this.positionsRect[this.count1 * 3 - 15], this.positionsRect[this.count1 * 3 - 14], this.positionsRect[this.count1 * 3 - 13]);
                var start = new THREE.Vector2(this.positionsRect[this.count1 * 3 - 9], this.positionsRect[this.count1 * 3 - 8], this.positionsRect[this.count1 * 3 - 7]);
                this.positionProportions(start, end, (this.count-2)*2-1, this.numWalls.toString());
            }
        }
    }

    this.lineRect.geometry.attributes.position.needsUpdate = true;
    this.lineDown.geometry.attributes.position.needsUpdate = true;
};

ControlDesigner.prototype.clearLastPointsPosition = function (){
    if ( this.count <= 2) {
        this.removeObject(this.groupProportions, this.mapProportions.get(((this.count - 2)*2).toString() + "_" + this.numWalls.toString()));
        this.mapProportions.delete(((this.count - 2)*2).toString() + "_" + this.numWalls.toString());
        this.removeObject(this.groupProportions, this.mapProportions.get(((this.count-2)*2+1 ).toString() + "_" + this.numWalls.toString()));
        this.mapProportions.delete(((this.count-2)*2+1 ).toString() + "_" + this.numWalls.toString());

        this.clearPointsPosition();
    } else {
        this.mapX.delete(Math.round(this.positions[this.count * 3 - 6]));
        this.mapY.delete(Math.round(this.positions[this.count * 3 - 5]));

        this.positions[this.count * 3 - 6] = this.positions[this.count * 3 - 3];
        this.positions[this.count * 3 - 5] = this.positions[this.count * 3 - 2];
        this.positions[this.count * 3 - 4] = this.positions[this.count * 3 - 1];

        this.positions[this.count * 3 - 3] = 0;
        this.positions[this.count * 3 - 2] = 0;
        this.positions[this.count * 3 - 1] = 0;

        this.positionsRect[this.count1 * 3 - 9] = this.positionsRect[this.count1 * 3 - 3];
        this.positionsRect[this.count1 * 3 - 8] = this.positionsRect[this.count1 * 3 - 2];
        this.positionsRect[this.count1 * 3 - 7] = this.positionsRect[this.count1 * 3 - 1];

        this.positionsRect[this.count1 * 3 - 12] = this.positionsRect[this.count1 * 3 - 6];
        this.positionsRect[this.count1 * 3 - 11] = this.positionsRect[this.count1 * 3 - 5];
        this.positionsRect[this.count1 * 3 - 10] = this.positionsRect[this.count1 * 3 - 4];

        this.positionsRect[this.count1 * 3 - 3] = 0;
        this.positionsRect[this.count1 * 3 - 2] = 0;
        this.positionsRect[this.count1 * 3 - 1] = 0;

        this.positionsRect[this.count1 * 3 - 6] = 0;
        this.positionsRect[this.count1 * 3 - 5] = 0;
        this.positionsRect[this.count1 * 3 - 4] = 0;

        this.positionsDown[this.count1 * 3 - 9] = this.positionsDown[this.count1 * 3 - 3];
        this.positionsDown[this.count1 * 3 - 8] = this.positionsDown[this.count1 * 3 - 2];
        this.positionsDown[this.count1 * 3 - 7] = this.positionsDown[this.count1 * 3 - 1];

        this.positionsDown[this.count1 * 3 - 12] = this.positionsDown[this.count1 * 3 - 6];
        this.positionsDown[this.count1 * 3 - 11] = this.positionsDown[this.count1 * 3 - 5];
        this.positionsDown[this.count1 * 3 - 10] = this.positionsDown[this.count1 * 3 - 4];

        this.positionsDown[this.count1 * 3 - 3] = 0;
        this.positionsDown[this.count1 * 3 - 2] = 0;
        this.positionsDown[this.count1 * 3 - 1] = 0;

        this.positionsDown[this.count1 * 3 - 6] = 0;
        this.positionsDown[this.count1 * 3 - 5] = 0;
        this.positionsDown[this.count1 * 3 - 4] = 0;

        this.removeObject(this.groupProportions, this.mapProportions.get(((this.count - 2)*2).toString() + "_" + this.numWalls.toString()));
        this.mapProportions.delete(((this.count - 2)*2).toString() + "_" + this.numWalls.toString());
        this.removeObject(this.groupProportions, this.mapProportions.get(((this.count-2)*2+1 ).toString() + "_" + this.numWalls.toString()));
        this.mapProportions.delete(((this.count-2)*2+1 ).toString() + "_" + this.numWalls.toString());

        this.count--;
        this.count1 -= 2;

        var currentWall = {
            x0: this.positions[this.count * 3 - 9],
            y0: this.positions[this.count * 3 - 8],
            z0: this.positions[this.count * 3 - 7],
            x1: this.positions[this.count * 3 - 6],
            y1: this.positions[this.count * 3 - 5],
            z1: this.positions[this.count * 3 - 4],
        };

        var vectors = this.getVectors(currentWall, this.widthWall);

        this.tempCoord.x = vectors.c.x;
        this.tempCoord.y = vectors.c.y;

        this.updateLine(new THREE.Vector3(this.positions[this.count * 3 - 3], this.positions[this.count * 3 - 2], this.positions[this.count * 3 - 1]));
        this.line.geometry.setDrawRange(0, this.count);
        this.lineRect.geometry.setDrawRange(0, this.count1);
        this.lineDown.geometry.setDrawRange(0, this.count1);
    }
};

ControlDesigner.prototype.clearPointsPosition = function (){
    this.positions = [];
    this.positionsRect = [];
    this.positionsDown = [];

    this.count = 0;
    this.count1 = 0;

    this.removeLines(this.groupLines);

    this.addLines();
};

ControlDesigner.prototype.positionProportions3D = function (start, end, num, numWalls) {

    var lengthVector = new THREE.Vector2(start.x - end.x, start.y - end.y, start.z - end.z).length();

    if (lengthVector > 0) {
        var angle = 0;

        var vector = {
            x0: start.x,
            y0: start.y,
            z0: start.z,
            x1: end.x,
            y1: end.y,
            z1: end.z,
        };

        var v = this.getVectors(vector, 50);
        var a = v.b;
        var b = v.d;
        var middle = new THREE.Vector3((a.x + b.x) / 2, 10, -(a.y + b.y) / 2);

      /*  if (start.x > end.x) {
            if (start.y < end.y) {
                angle = this.getAngle(
                    new THREE.Vector2(1, 0),
                    new THREE.Vector2(start.x - end.x, start.y - end.y)
                );
                angle = Math.acos(angle);
            } else  if (start.y > end.y) {

                angle = this.getAngle(
                    new THREE.Vector2(1, 0),
                    new THREE.Vector2(end.x - start.x, end.y - start.y)
                );
                angle = Math.acos(angle) + Math.PI;
            } else  if (start.y === end.y) {
                angle = 0;
            }
        } else if (start.x < end.x) {
            if (start.y < end.y) {
                angle = this.getAngle(
                    new THREE.Vector2(1, 0),
                    new THREE.Vector2(start.x - end.x, start.y - end.y)
                );
                angle = Math.acos(angle) + Math.PI;
            } else if (start.y > end.y){

                angle = this.getAngle(
                    new THREE.Vector2(1, 0),
                    new THREE.Vector2(end.x - start.x, end.y - start.y)
                );
                angle = Math.acos(angle);
            } else  if (start.y === end.y) {
                angle = 0;
            }

        } else if (start.x === end.x) {


            angle = -Math.PI / 2 ;

        }*/

        var spritey = this.makeTextSprite( Math.round(lengthVector), {
            fontsize: 24,
            backgroundColor: {r: 255, g: 255, b: 255, a: 1.0},
            borderColor: {r: 50, g: 175, b: 50, a: 1.0}
        }, angle, num, numWalls, "3D");
        spritey.position.copy(middle);
        /*  if (lengthVector <= 30) {
              spritey.visible = false;
          }*/
        this.groupProportions3D.add(spritey);
        this.mapProportions.set(spritey.name, spritey);
    }
};

ControlDesigner.prototype.positionProportions = function (start, end, num, numWalls) {

    var lengthVector = new THREE.Vector2(start.x - end.x, start.y - end.y, start.z - end.z).length();

    if (lengthVector > 0) {
        var angle;

        var vector = {
            x0: start.x,
            y0: start.y,
            z0: start.z,
            x1: end.x,
            y1: end.y,
            z1: end.z,
        };

        var v = this.getVectors(vector, 10);
        var a = v.b;
        var b = v.d;
        var middle = new THREE.Vector3((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);

        if (start.x > end.x) {
            if (start.y < end.y) {
                angle = this.getAngle(
                    new THREE.Vector2(1, 0),
                    new THREE.Vector2(start.x - end.x, start.y - end.y)
                );
                angle = Math.acos(angle);
            } else  if (start.y > end.y) {

                angle = this.getAngle(
                    new THREE.Vector2(1, 0),
                    new THREE.Vector2(end.x - start.x, end.y - start.y)
                );
                angle = Math.acos(angle) + Math.PI;
            } else  if (start.y === end.y) {
                angle = 0;
            }
        } else if (start.x < end.x) {
            if (start.y < end.y) {
                angle = this.getAngle(
                    new THREE.Vector2(1, 0),
                    new THREE.Vector2(start.x - end.x, start.y - end.y)
                );
                angle = Math.acos(angle) + Math.PI;
            } else if (start.y > end.y){

                angle = this.getAngle(
                    new THREE.Vector2(1, 0),
                    new THREE.Vector2(end.x - start.x, end.y - start.y)
                );
                angle = Math.acos(angle);
            } else  if (start.y === end.y) {
                angle = 0;
            }

        } else if (start.x === end.x) {


            angle = -Math.PI / 2 ;

        }

        var spritey = this.makeTextSprite( Math.round(lengthVector), {
            fontsize: 12,
            backgroundColor: {r: 255, g: 255, b: 255, a: 0.0}
        }, angle, num, numWalls, "2D");
        spritey.position.copy(middle);
      /*  if (lengthVector <= 30) {
            spritey.visible = false;
        }*/
        this.groupProportions.add(spritey);
        this.mapProportions.set(spritey.name, spritey);
    }
};

ControlDesigner.prototype.makeTextSprite = function ( message, parameters, angle, num, numWalls, view){
/*    function roundRect(ctx, w, h)
    {
        ctx.beginPath();
        ctx.moveTo(w, h);
        ctx.lineTo(2*w, h);
        ctx.lineTo(2*w, -h);
        ctx.lineTo(w, -h);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }*/
    function roundRect(ctx, x, y, w, h)
    {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x+w, y);
        ctx.lineTo(x+w, y+h);
        ctx.lineTo(x, y+h);
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.fill();
        if (view === "3D") {
            ctx.stroke();
        }
    }
    if ( parameters === undefined ) parameters = {};

    var fontface = parameters.hasOwnProperty("fontface") ?
        parameters["fontface"] : "Arial";

    var fontsize = parameters.hasOwnProperty("fontsize") ?
        parameters["fontsize"] : 18;

    var borderThickness = parameters.hasOwnProperty("borderThickness") ?
        parameters["borderThickness"] : 4;

    var borderColor = parameters.hasOwnProperty("borderColor") ?
        parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };

    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
        parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };

    var canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 32;
    var context = canvas.getContext('2d');
    context.font = fontsize + "px " + fontface;

    // background color
    context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
        + backgroundColor.b + "," + backgroundColor.a + ")";

    if (view === "3D") {
        // border color
        context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
            + borderColor.b + "," + borderColor.a + ")";
        context.lineWidth = borderThickness;
        roundRect(context, borderThickness / 2, borderThickness / 2, canvas.width - borderThickness, canvas.height - borderThickness);
    }
    // text color
    context.fillStyle = "rgba(0, 0, 0, 1.0)";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText( message, canvas.width / 2, canvas.height / 2);

    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    var spriteMaterial = new THREE.SpriteMaterial(
        { rotation: -angle, map: texture, depthTest: false } );
    var sprite = new THREE.Sprite( spriteMaterial );
    sprite.name = num.toString() + "_" + numWalls ;
    sprite.scale.set(80,40,40);
    return sprite;
};

                // Create Wall
ControlDesigner.prototype.addPointObject = function (x, y ,z, num) {
    var pointGeometry = new THREE.SphereBufferGeometry( 4, 8, 8 );
    var pointMaterial = new THREE.MeshBasicMaterial( { color: '#ff0000', /*opacity: 0.5,*/ transparent: true } );
    var point = new THREE.Mesh( pointGeometry, pointMaterial );
    point.name = num.toString() + "_" + this.numWalls;
    point.position.set(x, y ,z);
    this.mapX.set(Math.round(x), point.position);
    this.mapY.set(Math.round(y), point.position);
    this.groupPoints.add(point);
    this.mapPointObjects.set(point.name, point);
    this.objects.push(point);
    transformControl.attach( point );
};

ControlDesigner.prototype.updateObject = function (object) {

    var arr = object.name.split('_');
    var num = +arr[0];
    this.updatedWall = +arr[1];
    var objectlines = null;
    if (this.mapLines.has("line_" + arr[1])) {
        objectlines = this.mapLines.get("line_" + arr[1]);
    }
    var position = objectlines.geometry.attributes.position.array;

    var length = position.length / 3;
    if (num === 0) {
        position[(length-1) * 3 + 0] = object.position.x;
        position[(length-1) * 3 + 1] = object.position.y;
        position[(length-1) * 3 + 2] = object.position.z;

        position[num * 3 + 0] = object.position.x;
        position[num * 3 + 1] = object.position.y;
        position[num * 3 + 2] = object.position.z;

        if (length > 1) {
            this.removeObject(this.groupProportions, this.mapProportions.get(num.toString() + "_" + this.updatedWall.toString()));
            var end = new THREE.Vector2(position[(num + 1) * 3 + 0], position[(num + 1) * 3 + 1], position[(num + 1) * 3 + 2]);
            var start = new THREE.Vector2(position[num * 3 + 0], position[num * 3 + 1], position[num * 3 + 2]);
            this.positionProportions(start, end, num, this.updatedWall.toString());

            this.removeObject(this.groupProportions, this.mapProportions.get((length - 2).toString() + "_" + this.updatedWall.toString()));
            var start = new THREE.Vector2(position[(length - 2) * 3 + 0], position[(length - 2) * 3 + 1], position[(length - 2) * 3 + 2]);
            var end = new THREE.Vector2(position[num * 3 + 0], position[num * 3 + 1], position[num * 3 + 2]);
            this.positionProportions(start, end, (length - 2), this.updatedWall.toString());
        }
    } else {
        position[num * 3 + 0] = object.position.x;
        position[num * 3 + 1] = object.position.y;
        position[num * 3 + 2] = object.position.z;

        if (length > 1) {
            this.removeObject(this.groupProportions, this.mapProportions.get(num.toString() + "_" + this.updatedWall.toString()));
            var end = new THREE.Vector2(position[(num + 1) * 3 + 0], position[(num + 1) * 3 + 1], position[(num + 1) * 3 + 2]);
            var start = new THREE.Vector2(position[num * 3 + 0], position[num * 3 + 1], position[num * 3 + 2]);
            this.positionProportions(start, end, num, this.updatedWall.toString());

            this.removeObject(this.groupProportions, this.mapProportions.get((num - 1).toString() + "_" + this.updatedWall.toString()));
            var start = new THREE.Vector2(position[(num - 1) * 3 + 0], position[(num - 1) * 3 + 1], position[(num - 1) * 3 + 2]);
            var end = new THREE.Vector2(position[num * 3 + 0], position[num * 3 + 1], position[num * 3 + 2]);
            this.positionProportions(start, end, num - 1, this.updatedWall.toString());
        }
    }
    objectlines.geometry.attributes.position.needsUpdate = true;
    objectlines.material.needsUpdate = true;
};

ControlDesigner.prototype.deletePointObject = function (object) {

    transformControl.detach( transformControl.object );
    var arr = object.name.split('_');
    var num = +arr[0];
    this.updatedWall = +arr[1];
    var indexDeleteElement;
    var position;
    var objectlines = null;
    if (this.mapLines.has("line_" + arr[1])) {
        objectlines = this.mapLines.get("line_" + arr[1]);
    }
    position = objectlines.geometry.attributes.position.array;
    var length = position.length / 3;
    if (num === 0) {
        var array =  Array.prototype.slice.call(position);
        array.splice(num * 3, 3);
        array.splice((length-2) * 3, 3);

        this.removeObject(this.groupPoints, this.mapPointObjects.get(arr[0] + "_" + arr[1]));
        this.removeIntersectObjectsArray(this.objects, this.mapPointObjects.get(arr[0] + "_" + arr[1]));
        for (var i = 0; i < this.groupPoints.children.length; i++ ) {
            var name = this.groupPoints.children[i].name;

            var arr = name.split('_');
            if (+arr[1] === this.updatedWall) {
                if (+arr[0] === num) {
                    indexDeleteElement = i;
                } else if (+arr[0] > num) {
                    var n = +arr[0];
                    n--;
                    if (n < 0) {
                        n = 0
                    }
                    this.mapPointObjects.delete(this.groupPoints.children[i].name);
                    this.groupPoints.children[i].name = n.toString() + "_" + arr[1];
                    this.mapPointObjects.set(this.groupPoints.children[i].name, this.groupPoints.children[i]);
                }
            }
        }
        position[(length-1) * 3 + 0] = array[0];
        position[(length-1) * 3 + 1] = array[1];
        position[(length-1) * 3 + 2] = array[2];
    } else {
        var array =  Array.prototype.slice.call(position);
        array.splice(num * 3, 3);

        this.removeObject(this.groupPoints, this.mapPointObjects.get(object.name));
        this.removeIntersectObjectsArray(this.objects, this.mapPointObjects.get(arr[0] + "_" + arr[1]));
        for (var i = 0; i < this.groupPoints.children.length; i++ ) {
            var name = this.groupPoints.children[i].name;

            var arr = name.split('_');
            if (+arr[1] === this.updatedWall) {
                if (+arr[0] === num) {
                    indexDeleteElement = i;
                } else if (+arr[0] > num) {
                    var n = +arr[0];
                    n--;
                    if (n < 0) {
                        n = 0
                    }
                    this.mapPointObjects.delete(this.groupPoints.children[i].name);
                    this.groupPoints.children[i].name = n.toString() + "_" + arr[1];
                    this.mapPointObjects.set(this.groupPoints.children[i].name, this.groupPoints.children[i]);
                }
            }
        }

    }

    if (length > 3) {
        this.removeObject(this.groupProportions, this.mapProportions.get((length - 2).toString() + "_" + this.updatedWall.toString()));
        this.mapProportions.delete((length - 2).toString() + "_" + this.updatedWall.toString());
    } else {
        this.removeObject(this.groupProportions, this.mapProportions.get("0_" + this.updatedWall.toString()));
        this.mapProportions.delete("0_" + this.updatedWall.toString());

        this.removeObject(this.groupProportions, this.mapProportions.get("1_" + this.updatedWall.toString()));
        this.mapProportions.delete("1_" + this.updatedWall.toString());
    }

    position[(length-2) * 3 + 0] = array[0];
    position[(length-2) * 3 + 1] = array[1];
    position[(length-2) * 3 + 2] = array[2];

    var lengthArray = array.length/3;
    for (var i = 0; i < lengthArray; i++ ) {

        position[i * 3 + 0] = array[i * 3 + 0];
        position[i * 3 + 1] = array[i * 3 + 1];
        position[i * 3 + 2] = array[i * 3 + 2];

        if (lengthArray > 1) {
            if (i === 0) {
                this.removeObject(this.groupProportions, this.mapProportions.get(i.toString() + "_" + this.updatedWall.toString()));
                var end = new THREE.Vector2(position[(i + 1) * 3 + 0], position[(i + 1) * 3 + 1], position[(i + 1) * 3 + 2]);
                var start = new THREE.Vector2(position[i * 3 + 0], position[i * 3 + 1], position[i * 3 + 2]);
                this.positionProportions(start, end, i, this.updatedWall.toString());

                this.removeObject(this.groupProportions, this.mapProportions.get((lengthArray - 2).toString() + "_" + this.updatedWall.toString()));
                var start = new THREE.Vector2(position[(lengthArray - 2) * 3 + 0], position[(lengthArray - 2) * 3 + 1], position[(lengthArray - 2) * 3 + 2]);
                var end = new THREE.Vector2(position[i * 3 + 0], position[i * 3 + 1], position[i * 3 + 2]);
                this.positionProportions(start, end, (lengthArray - 2), this.updatedWall.toString());

            } else {
                this.removeObject(this.groupProportions, this.mapProportions.get(i.toString() + "_" + this.updatedWall.toString()));
                var end = new THREE.Vector2(position[(i + 1) * 3 + 0], position[(i + 1) * 3 + 1], position[(i + 1) * 3 + 2]);
                var start = new THREE.Vector2(position[i * 3 + 0], position[i * 3 + 1], position[i * 3 + 2]);
                this.positionProportions(start, end, i, this.updatedWall.toString());

                this.removeObject(this.groupProportions, this.mapProportions.get((i - 1).toString() + "_" + this.updatedWall.toString()));
                var start = new THREE.Vector2(position[(i - 1) * 3 + 0], position[(i - 1) * 3 + 1], position[(i - 1) * 3 + 2]);
                var end = new THREE.Vector2(position[i * 3 + 0], position[i * 3 + 1], position[i * 3 + 2]);
                this.positionProportions(start, end, i - 1, this.updatedWall.toString());
            }
        }
    }

    objectlines.geometry.attributes.position.needsUpdate = true;

    this.mapX.delete(Math.round(object.position.x));
    this.mapY.delete(Math.round(object.position.y));

    if (array.length) {
        this.updateExtrudePath(position);
    }
    if (!array.length) {
        this.removeObject(this.groupExtrude, this.mapWalls.get("walls_" + this.updatedWall.toString()));
        this.removeObject(this.groupPlane, this.mapWallsCup.get("wallsCup_" + this.updatedWall.toString()));
        this.removeObject(this.groupLinesUpdate, this.mapLines.get("line_" + this.updatedWall.toString()));

        this.removeIntersectObjectsArray(this.objects, this.mapWallsCup.get("wallsCup_" + this.updatedWall.toString()));
        this.removeIntersectObjectsArray(this.objects, this.mapWalls.get("walls_" + this.updatedWall.toString()));
        this.removeIntersectObjectsArray(this.objects, this.mapPointObjects.get("0_0"));
        this.clearMap();
    }
};
                // help lines
ControlDesigner.prototype.addHelperLine = function () {
    var geometryH = new THREE.BufferGeometry();
    var h = new Float32Array(2 * 3);
    geometryH.addAttribute('position', new THREE.BufferAttribute(h, 3));
    var material = new THREE.LineDashedMaterial( {
        color: '#009a09',
        dashSize: 10,
        gapSize: 5,
        transparent: true } );
    this.lineHorizontal = new THREE.LineSegments(geometryH, material);
    this.lineHorizontal.computeLineDistances();
    this.lineHorizontal.geometry.lineDistancesNeedUpdate = true;
    this.lineHorizontal.name = "lineHorizontal";
    this.add(this.lineHorizontal);

    var geometryV = new THREE.BufferGeometry();
    var v = new Float32Array(2 * 3);
    geometryV.addAttribute('position', new THREE.BufferAttribute(v, 3));
    this.lineVertical = new THREE.LineSegments(geometryV, material);
    this.lineVertical.computeLineDistances();
    this.lineVertical.geometry.lineDistancesNeedUpdate = true;
    this.lineVertical.name = "lineVertical";
    this.add(this.lineVertical);
};

ControlDesigner.prototype.updateHelperLines = function (object) {
    if (this.boolMagnet) {
        var posHor = this.lineHorizontal.geometry.attributes.position.array;
        var posVert = this.lineVertical.geometry.attributes.position.array;
        if (this.mapX.has(Math.round(object.position.x))) {
            object.position.x = Math.round(object.position.x);

            posVert[0] = object.position.x;

            this.magnetX = posVert[0];

            var pX = this.mapX.get(Math.round(object.position.x));
            posVert[3] = pX.x;
            posVert[4] = pX.y;
            posVert[5] = pX.z + 20;
        }

        if (this.mapY.has(Math.round(object.position.y))) {
            object.position.y = Math.round(object.position.y);

            posHor[1] = object.position.y;

            this.magnetY = posHor[1];

            var pY = this.mapY.get(Math.round(object.position.y));
            posHor[3] = pY.x;
            posHor[4] = pY.y;
            posHor[5] = pY.z + 20;
        }

        if (object.position.x >= this.magnetX - this.sensitivity && object.position.x <= this.magnetX + this.sensitivity) {
            object.position.x = this.magnetX;
            this.lineVertical.visible = true;
            posVert[0] = object.position.x;
            if (this.lineHorizontal.visible) {
                posVert[1] = posHor[1];
            } else {
                posVert[1] = object.position.y;
            }
            posVert[2] = object.position.z + 20;
        } else {
            this.lineVertical.visible = false;
        }

        if (object.position.y >= this.magnetY - this.sensitivity && object.position.y <= this.magnetY + this.sensitivity) {
            object.position.y = this.magnetY;
            this.lineHorizontal.visible = true;
            posHor[0] = object.position.x;
            posHor[1] = object.position.y;
            posHor[2] = object.position.z + 20;
        } else {
            this.lineHorizontal.visible = false;
        }
        this.lineHorizontal.geometry.attributes.position.needsUpdate = true;
        this.lineVertical.geometry.attributes.position.needsUpdate = true;
        this.lineVertical.computeLineDistances();
        this.lineVertical.geometry.lineDistancesNeedUpdate = true;
        this.lineHorizontal.computeLineDistances();
        this.lineHorizontal.geometry.lineDistancesNeedUpdate = true;
    }
    return object.position;
};

/////////////// 3D
ControlDesigner.prototype.extrudePath = function () {

    // this.crossingWalls();

    var num = 0;
    var pathPts = [];
    var mainLine = [];
    for (var i = 0; i < this.count; i++) {
        pathPts.push( new THREE.Vector2 ( this.positions[i * 3 + 0], this.positions[i * 3 + 1] ) );
        mainLine.push( new THREE.Vector2 ( this.positions[i * 3 + 0], this.positions[i * 3 + 1] ) );
        this.addPointObject(this.positions[i * 3 + 0], this.positions[i * 3 + 1], this.positions[i * 3 + 2], num);
        if (i !== 0) {
            this.removeObject(this.groupProportions, this.mapProportions.get((num-1).toString()+ "_" + this.numWalls.toString()));
            var start = new THREE.Vector2(this.positions[i * 3 - 3], this.positions[i * 3 - 2], this.positions[i * 3 - 1]);
            var end = new THREE.Vector2(this.positions[i * 3 + 0], this.positions[i * 3 + 1], this.positions[i * 3 + 2]);
            this.positionProportions(start, end, num-1, this.numWalls.toString());
        }
        num++;
    }
    this.mapLinesWalls.set(this.numWalls.toString(), mainLine);

    for (var i = this.count1 - 1; i > -1; i--) {

        if (i !== this.count1 - 1) {
            if (
                this.positionsRect[i * 3 + 0] === this.positionsRect[i * 3 + 3] &&
                this.positionsRect[i * 3 + 1] === this.positionsRect[i * 3 + 4] &&
                this.positionsRect[i * 3 + 2] === this.positionsRect[i * 3 + 5]
            ) {
                if (i === 0) {
                    this.removeObject(this.groupProportions, this.mapProportions.get((pathPts.length - 1).toString()+ "_" + this.numWalls.toString()));
                    var start = new THREE.Vector2(pathPts[pathPts.length - 1].x, pathPts[pathPts.length - 1].y, pathPts[pathPts.length - 1].z);
                    var end = new THREE.Vector2(pathPts[0].x, pathPts[0].y, pathPts[0].z);
                    this.positionProportions(start, end, pathPts.length - 1, this.numWalls.toString());
                }
            } else {
                pathPts.push(new THREE.Vector2(this.positionsRect[i * 3 + 0], this.positionsRect[i * 3 + 1]));
                this.addPointObject(this.positionsRect[i * 3 + 0], this.positionsRect[i * 3 + 1], this.positionsRect[i * 3 + 2], num);
                if (i !== 0) {
                    this.removeObject(this.groupProportions, this.mapProportions.get((pathPts.length - 2).toString()+ "_" + this.numWalls.toString()));
                    var start = new THREE.Vector2(pathPts[pathPts.length - 2].x, pathPts[pathPts.length - 2].y, pathPts[pathPts.length - 2].z);
                    var end = new THREE.Vector2(pathPts[pathPts.length - 1].x, pathPts[pathPts.length - 1].y, pathPts[pathPts.length - 1].z);
                    this.positionProportions(start, end, pathPts.length - 2, this.numWalls.toString());
                }
                num++;
            }
        } else {
            pathPts.push(new THREE.Vector2(this.positionsRect[i * 3 + 0], this.positionsRect[i * 3 + 1]));
            this.addPointObject(this.positionsRect[i * 3 + 0], this.positionsRect[i * 3 + 1], this.positionsRect[i * 3 + 2], num);
            this.removeObject(this.groupProportions, this.mapProportions.get((pathPts.length - 2).toString()+ "_" + this.numWalls.toString()));
            var start = new THREE.Vector2(pathPts[pathPts.length - 2].x, pathPts[pathPts.length - 2].y, pathPts[pathPts.length - 2].z);
            var end = new THREE.Vector2(pathPts[pathPts.length - 1].x, pathPts[pathPts.length - 1].y, pathPts[pathPts.length - 1].z);
            this.positionProportions(start, end, pathPts.length - 2, this.numWalls.toString());
            num++;
        }
    }
    /*
        for (var i = 0; i < pathPts.length; i++) {
            if (i !== 0) {
                var start = new THREE.Vector2(pathPts[i - 1].x, pathPts[i - 1].y, pathPts[i - 1].z);
                var end = new THREE.Vector2(pathPts[i].x, pathPts[i].y, pathPts[i].z);
                this.positionProportions(start, end, i, this.numWalls.toString());
            } else {
                var start = new THREE.Vector2(pathPts[pathPts.length - 1].x, pathPts[pathPts.length - 1].y, pathPts[pathPts.length - 1].z);
                var end = new THREE.Vector2(pathPts[i].x, pathPts[i].y, pathPts[i].z);
                this.positionProportions(start, end, i, this.numWalls.toString());
            }
        }*/

    var inputShape = new THREE.Shape( pathPts );
    var extrudeSettings = { depth: this.heightWall, bevelEnabled: false, steps: 1 };
    this.addShape( inputShape, extrudeSettings, "#9cc2d7", "#39424e", 0, 0, 0, 0, 0, 0, 1, this.numWalls );
    this.addLineShape( inputShape, extrudeSettings, "#d70003", 0, 0, 0, 0, 0, 0, 1, this.numWalls );
    this.numWalls++;
};

ControlDesigner.prototype.updateExtrudePath = function (position) {

    this.removeObject(this.groupExtrude, this.mapWalls.get("walls_" + this.updatedWall.toString()));
    this.removeObject(this.groupPlane, this.mapWallsCup.get("wallsCup_" + this.updatedWall.toString()));
    this.removeObject(this.groupLinesUpdate, this.mapLines.get("line_" + this.updatedWall.toString()));

    this.removeIntersectObjectsArray(this.objects, this.mapWallsCup.get("wallsCup_" + this.updatedWall.toString()));
    this.removeIntersectObjectsArray(this.objects, this.mapWalls.get("walls_" + this.updatedWall.toString()));
    // console.log("!!!", this.this.updatedWall);

    var num = 0;
    var pathPts = [];
    var mainLine = [];
    var length = position.length / 3;
    if (length > 1) {
        for (var i = 0; i < length; i++) {

            if (i !== 0) {
                if (
                    position[i * 3 + 0] === position[i * 3 + 3] &&
                    position[i * 3 + 1] === position[i * 3 + 4] &&
                    position[i * 3 + 2] === position[i * 3 + 5]
                ) {
                    // console.log("!!!");
                } else {
                    pathPts.push(new THREE.Vector2(position[i * 3 + 0], position[i * 3 + 1]));
                    if (i < Math.round((length-1) / 2)) {
                        mainLine.push(new THREE.Vector2(position[i * 3 + 0], position[i * 3 + 1]));
                    }
                    num++;
                }

            } else {
                pathPts.push(new THREE.Vector2(position[i * 3 + 0], position[i * 3 + 1]));
                mainLine.push(new THREE.Vector2(position[i * 3 + 0], position[i * 3 + 1]));
                num++;
            }

        }

        this.mapLinesWalls.delete(this.updatedWall.toString());
        this.mapLinesWalls.set(this.updatedWall.toString(), mainLine);

        var inputShape = new THREE.Shape(pathPts);
        var extrudeSettings = {depth: this.heightWall, bevelEnabled: false, steps: 1};
        this.addShape(inputShape, extrudeSettings, "#9cc2d7", "#39424e", 0, 0, 0, 0, 0, 0, 1, this.updatedWall);
        this.addLineShape(inputShape, extrudeSettings, "#d70003", 0, 0, 0, 0, 0, 0, 1, this.updatedWall);
    }
};

ControlDesigner.prototype.addLineShape = function ( shape, extrudeSettings, color, x, y, z, rx, ry, rz, s, nameWall ) {
    // lines
    shape.autoClose = true;
    var points = shape.getPoints();
    var geometryPoints = new THREE.BufferGeometry().setFromPoints( points );
    // solid this.line
    var line = new THREE.Line( geometryPoints, new THREE.LineBasicMaterial( { color: color, linewidth: 10/*, transparent: true */} ) );
    line.position.set( x, y, z + 500 );
    line.rotation.set( rx, ry, rz );
    line.scale.set( s, s, s );
    line.name = "line_" + nameWall.toString();
    this.mapLines.set(line.name, line);
    this.groupLinesUpdate.add( line );
};

ControlDesigner.prototype.addShape = function ( shape, extrudeSettings, colorCup, colorWall, x, y, z, rx, ry, rz, s, nameWall ) {
    // extruded shape
    var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
    geometry.rotateX(-Math.PI / 2);
    var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: colorWall/*, transparent: true*/, side: THREE.DoubleSide } ) );
    mesh.position.set( x, y, z );
    mesh.rotation.set( rx, ry, rz );
    mesh.scale.set( s, s, s );
    mesh.name = "walls_" + nameWall.toString();
    // mesh.castShadow = true;
    this.mapWalls.set(mesh.name, mesh);
    this.objects.push(mesh);
    this.groupExtrude.add( mesh );
    // flat shape
    var geometry = new THREE.ShapeBufferGeometry( shape );
    var mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: colorCup/*, wireframe: true*/ } ) );
    mesh.position.set( x, y, z + 700 );
    mesh.rotation.set( rx, ry, rz );
    mesh.scale.set( 1, 1, 1 );
    mesh.name = "wallsCup_" + nameWall.toString();
    this.mapWallsCup.set(mesh.name, mesh);
    this.objects.push(mesh);
    this.groupPlane.add( mesh );
    //points
};

ControlDesigner.prototype.booleanOperation = function ( obj1, obj2 ){

    var mat = new THREE.MeshBasicMaterial( { color: '#15ff00', side: THREE.DoubleSide } );

    var obj1BSP = new ThreeBSP( obj1 );
    var obj2BSP = new ThreeBSP( obj2 );

    var newSubtractBSP = obj1BSP.subtract( obj2BSP ).toGeometry();
    var newUnionBSP = obj1BSP.union( obj2BSP ).toGeometry();
    var newIntersectBSP = obj1BSP.intersect( obj2BSP ).toGeometry();

    var mesh = new THREE.Mesh( newSubtractBSP, obj1.material );
    mesh.geometry.computeFaceNormals();
    return mesh;
};

ControlDesigner.prototype.createCursorDoor3D = function (){

    if (this.window) {
        this.removeObject(this, this.window);
        this.window = undefined;
    }

    var geom = new THREE.BoxGeometry( 1, 1, 1 );
    var mat = new THREE.MeshPhongMaterial({color: "#ff00fa"});
    this.door = new THREE.Mesh( geom, mat );
    this.door.scale.set(this.widthDoor, this.heightDoor , (this.depthDoor+2));
    this.door.name = "door";
    this.add(this.door);
};

ControlDesigner.prototype.removeCursorDoor3D = function (){
    this.removeObject(this, this.door);
    this.door = undefined;
    this.removeObject(this.groupProportions3D, this.mapProportions.get("distance_wall"));
    this.clearDistanceToPoint();
};

ControlDesigner.prototype.createCursorWindow3D = function (){

    if (this.door) {
        this.removeObject(this, this.door);
        this.door = undefined;
    }

    var geom = new THREE.BoxGeometry( 1, 1, 1 );
    var mat = new THREE.MeshPhongMaterial({color: "#ff00fa"});
    this.window = new THREE.Mesh( geom, mat );
    this.window.scale.set(this.widthWindow, this.heightWindow, (this.depthWindow+2));
    this.window.name = "window";
    this.add(this.window);
};

ControlDesigner.prototype.removeCursorWindow3D = function (){
    this.removeObject(this, this.window);
    this.window = undefined;
    this.removeObject(this.groupProportions3D, this.mapProportions.get("distance_wall"));
    this.clearDistanceToPoint();
};

ControlDesigner.prototype.rebuild = function (){

    var singleGeometry = new THREE.Geometry();
    for (var j = 0; j < this.groupSubtractDoors.children.length; j++) {
        var pathPts = [];
        var g = this.groupSubtractDoors.children[j].geometry.vertices;

        pathPts.push(g[0]);
        pathPts.push(g[1]);
        pathPts.push(g[3]);
        pathPts.push(g[2]);

        var inputShape = new THREE.Shape(pathPts);
        var extrudeSettings = {depth: this.groupSubtractDoors.children[j].heightDoor, bevelEnabled: false, steps: 1};
        var geometry = new THREE.ExtrudeGeometry(inputShape, extrudeSettings);
        geometry.rotateX(-Math.PI / 2);
        var mat = new THREE.MeshPhongMaterial({
            color: "#4145d7",
            transparent: true,
            opacity: 0.5
        });
        var mesh = new THREE.Mesh(geometry, mat);
        mesh.position.x = this.groupSubtractDoors.children[j].position.x;
        mesh.position.z = -this.groupSubtractDoors.children[j].position.y;
        mesh.position.y = this.groupSubtractDoors.children[j].fromFloorDoor;
        mesh.rotation.y = this.groupSubtractDoors.children[j].rotation.z;
        mesh.updateMatrix();
        mesh.name = this.groupSubtractDoors.children[j].name;
        this.removeIntersectObjectsArray(this.objects, this.mapDoors.get(mesh.name));
        this.removeObject(this.groupDoors, this.mapDoors.get(mesh.name));
        this.mapDoors.set(mesh.name, mesh);
        this.objects.push(mesh);
        this.groupDoors.add(mesh);
        // this.add( new THREE.BoxHelper( mesh ) );
        singleGeometry.merge(mesh.geometry, mesh.matrix);
    }

    for (var j = 0; j < this.groupSubtractWindows.children.length; j++) {
        var pathPts = [];
        var g = this.groupSubtractWindows.children[j].geometry.vertices;

        pathPts.push(g[0]);
        pathPts.push(g[1]);
        pathPts.push(g[3]);
        pathPts.push(g[2]);

        var inputShape = new THREE.Shape(pathPts);
        var extrudeSettings = {depth: this.groupSubtractWindows.children[j].heightWindow, bevelEnabled: false, steps: 1};
        var geometry = new THREE.ExtrudeGeometry(inputShape, extrudeSettings);
        geometry.rotateX(-Math.PI / 2);
        var mat = new THREE.MeshPhongMaterial({
            color: "#d71cb4",
            transparent: true,
            opacity: 0.5
        });
        var mesh = new THREE.Mesh(geometry, mat);
        mesh.position.x = this.groupSubtractWindows.children[j].position.x;
        mesh.position.z = -this.groupSubtractWindows.children[j].position.y;
        mesh.position.y = this.groupSubtractWindows.children[j].fromFloorWindow;
        mesh.rotation.y = this.groupSubtractWindows.children[j].rotation.z;
        mesh.updateMatrix();
        mesh.name = this.groupSubtractWindows.children[j].name;
        this.removeIntersectObjectsArray(this.objects, this.mapWindows.get(mesh.name));
        this.removeObject(this.groupWindows, this.mapWindows.get(mesh.name));
        this.mapWindows.set(mesh.name, mesh);
        this.objects.push(mesh);
        this.groupWindows.add(mesh);
        singleGeometry.merge(mesh.geometry, mesh.matrix);
    }
    var meshSubtract = new THREE.Mesh(singleGeometry);
  //  this.add(meshSubtract);

    for (var i = 0; i < this.groupExtrude.children.length; i++) {

        var m = this.groupExtrude.children[i];
        m = this.booleanOperation(m, meshSubtract);
        m.name = this.groupExtrude.children[i].name;
        m.updateMatrix();
        this.removeIntersectObjectsArray(this.objects, this.mapWalls.get(m.name));
        this.removeObject(this.groupFinishedWalls, this.mapWalls.get(m.name));
        this.mapWalls.set(m.name, m);
        this.objects.push(m);
        this.groupFinishedWalls.add(m);
    }
};

/////////////// help function
ControlDesigner.prototype.removeIntersectObjectsArray = function (array, object) {
    if (array.length) {
        var index = array.indexOf(object);
        if (index !== -1) {
            array.splice(index, 1);
        }
    }
};

ControlDesigner.prototype.removeObject = function ( groupObject, object ) {
    //groupObject.remove(object);
    if (object) {
        groupObject.remove(groupObject.getObjectByName(object.name));
    }
    /*  if (object.geometry) {
          object.geometry.dispose();
      }*/
    /*  if (object.material) {
          object.material.dispose();
      }
      if (object.texture) {
          object.texture.dispose();
      }*/
};

ControlDesigner.prototype.removeLines = function ( groupObject ) {
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
};

ControlDesigner.prototype.crossingWalls = function () {

    var firstWall = {
        x0: this.positions[0],
        y0: this.positions[1],
        z0: this.positions[2],
        x1: this.positions[3],
        y1: this.positions[4],
        z1: this.positions[5],
    };
    var lastWall = {
        x0: this.positions[this.count * 3 - 6],
        y0: this.positions[this.count * 3 - 5],
        z0: this.positions[this.count * 3 - 4],
        x1: this.positions[this.count * 3 - 3],
        y1: this.positions[this.count * 3 - 2],
        z1: this.positions[this.count * 3 - 1],
    };

    var start1 = new THREE.Vector2(firstWall.x0, firstWall.y0);
    var end1 = new THREE.Vector2(firstWall.x1, firstWall.y1);

    var start2 = new THREE.Vector2(lastWall.x0, lastWall.y0);
    var end2 = new THREE.Vector2(lastWall.x1, lastWall.y1);

    var cross = this.crossSection(start1, end1, start2, end2);
    // console.log("crosssssssssssssssssss1", cross);

    // rollOverMesh1.position.x = cross.x;
    // rollOverMesh1.position.y = cross.y;

    var firstWall = {
        x0: this.positionsRect[3],
        y0: this.positionsRect[4],
        z0: this.positionsRect[5],
        x1: this.positionsRect[6],
        y1: this.positionsRect[7],
        z1: this.positionsRect[8],
    };
    var lastWall = {
        x0: this.positionsRect[this.count1 * 3 - 9],
        y0: this.positionsRect[this.count1 * 3 - 8],
        z0: this.positionsRect[this.count1 * 3 - 7],
        x1: this.positionsRect[this.count1 * 3 - 6],
        y1: this.positionsRect[this.count1 * 3 - 5],
        z1: this.positionsRect[this.count1 * 3 - 4],
    };

    var start1 = new THREE.Vector2(firstWall.x0, firstWall.y0);
    var end1 = new THREE.Vector2(firstWall.x1, firstWall.y1);

    var start2 = new THREE.Vector2(lastWall.x0, lastWall.y0);
    var end2 = new THREE.Vector2(lastWall.x1, lastWall.y1);

    var cross = this.crossSection(start1, end1, start2, end2);
    // console.log("crosssssssssssssssssss2", cross);

    // rollOverMesh2.position.x = cross.x;
    // rollOverMesh2.position.y = cross.y;


    var firstWall = {
        x0: this.positions[0],
        y0: this.positions[1],
        z0: this.positions[2],
        x1: this.positions[3],
        y1: this.positions[4],
        z1: this.positions[5],
    };
    var lastWall = {
        x0: this.positionsRect[this.count1 * 3 - 9],
        y0: this.positionsRect[this.count1 * 3 - 8],
        z0: this.positionsRect[this.count1 * 3 - 7],
        x1: this.positionsRect[this.count1 * 3 - 6],
        y1: this.positionsRect[this.count1 * 3 - 5],
        z1: this.positionsRect[this.count1 * 3 - 4],
    };

    var start1 = new THREE.Vector2(firstWall.x0, firstWall.y0);
    var end1 = new THREE.Vector2(firstWall.x1, firstWall.y1);

    var start2 = new THREE.Vector2(lastWall.x0, lastWall.y0);
    var end2 = new THREE.Vector2(lastWall.x1, lastWall.y1);

    var cross = this.crossSection(start1, end1, start2, end2);
    // console.log("crosssssssssssssssssss3", cross);

    // rollOverMesh3.position.x = cross.x;
    // rollOverMesh3.position.y = cross.y;

    var firstWall = {
        x0: this.positionsRect[3],
        y0: this.positionsRect[4],
        z0: this.positionsRect[5],
        x1: this.positionsRect[6],
        y1: this.positionsRect[7],
        z1: this.positionsRect[8],
    };
    var lastWall = {
        x0: this.positions[this.count * 3 - 6],
        y0: this.positions[this.count * 3 - 5],
        z0: this.positions[this.count * 3 - 4],
        x1: this.positions[this.count * 3 - 3],
        y1: this.positions[this.count * 3 - 2],
        z1: this.positions[this.count * 3 - 1],
    };

    var start1 = new THREE.Vector2(firstWall.x0, firstWall.y0);
    var end1 = new THREE.Vector2(firstWall.x1, firstWall.y1);

    var start2 = new THREE.Vector2(lastWall.x0, lastWall.y0);
    var end2 = new THREE.Vector2(lastWall.x1, lastWall.y1);

    var cross = this.crossSection(start1, end1, start2, end2);
    // console.log("crosssssssssssssssssss4", cross);

    // rollOverMesh4.position.x = cross.x;
    // rollOverMesh4.position.y = cross.y;

};

ControlDesigner.prototype.crossSection = function (start1, end1, start2, end2) {

    var ret = {
        overlapping: false,
        x: null,
        y: null,
    }

    var maxx1 = Math.max(start1.x, end1.x), maxy1 = Math.max(start1.y, end1.y);
    var minx1 = Math.min(start1.x, end1.x), miny1 = Math.min(start1.y, end1.y);
    var maxx2 = Math.max(start2.x, end2.x), maxy2 = Math.max(start2.y, end2.y);
    var minx2 = Math.min(start2.x, end2.x), miny2 = Math.min(start2.y, end2.y);

    if (minx1 > maxx2 || maxx1 < minx2 || miny1 > maxy2 || maxy1 < miny2) {
        return ret;  // Момент, када линии имеют одну общую вершину...
    }

    var dx1 = end1.x-start1.x, dy1 = end1.y-start1.y; // Длина проекций первой линии на ось x и y
    var dx2 = end2.x-start2.x, dy2 = end2.y-start2.y; // Длина проекций второй линии на ось x и y
    var dxx = start1.x-start2.X, dyy = start1.y-start2.y;
    var div, mul;

    if ((div = dy2*dx1-dx2*dy1) == 0) {
        return ret; // Линии параллельны...
    }
    if (div > 0) {
        if ((mul = dx1*dyy-dy1*dxx) < 0 || mul > div)
            return ret; // Первый отрезок пересекается за своими границами...
        if ((mul = dx2*dyy-dy2*dxx) < 0 || mul > div)
            return ret; // Второй отрезок пересекается за своими границами...
    }

    if ((mul = -dx1*dyy-dy1*dxx) < 0 || mul > -div)
        return ret; // Первый отрезок пересекается за своими границами...
    if ((mul = -dx2*dyy-dy2*dxx) < 0 || mul > -div)
        return ret; // Второй отрезок пересекается за своими границами...

    var u = ((end2.x - start2.x)*(start1.y - start2.y) - (end2.y - start2.y)*(start1.x - start2.x))/
        ((end2.y - start2.y)*(end1.x - start1.x) - (end2.x - start2.x)*(end1.y - start1.y));

    var x = start1.x + u * (end1.x - start1.x);
    var y = start1.y + u * (end1.y - start1.y);

    ret.x = x;
    ret.y = y;
    ret.overlapping = true;

/*
this.removeObject(this, this.getObjectByName("human"));
      var geom = new THREE.BoxBufferGeometry( 10, 10, 10 );
  var mat = new THREE.MeshBasicMaterial( { color: '#ff00fa', opacity: 0.5, transparent: true } );
  var human = new THREE.Mesh( geom, mat );
  human.name = "human";
  human.position.set(x, y, 700);
  // human.visible = false;
  this.add( human );*/

    return ret;
};

ControlDesigner.prototype.unselectObject = function (object) {
    if (object) {
        var name = object.name.split('_');
        if (this.mapWallsCup.has(object.name)) {
            this.mapWallsCup.get(object.name).material.color = new THREE.Color("#9cc2d7");
        }
        if (this.mapLines.has("line_" + name[1])) {
            this.mapLines.get("line_" + name[1]).material.color = new THREE.Color("#d70003");
        }
    }
};

ControlDesigner.prototype.selectObject = function (object) {
    if (object) {
        var name = object.name.split('_');
        if (this.mapWallsCup.has(object.name)) {
            this.mapWallsCup.get(object.name).material.color = new THREE.Color("#b4e2f9");
        }

        if (this.mapLines.has("line_" + name[1])) {
            this.mapLines.get("line_" + name[1]).material.color = new THREE.Color("#302fd4");
        }
    }
};

ControlDesigner.prototype.unselectWindow = function (object) {
    if (object) {
            object.material.color = new THREE.Color("#d71cb4");
    }
};

ControlDesigner.prototype.selectWindow = function (object) {
    if (object) {
            object.material.color = new THREE.Color("#0ec921");
    }
};

ControlDesigner.prototype.unselectDoor = function (object) {
    if (object) {
            object.material.color = new THREE.Color("#4145d7");
    }
};

ControlDesigner.prototype.selectDoor = function (object) {
    if (object) {
            object.material.color = new THREE.Color("#0ec921");
    }
};

ControlDesigner.prototype.unselectPointObject = function (point) {
    if (point) {
        point.scale.set(1.0, 1.0, 1.0);
        point.material.color = new THREE.Color("#ff0000");
    }
};

ControlDesigner.prototype.selectPointObject = function (point) {
    if (point) {
        point.scale.set(1.5, 1.5, 1.5);
        point.material.color = new THREE.Color("#00d40f");
    }
};

ControlDesigner.prototype.clearMap = function  () {
    if (
        !this.groupExtrude.children.length &&
        !this.groupPlane.children.length &&
        !this.groupLinesUpdate.children.length
    ) {
        this.numWalls = 0;
        this.mapWalls.clear();
        this.mapPointObjects.clear();
        this.mapWallsCup.clear();
        this.mapLines.clear();
        this.mapProportions.clear();
    }
};

ControlDesigner.prototype.calculateScale = function (posMouse){
    var l = this.getLength(posMouse);
    if (l) {
        this.scalePlane = l / this.valueScale;
    } else {
        this.scalePlane = 1;
    }
};

ControlDesigner.prototype.getAngle = function (v1, v2) {
    var cosA = v1.dot(v2)/(v1.length() * v2.length());
    if (cosA) {
        return cosA;
    } else {
        return 0;
    }
};

ControlDesigner.prototype.getAngleDoorAndWindow = function (start, end) {
    var angle;
    var axis = new THREE.Vector2(0, 1);
    if (start.x > end.x) {
        if (start.y < end.y) {
            angle = this.getAngle(
                axis,
                new THREE.Vector2(start.x - end.x, start.y - end.y)
            );
            angle = Math.PI / 2 - Math.acos(angle) ;
        } else  if (start.y > end.y) {

            angle = this.getAngle(
                axis,
                new THREE.Vector2(end.x - start.x, end.y - start.y)
            );
            angle = Math.acos(angle) + Math.PI / 2;
        } else  if (start.y === end.y) {
            angle = 0;
        }
    } else if (start.x < end.x) {
        if (start.y < end.y) {
            angle = this.getAngle(
                axis,
                new THREE.Vector2(start.x - end.x, start.y - end.y)
            );
            angle = Math.acos(angle) + Math.PI / 2;
        } else if (start.y > end.y){

            angle = this.getAngle(
                axis,
                new THREE.Vector2(end.x - start.x, end.y - start.y)
            );
            angle = Math.PI / 2 - Math.acos(angle);
        } else  if (start.y === end.y) {
            angle = 0;
        }

    } else if (start.x === end.x) {


        angle = -Math.PI / 2 ;

    }
    return angle;
};

ControlDesigner.prototype.getVectors = function (vector, depth) {

    var mainVector = new THREE.Vector2(vector.x1 - vector.x0, vector.y1 - vector.y0);
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

/*
    this.removeObject(this, this.getObjectByName("g"));
    var geom = new THREE.BoxBufferGeometry( 10, 10, 10 );
    var mat = new THREE.MeshBasicMaterial( { color: '#ffde00', opacity: 0.5, transparent: true } );
    var human = new THREE.Mesh( geom, mat );
    human.name = "g";
    human.position.set(a.x, a.y, 700);
    // human.visible = false;
    this.add( human );


    this.removeObject(this, this.getObjectByName("f"));
    var geom = new THREE.BoxBufferGeometry( 10, 10, 10 );
    var mat = new THREE.MeshBasicMaterial( { color: '#00acff', opacity: 0.5, transparent: true } );
    var human = new THREE.Mesh( geom, mat );
    human.name = "f";
    human.position.set(c.x, c.y, 700);
    // human.visible = false;
    this.add( human );*/

    return {
        a: a,
        b: b,
        c: c,
        d: d,
        NvectorA: NvectorA,
        mainVector: mainVector
    }
};

ControlDesigner.prototype.getLength = function (posMouse){
    var vec = new THREE.Vector3(posMouse[0] - posMouse[3], posMouse[1] - posMouse[4], posMouse[2] - posMouse[5]);
    var l = vec.length();
    // console.log("l", l);
    return l;
};

ControlDesigner.prototype.getBetweenPoints = function (pointsLine, intersectPoint){
    var minD = 10000;
    var index = 1;
    for (var i = 1; i  < pointsLine.length; i++) {

        var zn = Math.sqrt(Math.pow((pointsLine[i].x - pointsLine[i-1].x), 2) + Math.pow((pointsLine[i].y - pointsLine[i-1].y), 2));
        var ch = (pointsLine[i-1].y - pointsLine[i].y) * intersectPoint.x + (pointsLine[i].x - pointsLine[i-1].x) * intersectPoint.y +
            (pointsLine[i-1].x*pointsLine[i].y - pointsLine[i].x*pointsLine[i-1].y);
        var d = ch/zn;
        if (Math.abs(d) < minD) {
            minD = Math.abs(d);
            index = i;
        }
    }
    return {
        start: new THREE.Vector2(pointsLine[index-1].x, pointsLine[index-1].y),
        end: new THREE.Vector2(pointsLine[index].x, pointsLine[index].y)
    }
};

ControlDesigner.prototype.middleWall = function ( f, posMouse ){
    var cross;
    if (f.a.y !== f.c.y) {
        if (f.a.x !== f.c.x) {
            if (new THREE.Vector2(f.c.x - f.a.x, 0).length() >
                new THREE.Vector2(0, f.c.y - f.a.y).length() ) {

                if (f.a.y < f.c.y) {
                    if (f.a.x < f.c.x) {
                        /*   >
                            -
                           -  */
                        if (posMouse.y < f.a.y || posMouse.y < f.c.y) {
                            cross = this.crossSection(f.a, f.c, posMouse, new THREE.Vector2(posMouse.x, -1000 * f.NvectorA.y));
                        } else {
                            cross = this.crossSection(f.a, f.c, posMouse, new THREE.Vector2(posMouse.x, 1000 * f.NvectorA.y));
                        }
                    } else {
                        /* <
                            -
                             - */
                        if (posMouse.y < f.a.y || posMouse.y < f.c.y) {
                            cross = this.crossSection(f.a, f.c, posMouse, new THREE.Vector2(posMouse.x, 1000 * f.NvectorA.y));
                        } else {
                            cross = this.crossSection(f.a, f.c, posMouse, new THREE.Vector2(posMouse.x, -1000 * f.NvectorA.y));
                        }
                    }
                } else {
                    if (f.a.x < f.c.x) {
                        /* -
                            -
                             > */
                        if (posMouse.y < f.c.y || posMouse.y < f.c.y) {
                            cross = this.crossSection(f.a, f.c, posMouse, new THREE.Vector2(posMouse.x, -1000 * f.NvectorA.y));
                        } else {
                            cross = this.crossSection(f.a, f.c, posMouse, new THREE.Vector2(posMouse.x, 1000 * f.NvectorA.y));
                        }
                    } else {
                        /*   -
                            -
                           < */
                        if (posMouse.y < f.c.y || posMouse.y < f.c.y) {
                            cross = this.crossSection(f.a, f.c, posMouse, new THREE.Vector2(posMouse.x, 1000 * f.NvectorA.y));
                        } else {
                            cross = this.crossSection(f.a, f.c, posMouse, new THREE.Vector2(posMouse.x, -1000 * f.NvectorA.y));
                        }
                    }
                }
                //////////////////////////
            } else {
                if (f.a.y < f.c.y) {
                    if (f.a.x < f.c.x) {
                        /*   >
                            /
                           /  */
                        if (posMouse.x < f.a.x || posMouse.x < f.c.x) {
                            cross = this.crossSection(f.a, f.c, posMouse, new THREE.Vector2(-1000 * f.NvectorA.y, posMouse.y));
                        } else {
                            cross = this.crossSection(f.a, f.c, posMouse, new THREE.Vector2(1000 * f.NvectorA.y, posMouse.y));
                        }
                    } else {
                        /* <
                            \
                             \ */
                        if (posMouse.x < f.a.x || posMouse.x < f.c.x) {
                            cross = this.crossSection(f.a, f.c, posMouse, new THREE.Vector2(1000 * f.NvectorA.y, posMouse.y));
                        } else {
                            cross = this.crossSection(f.a, f.c, posMouse, new THREE.Vector2(-1000 * f.NvectorA.y, posMouse.y));
                        }
                    }
                } else {
                    if (f.a.x < f.c.x) {
                        /* \
                            \
                             > */
                        if (posMouse.x < f.c.x || posMouse.x < f.c.x) {
                            cross = this.crossSection(f.a, f.c, posMouse, new THREE.Vector2(-1000 * f.NvectorA.y, posMouse.y));
                        } else {
                            cross = this.crossSection(f.a, f.c, posMouse, new THREE.Vector2(1000 * f.NvectorA.y, posMouse.y));
                        }
                    } else {
                        /*   /
                            /
                           < */
                        if (posMouse.x < f.c.x || posMouse.x < f.c.x) {
                            cross = this.crossSection(f.a, f.c, posMouse, new THREE.Vector2(1000 * f.NvectorA.y, posMouse.y));
                        } else {
                            cross = this.crossSection(f.a, f.c, posMouse, new THREE.Vector2(-1000 * f.NvectorA.y, posMouse.y));
                        }
                    }
                }
            }
        } else {
            if (posMouse.x < f.a.x) {
                cross = this.crossSection(f.a, f.c, posMouse, new THREE.Vector2(1000, posMouse.y));
            } else {
                cross = this.crossSection(f.a, f.c, posMouse, new THREE.Vector2(-1000, posMouse.y));
            }
        }
    } else {
        if (posMouse.y < f.a.y) {
            cross = this.crossSection(f.a, f.c, posMouse, new THREE.Vector2(posMouse.x, 1000));
        } else {
            cross = this.crossSection(f.a, f.c, posMouse, new THREE.Vector2(posMouse.x, -1000));
        }
    }
    return cross;
};

ControlDesigner.prototype.getLastPosition = function ( f, posMouse ){
    if (f.a.x !== f.c.x) {
        if (new THREE.Vector2(f.c.x - f.a.x, 0).length() >
            new THREE.Vector2(0, f.c.y - f.a.y).length() ) {
            if (f.a.x < f.c.x) {
                if (posMouse.x >= f.c.x) {
                    return (new THREE.Vector3(f.c.x, f.c.y, posMouse.z));
                } else {
                    return (new THREE.Vector3(f.a.x, f.a.y, posMouse.z));
                }
            } else {
                if (posMouse.x <= f.c.x) {
                    return (new THREE.Vector3(f.c.x, f.c.y, posMouse.z));
                } else {
                    return (new THREE.Vector3(f.a.x, f.a.y, posMouse.z));
                }
            }
        } else {
            if (f.a.y < f.c.y) {
                if (posMouse.y >= f.c.y) {
                    return (new THREE.Vector3(f.c.x, f.c.y, posMouse.z));
                } else if (posMouse.y <= f.a.y) {
                    return (new THREE.Vector3(f.a.x, f.a.y, posMouse.z));
                }
            } else {
                if (posMouse.y <= f.c.y) {
                    return (new THREE.Vector3(f.c.x, f.c.y, posMouse.z));
                } else if (posMouse.y >= f.a.y) {
                    return (new THREE.Vector3(f.a.x, f.a.y, posMouse.z));
                }
            }
        }
    } else {
        if (f.a.y < f.c.y) {
            if (posMouse.y >= f.c.y) {
                return (new THREE.Vector3(f.c.x, f.c.y, posMouse.z));
            } else if (posMouse.y <= f.a.y) {
                return (new THREE.Vector3(f.a.x, f.a.y, posMouse.z));
            }
        } else {
            if (posMouse.y <= f.c.y) {
                return (new THREE.Vector3(f.c.x, f.c.y, posMouse.z));
            } else if (posMouse.y >= f.a.y) {
                return (new THREE.Vector3(f.a.x, f.a.y, posMouse.z));
            }
        }
    }
};

ControlDesigner.prototype.getDistanceToPoint3D = function ( start0, start, end, end0 ){
    if (!this.lineDistance) {
        var geometry = new THREE.BufferGeometry();
        var positionsDistance = new Float32Array(4 * 3);
        geometry.addAttribute('position', new THREE.BufferAttribute(positionsDistance, 3));
        var material = new THREE.LineBasicMaterial({
            color: '#18c500',
            linewidth: 20,
            // transparent: true,
        });
        this.lineDistance = new THREE.Line(geometry, material);
        this.lineDistance.name = "lineDistance";
        this.add(this.lineDistance);
    }

    if (this.lineDistance) {

        var pos = this.lineDistance.geometry.attributes.position.array;

        pos[0] = end0.x;
        pos[1] = 10;
        pos[2] = -end0.y;

        pos[3] = start.x;
        pos[4] = 10;
        pos[5] = -start.y;

        pos[6] = end.x;
        pos[7] = 10;
        pos[8] = -end.y;

        pos[9] = start0.x;
        pos[10] = 10;
        pos[11] = -start0.y;

        this.lineDistance.geometry.attributes.position.needsUpdate = true;
    }
};

ControlDesigner.prototype.getDistanceToPoint2D = function ( start0, start, end, end0 ){
    if (!this.lineDistance) {
        var geometry = new THREE.BufferGeometry();
        var positionsDistance = new Float32Array(4 * 3);
        geometry.addAttribute('position', new THREE.BufferAttribute(positionsDistance, 3));
        var material = new THREE.LineBasicMaterial({
            color: '#18c500',
            linewidth: 20,
            // transparent: true,
        });
        this.lineDistance = new THREE.Line(geometry, material);
        this.lineDistance.name = "lineDistance";
        this.add(this.lineDistance);
    }

    if (this.lineDistance) {

        var pos = this.lineDistance.geometry.attributes.position.array;

        pos[0] = end0.x;
        pos[1] = end0.y;
        pos[2] = 700;

        pos[3] = start.x;
        pos[4] = start.y;
        pos[5] = 700;

        pos[6] = end.x;
        pos[7] = end.y;
        pos[8] = 700;

        pos[9] = start0.x;
        pos[10] = start0.y;
        pos[11] = 700;

        this.lineDistance.geometry.attributes.position.needsUpdate = true;
    }
};

ControlDesigner.prototype.clearDistanceToPoint = function ( start, end ){
    if (this.lineDistance) {
        var pos = this.lineDistance.geometry.attributes.position.array;
        pos[0] = 0;
        pos[1] = 0;
        pos[2] = 0;

        pos[3] = 0;
        pos[4] = 0;
        pos[5] = 0;

        pos[6] = 0;
        pos[7] = 0;
        pos[8] = 0;

        pos[9] = 0;
        pos[10] = 0;
        pos[11] = 0;
        this.lineDistance.geometry.attributes.position.needsUpdate = true;
    }
};


/////////////// Mouse event
ControlDesigner.prototype.mouseMove = function (posMouse){
    this.posMouse.copy( posMouse );
    if (this.selectedInstr) {
        document.getElementsByTagName("canvas")[0].style.cursor = 'crosshair';
        if (this.count !== 0) {
            this.updateLine(this.posMouse);
        }
    } else if (this.selectedScale) {
        document.getElementsByTagName("canvas")[0].style.cursor = 'crosshair';
        if (this.countScale !== 0) {
            this.updateLineScale(this.posMouse);
        }
    }
};

ControlDesigner.prototype.mouseMove2D = function (posMouse, intersect){
// console.log(intersect.object.name);
    posMouse.z = 710;
    if (this.selectedWindow) {
        var arr = this.selectedWindow.name.split('_');
        var line = this.mapLinesWalls.get(arr[1]);

        var v = this.getBetweenPoints(line, posMouse);

        if (v) {
            var angle = this.getAngleDoorAndWindow(v.start, v.end);

            var d = new THREE.Vector2(-(v.end.x - v.start.x), -(v.end.y - v.start.y));
            d = d.normalize();

            var vector = {
                x0: v.start.x - d.x * (this.widthWindow / 2),
                y0: v.start.y - d.y * (this.widthWindow / 2),
                z0: 0,
                x1: v.end.x + d.x * (this.widthWindow / 2),
                y1: v.end.y + d.y * (this.widthWindow / 2),
                z1: 0,
            };
            var f = this.getVectors(vector, (this.widthWall / 2));

            var cross = this.middleWall(f, posMouse);
            this.selectedWindow.rotation.z = angle;
            if (cross.overlapping) {
                this.selectedWindow.position.copy(new THREE.Vector3(cross.x, cross.y, posMouse.z));

                d = new THREE.Vector2(-(cross.x - f.a.x), -(cross.y - f.a.y));
                d = d.normalize();

                vector = {
                    x0: f.a.x + d.x * (this.widthWindow / 2),
                    y0: f.a.y + d.y * (this.widthWindow / 2),
                    z0: 0,
                    x1: cross.x + d.x * (this.widthWindow / 2),
                    y1: cross.y + d.y * (this.widthWindow / 2),
                    z1: 0,
                };
                f = this.getVectors(vector, (this.widthWall*1.5));
                this.getDistanceToPoint2D(v.start, f.d, f.b, new THREE.Vector3(cross.x + d.x * (this.widthWindow / 2), cross.y + d.y * (this.widthWindow / 2),cross.z));
                this.removeObject(this.groupProportions, this.mapProportions.get("distance_wall"));
                this.positionProportions(f.b, f.d, "distance", "wall");
            } else {
                this.selectedWindow.position.copy(this.getLastPosition(f, posMouse));
                this.removeObject(this.groupProportions, this.mapProportions.get("distance_wall"));
                this.clearDistanceToPoint();
            }
        }
    } else  if (this.selectedDoor) {
        var arr = this.selectedDoor.name.split('_');
        var line = this.mapLinesWalls.get(arr[1]);

        var v = this.getBetweenPoints(line, posMouse);

        if (v) {
            var angle = this.getAngleDoorAndWindow(v.start, v.end);

            var d = new THREE.Vector2(-(v.end.x - v.start.x), -(v.end.y - v.start.y));
            d = d.normalize();

            var vector = {
                x0: v.start.x - d.x * (this.widthDoor / 2),
                y0: v.start.y - d.y * (this.widthDoor / 2),
                z0: 0,
                x1: v.end.x + d.x * (this.widthDoor / 2),
                y1: v.end.y + d.y * (this.widthDoor / 2),
                z1: 0,
            };
            var f = this.getVectors(vector, (this.widthWall / 2));

            var cross = this.middleWall(f, posMouse);
            this.selectedDoor.rotation.z = angle;
            if (cross.overlapping) {
                this.selectedDoor.position.copy(new THREE.Vector3(cross.x, cross.y, posMouse.z));

                d = new THREE.Vector2(-(cross.x - f.a.x), -(cross.y - f.a.y));
                d = d.normalize();

                vector = {
                    x0: f.a.x + d.x * (this.widthDoor / 2),
                    y0: f.a.y + d.y * (this.widthDoor / 2),
                    z0: 0,
                    x1: cross.x + d.x * (this.widthDoor / 2),
                    y1: cross.y + d.y * (this.widthDoor / 2),
                    z1: 0,
                };
                f = this.getVectors(vector, (this.widthWall*1.5));
                this.getDistanceToPoint2D(v.start, f.d, f.b, new THREE.Vector3(cross.x + d.x * (this.widthDoor / 2), cross.y + d.y * (this.widthDoor / 2),cross.z));
                this.removeObject(this.groupProportions, this.mapProportions.get("distance_wall"));
                this.positionProportions(f.b, f.d, "distance", "wall");
//
            } else {
                this.selectedDoor.position.copy(this.getLastPosition(f, posMouse));
                this.removeObject(this.groupProportions, this.mapProportions.get("distance_wall"));
                this.clearDistanceToPoint();
            }
        }
    }
};

ControlDesigner.prototype.mouseClickDoor2D = function (intersect){
    var arr = intersect.object.name.split('_');
    if (!this.selectedInstr && !this.selectedScale) {
        if (!this.door2D && this.boolDoor && arr[0] === "wallsCup") {

            var line = this.mapLinesWalls.get(arr[1]);

            var v = this.getBetweenPoints(line, intersect.point);

            if (v) {
                var angle = this.getAngleDoorAndWindow(v.start, v.end);

                var d = new THREE.Vector2(-(v.end.x - v.start.x), -(v.end.y - v.start.y));
                d = d.normalize();

                var vector = {
                    x0: v.start.x - d.x * (this.widthDoor / 2),
                    y0: v.start.y - d.y * (this.widthDoor / 2),
                    z0: 0,
                    x1: v.end.x + d.x * (this.widthDoor / 2),
                    y1: v.end.y + d.y * (this.widthDoor / 2),
                    z1: 0,
                };
                var f = this.getVectors(vector, (this.widthWall / 2));

                var cross = this.middleWall(f, intersect.point);

                this.createCursorDoor2D();
                this.door2D.rotation.z = angle;
                this.door2D.name = this.updatedWall.toString();
                if (cross.overlapping) {
                    this.door2D.position.copy(new THREE.Vector3(cross.x, cross.y, intersect.point.z));
                    d = new THREE.Vector2(-(cross.x - f.a.x), -(cross.y - f.a.y));
                    d = d.normalize();

                    vector = {
                        x0: f.a.x + d.x * (this.widthDoor / 2),
                        y0: f.a.y + d.y * (this.widthDoor / 2),
                        z0: 0,
                        x1: cross.x + d.x * (this.widthDoor / 2),
                        y1: cross.y + d.y * (this.widthDoor / 2),
                        z1: 0,
                    };
                    f = this.getVectors(vector, (this.widthWall*1.5));
                    this.getDistanceToPoint2D(v.start, f.d, f.b, new THREE.Vector3(cross.x + d.x * (this.widthDoor / 2), cross.y + d.y * (this.widthDoor / 2),cross.z));
                    this.removeObject(this.groupProportions, this.mapProportions.get("distance_wall"));
                    this.positionProportions(f.b, f.d, "distance", "wall");
                } else {
                    this.door2D.position.copy(this.getLastPosition(f, intersect.point));
                    this.removeObject(this.groupProportions, this.mapProportions.get("distance_wall"));
                    this.clearDistanceToPoint();
                }
            }
        } else if (this.door2D) {
            if (+this.door2D.name === this.updatedWall) {
                this.addDoor2D(this.door2D, this.groupSubtractDoors.children.length, arr[1]);
            }
            this.door2D.name = this.updatedWall.toString();
        }
    }
};

ControlDesigner.prototype.mouseMoveDoor2D = function ( posMouse, intersect ){
    var arr = intersect.object.name.split('_');
    if (this.boolDoor && this.door2D /*&& arr[0] === "wallsCup"*/) {

        var line = this.mapLinesWalls.get(this.updatedWall.toString());

        var v = this.getBetweenPoints(line, posMouse);

        if (v) {
            var angle = this.getAngleDoorAndWindow(v.start, v.end);

            var d = new THREE.Vector2(-(v.end.x - v.start.x), -(v.end.y - v.start.y));
            d = d.normalize();

            var vector = {
                x0: v.start.x - d.x * (this.widthDoor / 2),
                y0: v.start.y - d.y * (this.widthDoor / 2),
                z0: 0,
                x1: v.end.x + d.x * (this.widthDoor / 2),
                y1: v.end.y + d.y * (this.widthDoor / 2),
                z1: 0,
            };
            var f = this.getVectors(vector, (this.widthWall / 2));

            var cross = this.middleWall(f, posMouse);
            this.door2D.rotation.z = angle;
            if (cross.overlapping) {
                this.door2D.position.copy(new THREE.Vector3(cross.x, cross.y, posMouse.z));
                d = new THREE.Vector2(-(cross.x - f.a.x), -(cross.y - f.a.y));
                d = d.normalize();

                vector = {
                    x0: f.a.x + d.x * (this.widthDoor / 2),
                    y0: f.a.y + d.y * (this.widthDoor / 2),
                    z0: 0,
                    x1: cross.x + d.x * (this.widthDoor / 2),
                    y1: cross.y + d.y * (this.widthDoor / 2),
                    z1: 0,
                };
                f = this.getVectors(vector, (this.widthWall*1.5));
                this.getDistanceToPoint2D(v.start, f.d, f.b, new THREE.Vector3(cross.x + d.x * (this.widthDoor / 2), cross.y + d.y * (this.widthDoor / 2),cross.z));
                this.removeObject(this.groupProportions, this.mapProportions.get("distance_wall"));
                this.positionProportions(f.b, f.d, "distance", "wall");
            } else {
                this.door2D.position.copy(this.getLastPosition(f, posMouse));
                this.removeObject(this.groupProportions, this.mapProportions.get("distance_wall"));
                this.clearDistanceToPoint();
            }
        }
    }
};

ControlDesigner.prototype.mouseClickWindow2D = function (intersect){
    var arr = intersect.object.name.split('_');
    if (!this.selectedInstr && !this.selectedScale) {
        if (!this.window2D && this.boolWindow && arr[0] === "wallsCup") {

            var line = this.mapLinesWalls.get(arr[1]);

            var v = this.getBetweenPoints(line, intersect.point);

            if (v) {
                var angle = this.getAngleDoorAndWindow(v.start, v.end);

                var d = new THREE.Vector2(-(v.end.x - v.start.x), -(v.end.y - v.start.y));
                d = d.normalize();

                var vector = {
                    x0: v.start.x - d.x * (this.widthWindow / 2),
                    y0: v.start.y - d.y * (this.widthWindow / 2),
                    z0: 0,
                    x1: v.end.x + d.x * (this.widthWindow / 2),
                    y1: v.end.y + d.y * (this.widthWindow / 2),
                    z1: 0,
                };
                var f = this.getVectors(vector, (this.widthWall / 2));

                var cross = this.middleWall(f, intersect.point);

                this.createCursorWindow2D();
                this.window2D.rotation.z = angle;
                this.window2D.name = this.updatedWall.toString();
                if (cross.overlapping) {
                    this.window2D.position.copy(new THREE.Vector3(cross.x, cross.y, intersect.point.z));
                    d = new THREE.Vector2(-(cross.x - f.a.x), -(cross.y - f.a.y));
                    d = d.normalize();

                    vector = {
                        x0: f.a.x + d.x * (this.widthWindow / 2),
                        y0: f.a.y + d.y * (this.widthWindow / 2),
                        z0: 0,
                        x1: cross.x + d.x * (this.widthWindow / 2),
                        y1: cross.y + d.y * (this.widthWindow / 2),
                        z1: 0,
                    };
                    f = this.getVectors(vector, (this.widthWall*1.5));
                    this.getDistanceToPoint2D(v.start, f.d, f.b, new THREE.Vector3(cross.x + d.x * (this.widthWall / 2), cross.y + d.y * (this.widthWall / 2),cross.z));
                    this.removeObject(this.groupProportions, this.mapProportions.get("distance_wall"));
                    this.positionProportions(f.b, f.d, "distance", "wall");
                } else {
                    this.window2D.position.copy(this.getLastPosition(f, intersect.point));
                    this.removeObject(this.groupProportions, this.mapProportions.get("distance_wall"));
                    this.clearDistanceToPoint();
                }
            }
        } else if (this.window2D) {
            if (+this.window2D.name === this.updatedWall) {
                this.addWindow2D(this.window2D, this.groupSubtractWindows.children.length, arr[1]);
            }
            this.window2D.name = this.updatedWall.toString();

        }
    }
};

ControlDesigner.prototype.mouseMoveWindow2D = function ( posMouse, intersect ){
    var arr = intersect.object.name.split('_');
    if (this.boolWindow && this.window2D /*&& arr[0] === "wallsCup"*/) {

        var line = this.mapLinesWalls.get(this.updatedWall.toString());

        var v = this.getBetweenPoints(line, posMouse);

        if (v) {
            var angle = this.getAngleDoorAndWindow(v.start, v.end);

            var d = new THREE.Vector2(-(v.end.x - v.start.x), -(v.end.y - v.start.y));
            d = d.normalize();

            var vector = {
                x0: v.start.x - d.x * (this.widthWindow / 2),
                y0: v.start.y - d.y * (this.widthWindow / 2),
                z0: 0,
                x1: v.end.x + d.x * (this.widthWindow / 2),
                y1: v.end.y + d.y * (this.widthWindow / 2),
                z1: 0,
            };
            var f = this.getVectors(vector, (this.widthWall / 2));

            var cross = this.middleWall(f, posMouse);
            this.window2D.rotation.z = angle;
            if (cross.overlapping) {
                this.window2D.position.copy(new THREE.Vector3(cross.x, cross.y, posMouse.z));
                d = new THREE.Vector2(-(cross.x - f.a.x), -(cross.y - f.a.y));
                d = d.normalize();

                vector = {
                    x0: f.a.x + d.x * (this.widthWindow / 2),
                    y0: f.a.y + d.y * (this.widthWindow / 2),
                    z0: 0,
                    x1: cross.x + d.x * (this.widthWindow / 2),
                    y1: cross.y + d.y * (this.widthWindow / 2),
                    z1: 0,
                };
                f = this.getVectors(vector, (this.widthWall*1.5));
                this.getDistanceToPoint2D(v.start, f.d, f.b, new THREE.Vector3(cross.x + d.x * (this.widthWall / 2), cross.y + d.y * (this.widthWall / 2),cross.z));
                this.removeObject(this.groupProportions, this.mapProportions.get("distance_wall"));
                this.positionProportions(f.b, f.d, "distance", "wall");
            } else {
                this.window2D.position.copy(this.getLastPosition(f, posMouse));
                this.removeObject(this.groupProportions, this.mapProportions.get("distance_wall"));
                this.clearDistanceToPoint();
            }
        }
    }
};

ControlDesigner.prototype.createCursorDoor2D = function (){
        if (this.window2D) {
            this.removeCursorWindow2D();
        }

    var geom = new THREE.PlaneGeometry( 1, 1 );
    var mat = new THREE.MeshPhongMaterial({color: "#02ffbb"});
    this.door2D = new THREE.Mesh( geom, mat );
    this.door2D.scale.set(this.widthDoor, this.depthDoor, this.heightDoor);
    this.door2D.name = "door2D";
    this.add(this.door2D);
};

ControlDesigner.prototype.removeCursorDoor2D = function (){
    this.removeObject(this, this.door2D);
    this.door2D = undefined;
    this.removeObject(this.groupProportions, this.mapProportions.get("distance_wall"));
    this.clearDistanceToPoint();
};

ControlDesigner.prototype.addDoor2D = function (object, nameWindow, nameWall){
    var geometry = new THREE.PlaneGeometry(this.widthDoor, this.depthDoor);
    var mat = new THREE.MeshBasicMaterial({color: "#4145d7"});
    var door2D = new THREE.Mesh( geometry, mat );
    door2D.name = "door-" + nameWindow + "_" + nameWall;
    door2D.position.copy(object.position);
    door2D.position.z += 10;
    door2D.rotation.copy(object.rotation);
    door2D.heightDoor = this.heightDoor;
    door2D.fromFloorDoor = this.fromFloorDoor;
    this.mapSubtractDoors.set(door2D.name, door2D);
    this.objects.push(door2D);
    this.groupSubtractDoors.add(door2D);
};

ControlDesigner.prototype.addDoor3D = function (object, nameDoor, nameWall){
    var geometry = new THREE.PlaneGeometry(this.widthDoor, this.depthDoor);
    var mat = new THREE.MeshBasicMaterial({color: "#4145d7"});
    var door3D = new THREE.Mesh( geometry, mat );
    door3D.name = "door-" + nameDoor + "_" + nameWall;
    door3D.position.x = object.position.x;
    door3D.position.y = -object.position.z;
    door3D.position.z = 710;
    door3D.rotation.z = object.rotation.y;
    door3D.heightDoor = this.heightDoor;
    door3D.fromFloorDoor = this.fromFloorDoor;
    this.mapSubtractDoors.set(door3D.name, door3D);
    this.objects.push(door3D);
    this.groupSubtractDoors.add(door3D);
};

ControlDesigner.prototype.addWindow2D = function (object, nameDoor, nameWall){
    var geometry = new THREE.PlaneGeometry(this.widthWindow, this.depthWindow);
    var mat = new THREE.MeshBasicMaterial({color: "#d71cb4"});
    var window2D = new THREE.Mesh( geometry, mat );
    window2D.name = "window-" +  nameDoor + "_" + nameWall;
    window2D.position.copy(object.position);
    window2D.position.z += 10;
    window2D.rotation.copy(object.rotation);
    window2D.heightWindow = this.heightWindow;
    window2D.fromFloorWindow = this.fromFloorWindow;
    this.mapSubtractWindows.set(window2D.name, window2D);
    this.objects.push(window2D);
    this.groupSubtractWindows.add(window2D);
};

ControlDesigner.prototype.addWindow3D = function (object, nameWindow, nameWall){
    var geometry = new THREE.PlaneGeometry(this.widthWindow, this.depthWindow);
    var mat = new THREE.MeshBasicMaterial({color: "#d71cb4"});
    var window3D = new THREE.Mesh( geometry, mat );
    window3D.name = "window-" + nameWindow + "_" + nameWall;
    window3D.position.x = object.position.x;
    window3D.position.y = -object.position.z;
    window3D.position.z = 710;
    window3D.rotation.z = object.rotation.y;
    window3D.heightWindow = this.heightWindow;
    window3D.fromFloorWindow = this.fromFloorWindow;
    this.mapSubtractWindows.set(window3D.name, window3D);
    this.objects.push(window3D);
    this.groupSubtractWindows.add(window3D);
};

ControlDesigner.prototype.createCursorWindow2D = function (){
        if (this.door2D) {
          this.removeCursorDoor2D();
        }

    var geom = new THREE.PlaneGeometry( 1, 1 );
    var mat = new THREE.MeshPhongMaterial({color: "#c0ff00"});
    this.window2D = new THREE.Mesh( geom, mat );
    this.window2D.scale.set(this.widthWindow, this.depthWindow, this.heightWindow);
    this.window2D.name = "door2D";
    this.add(this.window2D);
};

ControlDesigner.prototype.removeCursorWindow2D = function (){
    this.removeObject(this, this.window2D);
    this.window2D = undefined;
    this.removeObject(this.groupProportions, this.mapProportions.get("distance_wall"));
    this.clearDistanceToPoint();
};

ControlDesigner.prototype.mouseClick2D = function (intersect){
    var arr = intersect.object.name.split('_');

    if (intersect.object.name === "floor" && !this.selectedInstr && !this.selectedScale) {
        this.unselectPointObject(this.selectedPoint);
        transformControl.detach(this.selectedPoint);
        this.selectedPoint = null;

        this.unselectObject(this.selectedObject);
        this.selectedObject = null;

     /*   this.unselectDoor(this.selectedDoor);
        this.selectedDoor = null;

        this.unselectWindow(this.selectedWindow);
        this.selectedWindow = null;*/
    }

    if (this.selectedInstr) {

        if ( Math.abs( new THREE.Vector2(
                this.positions[this.count * 3 - 6] - this.posMouse.x,
                this.positions[this.count * 3 - 5] - this.posMouse.y
                                        ).length() ) < this.radiusClick && this.count > 0) {

            this.count--;
            this.count1 -= 2;
            this.extrudePath();
            this.clearPointsPosition();
            changeInstrument();
            this.selectedObject = null;
            this.selectedPoint = null;

            this.lineHorizontal.visible = false;
            this.lineVertical.visible = false;
        } else {
            if (this.count === 0) {
                this.addPoint(this.posMouse);
            }
            this.addPoint(this.posMouse);
        }
    } else if (this.selectedScale) {
        if ( Math.round(this.positionsScale[this.countScale * 3 - 3]) === Math.round(this.posMouse.x) &&
             Math.round(this.positionsScale[this.countScale * 3 - 2]) === Math.round(this.posMouse.y) ) {
            changeScale();
            this.calculateScale(this.positionsScale);
        } else {
            if (this.countScale === 0) {
                this.addPointScale(this.posMouse);
            }
            this.addPointScale(this.posMouse);
        }
    } else  if (transformControl.object) {
        if (this.selectedPoint !== transformControl.object && this.selectedPoint) {
            this.unselectObject(this.selectedObject);
            this.selectedPoint = null;
        }

        this.selectedPoint = transformControl.object;
        this.selectPointObject(this.selectedPoint);

        this.unselectObject(this.selectedObject);
        this.selectedObject = null;
    } else {
        this.unselectPointObject(this.selectedPoint);
        transformControl.detach(this.selectedPoint);
        this.selectedPoint = null;
    }
    if (arr[0] === "wallsCup" && !this.selectedInstr && !this.selectedScale) {

        this.updatedWall = +arr[1];

        this.unselectPointObject(this.selectedPoint);
        transformControl.detach(this.selectedPoint);
        this.selectedPoint = null;

        this.unselectObject(this.selectedObject);

        this.selectedObject = intersect.object;

        this.selectObject(this.selectedObject);

    } else {
        this.unselectObject(this.selectedObject);
        this.selectedObject = null;
    }

    if (arr[0].split('-')[0] === "window") {

        if (!this.selectedWindow) {
            this.unselectPointObject(this.selectedPoint);
            transformControl.detach(this.selectedPoint);
            this.selectedPoint = null;

            this.unselectObject(this.selectedObject);
            this.selectedObject = null;

            this.unselectDoor(this.selectedDoor);
            this.selectedDoor = null;

            this.unselectWindow(this.selectedWindow);
            this.selectedWindow = intersect.object;
            this.selectWindow(this.selectedWindow);
        } else {
            this.unselectWindow(this.selectedWindow);
            this.selectedWindow = null;
            this.removeObject(this.groupProportions, this.mapProportions.get("distance_wall"));
            this.clearDistanceToPoint();
        }
    } /*else {
        this.unselectWindow(this.selectedWindow);
        this.selectedWindow = null;
        this.removeObject(this.groupProportions, this.mapProportions.get("distance_wall"));
        this.clearDistanceToPoint();
    }*/
    if (arr[0].split('-')[0] === "door") {

        if (!this.selectedDoor) {
            this.unselectPointObject(this.selectedPoint);
            transformControl.detach(this.selectedPoint);
            this.selectedPoint = null;

            this.unselectObject(this.selectedObject);
            this.selectedObject = null;

            this.unselectWindow(this.selectedWindow);
            this.selectedWindow = null;

            this.unselectDoor(this.selectedDoor);
            this.selectedDoor = intersect.object;
            this.selectDoor(this.selectedDoor);
        } else {
            this.unselectDoor(this.selectedDoor);
            this.selectedDoor = null;
            this.removeObject(this.groupProportions, this.mapProportions.get("distance_wall"));
            this.clearDistanceToPoint();
        }
    } /*else {
        this.unselectDoor(this.selectedDoor);
        this.selectedDoor = null;
        this.removeObject(this.groupProportions, this.mapProportions.get("distance_wall"));
        this.clearDistanceToPoint();
    }*/
};

ControlDesigner.prototype.mouseClick3D = function (intersect){
    var arr = intersect.object.name.split('_');
    console.log(intersect.object.name);
    if (!this.window && !this.boolWindow) {
        if (arr[0].split('-')[0] === "window") {
            if (!this.selectedWindow) {
                this.unselectPointObject(this.selectedPoint);
                transformControl.detach(this.selectedPoint);
                this.selectedPoint = null;

                this.unselectObject(this.selectedObject);
                this.selectedObject = null;

                this.unselectDoor(this.selectedDoor);
                this.selectedDoor = null;

                this.unselectWindow(this.selectedWindow);
                this.selectedWindow = intersect.object;
                this.selectWindow(this.selectedWindow);
            } else {
                this.unselectWindow(this.selectedWindow);
                this.selectedWindow.scale.z = 1.0;
                this.selectedWindow = null;
                this.removeObject(this.groupProportions3D, this.mapProportions.get("distance_wall"));
                this.clearDistanceToPoint();
                this.rebuild();
            }
        } else {
            // this.unselectWindow(this.selectedWindow);
            // this.selectedWindow = null;
        }
    }
    if (!this.door && !this.boolDoor) {
        if (arr[0].split('-')[0] === "door") {

            if (!this.selectedDoor) {
                this.unselectPointObject(this.selectedPoint);
                transformControl.detach(this.selectedPoint);
                this.selectedPoint = null;

                this.unselectObject(this.selectedObject);
                this.selectedObject = null;

                this.unselectWindow(this.selectedWindow);
                this.selectedWindow = null;

                this.unselectDoor(this.selectedDoor);
                this.selectedDoor = intersect.object;
                this.selectDoor(this.selectedDoor);
            } else {
                this.unselectDoor(this.selectedDoor);
                this.selectedDoor.scale.z = 1.0;
                this.selectedDoor = null;
                this.removeObject(this.groupProportions3D, this.mapProportions.get("distance_wall"));
                this.clearDistanceToPoint();
                this.rebuild();
            }
        } else {
             // this.unselectDoor(this.selectedDoor);
             // this.selectedDoor = null;
        }
    }
};

ControlDesigner.prototype.mouseClickDoor3D = function (intersect){
    var arr = intersect.object.name.split('_');
    if (!this.door && this.boolDoor && arr[0] === "walls") {
        this.createCursorDoor3D();

        var line = this.mapLinesWalls.get(arr[1]);

        var v = this.getBetweenPoints(line, new THREE.Vector3(intersect.point.x, -intersect.point.z, 0));

        if (v) {
            var angle = this.getAngleDoorAndWindow(v.start, v.end);

            var d = new THREE.Vector2(-(v.end.x - v.start.x), -(v.end.y - v.start.y));
            d = d.normalize();

            var vector = {
                x0: v.start.x - d.x * (this.widthDoor / 2),
                y0: v.start.y - d.y * (this.widthDoor / 2),
                z0: 0,
                x1: v.end.x + d.x * (this.widthDoor / 2),
                y1: v.end.y + d.y * (this.widthDoor / 2),
                z1: 0,
            };
            var f = this.getVectors(vector, (this.widthWall / 2));

            var cross = this.middleWall(f, new THREE.Vector3(intersect.point.x, -intersect.point.z, 0) );
            this.door.rotation.y = angle;
            if (cross.overlapping) {
                this.door.position.copy(new THREE.Vector3(cross.x, (this.heightDoor/2 + this.fromFloorDoor), -cross.y));
                d = new THREE.Vector2(-(cross.x - f.a.x), -(cross.y - f.a.y));
                d = d.normalize();

                vector = {
                    x0: f.a.x + d.x * (this.widthDoor / 2),
                    y0: f.a.y + d.y * (this.widthDoor / 2),
                    z0: 0,
                    x1: cross.x + d.x * (this.widthDoor / 2),
                    y1: cross.y + d.y * (this.widthDoor / 2),
                    z1: 0,
                };
                f = this.getVectors(vector, (this.widthWall*2));
                this.getDistanceToPoint3D(v.start, f.d, f.b, new THREE.Vector3(cross.x + d.x * (this.widthDoor / 2), cross.y + d.y * (this.widthDoor / 2),cross.z));
                this.removeObject(this.groupProportions3D, this.mapProportions.get("distance_wall"));
                this.positionProportions3D(f.b, f.d, "distance", "wall");
            } else {
                var pos = this.getLastPosition(f, new THREE.Vector3(intersect.point.x, -intersect.point.z, 0));
                this.door.position.copy(new THREE.Vector3(pos.x, (this.heightDoor/2 + this.fromFloorDoor), -pos.y ));
                this.removeObject(this.groupProportions3D, this.mapProportions.get("distance_wall"));
                this.clearDistanceToPoint();
            }
        }
    } else if (this.door && arr[0] === "walls" ) {

        this.addDoor3D(this.door, this.groupSubtractDoors.children.length, arr[1]);
        this.rebuild();
    }
};

ControlDesigner.prototype.mouseClickWindow3D = function (intersect){
    var arr = intersect.object.name.split('_');
    if (!this.window && this.boolWindow && arr[0] === "walls") {
        this.createCursorWindow3D();

        var line = this.mapLinesWalls.get(arr[1]);

        var v = this.getBetweenPoints(line, new THREE.Vector3(intersect.point.x, -intersect.point.z, 0));

        if (v) {
            var angle = this.getAngleDoorAndWindow(v.start, v.end);

            var d = new THREE.Vector2(-(v.end.x - v.start.x), -(v.end.y - v.start.y));
            d = d.normalize();

            var vector = {
                x0: v.start.x - d.x * (this.widthWindow / 2),
                y0: v.start.y - d.y * (this.widthWindow / 2),
                z0: 0,
                x1: v.end.x + d.x * (this.widthWindow / 2),
                y1: v.end.y + d.y * (this.widthWindow / 2),
                z1: 0,
            };
            var f = this.getVectors(vector, (this.widthWall / 2));

            var cross = this.middleWall(f, new THREE.Vector3(intersect.point.x, -intersect.point.z, 0) );
            this.window.rotation.y = angle;
            if (cross.overlapping) {
                this.window.position.copy(new THREE.Vector3(cross.x, ((this.heightWindow/2) + this.fromFloorWindow), -cross.y));
                d = new THREE.Vector2(-(cross.x - f.a.x), -(cross.y - f.a.y));
                d = d.normalize();

                vector = {
                    x0: f.a.x + d.x * (this.widthWindow / 2),
                    y0: f.a.y + d.y * (this.widthWindow / 2),
                    z0: 0,
                    x1: cross.x + d.x * (this.widthWindow / 2),
                    y1: cross.y + d.y * (this.widthWindow / 2),
                    z1: 0,
                };
                f = this.getVectors(vector, (this.widthWall*1.5));
                this.getDistanceToPoint2D(v.start, f.d, f.b, new THREE.Vector3(cross.x + d.x * (this.widthWall / 2), cross.y + d.y * (this.widthWall / 2),cross.z));
                this.removeObject(this.groupProportions3D, this.mapProportions.get("distance_wall"));
                this.positionProportions3D(f.b, f.d, "distance", "wall");
            } else {
                var pos = this.getLastPosition(f, new THREE.Vector3(intersect.point.x, -intersect.point.z, 0));
                this.window.position.copy(new THREE.Vector3(pos.x, ((this.heightWindow/2) + this.fromFloorWindow), -pos.y ));
                this.removeObject(this.groupProportions3D, this.mapProportions.get("distance_wall"));
                this.clearDistanceToPoint();
            }
        }
    } else if (this.window && arr[0] === "walls" ) {
        this.addWindow3D(this.window, this.groupSubtractWindows.children.length, arr[1]);
        this.rebuild();
    }
};

ControlDesigner.prototype.mouseMove3D = function ( intersect ){
    // console.log(intersect.object.name);
    if (this.selectedWindow) {
        var arr = this.selectedWindow.name.split('_');
        var line = this.mapLinesWalls.get(arr[1]);

        var v = this.getBetweenPoints(line, new THREE.Vector3(intersect.point.x, -intersect.point.z, 0));

        if (v) {
            var angle = this.getAngleDoorAndWindow(v.start, v.end);

            var d = new THREE.Vector2(-(v.end.x - v.start.x), -(v.end.y - v.start.y));
            d = d.normalize();

            var vector = {
                x0: v.start.x - d.x * (this.widthWindow / 2),
                y0: v.start.y - d.y * (this.widthWindow / 2),
                z0: 0,
                x1: v.end.x + d.x * (this.widthWindow / 2),
                y1: v.end.y + d.y * (this.widthWindow / 2),
                z1: 0,
            };
            var f = this.getVectors(vector, (this.widthWall / 2));

            var cross = this.middleWall(f, new THREE.Vector3(intersect.point.x, -intersect.point.z, 0) );
            this.selectedWindow.rotation.y = angle;
            if (cross.overlapping) {
                this.selectedWindow.position.copy(new THREE.Vector3(cross.x, this.fromFloorWindow, -cross.y));
                this.mapSubtractWindows.get(this.selectedWindow.name).position.x = this.selectedWindow.position.x;
                this.mapSubtractWindows.get(this.selectedWindow.name).position.y = -this.selectedWindow.position.z;
                this.mapSubtractWindows.get(this.selectedWindow.name).rotation.z = this.selectedWindow.rotation.y;
             //   this.rebuild();
                this.selectedWindow = this.mapWindows.get(this.selectedWindow.name);
                this.selectedWindow.scale.z = 1.05;
                this.selectWindow(this.selectedWindow);

                d = new THREE.Vector2(-(cross.x - f.a.x), -(cross.y - f.a.y));
                d = d.normalize();

                vector = {
                    x0: f.a.x + d.x * (this.widthWindow / 2),
                    y0: f.a.y + d.y * (this.widthWindow / 2),
                    z0: 0,
                    x1: cross.x + d.x * (this.widthWindow / 2),
                    y1: cross.y + d.y * (this.widthWindow / 2),
                    z1: 0,
                };
                f = this.getVectors(vector, (this.widthWall*2));
                this.getDistanceToPoint3D(v.start, f.d, f.b, new THREE.Vector3(cross.x + d.x * (this.widthWindow / 2), cross.y + d.y * (this.widthWindow / 2),cross.z));
                this.removeObject(this.groupProportions3D, this.mapProportions.get("distance_wall"));
                this.positionProportions3D(f.b, f.d, "distance", "wall");
            } else {
                var pos = this.getLastPosition(f, new THREE.Vector3(intersect.point.x, -intersect.point.z, 0));
                this.selectedWindow.position.copy(new THREE.Vector3(pos.x, this.fromFloorWindow, -pos.y ));
                this.mapSubtractWindows.get(this.selectedWindow.name).position.x = this.selectedWindow.position.x;
                this.mapSubtractWindows.get(this.selectedWindow.name).position.y = -this.selectedWindow.position.z;
                this.mapSubtractWindows.get(this.selectedWindow.name).rotation.z = this.selectedWindow.rotation.y;
            //    this.rebuild();
                this.selectedWindow = this.mapWindows.get(this.selectedWindow.name);
                this.selectedWindow.scale.z = 1.05;
                this.selectWindow(this.selectedWindow);
                this.removeObject(this.groupProportions3D, this.mapProportions.get("distance_wall"));
                this.clearDistanceToPoint();
            }
        }
    } else if (this.selectedDoor) {
        var arr = this.selectedDoor.name.split('_');
        var line = this.mapLinesWalls.get(arr[1]);

        var v = this.getBetweenPoints(line, new THREE.Vector3(intersect.point.x, -intersect.point.z, 0));

        if (v) {
            var angle = this.getAngleDoorAndWindow(v.start, v.end);

            var d = new THREE.Vector2(-(v.end.x - v.start.x), -(v.end.y - v.start.y));
            d = d.normalize();

            var vector = {
                x0: v.start.x - d.x * (this.widthDoor / 2),
                y0: v.start.y - d.y * (this.widthDoor / 2),
                z0: 0,
                x1: v.end.x + d.x * (this.widthDoor / 2),
                y1: v.end.y + d.y * (this.widthDoor / 2),
                z1: 0,
            };
            var f = this.getVectors(vector, (this.widthWall / 2));

            var cross = this.middleWall(f, new THREE.Vector3(intersect.point.x, -intersect.point.z, 0) );
            this.selectedDoor.rotation.y = angle;
            if (cross.overlapping) {
                this.selectedDoor.position.copy(new THREE.Vector3(cross.x, this.fromFloorDoor, -cross.y));
                this.mapSubtractDoors.get(this.selectedDoor.name).position.x = this.selectedDoor.position.x;
                this.mapSubtractDoors.get(this.selectedDoor.name).position.y = -this.selectedDoor.position.z;
                this.mapSubtractDoors.get(this.selectedDoor.name).rotation.z = this.selectedDoor.rotation.y;
                // this.rebuild();
                this.selectedDoor = this.mapDoors.get(this.selectedDoor.name);
                this.selectedDoor.scale.z = 1.05;
                this.selectDoor(this.selectedDoor);

                d = new THREE.Vector2(-(cross.x - f.a.x), -(cross.y - f.a.y));
                d = d.normalize();

                vector = {
                    x0: f.a.x + d.x * (this.widthDoor / 2),
                    y0: f.a.y + d.y * (this.widthDoor / 2),
                    z0: 0,
                    x1: cross.x + d.x * (this.widthDoor / 2),
                    y1: cross.y + d.y * (this.widthDoor / 2),
                    z1: 0,
                };
                f = this.getVectors(vector, (this.widthWall*2));
                this.getDistanceToPoint3D(v.start, f.d, f.b, new THREE.Vector3(cross.x + d.x * (this.widthDoor / 2), cross.y + d.y * (this.widthDoor / 2),cross.z));
                this.removeObject(this.groupProportions3D, this.mapProportions.get("distance_wall"));
                this.positionProportions3D(f.b, f.d, "distance", "wall");
            } else {
                var pos = this.getLastPosition(f, new THREE.Vector3(intersect.point.x, -intersect.point.z, 0));
                this.selectedDoor.position.copy(new THREE.Vector3(pos.x, this.fromFloorDoor, -pos.y ));
                this.mapSubtractDoors.get(this.selectedDoor.name).position.x = this.selectedDoor.position.x;
                this.mapSubtractDoors.get(this.selectedDoor.name).position.y = -this.selectedDoor.position.z;
                this.mapSubtractDoors.get(this.selectedDoor.name).rotation.z = this.selectedDoor.rotation.y;
                // this.rebuild();
                this.selectedDoor = this.mapDoors.get(this.selectedDoor.name);
                this.selectedDoor.scale.z = 1.05;
                this.selectDoor(this.selectedDoor);
                this.removeObject(this.groupProportions3D, this.mapProportions.get("distance_wall"));
                this.clearDistanceToPoint();

            }
        }
    }
};

ControlDesigner.prototype.mouseMoveDoor3D = function ( posMouse, intersect ){
    var arr = intersect.object.name.split('_');
    if (this.door && arr[0] === "walls") {
        var line = this.mapLinesWalls.get(arr[1]);

        var v = this.getBetweenPoints(line, new THREE.Vector3(intersect.point.x, -intersect.point.z, 0));

        if (v) {
            var angle = this.getAngleDoorAndWindow(v.start, v.end);

            var d = new THREE.Vector2(-(v.end.x - v.start.x), -(v.end.y - v.start.y));
            d = d.normalize();

            var vector = {
                x0: v.start.x - d.x * (this.widthDoor / 2),
                y0: v.start.y - d.y * (this.widthDoor / 2),
                z0: 0,
                x1: v.end.x + d.x * (this.widthDoor / 2),
                y1: v.end.y + d.y * (this.widthDoor / 2),
                z1: 0,
            };
            var f = this.getVectors(vector, (this.widthWall / 2));

            var cross = this.middleWall(f, new THREE.Vector3(intersect.point.x, -intersect.point.z, 0) );
            this.door.rotation.y = angle;
            if (cross.overlapping) {
                this.door.position.copy(new THREE.Vector3(cross.x, (this.heightDoor/2 + this.fromFloorDoor), -cross.y));
                d = new THREE.Vector2(-(cross.x - f.a.x), -(cross.y - f.a.y));
                d = d.normalize();

                vector = {
                    x0: f.a.x + d.x * (this.widthDoor / 2),
                    y0: f.a.y + d.y * (this.widthDoor / 2),
                    z0: 0,
                    x1: cross.x + d.x * (this.widthDoor / 2),
                    y1: cross.y + d.y * (this.widthDoor / 2),
                    z1: 0,
                };
                f = this.getVectors(vector, (this.widthWall*2));
                this.getDistanceToPoint3D(v.start, f.d, f.b, new THREE.Vector3(cross.x + d.x * (this.widthDoor / 2), cross.y + d.y * (this.widthDoor / 2),cross.z));
                this.removeObject(this.groupProportions3D, this.mapProportions.get("distance_wall"));
                this.positionProportions3D(f.b, f.d, "distance", "wall");
            } else {
                var pos = this.getLastPosition(f, new THREE.Vector3(intersect.point.x, -intersect.point.z, 0));
                this.door.position.copy(new THREE.Vector3(pos.x, (this.heightDoor/2 + this.fromFloorDoor), -pos.y ));
                this.removeObject(this.groupProportions3D, this.mapProportions.get("distance_wall"));
                this.clearDistanceToPoint();
            }
        }
    }
};

ControlDesigner.prototype.mouseMoveWindow3D = function ( posMouse, intersect ){
    var arr = intersect.object.name.split('_');
    if (this.window && arr[0] === "walls") {

        var line = this.mapLinesWalls.get(arr[1]);

        var v = this.getBetweenPoints(line, new THREE.Vector3(intersect.point.x, -intersect.point.z, 0));

        if (v) {
            var angle = this.getAngleDoorAndWindow(v.start, v.end);

            var d = new THREE.Vector2(-(v.end.x - v.start.x), -(v.end.y - v.start.y));
            d = d.normalize();

            var vector = {
                x0: v.start.x - d.x * (this.widthWindow / 2),
                y0: v.start.y - d.y * (this.widthWindow / 2),
                z0: 0,
                x1: v.end.x + d.x * (this.widthWindow / 2),
                y1: v.end.y + d.y * (this.widthWindow / 2),
                z1: 0,
            };
            var f = this.getVectors(vector, (this.widthWall / 2));

            var cross = this.middleWall(f, new THREE.Vector3(intersect.point.x, -intersect.point.z, 0));
            this.window.rotation.y = angle;
            if (cross.overlapping) {
                this.window.position.copy(new THREE.Vector3(cross.x, ((this.heightWindow/2) + this.fromFloorWindow), -cross.y));
                d = new THREE.Vector2(-(cross.x - f.a.x), -(cross.y - f.a.y));
                d = d.normalize();

                vector = {
                    x0: f.a.x + d.x * (this.widthWindow / 2),
                    y0: f.a.y + d.y * (this.widthWindow / 2),
                    z0: 0,
                    x1: cross.x + d.x * (this.widthWindow / 2),
                    y1: cross.y + d.y * (this.widthWindow / 2),
                    z1: 0,
                };
                f = this.getVectors(vector, (this.widthWall*2));
                this.getDistanceToPoint3D(v.start, f.d, f.b, new THREE.Vector3(cross.x + d.x * (this.widthWindow / 2), cross.y + d.y * (this.widthWindow / 2),cross.z));
                this.removeObject(this.groupProportions3D, this.mapProportions.get("distance_wall"));
                this.positionProportions3D(f.b, f.d, "distance", "wall");
            } else {
                var pos = this.getLastPosition(f, new THREE.Vector3(intersect.point.x, -intersect.point.z, 0));
                this.window.position.copy(new THREE.Vector3(pos.x, ((this.heightWindow/2) + this.fromFloorWindow), -pos.y));
                this.removeObject(this.groupProportions3D, this.mapProportions.get("distance_wall"));
                this.clearDistanceToPoint();
            }
        }
    }
};