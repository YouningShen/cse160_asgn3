// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main()
  {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  
  // texture handling
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor; // color
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0); // debug color
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV); // texture0
    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV); // texture1
    } else if (u_whichTexture == 2) {
      gl_FragColor = texture2D(u_Sampler2, v_UV); // texture2
    } else {
      gl_FragColor = vec4(1, .2, .2, 1); // error color
    }
  }`

// global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_whichTexture;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  canvas.setAttribute('tabindex','1');  // ensure it can be focused
  canvas.addEventListener('click', () => canvas.focus());  // auto-focus when clicked

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the sotrage location of u_ModelMatrix');
    return;
  }

  // get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // get the storage location of u_ViewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  // get the storage location of u_ProjectionMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  // get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  // get the storage location of u_Sampler1
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }

  // get the storage location of u_Sampler2
  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return false;
  }

  // get the storage location of u_whichTexture
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return false;
  }

  // set initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

  // set initial value for projection and view matrices
  var projectionMatrix = new Matrix4();
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projectionMatrix.elements);

  var viewMatrix = new Matrix4();
  gl.uniformMatrix4fv(u_ViewMatrix, false, projectionMatrix.elements);
}

// consts
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// globals for Assignment 2
// camera move
let g_globalAngleY = 0;
let g_globalAngleX = 0;
let g_shiftKeyActivated = true;
let g_lastX = null;
let g_lastY = null;
let sliderX;
let sliderY;
// limb stuff
let g_yellowAngle = 0;
let g_yellowAnimation = false;
let g_earAnimation = false;
let g_middleAnimation = false;
let g_earRotate = 0;
let g_middleRotate = 0;
let g_hatSpin = 0;
// camera
var g_camera = new Camera();

// handle keydown events
function keydown(ev) {
  console.log("Key pressed:", ev.key);

  if (ev.key == "w") {
    g_camera.moveForward();
    console.log("forward!");
  }
  if (ev.key == "s") {
    g_camera.moveBackward();
  }
  if (ev.key == "a") {
    g_camera.moveLeft();
  }
  if (ev.key == "d") {
    g_camera.moveRight();
  }
  if (ev.key == "q") {
    g_camera.turnLeft();
  }
  if (ev.key == "e") {
    g_camera.turnRight();
  }
}

// set up actions for the HTML UI elements
function addActionsForHTMLUI() {
  // button events
  document.getElementById('animationYellowOnButton').onclick = function () { g_yellowAnimation = true; g_earAnimation = true; g_middleAnimation = true; };
  document.getElementById('animationYellowOffButton').onclick = function () { g_yellowAnimation = false; g_earAnimation = false; g_middleAnimation = false; };
  // movement events
  document.addEventListener('keydown', keydown)
  // credit for camera turn from 'Stanley the Flying Elephant - Nicholas Eastmond' (from the hall of fame)

  canvas.onmousedown = (ev) => {
    let [x, y] = convertCoordinatesToGL(ev);
    g_lastX = x;
    g_lastY = y;
    if (ev.shiftKey) {
      g_shiftKeyActivated = !g_shiftKeyActivated;
    }
  }
  canvas.onmousemove = function (ev) {
    let [x, y] = convertCoordinatesToGL(ev);
    if (ev.buttons == 1) {
      g_globalAngleY -= (x - g_lastX) * 50;
      g_globalAngleX -= (y - g_lastY) * 50;
      g_lastX = x;
      g_lastY = y;
    } else {
      g_lastX = x;
      g_lastY = y;
    }
  }

  // Mouse clicks for block add/delete
  canvas.addEventListener("mousedown", function (ev) {
    ev.preventDefault(); // prevent right-click menu
    if (ev.button === 0) {  // Left click
      addBlockAtCamera();
    } else if (ev.button === 2) {  // Right click
      deleteBlockAtCamera();
    }
    renderAllShapes();
  });

  // Prevent right-click menu on canvas
  canvas.addEventListener("contextmenu", function (ev) {
    ev.preventDefault();
  });
  
}

// initTextures
function initTextures(gl) {

  // inits
  var image0 = new Image(); // create the image object
  if (!image0) {
    console.log('Failed to create the image object');
    return false;
  }

  var image1 = new Image(); // create the image object
  if (!image1) {
    console.log('Failed to create the image object');
    return false;
  }
  
  var image2 = new Image(); // create the image object
  if (!image2) {
    console.log('Failed to create the image object');
    return false;
  }
  
  // register the event handler to be called on loading an image
  image0.onload = function(){ sendTextureToTEXTURE0(image0); };
  // tell the browser to load an image
  image0.src = '../resources/grass.png';

  // register the event handler to be called on loading an image
  image1.onload = function(){ sendTextureToTEXTURE1(image1); };
  // tell the browser to load an image
  image1.src = '../resources/sky.png';

  // register the event handler to be called on loading an image
  image2.onload = function(){ sendTextureToTEXTURE2(image2); };
  // tell the browser to load an image
  image2.src = '../resources/doraemon.png';

  return true;
}

// sendTextureToGLSL0
function sendTextureToTEXTURE0(image) {
  var texture0 = gl.createTexture(); // create a texture object
  if (!texture0) {
    console.log('Failed to create the texture object');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // flip the image's y axis
  // enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture0);

  // set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);

  //gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

  //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
  console.log("finished loadTexture0");
}

// sendTextureToGLSL1
function sendTextureToTEXTURE1(image) {
  var texture1 = gl.createTexture(); // create a texture object
  if (!texture1) {
    console.log('Failed to create the texture object');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // flip the image's y axis
  // enable texture unit1
  gl.activeTexture(gl.TEXTURE1);
  // bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture1);

  // set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // set the texture unit 1 to the sampler
  gl.uniform1i(u_Sampler1, 1);

  console.log("finished loadTexture1");
}

// sendTextureToGLSL2
function sendTextureToTEXTURE2(image) {
  var texture2 = gl.createTexture(); // create a texture object
  if (!texture2) {
    console.log('Failed to create the texture object');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // flip the image's y axis
  // enable texture unit1
  gl.activeTexture(gl.TEXTURE2);
  // bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture2);

  // set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // set the texture unit 1 to the sampler
  gl.uniform1i(u_Sampler2, 2);

  console.log("finished loadTexture2");
}

function main() {

  // set up canvas and GL variables
  setupWebGL();

  // set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  // set up actions for the HTML UI elements
  addActionsForHTMLUI();

  // init textures
  initTextures(gl);

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // render
  requestAnimationFrame(tick);
}

var g_startTime = performance.now() / 1000;
// tick
function tick() {
  // update current time
  g_seconds = performance.now() / 500 - g_startTime;
  console.log(performance.now);

  // update animation angles
  updateAnimationAngles();

  // action
  renderAllShapes();

  // recurse..? sorta
  requestAnimationFrame(tick);
}

// update the angles of everything that is currently animated
function updateAnimationAngles() {
  // neck
  if (g_yellowAnimation == true) {
    g_yellowAngle = 16 * Math.sin(g_seconds);
  }
  // ears
  if (g_earAnimation == true) {
    g_earRotate = 6 * Math.sin(g_seconds) - 20;
  }
  if (g_middleAnimation == true) {
    g_middleRotate = 5 * Math.sin(g_seconds);
  }
  if (!g_shiftKeyActivated) {
    g_hatSpin = 90 * Math.sin(g_seconds);
  }
}

// canvas stuff
function convertCoordinatesToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return ([x, y]);
}

// map function here:
var g_map = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
];

// function to draw the map
function drawMap() {
  for (x = 0; x < 8; x++) {
    for (y = 0; y < 8; y++) {
      if (g_map[y][x] == 1) {
        var bar1 = new Cube();
        bar1.color = [1, 0, 0, 1];
        bar1.matrix.translate(x-4, -.75, y-4);
        bar1.render();
        var bar2 = new Cube();
        bar2.color = [1, 0, 0, 1];
        bar2.matrix.translate(x-4, 1, y-4);
        bar2.render();
      }
    }
  }
}

// render function (the big one (big))

function renderAllShapes() {
  // track performance
  var renderStart = performance.now();
  
  // pass the projection matrix
  var projMat = new Matrix4();
  projMat.setPerspective(50, canvas.width / canvas.height, 1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  // pass the view matrix
  var viewMat = new Matrix4();
  viewMat.setLookAt(g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
    g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2],
    g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  // pass the matrix to u_ModelMatrix attribute
  var globalRotMat = new Matrix4();
  globalRotMat.rotate(g_globalAngleY, 0, 1, 0);
  globalRotMat.rotate(-g_globalAngleX, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  // clear... other buffer?
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // environment setup
  // skybox
  var skybox = new Cube();
  skybox.color = [1, 0, 0, 1];
  skybox.textureNum = 1;
  skybox.matrix.scale(50, 50, 50);
  skybox.matrix.translate(-.5, -.5, -.5);
  skybox.render();

  // floor
  var floor = new Cube();
  floor.color = [1, 0, 0, 1];
  floor.textureNum = 0;
  floor.matrix.translate(0, -1, 0);
  floor.matrix.scale(10, .01, 10);
  floor.matrix.translate(-.5, 0, -.5);
  floor.render();

    // floor2
    var floor2 = new Cube();
    floor2.color = [1, 0, 0, 1];
    floor2.textureNum = 0;
    floor2.matrix.translate(0, 2.5, 0);
    floor2.matrix.scale(10, .01, 10);
    floor2.matrix.translate(-.5, 0, -.5);
    floor2.render();
  // ceiling
  var ceiling = new Cube();
  ceiling.color = [1, 0, 0, 1];
  ceiling.textureNum = 2;
  ceiling.matrix.translate(0, 24.99, 0);
  ceiling.matrix.scale(50, .01, 50);
  ceiling.matrix.translate(-.5, 0, -.5);
  ceiling.render();

  // draw the slug
  // bottom
  var bottomseg = new Cube();
  bottomseg.color = [1.0, 1.0, 0.0, 1.0];
  bottomseg.textureNum = -2;
  bottomseg.matrix.translate(-.15, -.75, 0.0);
  var bottomCoordinatesMat = new Matrix4(bottomseg.matrix);
  bottomseg.matrix.translate(-.02, 0, 0);
  bottomseg.matrix.scale(.35, .35, .5);
  bottomseg.render();
  //neck
  var neck = new Cube();
  neck.color = [1, 1, 0, 1];
  neck.textureNum = -2;
  neck.matrix.translate(0, -.5, 0, 0);
  neck.matrix.rotate(-5, 1, 0, 0);
  // animation
  neck.matrix.rotate(g_yellowAngle, 1, 0, 0);
  // update matrix for attached limbs
  var neckCoordinatesMat = new Matrix4(neck.matrix);
  neck.matrix.scale(.25, .4, .3);
  neck.matrix.translate(-.5, 0, 0);
  neck.render();
  // head
  var head = new Cube();
  head.color = [.9, .9, 0, 1];
  head.textureNum = -2;
  head.matrix = neckCoordinatesMat;
  head.matrix.translate(0, .65, 0);
  var headCoordinatesMat = new Matrix4(head.matrix);
  head.matrix.rotate(0, 1, 0, 0);
  head.matrix.scale(.3, .3, .32);
  head.matrix.translate(-.5, -1.5, -0.001);
  head.render();
  // nose
  var nose = new Cube();
  nose.color = [.8, .8, 0, 1];
  nose.textureNum = -2;
  nose.matrix = new Matrix4(headCoordinatesMat);
  nose.matrix.rotate(-15, 1, 0, 0)
  nose.matrix.scale(.05, .05, .1);
  nose.matrix.translate(-.5, -7.5, -1.5)
  nose.render();
  // ear?? 1
  var ear1 = new Cube();
  ear1.color = [.8, .8, 0, 1];
  ear1.textureNum = -2;
  ear1.matrix = new Matrix4(headCoordinatesMat);
  ear1.matrix.rotate(g_earRotate, 1, 0, 0);
  ear1.matrix.rotate(-30, 1, 0, 0);
  ear1.matrix.translate(.05, -.3, -0.08);
  ear1.matrix.scale(.05, .3, 0.05);
  ear1.render();
  // ear?? 2
  var ear2 = new Cube();
  ear2.color = [.8, .8, 0, 1];
  ear2.textureNum = -2;
  ear2.matrix = new Matrix4(headCoordinatesMat);
  ear2.matrix.rotate(g_earRotate, 1, 0, 0);
  ear2.matrix.rotate(-30, 1, 0, 0);
  ear2.matrix.translate(-.1, -.3, -0.08);
  ear2.matrix.scale(.05, .3, 0.05);
  ear2.render();
  // segment middle
  var middle = new Cube();
  middle.color = [0.9, 0.9, 0, 1];
  middle.textureNum = -2;
  middle.matrix = bottomCoordinatesMat;
  middle.matrix.rotate(g_middleRotate, 0, 1, 0);
  middle.matrix.scale(.2, .2, .35);
  middle.matrix.translate(.78, 0, 1);
  middle.matrix.rotate(45, 0, 0, 1);
  var middleCoordinatesMat = new Matrix4(middle.matrix);
  middle.render();
  // segment tail
  var tail = new Cube();
  tail.matrix = middleCoordinatesMat;
  tail.color = [1, 1, 0, 1];
  tail.textureNum = -2;
  tail.matrix.translate(-0.09, -0.1, 1);
  var tailCoordinatesMat = new Matrix4(tail.matrix);
  tail.matrix.scale(1.3, 1.3, 1.3);
  tail.render();
  // segment tailend
  var tailend = new Cube();
  tailend.matrix = tailCoordinatesMat;
  tailend.color = [.85, .85, 0, 1];
  tailend.textureNum = -2;
  tailend.matrix.translate(0.3, 0.3, 1.1);
  tailend.matrix.scale(0.8, 0.8, 0.3);
  middle.matrix.rotate(-45, 0, 1, 0);
  tailend.render();

  // hat
  var hat = new Pyramid();
  hat.color = [1, 0, 0, 1];
  hat.textureNum = -2;
  hat.matrix = new Matrix4(headCoordinatesMat);
  hat.matrix.translate(0, -.15, .15);
  hat.matrix.scale(.3, .3, .3);
  hat.matrix.rotate(g_hatSpin, 0, 1, 0);
  hat.matrix.translate(-.5,0,-.38)
  hat.render();

  // map
  drawMap();

  // track performance (end)
  var duration = performance.now() - renderStart;
  sendTextToHTML("fps: " + Math.floor(10000/duration), "fps");
}

function sendTextToHTML(text, ID){
  var element = document.getElementById(ID);
  // check validity
  if (!element) {
    console.log("Failed to get " + ID + "from HTML");
    return;
  }
  // set text
  element.innerHTML = text;
}

// Get mouse ray target block
function getBlockPosFromCamera() {
  let dir = new Vector3([
    g_camera.at.elements[0] - g_camera.eye.elements[0],
    g_camera.at.elements[1] - g_camera.eye.elements[1],
    g_camera.at.elements[2] - g_camera.eye.elements[2],
  ]);
  dir.normalize();

  let target = new Vector3([
    g_camera.eye.elements[0] + dir.elements[0] * 2,
    g_camera.eye.elements[1] + dir.elements[1] * 2,
    g_camera.eye.elements[2] + dir.elements[2] * 2,
  ]);

  let bx = Math.floor(target.elements[0] + 4.5);
  let by = Math.floor(target.elements[2] + 4.5);

  return [bx, by];
}

function addBlockAtCamera() {
  let [bx, by] = getBlockPosFromCamera();
  if (bx >= 0 && bx < g_map[0].length && by >= 0 && by < g_map.length) {
    g_map[by][bx] = 1;  // Place block
  }
}

function deleteBlockAtCamera() {
  let [bx, by] = getBlockPosFromCamera();
  if (bx >= 0 && bx < g_map[0].length && by >= 0 && by < g_map.length) {
    g_map[by][bx] = 0;  // Remove block
  }
}
