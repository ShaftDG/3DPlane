function ObjectParametersMenu() {
    var colorBorder = "#3997ad";
    var container = document.createElement("div");
    container.id = "objectParametersMenu";
    container.name = "objectParametersMenu";
    container.classList.add("styleObjectParametersMenu");
    document.body.appendChild(container);

    var labelWidth = document.createElement("label");
    labelWidth.innerText = "Ширина, (см):";
    labelWidth.classList.add("labelObjectParametersMenu");
    container.appendChild(labelWidth);

    var inputWidth = document.createElement("input");
    inputWidth.type = "number";
    inputWidth.step="1";
    inputWidth.min="0";
    inputWidth.max="1000";
    inputWidth.value="20";
    inputWidth.id="w";
    inputWidth.name="w";
    inputWidth.classList.add("inputObjectParametersMenu");
    container.appendChild(inputWidth);

    var labelHeight = document.createElement("label");
    labelHeight.innerText = "Высота, (см):";
    labelHeight.classList.add("labelObjectParametersMenu");
    container.appendChild(labelHeight);

    var inputHeight = document.createElement("input");
    inputHeight.type = "number";
    inputHeight.step="1";
    inputHeight.min="0";
    inputHeight.max="1000";
    inputHeight.value="20";
    inputHeight.id="h";
    inputHeight.name="h";
    inputHeight.classList.add("inputObjectParametersMenu");
    container.appendChild(inputHeight);

    var labelDepth = document.createElement("label");
    labelDepth.innerText = "Глубина, (см):";
    labelDepth.classList.add("labelObjectParametersMenu");
    container.appendChild(labelDepth);

    var inputDepth = document.createElement("input");
    inputDepth.type = "number";
    inputDepth.step="1";
    inputDepth.min="0";
    inputDepth.max="1000";
    inputDepth.value="20";
    inputDepth.id="d";
    inputDepth.name="d";
    inputDepth.classList.add("inputObjectParametersMenu");
    container.appendChild(inputDepth);

    var labelFromFloor = document.createElement("label");
    labelFromFloor.innerText = "От пола, (см):";
    labelFromFloor.classList.add("labelObjectParametersMenu");
    container.appendChild(labelFromFloor);

    var inputFromFloor = document.createElement("input");
    inputFromFloor.type = "number";
    inputFromFloor.step="1";
    inputFromFloor.min="0";
    inputFromFloor.max="1000";
    inputFromFloor.value="20";
    inputFromFloor.id="f";
    inputFromFloor.name="f";
    inputFromFloor.classList.add("inputObjectParametersMenu");
    container.appendChild(inputFromFloor);

    this.width = 0;
    this.height = 0;
    this.depth = 0;
    this.fromFloor = 0;

    inputWidth.addEventListener('change', function (ev) {
        designer.widthSubtractObject = +inputWidth.value;
        if (!designer.widthSubtractObject) {
            alert('Error: failed to get the width element!');
            designer.widthSubtractObject = 100;
        }
        if (designer.boolCursor) {
            if (designer.cursor3D) {
                designer.cursor3D.scale.x = designer.widthSubtractObject;
            }
            if (designer.cursor2D) {
                designer.cursor2D.scale.x = designer.widthSubtractObject;
            }
        } else if (designer.selectedSubtractObject) {
            designer.selectedSubtractObject.userData.width = designer.widthSubtractObject;
            var changedSize = new THREE.Vector3(designer.widthSubtractObject, null, null);
            if (camera.isPerspectiveCamera) {
                designer.changeSize3D(designer.selectedSubtractObject, changedSize);
            } else if (camera.isOrthographicCamera) {
                designer.changeSize3D(designer.mapSubtractObjects.get(designer.selectedSubtractObject.name), changedSize);
            }
        }
    }, false);

    inputHeight.addEventListener('change', function (ev) {
        designer.heightSubtractObject = +inputHeight.value;
        if (!designer.heightSubtractObject) {
            alert('Error: failed to get the height element!');
            designer.heightSubtractObject = 210;
        }
        if (designer.boolCursor) {
            if (designer.cursor3D) {
                designer.cursor3D.scale.y = designer.heightSubtractObject;
            }
        } else if (designer.selectedSubtractObject) {
            designer.selectedSubtractObject.userData.height = designer.heightSubtractObject;
            var changedSize = new THREE.Vector3(null, designer.heightSubtractObject, null);
            if (camera.isPerspectiveCamera) {
                designer.changeSize3D(designer.selectedSubtractObject, changedSize);
            } else if (camera.isOrthographicCamera) {
                designer.changeSize3D(designer.mapSubtractObjects.get(designer.selectedSubtractObject.name), changedSize);
            }
        }
    }, false);

    inputDepth.addEventListener('change', function (ev) {
        designer.depthSubtractObject = +inputDepth.value;
        if (!designer.depthSubtractObject) {
            alert('Error: failed to get the depth element!');
            designer.depthSubtractObject = 20;
        }
        if (designer.boolCursor) {
            if (designer.cursor3D) {
                designer.cursor3D.scale.z = designer.depthSubtractObject;
            }
            if (designer.cursor2D) {
                designer.cursor2D.scale.y = designer.depthSubtractObject;
            }
        } else if (designer.selectedSubtractObject) {
            designer.selectedSubtractObject.userData.depth = designer.depthSubtractObject;
            var changedSize = new THREE.Vector3(null, null, designer.depthSubtractObject);
            if (camera.isPerspectiveCamera) {
                designer.changeSize3D(designer.selectedSubtractObject, changedSize);
            } else if (camera.isOrthographicCamera) {
                designer.changeSize3D(designer.mapSubtractObjects.get(designer.selectedSubtractObject.name), changedSize);
            }
        }
    }, false);

    inputFromFloor.addEventListener('change', function (ev) {
        designer.fromFloorSubtractObject = +inputFromFloor.value;
        if (!designer.fromFloorSubtractObject) {
            alert('Error: failed to get the fromFloor element!');
            designer.fromFloorSubtractObject = 0;
        }
        if (designer.selectedSubtractObject) {
            designer.selectedSubtractObject.userData.fromFloor = designer.fromFloorSubtractObject;
            var changedSize = new THREE.Vector3(null, null, null);
            if (camera.isPerspectiveCamera) {
                designer.changeSize3D(designer.selectedSubtractObject, changedSize);
            } else if (camera.isOrthographicCamera) {
                designer.changeSize3D(designer.mapSubtractObjects.get(designer.selectedSubtractObject.name), changedSize);
            }
        }
    }, false);

}

ObjectParametersMenu.prototype.constructor = ObjectParametersMenu;

ObjectParametersMenu.prototype.getObjectProperties = function (object) {
    var box = object.children[0].box;
    // console.log(object.userData.width, object.userData.height, object.userData.depth);

    var height, depth;

    var width = Math.round(box.max.x - box.min.x);
    if (camera.isPerspectiveCamera) {
        height = Math.round(box.max.y - box.min.y);
        depth = Math.round(box.max.z - box.min.z);
    } else if (camera.isOrthographicCamera) {
        height = object.userData.height;
        depth = Math.round(box.max.y - box.min.y);
    }
    var fromFloor = object.userData.fromFloor;
    /*var width = object.userData.width;
    var height = object.userData.height;
    var depth = object.userData.depth;
    var fromFloor = object.userData.fromFloor;*/
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.fromFloor = fromFloor;

    var inputWidth = document.getElementById("w");
    var inputHeight = document.getElementById("h");
    var inputDepth = document.getElementById("d");
    var inputFromFloor =  document.getElementById("f");

    inputWidth.value = this.width.toString();
    inputHeight.value = this.height.toString();
    inputDepth.value = this.depth.toString();
    inputFromFloor.value = this.fromFloor.toString();
};

ObjectParametersMenu.prototype.setValue = function () {
    var inputWidth = document.getElementById("w");
    var inputHeight = document.getElementById("h");
    var inputDepth = document.getElementById("d");
    var inputFromFloor =  document.getElementById("f");

    inputWidth.value = designer.widthSubtractObject.toString();
    inputHeight.value = designer.heightSubtractObject.toString();
    inputDepth.value = designer.depthSubtractObject.toString();
    inputFromFloor.value = designer.fromFloorSubtractObject.toString();
};

ObjectParametersMenu.prototype.getValue = function () {
   return {
       width: this.width,
       height: this.height,
       depth: this.depth,
       fromFloor: this.fromFloor
    }
};

ObjectParametersMenu.prototype.hiddenMenu = function () {
    var menu = document.getElementById("objectParametersMenu");
    menu.style.visibility = "hidden";
};

ObjectParametersMenu.prototype.visibleMenu = function () {
    var menu = document.getElementById("objectParametersMenu");
    menu.style.visibility = "visible";
};