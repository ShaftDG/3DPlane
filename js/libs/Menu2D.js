function Menu2D() {
    var container = document.createElement("div");
    container.id = "Menu2D";
    container.name = "Menu2D";
    container.innerHTML = " <div style=\"text-align: center\">\n" +
        "            <!--<label>Загрузить план:</label>-->\n" +
        "            <!--<input type=\"file\" id=\"file\" name=\"file\" />-->\n" +
        "            <label for=\"file\" class=\"custom-file-uploadMenu2D\">\n" +
        "                Загрузить план\n" +
        "            </label>\n" +
        "            <input id=\"file\" name=\"file\" type=\"file\"/>\n" +
        "        </div>\n" +
        "        <div>\n" +
        "            <span id=\"output\"></span>\n" +
        "        </div>";
    container.classList.add("styleMenu2D");
    container.classList.add("columnsMenu2D");
    document.body.appendChild(container);

    var pButton = document.createElement("p");
    pButton.style.width = "54px";
    pButton.style.height = "100px";
    container.appendChild(pButton);

    var buttonDrawing = document.createElement("button");
    buttonDrawing.style.width = "53px";
    buttonDrawing.style.height = "53px";
    buttonDrawing.innerHTML = "<img name=\"changeInstrument\" src=\"textures/icons/plane.png\" width=\"32\" height=\"32\"\n" +
        "class=\"icon-button\">";
    buttonDrawing.id = "changeInstrument";
    buttonDrawing.name = "changeInstrument";
    buttonDrawing.value = "Cтена";
    buttonDrawing.title = "Рисовать стену";
    buttonDrawing.classList.add("inputInstrumentUnselected");
    pButton.appendChild(buttonDrawing);


    var buttonMagnet = document.createElement("button");
    buttonMagnet.style.width = "53px";
    buttonMagnet.style.height = "53px";
    buttonMagnet.innerHTML = "<img name=\"changeMagnet\" src=\"textures/icons/magnet.png\" width=\"40\" height=\"40\"\n" +
        "class=\"icon-button\">";
    buttonMagnet.style.marginTop = "2%";
    buttonMagnet.id = "changeMagnet";
    buttonMagnet.name = "changeMagnet";
    buttonMagnet.value = "Magnet";
    buttonMagnet.title = "Притягивание к существующим точкам";
    buttonMagnet.classList.add("inputInstrumentUnselected");
    pButton.appendChild(buttonMagnet);


    var pInput = document.createElement("p");
    container.appendChild(pInput);

    var labelWidth = document.createElement("label");
    labelWidth.innerText = "Толщина стены, (см):";
    labelWidth.classList.add("labelMenu2D");
    pInput.appendChild(labelWidth);

    var inputWidth = document.createElement("input");
    inputWidth.style.marginBottom = "1%";
    inputWidth.type = "number";
    inputWidth.step="1";
    inputWidth.min="0";
    inputWidth.max="1000";
    inputWidth.value="20";
    inputWidth.id="widthWall";
    inputWidth.name="widthWall";
    pInput.appendChild(inputWidth);

    var labelHeight = document.createElement("label");
    labelHeight.classList.add("labelMenu2D");
    labelHeight.innerText = "Высота стены, (см):";
    pInput.appendChild(labelHeight);

    var inputHeight = document.createElement("input");
    inputHeight.style.marginBottom = "1%";
    inputHeight.type = "number";
    inputHeight.step="1";
    inputHeight.min="0";
    inputHeight.max="1000";
    inputHeight.value="280";
    inputHeight.id="heightWall";
    inputHeight.name="heightWall";
    pInput.appendChild(inputHeight);

    inputWidth.addEventListener('change', function (ev) {
        designer.widthWall = +inputWidth.value;
        if (!designer.widthWall) {
            alert('Error: failed to get the widthWall element!');
            designer.widthWall = 20;
            return;
        }
    }, false);

    inputHeight.addEventListener('change', function (ev) {
        designer.heightWall = +inputHeight.value;
        if (!designer.heightWall) {
            alert('Error: failed to get the heightWall element!');
            designer.heightWall = 280;
            return;
        }
    }, false);

    buttonDrawing.addEventListener("click", this.changeInstrument);
    buttonMagnet.addEventListener("click", this.changeMagnet);

    document.getElementById('file').addEventListener('change', handleFileSelect, false);
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
                    designer.menuScaling.visibleMenu();
                    designer.menu2D.hiddenMenu();
                    designer.objectParametersMenu.hiddenMenu();
                    designer.menuObject.hiddenMenu();
                }
            );
        }
    }
}

Menu2D.prototype.constructor = Menu2D;

Menu2D.prototype.changeInstrument = function (){
    if (
        camera.isOrthographicCamera &&
        !designer.boolCursor &&
        !designer.selectedSubtractObject
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

    function changeColorButton (){
        var buttonDrawing = document.getElementById("changeInstrument");
        if (designer.selectedInstr) {
            buttonDrawing.classList.remove("inputInstrumentUnselected");
            buttonDrawing.classList.add("inputInstrumentSelected");
        } else {
            buttonDrawing.classList.remove("inputInstrumentSelected");
            buttonDrawing.classList.add("inputInstrumentUnselected");
        }
    }
};

Menu2D.prototype.changeColorButton = function (){
    var buttonDrawing = document.getElementById("changeInstrument");
    var buttonMagnet = document.getElementById("changeMagnet");
        if (designer.selectedInstr) {
            buttonDrawing.classList.remove("inputInstrumentUnselected");
            buttonDrawing.classList.add("inputInstrumentSelected");
        } else {
            buttonDrawing.classList.remove("inputInstrumentSelected");
            buttonDrawing.classList.add("inputInstrumentUnselected");
        }

        if (designer.boolMagnet) {
            buttonMagnet.classList.remove("inputInstrumentUnselected");
            buttonMagnet.classList.add("inputInstrumentSelected");
        } else {
            buttonMagnet.classList.remove("inputInstrumentSelected");
            buttonMagnet.classList.add("inputInstrumentUnselected");
        }
};

Menu2D.prototype.changeMagnet = function (){
        if (
            camera.isOrthographicCamera &&
            !designer.boolCursor &&
            !designer.selectedSubtractObject
        ) {
            designer.boolMagnet = !designer.boolMagnet;
            changeColorButton();
        }
    function changeColorButton (){
        var buttonMagnet = document.getElementById("changeMagnet");
        if (designer.boolMagnet) {
            buttonMagnet.classList.remove("inputInstrumentUnselected");
            buttonMagnet.classList.add("inputInstrumentSelected");
        } else {
            buttonMagnet.classList.remove("inputInstrumentSelected");
            buttonMagnet.classList.add("inputInstrumentUnselected");
        }
    }
};

Menu2D.prototype.hiddenMenu = function () {
    var menu = document.getElementById("Menu2D");
    menu.style.visibility = "hidden";
};

Menu2D.prototype.visibleMenu = function () {
    var menu = document.getElementById("Menu2D");
    menu.style.visibility = "visible";
};