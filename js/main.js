/* © 2009 ROBO Design
 * http://www.robodesign.ro
 */
var arrayWalls = [];
var arrayRooms = [];
var canvasMain, contextMain;
// Keep everything in anonymous function, called on window load.
if(window.addEventListener) {
    window.addEventListener('load', function () {
        var canvasTemp, contextTemp;
        var canvasWall, contextWall;

        // The active tool instance.
        var tool;
        var tool_default = 'line';


        var currentWall = {
            x0: 0,
            y0: 0,
            x1: 0,
            y1: 0
        };
        var wall = {
            leftTop:  {
                x: 0,
                y: 0,
            },
            rightTop: {
                x: 0,
                y: 0
            },
            rightBottom: {
                x: 0,
                y: 0
            },
            leftBottom: {
                x: 0,
                y: 0
            },
        };

        var room = {
            leftTop:  {
                x: 0,
                y: 0,
            },
            rightTop: {
                x: 0,
                y: 0
            },
            rightBottom: {
                x: 0,
                y: 0
            },
            leftBottom: {
                x: 0,
                y: 0
            },
        };

        var lineWidth = 50;

        function init () {
            // Find the canvasMain element.
            canvasMain = document.getElementById('imageView');

            canvasMain.width  = window.innerWidth / 2.1;
            canvasMain.height = window.innerHeight * 0.930;
            if (!canvasMain) {
                alert('Error: I cannot find the canvasTemp element!');
                return;
            }

            if (!canvasMain.getContext) {
                alert('Error: no canvasTemp.getContext!');
                return;
            }

            // Get the 2D canvasTemp contextTemp.
            contextMain = canvasMain.getContext('2d');
            if (!contextMain) {
                alert('Error: failed to getContext!');
                return;
            }

            // Add the temporary canvasTemp.
            var container = canvasMain.parentNode;
            canvasTemp = document.createElement('canvas');
            if (!canvasTemp) {
                alert('Error: I cannot create a new canvasTemp element!');
                return;
            }

            canvasTemp.id     = 'imageTemp';
            canvasTemp.width  = canvasMain.width;
            canvasTemp.height = canvasMain.height;
            container.appendChild(canvasTemp);

            contextTemp = canvasTemp.getContext('2d');
            contextWall = canvasTemp.getContext('2d');

            // Get the widthWall input.
            var widthWall = document.getElementById('widthWall');
            lineWidth = widthWall.value;
            if (!lineWidth) {
                alert('Error: failed to get the widthWall element!');
                lineWidth = 50;
                return;
            }
            widthWall.addEventListener('change', function (ev) {
                lineWidth = widthWall.value;

                console.log(lineWidth);
            }, false);

            // Get the tool select input.
            var tool_select = document.getElementById('dtool');
            if (!tool_select) {
                alert('Error: failed to get the dtool element!');
                return;
            }
            tool_select.addEventListener('change', ev_tool_change, false);

            // Activate the default tool.
            if (tools[tool_default]) {
                tool = new tools[tool_default]();
                tool_select.value = tool_default;
            }

            // Attach the mousedown, mousemove and mouseup event listeners.
            canvasTemp.addEventListener('mousedown', ev_canvas, false);
            canvasTemp.addEventListener('mousemove', ev_canvas, false);
            canvasTemp.addEventListener('mouseup',   ev_canvas, false);
            document.addEventListener('keydown', onKeyDown, false );
            window.addEventListener( 'resize', onWindowResize, false );
        }

        function onWindowResize() {
            canvasMain.width  = window.innerWidth / 2.1;
            canvasMain.height = window.innerHeight * 0.930;
            canvasTemp.width  = canvasMain.width;
            canvasTemp.height = canvasMain.height;

        }
        // The general-purpose event handler. This function just determines the mouse
        // position relative to the canvasTemp element.
        function ev_canvas (ev) {
            if (ev.layerX || ev.layerX == 0) { // Firefox
                ev._x = ev.layerX;
                ev._y = ev.layerY;
            } else if (ev.offsetX || ev.offsetX == 0) { // Opera
                ev._x = ev.offsetX;
                ev._y = ev.offsetY;
            }

            // Call the event handler of the tool.
            var func = tool[ev.type];
            if (func) {
                func(ev);
            }
        }

        // The event handler for any changes made to the tool selector.
        function ev_tool_change (ev) {
            if (tools[this.value]) {
                tool = new tools[this.value]();
            }
        }

        // This function draws the #imageTemp canvasTemp on top of #imageView, after which
        // #imageTemp is cleared. This function is called each time when the user
        // completes a drawing operation.
        function img_update (currentWall, currentRoom) {
            arrayWalls.push(currentWall);
            arrayRooms.push(currentRoom);
            // console.log(arrayWalls);
            contextMain.drawImage(canvasTemp, 0, 0);
            contextTemp.clearRect(0, 0, canvasTemp.width, canvasTemp.height);
        }

        function handleFileSelect(evt) {
            var file = evt.target.files; // FileList object
            var f = file[0];
            // Only process image files.
            if (!f.type.match('image.*')) {
                alert("Image only please....");
            }
            var reader = new FileReader();
            // Closure to capture the file information.
            reader.onload = (function(theFile) {
                return function(e) {
                    // Render thumbnail.
                    var span = document.createElement('span');
                    span.innerHTML = ['<img class="thumb" title="', escape(theFile.name), '" src="', e.target.result, '" />'].join('');
                    /*width="', canvasMain.width,'" height="', canvasMain.height,'"*/
                    document.getElementById('container').insertBefore(span, null);
                };
            })(f);
            // Read in the image file as a data URL.
            reader.readAsDataURL(f);
        }
        document.getElementById('file').addEventListener('change', handleFileSelect, false);


        // This object holds the implementation of each drawing tool.
        var tools = {};

        // The drawing pencil.
        tools.pencil = function () {
            var tool = this;
            this.started = false;

            // This is called when you start holding down the mouse button.
            // This starts the pencil drawing.
            this.mousedown = function (ev) {
                contextTemp.beginPath();
                contextTemp.moveTo(ev._x, ev._y);
                tool.started = true;
            };

            // This function is called every time you move the mouse. Obviously, it only
            // draws if the tool.started state is set to true (when you are holding down
            // the mouse button).
            this.mousemove = function (ev) {
                if (tool.started) {
                    contextTemp.lineTo(ev._x, ev._y);
                    contextTemp.stroke();
                }
            };

            // This is called when you release the mouse button.
            this.mouseup = function (ev) {
                if (tool.started) {
                    tool.mousemove(ev);
                    tool.started = false;
                    img_update();
                }
            };
        };

        // The rectangle tool.
        tools.rect = function () {
            var tool = this;
            this.started = false;

            this.mousedown = function (ev) {
                tool.started = true;
                tool.x0 = ev._x;
                tool.y0 = ev._y;
            };

            this.mousemove = function (ev) {
                if (!tool.started) {
                    return;
                }

                var x = Math.min(ev._x,  tool.x0),
                    y = Math.min(ev._y,  tool.y0),
                    w = Math.abs(ev._x - tool.x0),
                    h = Math.abs(ev._y - tool.y0);

                contextTemp.clearRect(0, 0, canvasTemp.width, canvasTemp.height);

                if (!w || !h) {
                    return;
                }

                contextTemp.strokeRect(x, y, w, h);
            };

            this.mouseup = function (ev) {
                if (tool.started) {
                    tool.mousemove(ev);
                    tool.started = false;
                    img_update();
                }
            };
        };

        // The line tool.
        tools.line = function () {
            var tool = this;
            this.started = false;

            this.mousedown = function (ev) {
                tool.started = true;
                tool.x0 = ev._x;
                tool.y0 = ev._y;
            };

            this.mousemove = function (ev) {
                if (!tool.started) {
                    return;
                }
                contextTemp.clearRect(0, 0, canvasTemp.width, canvasTemp.height);
                contextTemp.beginPath();
                if(ev.shiftKey) {
                    if (Math.abs(tool.x0 - ev._x) <= Math.abs(tool.y0 - ev._y)) {
                        contextTemp.moveTo(tool.x0, tool.y0);
                        contextTemp.lineTo(tool.x0, ev._y);
                        currentWall = {
                            x0: tool.x0,
                            y0: tool.y0,
                            x1: tool.x0,
                            y1: ev._y
                        };
                    } else {
                        contextTemp.moveTo(tool.x0, tool.y0);
                        contextTemp.lineTo(ev._x, tool.y0);
                        currentWall = {
                            x0: tool.x0,
                            y0: tool.y0,
                            x1: ev._x,
                            y1: tool.y0
                        };
                    }
                } else {
                    contextTemp.moveTo(tool.x0, tool.y0);
                    contextTemp.lineTo(ev._x, ev._y);
                    currentWall = {
                        x0: tool.x0,
                        y0: tool.y0,
                        x1: ev._x,
                        y1: ev._y
                    };
                }
                contextTemp.lineWidth = lineWidth;
                contextTemp.strokeStyle = "#898d94";
                contextTemp.stroke();
                contextTemp.closePath();
            };

            this.mouseup = function (ev) {
                if (tool.started) {
                    tool.mousemove(ev);
                    tool.started = false;
                    rectangle(currentWall, lineWidth / 2);
                    roomRectangle(currentWall, lineWidth / 2, lineWidth / 4 );
                    // img_update();
                }
            };
        };

        init();

        //keyboard
        function onKeyDown ( event ) {
            switch ( event.keyCode ) {
                case 13: // enter
                    img_update(wall, room);
                    break;
                case 83: // s - stop
                    break;
                case 84: // t - paused
                    break;
                case 32: // stop rotate
                    break;
            }
        }

        function rectangle(currentWall, depth) {

            var NvectorA = new THREE.Vector2(-(currentWall.y0 - currentWall.y1), (currentWall.x0 - currentWall.x1));
            NvectorA = NvectorA.normalize();

            var nS = NvectorA.multiplyScalar(depth);
            var a, b, c, d;
            var p0 = new THREE.Vector2( currentWall.x0, currentWall.y0 );
            var p1 = new THREE.Vector2( currentWall.x1, currentWall.y1 );

            a = new THREE.Vector2();
            a.subVectors(p0, nS);
            b = new THREE.Vector2();
            b.addVectors(p0, nS);

            c = new THREE.Vector2();
            c.subVectors(p1, nS);
            d = new THREE.Vector2();
            d.addVectors(p1, nS);

            var leftTop = {
                x: a.x,
                y: a.y,
            };
            var rightTop= {
                x: b.x,
                y: b.y
            };
            var rightBottom= {
                x: d.x,
                y: d.y
            };
            var leftBottom= {
                x: c.x,
                y: c.y
            };

            contextWall.moveTo(leftTop.x, leftTop.y);
            contextWall.lineTo(rightTop.x, rightTop.y);

            contextWall.moveTo(rightTop.x, rightTop.y);
            contextWall.lineTo(rightBottom.x, rightBottom.y);

            contextWall.moveTo(rightBottom.x, rightBottom.y);
            contextWall.lineTo(leftBottom.x, leftBottom.y);

            contextWall.moveTo(leftBottom.x, leftBottom.y);
            contextWall.lineTo(leftTop.x, leftTop.y);

            wall = {
                leftTop:  {
                    x: leftTop.x,
                    y: leftTop.y,
                },
                rightTop: {
                    x: rightTop.x,
                    y: rightTop.y
                },
                rightBottom: {
                    x: rightBottom.x,
                    y: rightBottom.y
                },
                leftBottom: {
                    x: leftBottom.x,
                    y: leftBottom.y
                },
            };

            contextWall.lineWidth = 2;
            contextWall.strokeStyle = "#454545"; // цвет линии
            contextWall.stroke();
            contextWall.closePath();
        }

        function roomRectangle(currentWall, depth, width) {

            var NvectorA = new THREE.Vector2(-(currentWall.y0 - currentWall.y1), (currentWall.x0 - currentWall.x1));
            NvectorA = NvectorA.normalize();

            var nS = NvectorA.multiplyScalar(depth);
            var a, b, c, d;
            var p0 = new THREE.Vector2( currentWall.x0, currentWall.y0);
            var p1 = new THREE.Vector2( currentWall.x1, currentWall.y1);

            var NvectorB = new THREE.Vector2((p1.x - p0.x), (p1.y - p0.y));
            NvectorB = NvectorB.normalize();

            p0.x += NvectorB.x*width;
            p0.y += NvectorB.y*width;

            p1.x += NvectorB.x*width;
            p1.x += NvectorB.y*width;

            a = new THREE.Vector2();
            a.subVectors(p0, nS);
            b = new THREE.Vector2();
            b.addVectors(p0, nS);

            c = new THREE.Vector2();
            c.subVectors(p1, nS);
            d = new THREE.Vector2();
            d.addVectors(p1, nS);

            var leftTop = {
                x: a.x,
                y: a.y,
            };
            var rightTop= {
                x: b.x,
                y: b.y
            };
            var rightBottom= {
                x: d.x,
                y: d.y
            };
            var leftBottom= {
                x: c.x,
                y: c.y
            };

            contextWall.moveTo(leftTop.x, leftTop.y);
            contextWall.lineTo(rightTop.x, rightTop.y);

            contextWall.moveTo(rightTop.x, rightTop.y);
            contextWall.lineTo(rightBottom.x, rightBottom.y);

            contextWall.moveTo(rightBottom.x, rightBottom.y);
            contextWall.lineTo(leftBottom.x, leftBottom.y);

            contextWall.moveTo(leftBottom.x, leftBottom.y);
            contextWall.lineTo(leftTop.x, leftTop.y);

            room = {
                leftTop:  {
                    x: leftTop.x,
                    y: leftTop.y,
                },
                rightTop: {
                    x: rightTop.x,
                    y: rightTop.y
                },
                rightBottom: {
                    x: rightBottom.x,
                    y: rightBottom.y
                },
                leftBottom: {
                    x: leftBottom.x,
                    y: leftBottom.y
                },
            };

            contextWall.lineWidth = 2;
            contextWall.strokeStyle = "#454545"; // цвет линии
            contextWall.stroke();
            contextWall.closePath();
        }


       /* function runOnKeys(func) {
            var codes = [].slice.call(arguments, 1);

            var pressed = {};

            document.onkeydown = function(e) {
                e = e || window.event;

                pressed[e.keyCode] = true;

                for (var i = 0; i < codes.length; i++) { // проверить, все ли клавиши нажаты
                    if (!pressed[codes[i]]) {
                        return;
                    }
                }

                // во время показа alert, если посетитель отпустит клавиши - не возникнет keyup
                // при этом JavaScript "пропустит" факт отпускания клавиш, а pressed[keyCode] останется true
                // чтобы избежать "залипания" клавиши -- обнуляем статус всех клавиш, пусть нажимает всё заново
                pressed = {};

                func();

            };

            document.onkeyup = function(e) {
                e = e || window.event;

                delete pressed[e.keyCode];
            };

        }*/

       /* runOnKeys(
            function() {
                alert("Привет!")
            },
            "Q".charCodeAt(0),
            "W".charCodeAt(0)
        );*/

    }, false);
}

// vim:set spell spl=en fo=wan1croql tw=80 ts=2 sw=2 sts=2 sta et ai cin fenc=utf-8 ff=unix:

