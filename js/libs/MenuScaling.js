function MenuScaling() {
    var container = document.createElement("div");
    container.id = "MenuScaling";
    container.name = "MenuScaling";
    container.classList.add("styleMenuScaling");
    container.classList.add("columnsMenuScaling");
    document.body.appendChild(container);

    var pButton = document.createElement("p");
    pButton.style.width = "53px";
    pButton.style.height = "53px";
    container.appendChild(pButton);

    var buttonScaling = document.createElement("button");
    buttonScaling.style.width = "53px";
    buttonScaling.style.height = "53px";
    buttonScaling.innerHTML = "<img name=\"changeScale\" src=\"textures/icons/scale.png\" width=\"32\" height=\"32\"\n" +
        "class=\"icon-button\">";
    buttonScaling.id = "changeScale";
    buttonScaling.name = "changeScale";
    buttonScaling.value = "Масштаб";
    buttonScaling.title = "Установить масштаб";
    buttonScaling.classList.add("inputInstrumentUnselected");
    pButton.appendChild(buttonScaling);


    var pInput = document.createElement("p");
    pInput.style.width = "110px";
    pInput.style.height = "53px";
    container.appendChild(pInput);

    var labelScaling = document.createElement("label");
    labelScaling.innerText = "Значение, (см):";
    labelScaling.classList.add("labelMenuScaling");
    pInput.appendChild(labelScaling);

    var inputScaling = document.createElement("input");
    inputScaling.type = "number";
    inputScaling.step="1";
    inputScaling.min="1";
    inputScaling.max="1000";
    inputScaling.value="1";
    inputScaling.id="valueScale";
    inputScaling.name="valueScale";
    pInput.appendChild(inputScaling);

    var pSave = document.createElement("p");
    pSave.style.width = "53px";
    pSave.style.height = "53px";
    container.appendChild(pSave);
    var buttonOk = document.createElement("button");
    buttonOk.style.width = "53px";
    buttonOk.style.height = "53px";
    buttonOk.innerHTML = "<img name=\"changeScale\" src=\"textures/icons/save.png\" width=\"32\" height=\"32\"\n" +
        "class=\"icon-button\">";
    buttonOk.id = "okScale";
    buttonOk.name = "okScale";
    buttonOk.value = "ok";
    buttonOk.title = "Подтвердить";
    buttonOk.classList.add("inputInstrumentUnselected");
    pSave.appendChild(buttonOk);

    inputScaling.addEventListener('change', function (ev) {
        designer.valueScale = +inputScaling.value;
        if (!designer.valueScale) {
            alert('Error: failed to get the valueScale element!');
            designer.valueScale = 1;
            return;
        }
    }, false);

    buttonScaling.addEventListener("click", this.changeScale);
    buttonOk.addEventListener("click", this.okScale);
        // designer.calculateScale(designer.positionsScale);

}

MenuScaling.prototype.constructor = MenuScaling;

MenuScaling.prototype.okScale = function (){
    designer.calculateScale(designer.positionsScale);
    designer.selectedScale = false;
    designer.groupLinesScale.visible = false;
    changeColorButton();
    if (designer.count === 0) {
        if (designer.planeBackground) {
            designer.planeBackground.scale.set(1 / designer.scalePlane, 1 / designer.scalePlane, 1 / designer.scalePlane);
        }
    }

    designer.menuScaling.hiddenMenu();
    designer.menu2D.visibleMenu();
};

MenuScaling.prototype.changeScale = function (){
    if (
        camera.isOrthographicCamera &&
        !designer.boolCursor &&
        !designer.selectedSubtractObject
    ) {
        designer.groupLinesScale.visible = true;
        designer.selectedScale = !designer.selectedScale;
        designer.selectedInstr = false;
        changeColorButton();
        if (designer.selectedScale) {
            designer.clearPointsScalePosition();
        }
    }

    function changeColorButton (){
        var buttonScaling = document.getElementById("changeScale");
        if (designer.selectedScale) {
            buttonScaling.classList.remove("inputInstrumentUnselected");
            buttonScaling.classList.add("inputInstrumentSelected");
        } else {
            buttonScaling.classList.remove("inputInstrumentSelected");
            buttonScaling.classList.add("inputInstrumentUnselected");
        }
    }
};

MenuScaling.prototype.changeColorButton = function (){
    var buttonScaling = document.getElementById("changeScale");
    if (designer.selectedScale) {
        buttonScaling.classList.remove("inputInstrumentUnselected");
        buttonScaling.classList.add("inputInstrumentSelected");
    } else {
        buttonScaling.classList.remove("inputInstrumentSelected");
        buttonScaling.classList.add("inputInstrumentUnselected");
    }
};

MenuScaling.prototype.hiddenMenu = function () {
    var menu = document.getElementById("MenuScaling");
    menu.style.visibility = "hidden";
};

MenuScaling.prototype.visibleMenu = function () {
    var menu = document.getElementById("MenuScaling");
    menu.style.visibility = "visible";
};