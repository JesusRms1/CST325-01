'use strict'

var gl;

var appInput = new Input();
var time = new Time();
var camera = new OrbitCamera(appInput);

var sphereGeometry = null; // this will be created after loading from a file
var groundGeometry = null;
var barrelGeometry = null;
var lightGeometry = null;

var projectionMatrix = new Matrix4();
var lightPosition = new Vector4(4, 1.5, 0, 0);

// the shader that will be used by each piece of geometry (they could each use their own shader but in this case it will be the same)
var phongShaderProgram;
var flatColorShaderProgram;

// auto start the app when the html page is ready
window.onload = window['initializeAndStartRendering'];

// we need to asynchronously fetch files from the "server" (your local hard drive)
var loadedAssets = {
    phongTextVS: null, phongTextFS: null,
    sphereJSON: null,
    marbleImage: null,
    crackedMudImage: null,
    barrelImage: null,
    barrelJSON: null,
    flatColorVS: null,
    flatColorFS: null
};

// -------------------------------------------------------------------------
function initializeAndStartRendering() {
    initGL();
    loadAssets(function() {
        createShaders(loadedAssets);
        createScene();

        updateAndRender();
    });
}

// -------------------------------------------------------------------------
function initGL(canvas) {
    var canvas = document.getElementById("webgl-canvas");

    try {
        gl = canvas.getContext("webgl");
        gl.canvasWidth = canvas.width;
        gl.canvasHeight = canvas.height;

        gl.enable(gl.DEPTH_TEST);
    } catch (e) {}

    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

// -------------------------------------------------------------------------
function loadAssets(onLoadedCB) {
    var filePromises = [
        fetch('./shaders/phong.vs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/phong.pointlit.fs.glsl').then((response) => { return response.text(); }),
        fetch('./data/sphere.json').then((response) => { return response.json(); }),
        loadImage('./data/marble.jpg'),
        loadImage('./data/crackedMud.png'),
        fetch('./data/barrel.json').then((response) => { return response.json(); }),
        loadImage('./data/barrel.png'),
        fetch('./shaders/flat.color.vs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/flat.color.fs.glsl').then((response) => { return response.text(); })
    ];

    Promise.all(filePromises).then(function(values) {
        // Assign loaded data to our named variables
        loadedAssets.phongTextVS = values[0];
        loadedAssets.phongTextFS = values[1];
        loadedAssets.sphereJSON = values[2];
        loadedAssets.marbleImage = values[3];
        loadedAssets.crackedMudImage = values[4];
        loadedAssets.barrelJSON = values[5];
        loadedAssets.barrelImage = values[6];
        loadedAssets.flatColorVS = values[7];
        loadedAssets.flatColorFS = values[8];
    }).catch(function(error) {
        console.error(error.message);
    }).finally(function() {
        onLoadedCB();
    });
}

// -------------------------------------------------------------------------
function createShaders(loadedAssets) {
    phongShaderProgram = createCompiledAndLinkedShaderProgram(loadedAssets.phongTextVS, loadedAssets.phongTextFS);

    phongShaderProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(phongShaderProgram, "aVertexPosition"),
        vertexNormalsAttribute: gl.getAttribLocation(phongShaderProgram, "aNormal"),
        vertexTexcoordsAttribute: gl.getAttribLocation(phongShaderProgram, "aTexcoords")
    };

    phongShaderProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uProjectionMatrix"),
        lightPositionUniform: gl.getUniformLocation(phongShaderProgram, "uLightPosition"),
        cameraPositionUniform: gl.getUniformLocation(phongShaderProgram, "uCameraPosition"),
        textureUniform: gl.getUniformLocation(phongShaderProgram, "uTexture"),
    };

    flatColorShaderProgram = createCompiledAndLinkedShaderProgram(loadedAssets.flatColorVS, loadedAssets.flatColorFS);

    flatColorShaderProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(flatColorShaderProgram, "aVertexPosition"),
        vertexNormalsAttribute: gl.getAttribLocation(flatColorShaderProgram, "aNormal"),
        vertexTexcoordsAttribute: gl.getAttribLocation(flatColorShaderProgram, "aTexcoords")
    };

    flatColorShaderProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(flatColorShaderProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(flatColorShaderProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation( flatColorShaderProgram, "uProjectionMatrix"),
        lightPositionUniform: gl.getUniformLocation( flatColorShaderProgram, "uLightPosition"),
        cameraPositionUniform: gl.getUniformLocation(flatColorShaderProgram, "uCameraPosition"),
        textureUniform: gl.getUniformLocation(flatColorShaderProgram, "uTexture"),
    };
}

// -------------------------------------------------------------------------
function createScene() {
    groundGeometry = new WebGLGeometryQuad(gl, phongShaderProgram);
    groundGeometry.create(loadedAssets.crackedMudImage);

    var scale = new Matrix4().makeScale(10.0, 10.0, 10.0);

    // compensate for the model being flipped on its side
    var rotation = new Matrix4().makeRotationX(-90);

    groundGeometry.worldMatrix.makeIdentity();
    groundGeometry.worldMatrix.multiply(rotation).multiply(scale);

    sphereGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    sphereGeometry.create(loadedAssets.sphereJSON, loadedAssets.marbleImage);

    barrelGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    barrelGeometry.create(loadedAssets.barrelJSON, loadedAssets.barrelImage);

    lightGeometry = new WebGLGeometryJSON(gl, flatColorShaderProgram);
    lightGeometry.create(loadedAssets.sphereJSON, loadedAssets.marbleImage);


    // Scaled it down so that the diameter is 3
    var scale = new Matrix4().makeScale(0.03, 0.03, 0.03);

    // raise it by the radius to make it sit on the ground
    var translation = new Matrix4().makeTranslation(0, 1.5, 0);

    sphereGeometry.worldMatrix.makeIdentity();
    sphereGeometry.worldMatrix.multiply(translation).multiply(scale);

    var scale2 = new Matrix4().makeScale(0.3, 0.3, 0.3);
    var translation2 = new Matrix4().makeTranslation(-5, 2, -5);

    barrelGeometry.worldMatrix.makeIdentity().multiply(translation2).multiply(scale2);

    var scale3 = new Matrix4().makeScale(0.006, 0.006, 0.006);
    var translation3 = new Matrix4().makeTranslation(4, 1.5, 0, 0);
    lightGeometry.worldMatrix.makeIdentity().multiply(translation3).multiply(scale3);
}

// -------------------------------------------------------------------------
function updateAndRender() {
    requestAnimationFrame(updateAndRender);

    var aspectRatio = gl.canvasWidth / gl.canvasHeight;
    var rotationMatrix = new Matrix4().makeRotationY(45.0 * time.deltaTime);

    // rotates light position around earth
    lightPosition = rotationMatrix.clone().multiplyVector(lightPosition);

    // trying to rotate sphere around earth like light
    // lightGeometry.worldMatrix.makeIdentity();

    var translationForLight = new Matrix4().makeTranslation(lightPosition);
    // moonMatrix.multiply(earthTransform).multiply(rotation).multiply(translationForMoon);

    lightGeometry.worldMatrix.multiply(rotationMatrix);
    // lightGeometry.worldMatrix.multiply(translationForLight);

    // todo #10
    // add keyboard controls for changing light direction here
    // if (appInput.up) {
    //     rotationMatrix.makeIdentity();
    //     rotationMatrix.makeRotationX(-2);
    //     lightPosition = rotationMatrix.multiplyVector(new Vector4(lightPosition.x, lightPosition.y, lightPosition.z, 1));
    // }

    // if (appInput.down) {
    //     rotationMatrix.makeIdentity();
    //     rotationMatrix.makeRotationX(2);
    //     lightPosition = rotationMatrix.multiplyVector(new Vector4(lightPosition.x, lightPosition.y, lightPosition.z, 1));
    // }

    // if (appInput.left) {
    //     rotationMatrix.makeIdentity();
    //     rotationMatrix.makeRotationZ(2);
    //     lightPosition = rotationMatrix.multiplyVector(new Vector4(lightPosition.x, lightPosition.y, lightPosition.z, 1));
    // }

    // if (appInput.right) {
    //     rotationMatrix.makeIdentity();
    //     rotationMatrix.makeRotationZ(-2);
    //     lightPosition = rotationMatrix.multiplyVector(new Vector4(lightPosition.x, lightPosition.y, lightPosition.z, 1));
    // }

    time.update();
    camera.update(time.deltaTime);

    // specify what portion of the canvas we want to draw to (all of it, full width and height)
    gl.viewport(0, 0, gl.canvasWidth, gl.canvasHeight);

    // this is a new frame so let's clear out whatever happened last frame
    gl.clearColor(0.707, 0.707, 1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(phongShaderProgram);
    var uniforms = phongShaderProgram.uniforms;
    var cameraPosition = camera.getPosition();
    gl.uniform3f(uniforms.lightPositionUniform, lightPosition.x, lightPosition.y, lightPosition.z);
    gl.uniform3f(uniforms.cameraPositionUniform, cameraPosition.x, cameraPosition.y, cameraPosition.z);

    projectionMatrix.makePerspective(45, aspectRatio, 0.1, 1000);
    groundGeometry.render(camera, projectionMatrix, phongShaderProgram);
    sphereGeometry.render(camera, projectionMatrix, phongShaderProgram);
    barrelGeometry.render(camera, projectionMatrix, phongShaderProgram);
    lightGeometry.render(camera, projectionMatrix, flatColorShaderProgram);
}

// EOF 00100001-10
