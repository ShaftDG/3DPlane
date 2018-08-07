function ControlDesigner(textureSpritePointScale) {
    THREE.Object3D.apply(this);
    this.name = "ControlDesigner";

    this.textureSpritePointScale = textureSpritePointScale;

    this.planeBackground = null;

    this.selectedObject = null;
    this.selectedPoint = null;

    this.lineHorizontal = null;
    this.lineVertical = null;

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
    this.mapWalls = new Map();
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

ControlDesigner.prototype.addHelperLine = function () {
    var geometryH = new THREE.BufferGeometry();
    var h = new Float32Array(2 * 3);
    geometryH.addAttribute('position', new THREE.BufferAttribute(h, 3));
    /* var material = new THREE.LineBasicMaterial({
         color: '#00ff0c',
         linewidth: 20,
         // transparent: true,
     });*/
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

   /* this.removeObject(this.groupLinesUpdate, this.mapLines.get("line_" + this.updatedWall.toString()));
    var pathPts = [];
    for (var i = 0; i < length; i++) {
          pathPts.push(new THREE.Vector2(position[i * 3 + 0], position[i * 3 + 1]));
    }
    var inputShape = new THREE.Shape(pathPts);
    var extrudeSettings = {depth: this.heightWall * this.scalePlane, bevelEnabled: false, steps: 1};
    this.addLineShape(inputShape, extrudeSettings, "#d70003", 0, 0, 0, 0, 0, 0, 1, this.updatedWall);*/
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

ControlDesigner.prototype.updateLine = function (coord) {
    if(event.shiftKey) {
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
    // console.log("this.positions", this.positions);
    this.updateRectangle( this.posMouse, this.widthWall * this.scalePlane);
};

ControlDesigner.prototype.updateLineScale = function (coord) {

    if(event.shiftKey) {
        if (Math.abs(this.positionsScale[this.countScale * 3 - 6] - coord.x) <= Math.abs(this.positionsScale[this.countScale * 3 - 5] - coord.y)) {
            this.positionsScale[this.countScale * 3 - 3] = this.positionsScale[this.countScale * 3 - 6];
            this.positionsScale[this.countScale * 3 - 2] = coord.y;
            this.positionsScale[this.countScale * 3 - 1] = coord.z;
        } else {
            this.positionsScale[this.countScale * 3 - 3] = coord.x;
            this.positionsScale[this.countScale * 3 - 2] = this.positionsScale[this.countScale * 3 - 5];
            this.positionsScale[this.countScale * 3 - 1] = coord.z;
        }
    } else {
        this.positionsScale[this.countScale * 3 - 3] = coord.x;
        this.positionsScale[this.countScale * 3 - 2] = coord.y;
        this.positionsScale[this.countScale * 3 - 1] = coord.z;
    }

    this.lineScale.geometry.attributes.position.needsUpdate = true;
    for (var i = 0; i < this.groupPointsScale.length; i++) {
        this.groupPointsScale[i].geometry.attributes.position.needsUpdate = true;
    }
};

ControlDesigner.prototype.addPoint = function (coord){

    this.posMouse.copy(coord)
    if (this.count !== 0) {
        this.mapX.set(Math.round(this.positions[this.count * 3 - 3]), new THREE.Vector3(this.positions[this.count * 3 - 3], this.positions[this.count * 3 - 2], this.positions[this.count * 3 - 1]));
        this.mapY.set(Math.round(this.positions[this.count * 3 - 2]), new THREE.Vector3(this.positions[this.count * 3 - 3], this.positions[this.count * 3 - 2], this.positions[this.count * 3 - 1]));
    }

    this.positions[this.count * 3 + 0] = coord.x;
    this.positions[this.count * 3 + 1] = coord.y;
    this.positions[this.count * 3 + 2] = coord.z;
    this.count++;

    this.line.geometry.setDrawRange(0, this.count);
    this.updateLine(coord);

    if ( this.count !== 0) {
        this.addRectangle(coord, this.widthWall * this.scalePlane);
    }
};

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

ControlDesigner.prototype.clearPointsPosition = function (){
    this.positions = [];
    this.positionsRect = [];
    this.positionsDown = [];

    this.count = 0;
    this.count1 = 0;

    this.removeLines(this.groupLines);

    this.addLines();
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

        var vectors = this.getVectors(currentWall, this.widthWall * this.scalePlane);

        this.tempCoord.x = vectors.c.x;
        this.tempCoord.y = vectors.c.y;

        this.updateLine(new THREE.Vector3(this.positions[this.count * 3 - 3], this.positions[this.count * 3 - 2], this.positions[this.count * 3 - 1]));
        this.line.geometry.setDrawRange(0, this.count);
        this.lineRect.geometry.setDrawRange(0, this.count1);
        this.lineDown.geometry.setDrawRange(0, this.count1);
    }
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

     /*     this.removeObject(this.groupProportions, this.mapProportions.get(((this.count - 2) * 4 + 1).toString() + "_" + this.numWalls.toString()));
          var end = new THREE.Vector2(this.positionsDown[this.count1 * 3 - 6], this.positionsDown[this.count1 * 3 - 5], this.positionsDown[this.count1 * 3 - 4]);
          var start = new THREE.Vector2(this.positionsDown[this.count1 * 3 - 3], this.positionsDown[this.count1 * 3 - 2], this.positionsDown[this.count1 * 3 - 1]);
          this.positionProportions(start, end, (this.count - 2) * 4 + 1, this.numWalls.toString());*/

          this.removeObject(this.groupProportions, this.mapProportions.get(((this.count-2)*2+1 ).toString() + "_" + this.numWalls.toString()));
          var end = new THREE.Vector2(this.positionsRect[this.count1 * 3 - 9], this.positionsRect[this.count1 * 3 - 8], this.positionsRect[this.count1 * 3 - 7]);
          var start = new THREE.Vector2(this.positionsRect[this.count1 * 3 - 3], this.positionsRect[this.count1 * 3 - 2], this.positionsRect[this.count1 * 3 - 1]);
          this.positionProportions(start, end, (this.count-2)*2+1 , this.numWalls.toString());

      /*    this.removeObject(this.groupProportions, this.mapProportions.get(((this.count - 2) * 4 + 3).toString() + "_" + this.numWalls.toString()));
          var start = new THREE.Vector2(this.positionsDown[this.count1 * 3 - 12], this.positionsDown[this.count1 * 3 - 11], this.positionsDown[this.count1 * 3 - 10]);
          var end = new THREE.Vector2(this.positionsDown[this.count1 * 3 - 9], this.positionsDown[this.count1 * 3 - 8], this.positionsDown[this.count1 * 3 - 7]);
          this.positionProportions(start, end, (this.count - 2) * 4 + 3, this.numWalls.toString());*/

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

ControlDesigner.prototype.getAngle = function (v1, v2) {
    var cosA = v1.dot(v2)/(v1.length() * v2.length());
    if (cosA) {
        return cosA;
    } else {
        return 0;
    }
};

ControlDesigner.prototype.getVectors = function (vector, depth) {

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
};

ControlDesigner.prototype.getLength = function (posMouse){
    var vec = new THREE.Vector3(posMouse[0] - posMouse[3], posMouse[1] - posMouse[4], posMouse[2] - posMouse[5]);
    var l = vec.length();
    // console.log("l", l);
    return l;
};

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

ControlDesigner.prototype.updateExtrudePath = function (position) {

    this.removeObject(this.groupExtrude, this.mapWalls.get("walls_" + this.updatedWall.toString()));
    this.removeObject(this.groupPlane, this.mapWallsCup.get("wallsCup_" + this.updatedWall.toString()));
    this.removeObject(this.groupLinesUpdate, this.mapLines.get("line_" + this.updatedWall.toString()));

    this.removeIntersectObjectsArray(this.objects, this.mapWallsCup.get("wallsCup_" + this.updatedWall.toString()));
    this.removeIntersectObjectsArray(this.objects, this.mapWalls.get("walls_" + this.updatedWall.toString()));
    // console.log("!!!", this.this.updatedWall);

    var num = 0;
    var pathPts = [];

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
                    num++;
                }

            } else {
                pathPts.push(new THREE.Vector2(position[i * 3 + 0], position[i * 3 + 1]));
                num++;
            }
        }

        var inputShape = new THREE.Shape(pathPts);
        var extrudeSettings = {depth: this.heightWall * this.scalePlane, bevelEnabled: false, steps: 1};
        this.addShape(inputShape, extrudeSettings, "#9cc2d7", "#39424e", 0, 0, 0, 0, 0, 0, this.scalePlane, this.updatedWall);
        this.addLineShape(inputShape, extrudeSettings, "#d70003", 0, 0, 0, 0, 0, 0, 1, this.updatedWall);
    }
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
    return ret;
};

ControlDesigner.prototype.positionProportions = function (start, end, num, numWalls) {

    var lengthVector = new THREE.Vector2(start.x - end.x, start.y - end.y).length();

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

        var spritey = this.makeTextSprite( Math.round(lengthVector / this.scalePlane), {
            fontsize: 12,
            backgroundColor: {r: 255, g: 0, b: 0, a: 1.0}
        }, angle, num, numWalls);
        spritey.position.copy(middle);
        if (lengthVector <= 30) {
            spritey.visible = false;
        }
        this.groupProportions.add(spritey);
        this.mapProportions.set(spritey.name, spritey);
    }
};

ControlDesigner.prototype.extrudePath = function () {

    // this.crossingWalls();

    var num = 0;
    var pathPts = [];

    for (var i = 0; i < this.count; i++) {
        pathPts.push( new THREE.Vector2 ( this.positions[i * 3 + 0], this.positions[i * 3 + 1] ) );
        this.addPointObject(this.positions[i * 3 + 0], this.positions[i * 3 + 1], this.positions[i * 3 + 2], num);
        if (i !== 0) {
            this.removeObject(this.groupProportions, this.mapProportions.get((num-1).toString()+ "_" + this.numWalls.toString()));
            var start = new THREE.Vector2(this.positions[i * 3 - 3], this.positions[i * 3 - 2], this.positions[i * 3 - 1]);
            var end = new THREE.Vector2(this.positions[i * 3 + 0], this.positions[i * 3 + 1], this.positions[i * 3 + 2]);
            this.positionProportions(start, end, num-1, this.numWalls.toString());
        }
        num++;
    }

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
    var extrudeSettings = { depth: this.heightWall * this.scalePlane, bevelEnabled: false, steps: 1 };
    this.addShape( inputShape, extrudeSettings, "#9cc2d7", "#39424e", 0, 0, 0, 0, 0, 0, this.scalePlane, this.numWalls );
    this.addLineShape( inputShape, extrudeSettings, "#d70003", 0, 0, 0, 0, 0, 0, 1, this.numWalls );
    this.numWalls++;
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
    var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: colorWall/*, transparent: true*/, side: THREE.DoubleSide } ) );
    mesh.position.set( x, y, z );
    mesh.rotation.set( rx, ry, rz );
    mesh.scale.set( s, s, s );
    mesh.name = "walls_" + nameWall.toString();
    // mesh.castShadow = true;
    this.mapWalls.set(mesh.name, mesh);
    this.objects.push(mesh);
    this.groupExtrude.add( mesh );

/*    var geom = new THREE.SphereGeometry( 20, 16, 16 );
    var s = new THREE.Mesh( geom );
    s.name = "s";

  var geom = new THREE.CubeGeometry( 180, 50, 20 );
  var human = new THREE.Mesh( geom );
  human.name = "human";
   //this.groupExtrude.add( human );

  this.booleanOperation( human, s);*/

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
            this.mapWallsCup.get(object.name).material.color = new THREE.Color("#1dff00");
        }

        if (this.mapLines.has("line_" + name[1])) {
            this.mapLines.get("line_" + name[1]).material.color = new THREE.Color("#302fd4");
        }
    }
};

ControlDesigner.prototype.unselectPointObject = function (point) {
    if (point) {
        point.scale.set(1.0, 1.0, 1.0);
        point.material.color = new THREE.Color("#ff0000");
        transformControl.detach(point);
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

ControlDesigner.prototype.mouseClick = function (intersect){
    var arr = intersect.object.name.split('_');

    if (intersect.object.name === "floor" && !this.selectedInstr && !this.selectedScale) {
        this.unselectPointObject(this.selectedPoint);
        this.selectedPoint = null;
    }

    if (this.selectedInstr) {
        if (this.positions[this.count * 3 - 6] === this.posMouse.x &&
            this.positions[this.count * 3 - 5] === this.posMouse.y &&
            this.positions[this.count * 3 - 4] === this.posMouse.z) {

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
                this.calculateScale(this.positionsScale);
            }
            this.addPoint(this.posMouse);
        }
    } else if (this.selectedScale) {
        if (this.positionsScale[this.countScale * 3 - 3] === this.posMouse.x &&
            this.positionsScale[this.countScale * 3 - 2] === this.posMouse.y &&
            this.positionsScale[this.countScale * 3 - 1] === this.posMouse.z) {
            changeScale();
        } else {
            if (this.countScale === 0) {
                this.addPointScale(this.posMouse);
            }
            this.addPointScale(this.posMouse);
        }
    } else  if (transformControl.object) {
        if (this.selectedPoint !== transformControl.object && this.selectedPoint) {
            this.selectedPoint.scale.set(1.0, 1.0, 1.0);
            this.selectedPoint.material.color = new THREE.Color("#ff0000");
            this.selectedPoint = null;
        }

        this.selectedPoint = transformControl.object;
        this.selectedPoint.scale.set(1.5, 1.5, 1.5);
        transformControl.object.material.color = new THREE.Color("#00d40f");

        this.unselectObject(this.selectedObject);
        this.selectedObject = null;
    }
    if (arr[0] === "wallsCup" && !this.selectedInstr && !this.selectedScale) {

        this.unselectPointObject(this.selectedPoint);
        this.selectedPoint = null;

        this.unselectObject(this.selectedObject);

        this.selectedObject = intersect.object;

        this.selectObject(this.selectedObject);

    } else {
        this.unselectObject(this.selectedObject);
        this.selectedObject = null;
    }
};

ControlDesigner.prototype.makeTextSprite = function ( message, parameters, angle, num, numWalls){
    function roundRect(ctx, w, h)
    {
        ctx.beginPath();
        ctx.moveTo(w, h);
        ctx.lineTo(2*w, h);
        ctx.lineTo(2*w, -h);
        ctx.lineTo(w, -h);
        ctx.closePath();
        ctx.fill();
    }

    if ( parameters === undefined ) parameters = {};

    var fontface = parameters.hasOwnProperty("fontface") ?
        parameters["fontface"] : "Arial";

    var fontsize = parameters.hasOwnProperty("fontsize") ?
        parameters["fontsize"] : 18;

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

    roundRect(context, canvas.width,  canvas.height);

    // text color
    context.fillStyle = "rgba(0, 0, 0, 1.0)";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText( message, canvas.width / 2, canvas.height / 2);

    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    var spriteMaterial = new THREE.SpriteMaterial(
        { rotation: -angle, map: texture } );
    var sprite = new THREE.Sprite( spriteMaterial );
    sprite.name = num.toString() + "_" + numWalls ;
    sprite.scale.set(80,40,1.0);
    return sprite;
};
/*

ControlDesigner.prototype.booleanOperation = function ( obj1, obj2 ){

    var mat = new THREE.MeshBasicMaterial( { color: '#15ff00', side: THREE.DoubleSide } );

    var obj1BSP = new ThreeBSP( obj1 );
    var obj2BSP = new ThreeBSP( obj2 );

    var newSubtractBSP = obj1BSP.subtract( obj2BSP );
    var newUnionBSP = obj1BSP.union( obj2BSP );
    var newIntersectBSP = obj1BSP.intersect( obj2BSP );

    // var newIntersectMesh = newIntersectBSP.toMesh( obj1.material );
    // this.groupExtrude.add( newIntersectMesh );

    var newUnionMesh = newUnionBSP.toMesh( mat );
    this.groupExtrude.add( newUnionMesh );

    // var newSubtractMesh = newSubtractBSP.toMesh( mat );
    // this.add( newSubtractMesh );
};*/
