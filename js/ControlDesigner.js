function ControlDesigner(textureSpritePointScale) {
    THREE.Object3D.apply(this);
    this.name = "ControlDesigner";

    this.menuObject = new MenuObject();
    this.objectParametersMenu = new ObjectParametersMenu();
    this.menu2D = new Menu2D();
    this.menuScaling = new MenuScaling();

    this.textureSpritePointScale = textureSpritePointScale;

    this.planeBackground = null;

    this.selectedObject = null;
    this.selectedPoint = null;

    this.selectedSubtractObject = null;

    this.lineHorizontal = null;
    this.lineVertical = null;

    this.lineDistance = null;

    this.boolCursor = false;

    this.tempPosition = new THREE.Vector3();

    this.widthSubtractObject = 100;
    this.heightSubtractObject = 210;
    this.depthSubtractObject = 20;

    this.fromFloorSubtractObject = 0;

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
    this.heightWall = 280;
    this.valueScale = 1;

    this.selectedInstr = false;
    this.selectedScale = false;

    this.objects = [];

    this.posMouse = new THREE.Vector3();

    this.mapWallsCup = new Map();
    this.mapSubtractObjects = new Map();
    this.mapSubtract = new Map();
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

    this.groupPlaneX = new THREE.Object3D();
    this.groupPlaneX.name = "groupPlaneX";
    // this.add(this.groupPlaneX);

    this.groupExtrude = new THREE.Object3D();
    this.groupExtrude.name = "groupExtrude";
    this.groupExtrude.visible = false;
    this.add(this.groupExtrude);

    this.groupFinishedWalls = new THREE.Object3D();
    this.groupFinishedWalls.name = "groupFinishedWalls";
    this.groupFinishedWalls.visible = false;
    this.add(this.groupFinishedWalls);

    this.groupSubtract = new THREE.Object3D();
    this.groupSubtract.name = "groupSubtract";
    // this.groupSubtract.visible = false;
    this.groupSubtract.nameSubtractObjects = new Map();
    this.add(this.groupSubtract);

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

    this.groupSubtractObjects = new THREE.Object3D();
    this.groupSubtractObjects.name = "groupSubtractObjects";
    this.groupSubtractObjects.visible = false;
    this.add(this.groupSubtractObjects);

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
    var material = new THREE.MeshBasicMaterial({map: texture, transparent: true, opacity: 0.25, depthTest: false});
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
    this.lineScale.frustumCulled = false;
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
    this.line.frustumCulled = false;
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
    this.lineRect.frustumCulled = false;
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
    this.lineDown.frustumCulled = false;
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
    this.removeObject(this.groupProportions, this.mapProportions.get(num + "_" + numWalls));

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
    var pointMaterial = new THREE.MeshBasicMaterial( { color: '#748a8e', /*opacity: 0.5,*/ transparent: true } );
    var point = new THREE.Mesh( pointGeometry, pointMaterial );
    point.name = num.toString() + "_" + this.numWalls;
    point.position.set(x, y ,z);
    this.mapX.set(Math.round(x), point.position);
    this.mapY.set(Math.round(y), point.position);
    this.groupPoints.add(point);
    this.mapPointObjects.set(point.name, point);
    this.objects.push(point);
    // transformControl.attach( point );
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

    this.clearGroup(this.groupProportions);
    this.mapProportions.clear();

    this.addGroupFaceWall(this.numWalls);
    // var num = 0;
    var pathPts = [];
    var mainLine = [];
    for (var i = 0; i < this.count; i++) {
        pathPts.push( new THREE.Vector2 ( this.positions[i * 3 + 0], this.positions[i * 3 + 1] ) );
        if (i > 0) {
            // this.extrudeFaceWall(pathPts[i-1], pathPts[i], this.numWalls, pathPts.length-1);
        }

        // mainLine.push( new THREE.Vector2 ( this.positions[i * 3 + 0], this.positions[i * 3 + 1] ) );
        // this.addPointObject(this.positions[i * 3 + 0], this.positions[i * 3 + 1], this.positions[i * 3 + 2], num);
      /*  if (i !== 0) {
            this.removeObject(this.groupProportions, this.mapProportions.get((num-1).toString()+ "_" + this.numWalls.toString()));
            var start = new THREE.Vector2(this.positions[i * 3 - 3], this.positions[i * 3 - 2], this.positions[i * 3 - 1]);
            var end = new THREE.Vector2(this.positions[i * 3 + 0], this.positions[i * 3 + 1], this.positions[i * 3 + 2]);
            this.positionProportions(start, end, num-1, this.numWalls.toString());
        }*/
        // num++;
    }


    for (var i = this.count1 - 1; i > -1; i--) {

        if (i !== this.count1 - 1) {
            if (
                this.positionsRect[i * 3 + 0] === this.positionsRect[i * 3 + 3] &&
                this.positionsRect[i * 3 + 1] === this.positionsRect[i * 3 + 4] &&
                this.positionsRect[i * 3 + 2] === this.positionsRect[i * 3 + 5]
            ) {
               /* if (i === 0) {
                    this.removeObject(this.groupProportions, this.mapProportions.get((pathPts.length - 1).toString()+ "_" + this.numWalls.toString()));
                    var start = new THREE.Vector2(pathPts[pathPts.length - 1].x, pathPts[pathPts.length - 1].y, pathPts[pathPts.length - 1].z);
                    var end = new THREE.Vector2(pathPts[0].x, pathPts[0].y, pathPts[0].z);
                    this.positionProportions(start, end, pathPts.length - 1, this.numWalls.toString());
                }*/
            } else {
                pathPts.push(new THREE.Vector2(this.positionsRect[i * 3 + 0], this.positionsRect[i * 3 + 1]));
                if (i > 1) {
                    // this.extrudeFaceWall(pathPts[pathPts.length-2], pathPts[pathPts.length-1], this.numWalls, pathPts.length-1);
                } else if (i === 1) {
                    // this.extrudeFaceWall(pathPts[pathPts.length-2], pathPts[pathPts.length-1], this.numWalls, pathPts.length-1);
                    // this.extrudeFaceWall(pathPts[pathPts.length-1], pathPts[0], this.numWalls, pathPts.length);
                }

                // this.addPointObject(this.positionsRect[i * 3 + 0], this.positionsRect[i * 3 + 1], this.positionsRect[i * 3 + 2], num);
               /* if (i !== 0) {
                    this.removeObject(this.groupProportions, this.mapProportions.get((pathPts.length - 2).toString()+ "_" + this.numWalls.toString()));
                    var start = new THREE.Vector2(pathPts[pathPts.length - 2].x, pathPts[pathPts.length - 2].y, pathPts[pathPts.length - 2].z);
                    var end = new THREE.Vector2(pathPts[pathPts.length - 1].x, pathPts[pathPts.length - 1].y, pathPts[pathPts.length - 1].z);
                    this.positionProportions(start, end, pathPts.length - 2, this.numWalls.toString());
                }*/
                // num++;
            }
        } else {
            pathPts.push(new THREE.Vector2(this.positionsRect[i * 3 + 0], this.positionsRect[i * 3 + 1]));
            // this.extrudeFaceWall(pathPts[pathPts.length-2], pathPts[pathPts.length-1], this.numWalls, pathPts.length-1);

            // this.addPointObject(this.positionsRect[i * 3 + 0], this.positionsRect[i * 3 + 1], this.positionsRect[i * 3 + 2], num);
           /* this.removeObject(this.groupProportions, this.mapProportions.get((pathPts.length - 2).toString()+ "_" + this.numWalls.toString()));
            var start = new THREE.Vector2(pathPts[pathPts.length - 2].x, pathPts[pathPts.length - 2].y, pathPts[pathPts.length - 2].z);
            var end = new THREE.Vector2(pathPts[pathPts.length - 1].x, pathPts[pathPts.length - 1].y, pathPts[pathPts.length - 1].z);
            this.positionProportions(start, end, pathPts.length - 2, this.numWalls.toString());*/
            // num++;
        }
    }

    this.createCup(pathPts, mainLine);
    this.createCup_alternative(pathPts, mainLine);
    // var inputShape = new THREE.Shape( pathPts );
 /*   console.log(pathPts);
    var smileyEye1Path = new THREE.Path(pathPtsX);
    smileyEye1Path.moveTo( 0, 0 );
    inputShape.holes.push( smileyEye1Path );*/

   // var extrudeSettings = { depth: this.heightWall, bevelEnabled: false, steps: 1 };
   // this.addShape( inputShape, extrudeSettings, "#9cc2d7", "#39424e", 0, 0, 0, 0, 0, 0, 1, this.numWalls );
   // this.addLineShape( inputShape, "#d70003", 0, 0, 0, 0, 0, 0, 1, this.numWalls );
    this.rebuildWall(this.numWalls);
    this.mapLinesWalls.set(this.numWalls.toString(), mainLine);
    this.numWalls++;
};

ControlDesigner.prototype.createCup_alternative = function (pathPts, mainLine) {
   /* console.log(pathPts);
    var p11 = [
        pathPts[0],
        pathPts[1],
        pathPts[2],
        pathPts[3]
    ];
    var p22 = [
        pathPts[pathPts.length - 2 - 1],
        pathPts[pathPts.length - 2 - 2],
        pathPts[pathPts.length - 2 - 3],
        pathPts[pathPts.length - 2 - 4]
    ];
    var union = new Boolean2D().union(p11, p22);

    console.log(union[0]);

    var shape = new THREE.Shape( union[0] );
    shape.autoClose = true;
    var points = shape.getPoints();
    var geometryPoints = new THREE.BufferGeometry().setFromPoints( points );
    // solid this.line
    var line = new THREE.Line( geometryPoints, new THREE.LineBasicMaterial( { color: "#ff000d", linewidth: 10/!*, transparent: true *!/} ) );
    line.position.set( 0, 10, 800 );
    line.name = "!!!!!!";
    this.add( line );*/


    var clockwiseMap = new Map();

    for (var i = 0; i < pathPts.length; i++) {

        var pX = [
            pathPts[i],
            pathPts[i+1]
        ];

        if (i === pathPts.length-1) {
            pX[1] = pathPts[0];
        }

        clockwiseMap.set(pathPts[i], pathPts[i+1]);

        for (var j = 0; j < pathPts.length; j++) {
            if (i !== j) {

                var pY = [
                    pathPts[j],
                    pathPts[j+1]
                ];

                if (j === pathPts.length-1) {
                    pY[1] = pathPts[0];
                }

                var crossA = this.crossSectionX(pX[0], pX[1], pY[0], pY[1]);

                if (crossA.overlapping) {
                    var pointA = new THREE.Vector2(crossA.x, crossA.y);
                    clockwiseMap.set(pY[0], pointA);
                    clockwiseMap.set(pointA, pX[1]);
                   // clockwiseMap.set(pathPts[j+1], pointA);
                    clockwiseMap.set(pX[0], pointA);


                } else {
                 //   clockwiseMap.set(pathPts[j], pathPts[j+1]);
                }
            }
        }


    }
this.clockwiseMap = clockwiseMap;
    var p = [];
    var begin = pathPts[0];
    p.push(begin);
    var current = clockwiseMap.get(begin);
    var index = 0;
    do {
        p.push(current);
        console.log("111111", current);
        current = clockwiseMap.get(current);
        console.log("222222", current);
        index++
    }
    while (index <= 4);

    var shape = new THREE.Shape( p );
    shape.autoClose = false;
    var points = shape.getPoints();
    var geometryPoints = new THREE.BufferGeometry().setFromPoints( points );
    // solid this.line
    var line = new THREE.Line( geometryPoints, new THREE.LineBasicMaterial( { color: "#ff000d", transparent: true } ) );
        line.position.set( 0, 10, 800 );
    line.name = "!!!!!!";
    this.add( line );

    var figure1 = new THREE.Geometry();
    for (var i = 0; i < this.groupPlaneX.children.length; i++) {
        figure1.merge(this.groupPlaneX.children[i].geometry);
    }
    figure1.mergeVertices();
    figure1.computeFaceNormals();
    figure1.computeVertexNormals();

    //  var m = this.booleanOperationX(this.groupPlaneX.children[0], this.groupPlaneX.children[2]);
    var m = new THREE.Mesh(figure1, new THREE.MeshBasicMaterial({color: "#c7f3ff", wireframe: false}));
    m.position.z = 700;
    // m.name = "example";

    m.name = "wallsCup_" + this.numWalls;
    this.mapWallsCup.set(m.name, m);
    this.objects.push(m);
    this.groupPlane.add( m );

    for (var i = 0; i < m.geometry.vertices.length; i++) {
        /*  var mesh = new THREE.Mesh(new THREE.SphereGeometry(5), new THREE.MeshBasicMaterial({color: "#ff00cf"}));
          mesh.position.copy(m.geometry.vertices[i]);
          mesh.name = i.toString();
          this.groupPoints.add(mesh);
          this.mapPointObjects.set(mesh.name, mesh);
          this.objects.push(mesh);*/

        // this.addPointObject(m.geometry.vertices[i].x, m.geometry.vertices[i].y, m.geometry.vertices[i].z, i);
    }

    this.addEdgeLine(m, this.numWalls);
};

ControlDesigner.prototype.createCup = function (pathPts, mainLine) {
    // var index = 0;
    var crossedLine = new Map();
    for (var i = 0; i < (pathPts.length/2)-1; i++) {
        var crossedLineSecond = new Map();
        var groupCross = [];
        var pX = [
            pathPts[i],
            pathPts[i+1],
            pathPts[pathPts.length - i - 2],
            pathPts[pathPts.length - i - 1]
        ];
        for (var j = 0; j < (pathPts.length/2)-1; j++) {
            // index ++;
            if (i !== j) {
                var crossA = this.crossSectionX(pathPts[pathPts.length - j - 2], pathPts[pathPts.length - j - 1], pX[0], pX[1]);
                var crossB = this.crossSectionX(pathPts[j], pathPts[j+1], pX[0], pX[1]);
                var crossC = this.crossSectionX(pathPts[pathPts.length - j - 2], pathPts[pathPts.length - j - 1], pX[2], pX[3]);
                var crossD = this.crossSectionX(pathPts[j], pathPts[j+1], pX[2], pX[3]);

                var lengthA = new THREE.Vector2().subVectors(crossA, pathPts[i]).length();
                var lengthB = new THREE.Vector2().subVectors(crossB, pathPts[i]).length();

                if (crossA.overlapping && crossB.overlapping && crossC.overlapping && crossD.overlapping) {
                    var pointA = new THREE.Vector2(crossA.x, crossA.y);
                    var pointB = new THREE.Vector2(crossB.x, crossB.y);
                    var pointC = new THREE.Vector2(crossC.x, crossC.y);
                    var pointD = new THREE.Vector2(crossD.x, crossD.y);
                    if (lengthA <= lengthB) {
                        groupCross.push([pointA, pointC, pointB, pointD]);
                    } else {
                        groupCross.push([pointB, pointD, pointA, pointC]);
                    }
                    crossedLineSecond.set(groupCross.length-1, j);
                }
            }
        }

        var st1 = pathPts[i];
        var st2 = pathPts[pathPts.length - i - 1];
        if (i === 0) {
            this.extrudeFaceWall(st2, st1, this.numWalls, i + "/" + 0 + "/" + 0 );
            this.positionProportions(st2, st1, i + "/" + 0 + "/" + 0, this.numWalls);
        }

        if (!groupCross.length) {
            var p = [
                st1,
                st2,
                pathPts[pathPts.length - i - 2],
                pathPts[i + 1]
            ];
            var shape = new THREE.Shape(p);
            var extrudeSettings = { depth: this.heightWall, bevelEnabled: false, steps: 1 };
            this.addShape( shape, extrudeSettings, "#9cc2d7", "#39424e", 0, 0, 0, 0, 0, 0, 1, this.numWalls );
            this.addShapeX(shape, "#fad9ff", 0, 0, 800, 0, 0, 0, 1, this.numWalls, i + "/" + groupCross.length);
            mainLine.push( st1 );
            mainLine.push( pathPts[i + 1] );
            this.extrudeFaceWall(pathPts[i], pathPts[i + 1], this.numWalls, i + "/" + groupCross.length + "/" + 0);
            this.positionProportions(pathPts[i], pathPts[i + 1], i + "/" + groupCross.length + "/" + 0, this.numWalls);
            this.extrudeFaceWall(pathPts[pathPts.length - i - 2], pathPts[pathPts.length - i - 1], this.numWalls, i + "/" + groupCross.length + "/" + 2);
            this.positionProportions(pathPts[pathPts.length - i - 2], pathPts[pathPts.length - i - 1], i + "/" + groupCross.length + "/" + 2, this.numWalls);
            if (i === 0) {
                this.extrudeFaceWall(pathPts[pathPts.length - i - 1], pathPts[i], this.numWalls, i + "/" + groupCross.length + "/" + 3);
                this.positionProportions(pathPts[pathPts.length - i - 1], pathPts[i], i + "/" + groupCross.length + "/" + 3, this.numWalls);
            }
            if (i === (pathPts.length/2)-2) {
                this.extrudeFaceWall(pathPts[i + 1], pathPts[pathPts.length - i - 2], this.numWalls, i + "/" + groupCross.length + "/" + 1);
                this.positionProportions(pathPts[i + 1], pathPts[pathPts.length - i - 2], i + "/" + groupCross.length + "/" + 1, this.numWalls);
            }
        } else {
            for (var k = 1; k < groupCross.length; k++) {
                for (var g = k; g > 0; g--) {
                    var lengthA = new THREE.Vector2().subVectors(st1, groupCross[g - 1][0]).length();
                    var lengthB = new THREE.Vector2().subVectors(st1, groupCross[g][0]).length();

                    if (lengthA > lengthB) {
                        var tmp = groupCross[g - 1];
                        groupCross[g - 1] = groupCross[g];
                        groupCross[g] = tmp;

                        var tmpMap = crossedLineSecond.get(g - 1);
                        crossedLineSecond.set(g - 1, crossedLineSecond.get(g));
                        crossedLineSecond.set(g, tmpMap);
                    }
                }
            }

            for (var k = 0; k < groupCross.length; k++) {
                if (groupCross[k].length) {
                    var p = [
                        st1,
                        st2,
                        groupCross[k][1],
                        groupCross[k][0]
                    ];
                    var shape = new THREE.Shape(p);
                    var extrudeSettings = { depth: this.heightWall, bevelEnabled: false, steps: 1 };
                    this.addShape( shape, extrudeSettings, "#9cc2d7", "#39424e", 0, 0, 0, 0, 0, 0, 1, this.numWalls );
                    this.addShapeX(shape, "#a9ffff", 0, 0, 800, 0, 0, 0, 1, this.numWalls, i + "/" + k);
                    mainLine.push( st1 );
                    mainLine.push( groupCross[k][0] );
                    mainLine.push( groupCross[k][2] );
                    this.extrudeFaceWall(st1, groupCross[k][0],this.numWalls, i + "/" + k + "/" + 1);
                    this.positionProportions(st1, groupCross[k][0], i + "/" + k + "/" + 1, this.numWalls);
                    this.extrudeFaceWall(groupCross[k][1], st2,this.numWalls, i + "/" + k + "/" + 2);
                    this.positionProportions(groupCross[k][1], st2, i + "/" + k + "/" + 2, this.numWalls);
                    st1 = groupCross[k][2];
                    st2 = groupCross[k][3];

                    if (!crossedLine.has(crossedLineSecond.get(k).toString() + "-" + i.toString())) {
                        var pCross = [
                            groupCross[k][1],
                            groupCross[k][0],
                            groupCross[k][2],
                            groupCross[k][3]
                        ];
                        crossedLine.set(i.toString() + "-" + crossedLineSecond.get(k).toString(), crossedLineSecond.get(k));
                        var shape = new THREE.Shape(pCross);
                        var extrudeSettings = { depth: this.heightWall, bevelEnabled: false, steps: 1 };
                        this.addShape( shape, extrudeSettings, "#9cc2d7", "#39424e", 0, 0, 0, 0, 0, 0, 1, this.numWalls );
                        this.addShapeX(shape, "#c2ffbd", 0, 0, 800, 0, 0, 0, 1, this.numWalls, i + "/" + groupCross.length + "/X" );
                    }
                }
            }

            var p = [
                st1,
                st2,
                pathPts[pathPts.length - i - 2],
                pathPts[i + 1]
            ];
            var shape = new THREE.Shape(p);
            var extrudeSettings = { depth: this.heightWall, bevelEnabled: false, steps: 1 };
            this.addShape( shape, extrudeSettings, "#9cc2d7", "#39424e", 0, 0, 0, 0, 0, 0, 1, this.numWalls );
            this.addShapeX(shape, "#fad9ff", 0, 0, 800, 0, 0, 0, 1, this.numWalls, i + "/" + groupCross.length);
            mainLine.push( pathPts[i + 1] );
            if (i === (pathPts.length / 2) - 2) {
                this.extrudeFaceWall(pathPts[i + 1], pathPts[pathPts.length - i - 2], this.numWalls, i + "/" + groupCross.length + "/" + 3);
                this.positionProportions(pathPts[i + 1], pathPts[pathPts.length - i - 2], i + "/" + groupCross.length + "/" + 3, this.numWalls);
            }
            this.extrudeFaceWall(st1, pathPts[i + 1], this.numWalls, i + "/" + groupCross.length + "/" + 4);
            this.positionProportions(st1, pathPts[i + 1], i + "/" + groupCross.length + "/" + 4, this.numWalls);
            this.extrudeFaceWall(pathPts[pathPts.length - i - 2], st2, this.numWalls, i + "/" + groupCross.length + "/" + 5);
            this.positionProportions(pathPts[pathPts.length - i - 2], st2, i + "/" + groupCross.length + "/" + 5, this.numWalls);
        }
    }
// console.log(index);

    var figure1 = new THREE.Geometry();
    for (var i = 0; i < this.groupPlaneX.children.length; i++) {
        figure1.merge(this.groupPlaneX.children[i].geometry);
    }
    figure1.mergeVertices();
    figure1.computeFaceNormals();
    figure1.computeVertexNormals();

    //  var m = this.booleanOperationX(this.groupPlaneX.children[0], this.groupPlaneX.children[2]);
    var m = new THREE.Mesh(figure1, new THREE.MeshBasicMaterial({color: "#c7f3ff", wireframe: false}));
    m.position.z = 700;
    // m.name = "example";

    m.name = "wallsCup_" + this.numWalls;
    this.mapWallsCup.set(m.name, m);
    this.objects.push(m);
    this.groupPlane.add( m );

    for (var i = 0; i < m.geometry.vertices.length; i++) {
        /*  var mesh = new THREE.Mesh(new THREE.SphereGeometry(5), new THREE.MeshBasicMaterial({color: "#ff00cf"}));
          mesh.position.copy(m.geometry.vertices[i]);
          mesh.name = i.toString();
          this.groupPoints.add(mesh);
          this.mapPointObjects.set(mesh.name, mesh);
          this.objects.push(mesh);*/

        this.addPointObject(m.geometry.vertices[i].x, m.geometry.vertices[i].y, m.geometry.vertices[i].z, i);
    }

    this.addEdgeLine(m, this.numWalls);
};

ControlDesigner.prototype.updateExtrudePathX = function (point) {

    var object = this.groupPlane.getObjectByName("wallsCup_" + this.updatedWall);
    // console.log(object);

    for (var i = 0; i < object.geometry.vertices.length; i++) {

        if (point.name === (i + "_" + this.updatedWall) ) {
            object.geometry.vertices[i].copy(point.position);
        }
    }
    object.geometry.verticesNeedUpdate = true;

    this.addEdgeLine(object, this.updatedWall);

};

ControlDesigner.prototype.addEdgeLine = function (object, nameWall) {

    this.removeObject(this.groupLinesUpdate, this.groupLinesUpdate.getObjectByName("line_" + nameWall));

    var helper = new THREE.EdgesHelper( object, "#6c838a" );
    helper.name = "line_" + nameWall.toString();
    this.mapLines.set(helper.name, helper);
    this.groupLinesUpdate.add( helper );
};

ControlDesigner.prototype.updateExtrudePath = function (position) {

    this.removeIntersectObjectsArray(this.objects, this.mapWallsCup.get("wallsCup_" + this.updatedWall.toString()));

    this.removeIntersectObjectsArray(this.objects,
        this.groupExtrude.getObjectByName("walls_" + this.updatedWall.toString()).getObjectByName("walls_" + this.updatedWall.toString() + "-0"));
    this.removeObject(this.groupExtrude.getObjectByName("walls_" + this.updatedWall.toString()),
        this.groupExtrude.getObjectByName("walls_" + this.updatedWall.toString()).getObjectByName("walls_" + this.updatedWall.toString() + "-0"));

    this.removeObject(this.groupPlane, this.mapWallsCup.get("wallsCup_" + this.updatedWall.toString()));
    this.removeObject(this.groupLinesUpdate, this.mapLines.get("line_" + this.updatedWall.toString()));

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

                    this.extrudeFaceWall(pathPts[pathPts.length-2], pathPts[pathPts.length-1], this.updatedWall, pathPts.length-1);

                    if (i < Math.round((length-1) / 2)) {
                        mainLine.push(new THREE.Vector2(position[i * 3 + 0], position[i * 3 + 1]));
                    }
                }
            } else {
                pathPts.push(new THREE.Vector2(position[i * 3 + 0], position[i * 3 + 1]));
                mainLine.push(new THREE.Vector2(position[i * 3 + 0], position[i * 3 + 1]));
            }
        }

        this.mapLinesWalls.delete(this.updatedWall.toString());
        this.mapLinesWalls.set(this.updatedWall.toString(), mainLine);

        var inputShape = new THREE.Shape(pathPts);
        var extrudeSettings = {depth: this.heightWall, bevelEnabled: false, steps: 1};
        this.addShape(inputShape, extrudeSettings, "#9cc2d7", "#39424e", 0, 0, 0, 0, 0, 0, 1, this.updatedWall);
        this.addLineShape(inputShape, "#d70003", 0, 0, 0, 0, 0, 0, 1, this.updatedWall);
        this.rebuildWall(this.updatedWall);
    }
};

ControlDesigner.prototype.addLineShape = function ( shape, color, x, y, z, rx, ry, rz, s, nameWall ) {
    // lines
    shape.autoClose = true;
    var points = shape.getPoints();
    var geometryPoints = new THREE.BufferGeometry().setFromPoints( points );
    // solid this.line
    var line = new THREE.LineSegments( geometryPoints, new THREE.LineBasicMaterial( { color: color, linewidth: 10/*, transparent: true */} ) );
    line.position.set( x, y, z + 500 );
    line.rotation.set( rx, ry, rz );
    line.scale.set( s, s, s );
    line.name = "line_" + nameWall.toString();
    this.mapLines.set(line.name, line);
    this.groupLinesUpdate.add( line );
};

ControlDesigner.prototype.addShapeX = function ( shape, colorCup, x, y, z, rx, ry, rz, s, nameWall, namePart ) {
    // flat shape
    var geometry = new THREE.ShapeGeometry( shape );
  //  geometry.rotateX(-Math.PI / 2);
    var mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: colorCup/*, wireframe: true*/ } ) );
    mesh.position.set( x, y, z );
    mesh.rotation.set( rx, ry, rz );
    mesh.scale.set( 1, 1, 1 );
    mesh.name = "wallsCupX_" + nameWall.toString() + "-" + namePart.toString();
    this.groupPlaneX.add( mesh );
};

ControlDesigner.prototype.addShape = function ( shape, extrudeSettings, colorCup, colorWall, x, y, z, rx, ry, rz, s, nameWall ) {
    // extruded shape
    var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
    geometry.rotateX(-Math.PI / 2);
    var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: colorWall/*, transparent: true, opacity: 0.75, side: THREE.DoubleSide, depthTest: false*/ } ) );
    mesh.position.set( x, y, z );
    mesh.rotation.set( rx, ry, rz );
    mesh.scale.set( s, s, s );
    mesh.name = "walls_" + nameWall.toString() + "-0";
    // mesh.castShadow = true;
    this.objects.push(mesh);
    this.groupExtrude.getObjectByName("walls_" + nameWall.toString()).add( mesh );
    // flat shape
  /*  var geometry = new THREE.ShapeBufferGeometry( shape );
    var mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: colorCup/!*, wireframe: true*!/ } ) );
    mesh.position.set( x, y, z + 700 );
    mesh.rotation.set( rx, ry, rz );
    mesh.scale.set( 1, 1, 1 );
    mesh.name = "wallsCup_" + nameWall.toString();
    this.mapWallsCup.set(mesh.name, mesh);
    this.objects.push(mesh);
    this.groupPlane.add( mesh );*/
};

ControlDesigner.prototype.addGroupFaceWall = function ( nameWall ) {
    var groupFace = new THREE.Object3D();
    groupFace.name = "walls_" + nameWall.toString();
    // this.mapWalls.set(groupFace.name, groupFace);
  //  this.objects.push(groupFace);
    this.groupExtrude.add( groupFace );
};

ControlDesigner.prototype.addFaceWall = function ( shape, extrudeSettings, colorWall, x, y, z, rx, ry, rz, s, nameWall, nameFace ) {
    // extruded shape
    var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
    geometry.rotateX(-Math.PI / 2);
    var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: colorWall/*, transparent: true, opacity: 0.75, side: THREE.DoubleSide, depthTest: false*/ } ) );
    mesh.position.set( x, y, z );
    mesh.rotation.set( rx, ry, rz );
    mesh.scale.set( s, s, s );
    mesh.name = "walls_" + nameWall.toString() + "-" + nameFace.toString();
  //  this.mapWalls.set(mesh.name, mesh);
    this.objects.push(mesh);
    this.groupExtrude.getObjectByName("walls_" + nameWall.toString()).add( mesh );
};

ControlDesigner.prototype.booleanOperation = function ( obj1, obj2 ){
    var groupFace = new THREE.Object3D();
    groupFace.name = obj1.name;

    for (var i = 0; i < obj1.children.length; i++) {

        var obj1BSP = new ThreeBSP(obj1.children[i]);

        var obj2BSP = new ThreeBSP(obj2);

        var newSubtractBSP = obj1BSP.subtract(obj2BSP).toGeometry();
        // var newUnionBSP = obj1BSP.union(obj2BSP).toGeometry();
        // var newIntersectBSP = obj1BSP.intersect(obj2BSP).toGeometry();
        var mesh = new THREE.Mesh(newSubtractBSP, obj1.children[i].material);
        mesh.name = obj1.children[i].name;
        mesh.geometry.computeFaceNormals();
        groupFace.add( mesh );
    }
    return groupFace;
};

ControlDesigner.prototype.createCursor3D = function (){
    var geom = new THREE.BoxGeometry( 1, 1, 1 );
    var mat = new THREE.MeshBasicMaterial({color: "#02ffbb", transparent: true, opacity: 0.75, depthTest: false});
    this.cursor3D = new THREE.Mesh( geom, mat );
    this.cursor3D.scale.set(this.widthSubtractObject, this.heightSubtractObject , (this.depthSubtractObject+2));
    this.cursor3D.name = "cursor3D";
    this.add(this.cursor3D);

    var helper = new THREE.EdgesHelper( this.cursor3D, "#ffd10b" );
    helper.material.transparent = true;
    helper.material.depthTest = false;
    this.cursor3D.add(helper);
};

ControlDesigner.prototype.removeCursor3D = function (){
    this.removeObject(this, this.cursor3D);
    this.cursor3D = undefined;
    this.removeObject(this.groupProportions3D, this.mapProportions.get("distance_wall"));
    this.clearDistanceToPoint();
};

ControlDesigner.prototype.rebuildAll = function (){

    var singleGeometry = new THREE.Geometry();
    for (var j = 0; j < this.groupSubtract.children.length; j++) {
        var pathPts = [];
        var g = this.groupSubtract.children[j].geometry.vertices;

        pathPts.push(g[0]);
        pathPts.push(g[1]);
        pathPts.push(g[3]);
        pathPts.push(g[2]);

        var inputShape = new THREE.Shape(pathPts);
        var extrudeSettings = {depth: this.groupSubtract.children[j].userData.height, bevelEnabled: false, steps: 1};
        var geometry = new THREE.ExtrudeGeometry(inputShape, extrudeSettings);
        geometry.rotateX(-Math.PI / 2);
        var mat = new THREE.MeshPhongMaterial({
            color: "#4145d7",
            transparent: true,
            opacity: 0.5
        });
        var mesh = new THREE.Mesh(geometry, mat);
        mesh.name = this.groupSubtract.children[j].name;
        mesh.userData = this.groupSubtract.children[j].userData;

        this.addHelper(mesh);

        if (!this.mapSubtractObjects.has(mesh.name)) {
            var loaderFBX = new THREE.FBXLoader(loadingManager);
            loaderFBX.load("models/door.fbx", function (object) {
                object.traverse(function (child) {
                    if (child.isMesh) {
                        object.name = "object";
                        mesh.add(object);
                    }
                });
            });
        } else {
            mesh.add(this.mapSubtractObjects.get(mesh.name).getObjectByName("object"));
        }

        mesh.position.x = this.groupSubtract.children[j].position.x;
        mesh.position.z = -this.groupSubtract.children[j].position.y;
        mesh.position.y = this.groupSubtract.children[j].userData.fromFloor;
        mesh.rotation.y = this.groupSubtract.children[j].rotation.z;
        mesh.updateMatrix();
        this.removeIntersectObjectsArray(this.objects, this.mapSubtractObjects.get(mesh.name));
        this.removeObject(this.groupSubtractObjects, this.mapSubtractObjects.get(mesh.name));
        this.mapSubtractObjects.set(mesh.name, mesh);
        this.objects.push(mesh);
        this.groupSubtractObjects.add(mesh);
        // this.add( new THREE.BoxHelper( mesh ) );
        singleGeometry.merge(mesh.geometry, mesh.matrix);
    }

    var meshSubtract = new THREE.Mesh(singleGeometry);

    for (var i = 0; i < this.groupExtrude.children.length; i++) {

        var m = this.groupExtrude.children[i];
        m = this.booleanOperation(m, meshSubtract);
        m.name = this.groupExtrude.children[i].name;
        // m.updateMatrix();
        this.removeIntersectObjectsArray(this.objects, this.mapWalls.get(m.name));
        this.removeObject(this.groupFinishedWalls, this.mapWalls.get(m.name));
        this.mapWalls.set(m.name, m);
        this.objects.push(m);
        this.groupFinishedWalls.add(m);
    }
};

ControlDesigner.prototype.rebuildWall = function (nameWall){

    var wall = "walls_" + nameWall.toString();

    var singleGeometry = new THREE.Geometry();

    var arr = this.groupSubtract.nameSubtractObjects.get(nameWall);
    if (arr) {
        for (var j = 0; j < arr.length; j++) {
            var pathPts = [];
            var m = this.mapSubtract.get(arr[j]);
            var g = m.geometry.vertices;

            pathPts.push(g[0]);
            pathPts.push(g[1]);
            pathPts.push(g[3]);
            pathPts.push(g[2]);

            var inputShape = new THREE.Shape(pathPts);
            var extrudeSettings = {depth: m.userData.height, bevelEnabled: false, steps: 1};
            var geometry = new THREE.ExtrudeGeometry(inputShape, extrudeSettings);
            geometry.rotateX(-Math.PI / 2);
            var mat = new THREE.MeshPhongMaterial({
                color: "#4145d7",
                transparent: true,
                opacity: 0.0
            });
            var mesh = new THREE.Mesh(geometry, mat);
            mesh.name = m.name;
            mesh.userData = m.userData;

            this.addHelper(mesh);

            if (!this.mapSubtractObjects.has(mesh.name)) {
                var loaderFBX = new THREE.FBXLoader(loadingManager);
                loaderFBX.load("models/door.fbx", function (object) {
                    object.traverse(function (child) {
                        if (child.isMesh) {
                            object.name = "object";
                            mesh.add(object);
                        }
                    });
                });
            } else {
                mesh.add(this.mapSubtractObjects.get(mesh.name).getObjectByName("object"));
            }

            mesh.position.x = m.position.x;
            mesh.position.z = -m.position.y;
            mesh.position.y = m.userData.fromFloor;
            mesh.rotation.y = m.rotation.z;
            mesh.updateMatrix();
            this.removeIntersectObjectsArray(this.objects, this.mapSubtractObjects.get(mesh.name));
            this.removeObject(this.groupSubtractObjects, this.mapSubtractObjects.get(mesh.name));
            this.mapSubtractObjects.set(mesh.name, mesh);
            this.objects.push(mesh);
            this.groupSubtractObjects.add(mesh);
            singleGeometry.merge(mesh.geometry, mesh.matrix);
        }
    }
    var meshSubtract = new THREE.Mesh(singleGeometry);


    var m = this.groupExtrude.getObjectByName(wall);

    m = this.booleanOperation(m, meshSubtract);
    m.name = wall;
    m.updateMatrix();
    this.removeIntersectObjectsArray(this.objects, this.mapWalls.get(m.name));
    this.removeObject(this.groupFinishedWalls, this.mapWalls.get(m.name));
    this.mapWalls.set(m.name, m);
  //  this.objects.push(m);
    this.groupFinishedWalls.add(m);
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

ControlDesigner.prototype.clearGroup = function ( group ) {
    for (var i = group.children.length - 1; i >= 0; i--) {
        group.remove(group.children[i]);
    }
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

ControlDesigner.prototype.crossSection = function (start1, end1, start2, end2) {

    var ret = {
        overlapping: false,
        x: null,
        y: null,
    };
    var maxx1 = Math.max(start1.x, end1.x), maxy1 = Math.max(start1.y, end1.y);
    var minx1 = Math.min(start1.x, end1.x), miny1 = Math.min(start1.y, end1.y);
    var maxx2 = Math.max(start2.x, end2.x), maxy2 = Math.max(start2.y, end2.y);
    var minx2 = Math.min(start2.x, end2.x), miny2 = Math.min(start2.y, end2.y);

    if (minx1 > maxx2 || maxx1 < minx2 || miny1 > maxy2 || maxy1 < miny2) {
        return ret;  // Момент, када линии имеют одну общую вершину...
    }


    var dx1 = end1.x-start1.x, dy1 = end1.y-start1.y; // Длина проекций первой линии на ось x и y
    var dx2 = end2.x-start2.x, dy2 = end2.y-start2.y; // Длина проекций второй линии на ось x и y
    var dxx = start1.x-start2.x, dyy = start1.y-start2.y;
    var div, mul;

    if ((div = dy2*dx1-dx2*dy1) === 0) {
        return ret; // Линии параллельны...
    }
   /* if (div > 0) {
        if ((mul = dx1*dyy-dy1*dxx) < 0 || mul > div)
            return ret; // Первый отрезок пересекается за своими границами...
        if ((mul = dx2*dyy-dy2*dxx) < 0 || mul > div)
            return ret; // Второй отрезок пересекается за своими границами...
    }

    if ((mul = -dx1*dyy-dy1*dxx) < 0 || mul > -div)
        return ret; // Первый отрезок пересекается за своими границами...
    if ((mul = -dx2*dyy-dy2*dxx) < 0 || mul > -div)
        return ret; // Второй отрезок пересекается за своими границами...*/

    var u = ((end2.x - start2.x)*(start1.y - start2.y) - (end2.y - start2.y)*(start1.x - start2.x))/
        ((end2.y - start2.y)*(end1.x - start1.x) - (end2.x - start2.x)*(end1.y - start1.y));

    var x = start1.x + u * (end1.x - start1.x);
    var y = start1.y + u * (end1.y - start1.y);

    ret.x = x;
    ret.y = y;
    ret.overlapping = true;

    return ret;
};

ControlDesigner.prototype.crossSectionX = function (start1, end1, start2, end2) {

    var ret = {
        overlapping: false,
        x: null,
        y: null,
    };

    if (
        (start1.x === start2.x && start1.y === start2.y) ||
        (start1.x === end2.x && start1.y === end2.y) ||
        (end1.x === start2.x && end1.y === start2.y) ||
        (end1.x === end2.x && end1.y === end2.y)
    ) {
        return ret; // Момент, када линии имеют одну общую вершину...
    }

//сначала расставим точки по порядку, т.е. чтобы было start1.x <= end1.x
        if (end1.x < start1.x) {
            var tmp = start1;
            start1 = end1;
            end1 = tmp;
        }

//и start2.x <= end2.x
        if (end2.x < start2.x) {
            var tmp = start2;
            start2 = end2;
            end2 = tmp;
        }

//проверим существование потенциального интервала для точки пересечения отрезков
        if (end1.x < start2.x) {
            return ret; //ибо у отрезков нету взаимной абсциссы
        }

//если оба отрезка вертикальные
        if((start1.x - end1.x == 0) && (start2.x - end2.x == 0)) {

//если они лежат на одном X
            if(start1.x == start2.x) {

//проверим пересекаются ли они, т.е. есть ли у них общий Y
//для этого возьмём отрицание от случая, когда они НЕ пересекаются
                if (!((Math.max(start1.y, end1.y) < Math.min(start2.y, end2.y)) ||
                    (Math.min(start1.y, end1.y) > Math.max(start2.y, end2.y)))) {
                    return true;
                }
            }
            return ret;
        }

//найдём коэффициенты уравнений, содержащих отрезки
//f1(x) = A1*x + b1 = y
//f2(x) = A2*x + b2 = y
//если первый отрезок вертикальный
        if (start1.x - end1.x == 0) {

//найдём Xa, Ya - точки пересечения двух прямых
            var Xa = start1.x;
            var A2 = (start2.y - end2.y) / (start2.x - end2.x);
            var b2 = start2.y - A2 * start2.x;
            var Ya = A2 * Xa + b2;
            if (start2.x <= Xa && end2.x >= Xa && Math.min(start1.y, end1.y) <= Ya &&
                Math.max(start1.y, end1.y) >= Ya) {
                ret.x = Xa;
                ret.y = Ya;
                ret.overlapping = true;
                return ret;
            }
            return ret;
        }

//если второй отрезок вертикальный
        if (start2.x - end2.x == 0) {
//найдём Xa, Ya - точки пересечения двух прямых
            var Xa = start2.x;
            var A1 = (start1.y - end1.y) / (start1.x - end1.x);
            var b1 = start1.y - A1 * start1.x;
            var Ya = A1 * Xa + b1;
            if (start1.x <= Xa && end1.x >= Xa && Math.min(start2.y, end2.y) <= Ya &&
                Math.max(start2.y, end2.y) >= Ya) {
                ret.x = Xa;
                ret.y = Ya;
                ret.overlapping = true;
                return ret;
            }
            return false;
        }

//оба отрезка невертикальные
    var A1 = (start1.y - end1.y) / (start1.x - end1.x);
    var A2 = (start2.y - end2.y) / (start2.x - end2.x);
    var b1 = start1.y - A1 * start1.x;
    var b2 = start2.y - A2 * start2.x;

        if (A1 == A2) {
            return ret; //отрезки параллельны
        }

//Xa - абсцисса точки пересечения двух прямых
    var Xa = (b2 - b1) / (A1 - A2);
    var Ya = A1 * Xa + b1 ;
        if ((Xa < Math.max(start1.x, start2.x)) || (Xa > Math.min( end1.x, end2.x))) {
            return ret; //точка Xa находится вне пересечения проекций отрезков на ось X
        } else {
            ret.x = Xa;
            ret.y = Ya;
            ret.overlapping = true;
            return ret;
        }
};

ControlDesigner.prototype.unselectObject = function (object) {
    if (object) {
        var name = object.name.split('_');
        if (this.mapWallsCup.has(object.name)) {
            this.mapWallsCup.get(object.name).material.color = new THREE.Color("#c7f3ff");
        }
        if (this.mapLines.has("line_" + name[1])) {
            this.mapLines.get("line_" + name[1]).material.color = new THREE.Color("#6c838a");
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

ControlDesigner.prototype.selectSubtractObject = function (object) {
    if (object) {
           // object.material.color = new THREE.Color("#0ec921");
            if (object.children.length) {
                object.children[0].visible = true;
            }
    }
};

ControlDesigner.prototype.selectFaceWall = function (object) {
    if (object) {
        object.material.color = new THREE.Color("#0ec921");
    }
};

ControlDesigner.prototype.unselectFaceWall = function (object) {
    if (object) {
        object.material.color = new THREE.Color("#39424e");
    }
};

ControlDesigner.prototype.unselectSubtractObject = function (object) {
    if (object) {
            object.material.color = new THREE.Color("#4145d7");
        if (object.children.length) {
            object.children[0].visible = false;
        }
    }
};

ControlDesigner.prototype.unselectPointObject = function (point) {
    if (point) {
        point.scale.set(1.0, 1.0, 1.0);
        point.material.color = new THREE.Color("#748a8e");
    }
};

ControlDesigner.prototype.selectPointObject = function (point) {
    if (point) {
        point.scale.set(1.5, 1.5, 1.5);
        point.material.color = new THREE.Color("#1300ff");
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

ControlDesigner.prototype.getMiddlePoint = function (point1, point2) {
    var middlePoint = new THREE.Vector2( (point1.x + point2.x) / 2, (point1.y + point2.y) / 2 );
    return middlePoint
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
        if ( new THREE.Vector2().subVectors(pointsLine[i], pointsLine[i-1]).length() > this.widthSubtractObject ) {

            var v = new THREE.Vector2().subVectors(pointsLine[i], pointsLine[i-1]);
            var w = new THREE.Vector2().subVectors(intersectPoint, pointsLine[i-1]);
            var c1 = v.dot(w);
            var c2 = v.dot(v);

            if (c1 >= 0 && c2 >= c1) {
                var zn = Math.sqrt(Math.pow((pointsLine[i].x - pointsLine[i - 1].x), 2) + Math.pow((pointsLine[i].y - pointsLine[i - 1].y), 2));
                var ch = (pointsLine[i - 1].y - pointsLine[i].y) * intersectPoint.x + (pointsLine[i].x - pointsLine[i - 1].x) * intersectPoint.y +
                    (pointsLine[i - 1].x * pointsLine[i].y - pointsLine[i].x * pointsLine[i - 1].y);
                var d = ch / zn;
                if (Math.abs(d) < minD) {
                    minD = Math.abs(d);
                    index = i;
                }
            }
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

ControlDesigner.prototype.getDistanceToPoint3D = function ( cross, f, v, width ){

    if (!this.lineDistance) {
        var geometry = new THREE.BufferGeometry();
        var positionsDistance = new Float32Array(4 * 3);
        geometry.addAttribute('position', new THREE.BufferAttribute(positionsDistance, 3));
        var material = new THREE.LineBasicMaterial({
            color: '#1cff00',
            linewidth: 20,
            transparent: true,
            depthTest: false
        });
        this.lineDistance = new THREE.Line(geometry, material);
        this.lineDistance.frustumCulled = false;
        this.lineDistance.name = "lineDistance";
        this.add(this.lineDistance);
    }

    var d, begin, vector, start, start0, end, end0;
    if (
        new THREE.Vector3(f.a.x - cross.x, f.a.y - cross.y, f.a.z - cross.z).length() <=
        new THREE.Vector3(cross.x - f.c.x, cross.y - f.c.y, cross.z - f.c.z).length()
    ) {
        begin = f.a;
        d = new THREE.Vector2(-(cross.x - begin.x), -(cross.y - begin.y));
        d = d.normalize();
        vector = {
            x0: begin.x + d.x * (width / 2),
            y0: begin.y + d.y * (width / 2),
            z0: 0,
            x1: cross.x + d.x * (width / 2),
            y1: cross.y + d.y * (width / 2),
            z1: 0,
        };
        f = this.getVectors(vector, 30);

        start0 = new THREE.Vector3(cross.x + d.x * (width / 2), cross.y + d.y * (width / 2), cross.z);
        start = f.d;
        end = f.b;
        end0 = v.start;
    } else {
        begin = f.c;
        d = new THREE.Vector2(-(cross.x - begin.x), -(cross.y - begin.y));
        d = d.normalize();
        vector = {
            x0: cross.x + d.x * (width / 2),
            y0: cross.y + d.y * (width / 2),
            z0: 0,
            x1: begin.x + d.x * (width / 2),
            y1: begin.y + d.y * (width / 2),
            z1: 0,

        };
        f = this.getVectors(vector, 30);

        start0 = new THREE.Vector3(cross.x + d.x * (width / 2), cross.y + d.y * (width / 2), cross.z);
        start = f.b;
        end = f.d;
        end0 = v.end;
    }

    if (this.lineDistance) {

        var pos = this.lineDistance.geometry.attributes.position.array;

        pos[0] = start0.x;
        pos[1] = 10;
        pos[2] = -start0.y;

        pos[3] = start.x;
        pos[4] = 10;
        pos[5] = -start.y;

        pos[6] = end.x;
        pos[7] = 10;
        pos[8] = -end.y;

        pos[9] = end0.x;
        pos[10] = 10;
        pos[11] = -end0.y;

        this.lineDistance.geometry.attributes.position.needsUpdate = true;
    }
    return f;
};

ControlDesigner.prototype.getDistanceToPoint2D = function ( cross, f, v, width ){
    if (!this.lineDistance) {
        var geometry = new THREE.BufferGeometry();
        var positionsDistance = new Float32Array(4 * 3);
        geometry.addAttribute('position', new THREE.BufferAttribute(positionsDistance, 3));
        var material = new THREE.LineBasicMaterial({
            color: '#1cff00',
            linewidth: 20,
            transparent: true,
            depthTest: false
        });
        this.lineDistance = new THREE.Line(geometry, material);
        this.lineDistance.frustumCulled = false;
        this.lineDistance.name = "lineDistance";
        this.add(this.lineDistance);
    }

    var d, begin, vector, start, start0, end, end0;
    if (
        new THREE.Vector3(f.a.x - cross.x, f.a.y - cross.y, f.a.z - cross.z).length() <=
        new THREE.Vector3(cross.x - f.c.x, cross.y - f.c.y, cross.z - f.c.z).length()
    ) {
        begin = f.a;
        d = new THREE.Vector2(-(cross.x - begin.x), -(cross.y - begin.y));
        d = d.normalize();
        vector = {
            x0: begin.x + d.x * (width / 2),
            y0: begin.y + d.y * (width / 2),
            z0: 0,
            x1: cross.x + d.x * (width / 2),
            y1: cross.y + d.y * (width / 2),
            z1: 0,
        };
        f = this.getVectors(vector, 30);

        start0 = new THREE.Vector3(cross.x + d.x * (width / 2), cross.y + d.y * (width / 2), cross.z);
        start = f.d;
        end = f.b;
        end0 = v.start;
    } else {
        begin = f.c;
        d = new THREE.Vector2(-(cross.x - begin.x), -(cross.y - begin.y));
        d = d.normalize();
        vector = {
            x0: cross.x + d.x * (width / 2),
            y0: cross.y + d.y * (width / 2),
            z0: 0,
            x1: begin.x + d.x * (width / 2),
            y1: begin.y + d.y * (width / 2),
            z1: 0,

        };
        f = this.getVectors(vector, 30);

        start0 = new THREE.Vector3(cross.x + d.x * (width / 2), cross.y + d.y * (width / 2), cross.z);
        start = f.b;
        end = f.d;
        end0 = v.end;
    }

    if (this.lineDistance) {

        var pos = this.lineDistance.geometry.attributes.position.array;

        pos[0] = start0.x;
        pos[1] = start0.y;
        pos[2] = 700;

        pos[3] = start.x;
        pos[4] = start.y;
        pos[5] = 700;

        pos[6] = end.x;
        pos[7] = end.y;
        pos[8] = 700;

        pos[9] = end0.x;
        pos[10] = end0.y;
        pos[11] = 700;

        this.lineDistance.geometry.attributes.position.needsUpdate = true;
    }
    return f;
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

ControlDesigner.prototype.positionCursor2D = function ( updatedWall, posMouse, cursorObject, width ) {
    var line = this.mapLinesWalls.get(updatedWall);

    var v = this.getBetweenPoints(line, posMouse);

    if (v) {
        var angle = this.getAngleDoorAndWindow(v.start, v.end);

        var d = new THREE.Vector2(-(v.end.x - v.start.x), -(v.end.y - v.start.y));
        d = d.normalize();

        var vector = {
            x0: v.start.x - d.x * (width / 2),
            y0: v.start.y - d.y * (width / 2),
            z0: 0,
            x1: v.end.x + d.x * (width / 2),
            y1: v.end.y + d.y * (width / 2),
            z1: 0,
        };
        var f = this.getVectors(vector, (this.widthWall / 2));

        var cross = this.middleWall(f, posMouse);

        cursorObject.rotation.z = angle;
        if (cross.overlapping) {
            cursorObject.position.copy(new THREE.Vector3(cross.x, cross.y, posMouse.z));
            f = this.getDistanceToPoint2D(cross, f, v, width);
            this.removeObject(this.groupProportions, this.mapProportions.get("distance_wall"));
            this.positionProportions(f.b, f.d, "distance", "wall");
        } else {
            cursorObject.position.copy(this.getLastPosition(f, posMouse));
            this.removeObject(this.groupProportions, this.mapProportions.get("distance_wall"));
            this.clearDistanceToPoint();
        }
    }
};

ControlDesigner.prototype.positionCursor3D = function ( updatedWall, posMouse, cursorObject, width, height, fromFloor ) {
    var line = this.mapLinesWalls.get(updatedWall);

    var v = this.getBetweenPoints(line, new THREE.Vector3(posMouse.x, -posMouse.z, 0));

    if (v) {
        var angle = this.getAngleDoorAndWindow(v.start, v.end);

        var d = new THREE.Vector2(-(v.end.x - v.start.x), -(v.end.y - v.start.y));
        d = d.normalize();

        var vector = {
            x0: v.start.x - d.x * (width / 2),
            y0: v.start.y - d.y * (width / 2),
            z0: 0,
            x1: v.end.x + d.x * (width / 2),
            y1: v.end.y + d.y * (width / 2),
            z1: 0,
        };
        var f = this.getVectors(vector, (this.widthWall / 2));

        var cross = this.middleWall(f, new THREE.Vector3(posMouse.x, -posMouse.z, 0) );
        cursorObject.rotation.y = angle;
        if (cross.overlapping) {
            cursorObject.position.copy(new THREE.Vector3(cross.x, (height/2 + fromFloor), -cross.y));
            f = this.getDistanceToPoint3D(cross, f, v, this.widthSubtractObject);
            this.removeObject(this.groupProportions3D, this.mapProportions.get("distance_wall"));
            this.positionProportions3D(f.b, f.d, "distance", "wall");
        } else {
            var pos = this.getLastPosition(f, new THREE.Vector3(posMouse.x, -posMouse.z, 0));
            cursorObject.position.copy(new THREE.Vector3(pos.x, (height/2 + fromFloor), -pos.y ));
            this.removeObject(this.groupProportions3D, this.mapProportions.get("distance_wall"));
            this.clearDistanceToPoint();
        }
    }
};

ControlDesigner.prototype.positionSelectedObject3D = function ( updatedWall, posMouse, cursorObject, mapObject, mapSubtract, width, height, fromFloor ) {
    var line = this.mapLinesWalls.get(updatedWall);

    var v = this.getBetweenPoints(line, new THREE.Vector3(posMouse.x, -posMouse.z, 0));

    if (v) {
        var angle = this.getAngleDoorAndWindow(v.start, v.end);

        var d = new THREE.Vector2(-(v.end.x - v.start.x), -(v.end.y - v.start.y));
        d = d.normalize();

        var vector = {
            x0: v.start.x - d.x * (width / 2),
            y0: v.start.y - d.y * (width / 2),
            z0: 0,
            x1: v.end.x + d.x * (width / 2),
            y1: v.end.y + d.y * (width / 2),
            z1: 0,
        };
        var f = this.getVectors(vector, (this.widthWall / 2));

        var cross = this.middleWall(f, new THREE.Vector3(posMouse.x, -posMouse.z, 0) );
        cursorObject.rotation.y = angle;
        if (cross.overlapping) {
            cursorObject.position.copy(new THREE.Vector3(cross.x, fromFloor, -cross.y));
            mapSubtract.get(cursorObject.name).position.x = cursorObject.position.x;
            mapSubtract.get(cursorObject.name).position.y = -cursorObject.position.z;
            mapSubtract.get(cursorObject.name).rotation.z = cursorObject.rotation.y;

            cursorObject = mapObject.get(cursorObject.name);
            cursorObject.scale.z = 1.05;
            this.selectSubtractObject(cursorObject);
            f = this.getDistanceToPoint3D(cross, f, v, width);
            this.removeObject(this.groupProportions3D, this.mapProportions.get("distance_wall"));
            this.positionProportions3D(f.b, f.d, "distance", "wall");
        } else {
            var pos = this.getLastPosition(f, new THREE.Vector3(posMouse.x, -posMouse.z, 0));
            cursorObject.position.copy(new THREE.Vector3(pos.x, fromFloor, -pos.y ));
            mapSubtract.get(cursorObject.name).position.x = cursorObject.position.x;
            mapSubtract.get(cursorObject.name).position.y = -cursorObject.position.z;
            mapSubtract.get(cursorObject.name).rotation.z = cursorObject.rotation.y;
            cursorObject = mapObject.get(cursorObject.name);
            cursorObject.scale.z = 1.05;
            this.selectSubtractObject(cursorObject);
            this.removeObject(this.groupProportions3D, this.mapProportions.get("distance_wall"));
            this.clearDistanceToPoint();
        }
    }
};

ControlDesigner.prototype.addNumSubtract = function (group, nameWall, nameObject) {
    if (!group.nameSubtractObjects.has(nameWall)) {
        group.nameSubtractObjects.set(nameWall, [nameObject]);
    } else {
        var arr = group.nameSubtractObjects.get(nameWall);
        arr.push(nameObject);
        group.nameSubtractObjects.set(nameWall, arr)
    }
};

ControlDesigner.prototype.deleteNumSubtract = function (group, nameWall, nameObject) {
    var arr = group.nameSubtractObjects.get(nameWall);
    this.removeIntersectObjectsArray(arr, nameObject);
    group.nameSubtractObjects.set(nameWall, arr)
};

ControlDesigner.prototype.changeSize2D = function (object, changedSize) {

    var box = object.children[0].box;
    var width = Math.round(box.max.x - box.min.x);
    var height = Math.round(box.max.y - box.min.y);
    var depth = object.userData.height;

    //   object.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(width/2, height/2, depth/2));

    var scale = new THREE.Vector3(
        changedSize.x ? changedSize.x / width : 1,
        changedSize.y ? changedSize.y / height : 1,
        changedSize.z ? changedSize.z / depth : 1
    );

    // console.log(box);

    box.max.multiply(scale);
    box.min.multiply(scale);

    var oldScale = new THREE.Vector3();
    oldScale.copy( object.scale );

    /* object.scale.x = oldScale.x * scale.x;
     object.scale.y = oldScale.y * scale.y;
     object.scale.z = oldScale.z * scale.z;*/

    for(var i = 0; i < object.geometry.vertices.length; i++) {
        object.geometry.vertices[i].multiply(scale);
    }
    object.geometry.verticesNeedUpdate = true;

    /* var pos = object.children[0].geometry.attributes.position.array;
     for(var i = 0; i < pos.length / 3; i++) {
         pos[i * 3 + 0] *= scale.x;
         pos[i * 3 + 1] *= scale.y;
         pos[i * 3 + 2] *= scale.z;
     }
     object.children[0].geometry.attributes.position.needsUpdate = true;*/
    this.positionCursor2D(object.name.split('_')[1], object.position, object, this.selectedSubtractObject.userData.width);
};

ControlDesigner.prototype.changeSize3D = function (object, changedSize) {

    var box = object.children[0].box;
    var width = Math.round(box.max.x - box.min.x);
    var height = Math.round(box.max.y - box.min.y);
    var depth = Math.round(box.max.z - box.min.z);

    //   object.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(width/2, height/2, depth/2));

    var scale = new THREE.Vector3(
        changedSize.x ? changedSize.x / width : 1,
        changedSize.y ? changedSize.y / height : 1,
        changedSize.z ? changedSize.z / depth : 1
    );

    // console.log(box);

    box.max.multiply(scale);
    box.min.multiply(scale);

    var oldScale = new THREE.Vector3();
    oldScale.copy( object.scale );

    /* object.scale.x = oldScale.x * scale.x;
     object.scale.y = oldScale.y * scale.y;
     object.scale.z = oldScale.z * scale.z;*/

    for(var i = 0; i < object.geometry.vertices.length; i++) {
        object.geometry.vertices[i].multiply(scale);
    }
    object.geometry.verticesNeedUpdate = true;

    /* var pos = object.children[0].geometry.attributes.position.array;
     for(var i = 0; i < pos.length / 3; i++) {
         pos[i * 3 + 0] *= scale.x;
         pos[i * 3 + 1] *= scale.y;
         pos[i * 3 + 2] *= scale.z;
     }
     object.children[0].geometry.attributes.position.needsUpdate = true;*/

    var changedSize2D = new THREE.Vector3(changedSize.x, changedSize.z, 1);
    this.changeSize2D(this.mapSubtract.get(object.name), changedSize2D);

    if (camera.isPerspectiveCamera) {
        this.positionSelectedObject3D(object.name.split('_')[1], object.position, object, this.mapSubtractObjects,
            this.mapSubtract, this.selectedSubtractObject.userData.width, this.selectedSubtractObject.userData.height, this.selectedSubtractObject.userData.fromFloor);
    }
    this.rebuildWall(object.name.split('_')[1]);
    object = this.mapSubtractObjects.get(object.name);

    object.getObjectByName("object").traverse(function (child) {
        if (child instanceof THREE.Mesh) {

            var pos = child.geometry.attributes.position.array;
            for(var i = 0; i < pos.length / 3; i++) {
                pos[i * 3 + 0] *= scale.x;
                pos[i * 3 + 1] *= scale.y;
                pos[i * 3 + 2] *= scale.z;
            }
            child.geometry.attributes.position.needsUpdate = true;
        }
    });

};

ControlDesigner.prototype.setPropertiesCursor = function () {
    if (!this.boolCursor) {
        this.removeCursor2D();
        this.removeCursor3D();
        this.objectParametersMenu.hiddenMenu();
    } else {
        this.objectParametersMenu.setValue();
        this.objectParametersMenu.visibleMenu();
    }
};

ControlDesigner.prototype.extrudeFaceWall = function (start, end, nameWalls, nameFace) {
    var pathTemp = [];
    pathTemp.push(start);
    pathTemp.push(end);
    var vector = {
        x0: start.x,
        y0: start.y,
        z0: 0,
        x1: end.x,
        y1: end.y,
        z1: 0,
    };
    var v = this.getVectors(vector, 0.1);
    pathTemp.push(new THREE.Vector2(v.d.x, v.d.y));
    pathTemp.push(new THREE.Vector2(v.b.x, v.b.y));
    var inputShapeTemp = new THREE.Shape( pathTemp );
    var extrudeSettings = { depth: this.heightWall, bevelEnabled: false, steps: 1 };
    this.removeIntersectObjectsArray(this.objects,
        this.groupExtrude.getObjectByName("walls_" + nameWalls.toString()).getObjectByName("walls_" + nameWalls.toString() + "-" + nameFace.toString()));
    this.removeObject(this.groupExtrude.getObjectByName("walls_" + nameWalls.toString()),
        this.groupExtrude.getObjectByName("walls_" + nameWalls.toString()).getObjectByName("walls_" + nameWalls.toString() + "-" + nameFace.toString()));
    this.addFaceWall( inputShapeTemp, extrudeSettings, "#39424e", 0, 0, 0, 0, 0, 0, 1, nameWalls.toString(), nameFace.toString() );
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

ControlDesigner.prototype.mouseMove2D = function (posMouse){

    if (this.enableMouseMove) {
        this.menuObject.hiddenMenu();
        this.objectParametersMenu.hiddenMenu();
        posMouse.z = 710;
        if (this.selectedSubtractObject) {
            var arr = this.selectedSubtractObject.name.split('_');
            this.positionCursor2D(arr[1], posMouse, this.selectedSubtractObject, this.selectedSubtractObject.userData.width);
        }
    }
};

ControlDesigner.prototype.mouseClickCursor2D = function (intersect){
    var arr = intersect.object.name.split('_');
    if (!this.selectedInstr && !this.selectedScale) {
        if (!this.cursor2D && this.boolCursor && arr[0] === "wallsCup") {
            this.createCursor2D();
            this.updatedWall = +arr[1];
            this.positionCursor2D(this.updatedWall.toString(), intersect.point, this.cursor2D, this.widthSubtractObject);
            this.cursor2D.name = this.updatedWall.toString();
        } else if (this.cursor2D) {
            if (arr[0] === "wallsCup") {
                if (this.cursor2D.name === arr[1]) {
                    this.addDoor2D(this.cursor2D, this.groupSubtract.children.length, arr[1]);
                    this.rebuildWall(this.updatedWall.toString());
                }
                this.updatedWall = +arr[1];
                this.positionCursor2D(this.updatedWall.toString(), intersect.point, this.cursor2D, this.widthSubtractObject);
                this.cursor2D.name = this.updatedWall.toString();
            } else {
                this.addDoor2D(this.cursor2D, this.groupSubtract.children.length, this.updatedWall.toString());
                this.rebuildWall(this.updatedWall.toString());
            }
        }
    }
};

ControlDesigner.prototype.mouseMoveCursor2D = function (posMouse ){
    if (this.boolCursor && this.cursor2D) {
        this.positionCursor2D(this.updatedWall.toString(), posMouse, this.cursor2D, this.widthSubtractObject);
    }
};

ControlDesigner.prototype.createCursor2D = function (){
    var geom = new THREE.PlaneGeometry( 1, 1 );
    var mat = new THREE.MeshBasicMaterial({color: "#02ffba", transparent: true, opacity: 0.75, depthTest: false});
    this.cursor2D = new THREE.Mesh( geom, mat );
    this.cursor2D.scale.set(this.widthSubtractObject, this.depthSubtractObject, this.heightSubtractObject);
    this.cursor2D.name = "cursor2D";
    this.add(this.cursor2D);

    var helper = new THREE.EdgesHelper( this.cursor2D, "#ffd10b" );
    helper.material.transparent = true;
    helper.material.depthTest = false;
    this.cursor2D.add(helper);
};

ControlDesigner.prototype.removeCursor2D = function (){
    this.removeObject(this, this.cursor2D);
    this.cursor2D = undefined;
    this.removeObject(this.groupProportions, this.mapProportions.get("distance_wall"));
    this.clearDistanceToPoint();
};

ControlDesigner.prototype.addDoor2D = function (object, nameObject, nameWall){
    var geometry = new THREE.PlaneGeometry(this.widthSubtractObject, this.depthSubtractObject+2);
    var mat = new THREE.MeshBasicMaterial({color: "#4145d7"});
    var cursor2D = new THREE.Mesh( geometry, mat );
    this.addHelper(cursor2D);
    cursor2D.name = "subtract-" + nameObject + "_" + nameWall;
    cursor2D.position.copy(object.position);
    cursor2D.position.z += 10;
    cursor2D.rotation.copy(object.rotation);
    cursor2D.userData.width = this.widthSubtractObject;
    cursor2D.userData.depth = this.depthSubtractObject;
    cursor2D.userData.height = this.heightSubtractObject;
    cursor2D.userData.fromFloor = this.fromFloorSubtractObject;
    this.mapSubtract.set(cursor2D.name, cursor2D);
    this.objects.push(cursor2D);
    this.groupSubtract.add(cursor2D);

    this.addNumSubtract(this.groupSubtract, nameWall, cursor2D.name);
};

ControlDesigner.prototype.addDoor3D = function (object, nameObject, nameWall){
    var geometry = new THREE.PlaneGeometry(this.widthSubtractObject, this.depthSubtractObject+2);
    var mat = new THREE.MeshBasicMaterial({color: "#4145d7"});
    var cursor3D = new THREE.Mesh( geometry, mat );
    this.addHelper(cursor3D);
    cursor3D.name = "subtract-" + nameObject + "_" + nameWall;
    cursor3D.position.x = object.position.x;
    cursor3D.position.y = -object.position.z;
    cursor3D.position.z = 710;
    cursor3D.rotation.z = object.rotation.y;
    cursor3D.userData.width = this.widthSubtractObject;
    cursor3D.userData.depth = this.depthSubtractObject;
    cursor3D.userData.height = this.heightSubtractObject;
    cursor3D.userData.fromFloor = this.fromFloorSubtractObject;
    this.mapSubtract.set(cursor3D.name, cursor3D);
    this.objects.push(cursor3D);
    this.groupSubtract.add(cursor3D);

    this.addNumSubtract(this.groupSubtract, nameWall, cursor3D.name);
};

ControlDesigner.prototype.addHelper = function (mesh) {

    var box = new THREE.Box3();
    box.setFromObject(mesh);
    var helper = new THREE.Box3Helper(box, "#ffd10b");

    // var helper = new THREE.BoxHelper(mesh, "#ffff00");

   /* var material = new THREE.LineDashedMaterial( {
        color: '#009a09',
        dashSize: 10,
        gapSize: 5,
        transparent: true,
        depthTest: false
    } );
    helper.material = material;
    helper.computeLineDistances();
    helper.geometry.lineDistancesNeedUpdate = true;*/
    helper.material.transparent = true;
    helper.material.depthTest = false;
    helper.name = "helper";
    helper.visible = false;
    mesh.add(helper);
};

ControlDesigner.prototype.mouseClick2D = function (intersect, event){
    var arr = intersect.object.name.split('_');
    if (arr[0] === "floor" && transformControl.object) {
        this.unselectPointObject(this.selectedPoint);
        transformControl.detach(this.selectedPoint);
        this.selectedPoint = null;
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
            this.menu2D.changeInstrument();
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
            this.menuScaling.changeScale();
        } else {
            if (this.countScale === 0) {
                this.addPointScale(this.posMouse);
            }
            this.addPointScale(this.posMouse);
        }
    } else  if (transformControl.object) {

        this.unselectObject(this.selectedObject);
        this.selectedObject = null;

        this.unselectPointObject(this.selectedPoint);
        this.selectedPoint = transformControl.object;
        this.selectPointObject(this.selectedPoint);

    } else {
        this.unselectPointObject(this.selectedPoint);
        transformControl.detach(this.selectedPoint);
        this.selectedPoint = null;
    }
    if (arr[0] === "wallsCup" && !this.selectedInstr && !this.selectedScale && !transformControl.object) {

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

    if (arr[0].split('-')[0] === "subtract") {
            this.enableMouseMove = true;
            this.unselectPointObject(this.selectedPoint);
            transformControl.detach(this.selectedPoint);
            this.selectedPoint = null;

            this.unselectObject(this.selectedObject);
            this.selectedObject = null;

            this.unselectSubtractObject(this.selectedSubtractObject);
            this.selectedSubtractObject = intersect.object;

            this.selectSubtractObject(this.selectedSubtractObject);
            this.positionCursor2D(arr[1], this.selectedSubtractObject.position, this.selectedSubtractObject, this.selectedSubtractObject.userData.width);
            this.menuObject.setPosition(event, this.selectedSubtractObject.position);
            this.objectParametersMenu.getObjectProperties(this.selectedSubtractObject);
            this.objectParametersMenu.visibleMenu();

            this.tempPosition.copy(this.selectedSubtractObject.position);
    } else {
        // if (!this.selectedWindow) {
            this.menuObject.hiddenMenu();
            this.objectParametersMenu.hiddenMenu();
        // }
        this.unselectSubtractObject(this.selectedSubtractObject);
        this.selectedSubtractObject = null;
        this.removeObject(this.groupProportions, this.mapProportions.get("distance_wall"));
        this.clearDistanceToPoint();
    }
};

ControlDesigner.prototype.mouseClick3D = function (intersect){
    var arr = intersect.object.name.split('_');
        if (arr[0].split('-')[0] === "subtract") {
                this.enableMouseMove = true;
                this.unselectPointObject(this.selectedPoint);
                transformControl.detach(this.selectedPoint);
                this.selectedPoint = null;

                this.unselectObject(this.selectedObject);
                this.selectedObject = null;

                this.unselectSubtractObject(this.selectedSubtractObject);
                this.selectedSubtractObject = intersect.object;

                this.selectSubtractObject(this.selectedSubtractObject);
                this.positionSelectedObject3D(arr[1], this.selectedSubtractObject.position, this.selectedSubtractObject, this.mapSubtractObjects,
                    this.mapSubtract, this.selectedSubtractObject.userData.width, this.selectedSubtractObject.userData.height, this.selectedSubtractObject.userData.fromFloor);
                this.menuObject.setPosition(event, this.selectedSubtractObject.position);
                this.objectParametersMenu.getObjectProperties(this.selectedSubtractObject);
                this.objectParametersMenu.visibleMenu();

                this.tempPosition.copy(this.selectedSubtractObject.position);
        } else {
            // if (!this.selectedWindow) {
                this.menuObject.hiddenMenu();
                this.objectParametersMenu.hiddenMenu();
            // }
            this.unselectSubtractObject(this.selectedSubtractObject);
            this.selectedSubtractObject = null;
            this.removeObject(this.groupProportions3D, this.mapProportions.get("distance_wall"));
            this.clearDistanceToPoint();
        }
        if (arr[0] === "walls" ) {
            this.unselectFaceWall(this.selectedFaceWall);
            this.selectedFaceWall = intersect.object;
            this.selectFaceWall(this.selectedFaceWall);
        } else {
            this.unselectFaceWall(this.selectedFaceWall);
            this.selectedFaceWall = null;
        }
};

ControlDesigner.prototype.mouseCancel = function (event){

            if (this.selectedSubtractObject) {
                if (camera.isPerspectiveCamera) {
                    if (  new THREE.Vector3(
                        this.tempPosition.x - this.selectedSubtractObject.position.x,
                        this.tempPosition.y - this.selectedSubtractObject.position.y,
                        this.tempPosition.z - this.selectedSubtractObject.position.z
                    ).length() > 0) {
                        this.rebuildWall(this.selectedSubtractObject.name.split('_')[1]);
                        this.selectedSubtractObject = this.mapSubtractObjects.get(this.selectedSubtractObject.name);
                        this.selectSubtractObject(this.selectedSubtractObject);
                    }
                } else if (camera.isOrthographicCamera) {
                    if (  new THREE.Vector3(
                        this.tempPosition.x - this.selectedSubtractObject.position.x,
                        this.tempPosition.y - this.selectedSubtractObject.position.y,
                        this.tempPosition.z - this.selectedSubtractObject.position.z
                    ).length() > 0) {
                        this.rebuildWall(this.selectedSubtractObject.name.split('_')[1]);
                        this.selectedSubtractObject = this.mapSubtract.get(this.selectedSubtractObject.name);
                        this.selectSubtractObject(this.selectedSubtractObject);
                    }
                }
                this.enableMouseMove = false;
                this.menuObject.setPosition(event, this.selectedSubtractObject.position);
                this.objectParametersMenu.visibleMenu();
            }
};

ControlDesigner.prototype.mouseClickCursor3D = function (intersect){
    var arr = intersect.object.name.split('_');
    if (!this.cursor3D && this.boolCursor && arr[0] === "walls") {
        arr[1] = arr[1].split('-')[0];
        this.createCursor3D();
        this.positionCursor3D(arr[1], intersect.point, this.cursor3D, this.widthSubtractObject, this.heightSubtractObject, this.fromFloorSubtractObject);
    } else if (this.cursor3D && arr[0] === "walls" ) {
        arr[1] = arr[1].split('-')[0];
        this.addDoor3D(this.cursor3D, this.groupSubtract.children.length, arr[1]);
        this.rebuildWall(arr[1]);
    }
};

ControlDesigner.prototype.mouseMove3D = function ( intersect ){
    if (this.enableMouseMove) {
        controlsP.enableRotate = false;
        this.menuObject.hiddenMenu();
        this.objectParametersMenu.hiddenMenu();
        if (this.selectedSubtractObject) {
            var arr = this.selectedSubtractObject.name.split('_');
            arr[1] = arr[1].split('-')[0];
            this.positionSelectedObject3D(arr[1], intersect.point, this.selectedSubtractObject, this.mapSubtractObjects,
                this.mapSubtract, this.selectedSubtractObject.userData.width, this.selectedSubtractObject.userData.height, this.selectedSubtractObject.userData.fromFloor);
        }
    }
};

ControlDesigner.prototype.mouseMoveCursor3D = function (intersect ){
    var arr = intersect.object.name.split('_');
    if (this.cursor3D && arr[0] === "walls") {
        arr[1] = arr[1].split('-')[0];
        this.positionCursor3D(arr[1], intersect.point, this.cursor3D, this.widthSubtractObject, this.heightSubtractObject, this.fromFloorSubtractObject);
    }
};