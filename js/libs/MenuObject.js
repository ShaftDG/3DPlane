function MenuObject() {

    var colorBorder = "#3997ad";
    var newDiv = document.createElement("div");
    newDiv.id = "contextMenuObject";
    newDiv.name = "contextMenuObject";
    newDiv.classList.add("styleMenu");
    document.body.appendChild(newDiv);

    var button1 = document.createElement("button");
    button1.id = "button1";
    button1.name = "button1";
    button1.classList.add("generalStyleButton");
    button1.classList.add("button1");
    newDiv.appendChild(button1);

    var button2 = document.createElement("button");
    button2.id = "button2";
    button2.name = "button2";
    button2.classList.add("generalStyleButton");
    button2.classList.add("button2");
    newDiv.appendChild(button2);

    var button3 = document.createElement("button");
    button3.id = "button3";
    button3.name = "button3";
    button3.classList.add("generalStyleButton");
    button3.classList.add("button3");
    newDiv.appendChild(button3);

    var button4 = document.createElement("button");
    button4.id = "button3";
    button4.name = "button3";
    button4.classList.add("generalStyleButton");
    button4.classList.add("button4");
    newDiv.appendChild(button4);
}

MenuObject.prototype.constructor = MenuObject;

MenuObject.prototype.setPosition = function (event, position) {


    var canvas = renderer.domElement,
    point = new THREE.Vector3();

    point.x = position.x,
    point.y = position.y,
    point.z = position.z,

    point.project( camera );

    point.x = Math.round(( 0.5 + point.x / 2 ) * ( canvas.width / window.devicePixelRatio ));
    point.y = Math.round(( 0.5 - point.y / 2 ) * ( canvas.height / window.devicePixelRatio ));

    var tempX = point.x - 50;
    var tempY = point.y - 140;

    var menu = document.getElementById("contextMenuObject");
    menu.style.top = tempY.toString() + "px";
    menu.style.left = tempX.toString() + "px";

    this.visibleMenu();
   /* if (menu.style.visibility === "hidden") {
        menu.style.visibility = "visible";
    } else {
        menu.style.visibility = "hidden";
    }*/
};

MenuObject.prototype.hiddenMenu = function () {
    var menu = document.getElementById("contextMenuObject");
    menu.style.visibility = "hidden";
};

MenuObject.prototype.visibleMenu = function () {
    var menu = document.getElementById("contextMenuObject");
    menu.style.visibility = "visible";
};