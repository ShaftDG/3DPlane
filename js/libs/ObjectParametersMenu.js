function ObjectParametersMenu() {
    var colorBorder = "#3997ad";
    var container = document.createElement("div");
    container.id = "objectParametersMenu";
    container.name = "objectParametersMenu";
    container.classList.add("styleObjectParametersMenu");
    document.body.appendChild(container);

    var labelWidth = document.createElement("label");
    labelWidth.innerText = "Ширина, (см):";
    container.appendChild(labelWidth);

    var inputWidth = document.createElement("input");
    inputWidth.type = "number";
    inputWidth.step="1";
    inputWidth.min="0";
    inputWidth.max="1000";
    inputWidth.value="20";
    inputWidth.id="w";
    inputWidth.name="w";
    container.appendChild(inputWidth);

    var labelHeight = document.createElement("label");
    labelHeight.innerText = "Высота, (см):";
    container.appendChild(labelHeight);

    var inputHeight = document.createElement("input");
    inputHeight.type = "number";
    inputHeight.step="1";
    inputHeight.min="0";
    inputHeight.max="1000";
    inputHeight.value="20";
    inputHeight.id="h";
    inputHeight.name="h";
    container.appendChild(inputHeight);

    var labelDepth = document.createElement("label");
    labelDepth.innerText = "Глубина, (см):";
    container.appendChild(labelDepth);

    var inputDepth = document.createElement("input");
    inputDepth.type = "number";
    inputDepth.step="1";
    inputDepth.min="0";
    inputDepth.max="1000";
    inputDepth.value="20";
    inputDepth.id="d";
    inputDepth.name="d";
    container.appendChild(inputDepth);

    var labelFromFloor = document.createElement("label");
    labelFromFloor.innerText = "От пола, (см):";
    container.appendChild(labelFromFloor);

    var inputFromFloor = document.createElement("input");
    inputFromFloor.type = "number";
    inputFromFloor.step="1";
    inputFromFloor.min="0";
    inputFromFloor.max="1000";
    inputFromFloor.value="20";
    inputFromFloor.id="f";
    inputFromFloor.name="f";
    container.appendChild(inputFromFloor);

    this.width = 0;
    this.height = 0;
    this.depth = 0;
    this.fromFloor = 0;

    inputWidth.addEventListener('change', function (ev) {
        if (designer.selectedSubtractObject) {
            designer.widthSubtractObject = +inputWidth.value;
            designer.selectedSubtractObject.userData.width = designer.widthSubtractObject;
            var changedSize = new THREE.Vector3(designer.widthSubtractObject, null, null);
            if (camera.isPerspectiveCamera) {
                designer.changeSize3D(designer.selectedSubtractObject, changedSize);
            } else if (camera.isOrthographicCamera) {
                designer.changeSize2D(designer.selectedSubtractObject, changedSize);
            }
        }
    }, false);

    inputHeight.addEventListener('change', function (ev) {
        if (designer.selectedSubtractObject) {
            designer.heightSubtractObject = +inputHeight.value;
            designer.selectedSubtractObject.userData.height = designer.heightSubtractObject;
            var changedSize = new THREE.Vector3(null, designer.heightSubtractObject, null);
            if (camera.isPerspectiveCamera) {
                designer.changeSize3D(designer.selectedSubtractObject, changedSize);
            }
        }
    }, false);

    inputDepth.addEventListener('change', function (ev) {
        if (designer.selectedSubtractObject) {
            designer.depthSubtractObject = +inputDepth.value;
            designer.selectedSubtractObject.userData.depth = designer.depthSubtractObject;
            var changedSize;
            if (camera.isPerspectiveCamera) {
                changedSize = new THREE.Vector3(null, null, designer.depthSubtractObject);
                designer.changeSize3D(designer.selectedSubtractObject, changedSize);
            } else if (camera.isOrthographicCamera) {
                changedSize = new THREE.Vector3(null, designer.depthSubtractObject, null);
                designer.changeSize2D(designer.selectedSubtractObject, changedSize);
            }
        }
    }, false);

    inputFromFloor.addEventListener('change', function (ev) {
        if (designer.selectedSubtractObject) {
            designer.fromFloorSubtractObject = +inputFromFloor.value;
            designer.selectedSubtractObject.userData.fromFloor = designer.fromFloorSubtractObject;
        }
    }, false);

}

ObjectParametersMenu.prototype.constructor = ObjectParametersMenu;

ObjectParametersMenu.prototype.setValue = function (object) {
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