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

    this.inputWidth = document.createElement("input");
    this.inputWidth.type = "number";
    this.inputWidth.step="1";
    this.inputWidth.min="0";
    this.inputWidth.max="1000";
    this.inputWidth.value="20";
    this.inputWidth.id="w";
    this.inputWidth.name="w";
    container.appendChild(this.inputWidth);

    var labelHeight = document.createElement("label");
    labelHeight.innerText = "Высота, (см):";
    container.appendChild(labelHeight);

    this.inputHeight = document.createElement("input");
    this.inputHeight.type = "number";
    this.inputHeight.step="1";
    this.inputHeight.min="0";
    this.inputHeight.max="1000";
    this.inputHeight.value="20";
    this.inputHeight.id="h";
    this.inputHeight.name="h";
    container.appendChild(this.inputHeight);

    var labelDepth = document.createElement("label");
    labelDepth.innerText = "Глубина, (см):";
    container.appendChild(labelDepth);

    this.inputDepth = document.createElement("input");
    this.inputDepth.type = "number";
    this.inputDepth.step="1";
    this.inputDepth.min="0";
    this.inputDepth.max="1000";
    this.inputDepth.value="20";
    this.inputDepth.id="d";
    this.inputDepth.name="d";
    container.appendChild(this.inputDepth);

    var labelFromFloor = document.createElement("label");
    labelFromFloor.innerText = "От пола, (см):";
    container.appendChild(labelFromFloor);

    this.inputFromFloor = document.createElement("input");
    this.inputFromFloor.type = "number";
    this.inputFromFloor.step="1";
    this.inputFromFloor.min="0";
    this.inputFromFloor.max="1000";
    this.inputFromFloor.value="20";
    this.inputFromFloor.id="f";
    this.inputFromFloor.name="f";
    container.appendChild(this.inputFromFloor);

    this.width = 0;
    this.height = 0;
    this.depth = 0;
    this.fromFloor = 0;

    this.inputWidth.addEventListener('change', function (ev) {
        this.width = +this.inputWidth.value;
    }, false);

    this.inputHeight.addEventListener('change', function (ev) {
        this.height = +this.inputHeight.value;
    }, false);

    this.inputDepth.addEventListener('change', function (ev) {
        this.depth = +this.inputDepth.value;
    }, false);

    this.inputFromFloor.addEventListener('change', function (ev) {
        this.fromFloor = +this.inputFromFloor.value;
    }, false);

}

ObjectParametersMenu.prototype.constructor = ObjectParametersMenu;

ObjectParametersMenu.prototype.setValue = function (object) {
    // var box = object.children[0].box;

    var width = object.userData.width;
    var height = object.userData.height;
    var depth = object.userData.depth;
    var fromFloor = object.userData.fromFloor;
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.fromFloor = fromFloor;

    this.inputWidth.value = this.width.toString();
    this.inputHeight.value = this.height.toString();
    this.inputDepth.value = this.depth.toString();
    this.inputFromFloor.value = this.fromFloor.toString();
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