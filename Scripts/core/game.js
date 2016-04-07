/*
 *  This is a game script where most of the game functions are implemented.
 *
 *  Source File Name:   game.ts
 *  Author Name:        Mohammed Juned Ahmed (300833356)
 *                      Joshua Collaco (300507555)
 *  Last Modified by:   Mohammed Juned Ahmed
 *  Date Last Modified: March 20, 2016
 *  Revision History:   1.0.1
 */
/// <reference path="_reference.ts"/>
// MAIN GAME FILE
// THREEJS Aliases
var Scene = Physijs.Scene;
var Renderer = THREE.WebGLRenderer;
var PerspectiveCamera = THREE.PerspectiveCamera;
var BoxGeometry = THREE.BoxGeometry;
var CubeGeometry = THREE.CubeGeometry;
var PlaneGeometry = THREE.PlaneGeometry;
var SphereGeometry = THREE.SphereGeometry;
var Geometry = THREE.Geometry;
var AxisHelper = THREE.AxisHelper;
var LambertMaterial = THREE.MeshLambertMaterial;
var MeshBasicMaterial = THREE.MeshBasicMaterial;
var LineBasicMaterial = THREE.LineBasicMaterial;
var PhongMaterial = THREE.MeshPhongMaterial;
var Material = THREE.Material;
var Texture = THREE.Texture;
var Line = THREE.Line;
var Mesh = THREE.Mesh;
var Object3D = THREE.Object3D;
var SpotLight = THREE.SpotLight;
var PointLight = THREE.PointLight;
var AmbientLight = THREE.AmbientLight;
var Control = objects.Control;
var GUI = dat.GUI;
var Color = THREE.Color;
var Vector3 = THREE.Vector3;
var Face3 = THREE.Face3;
var Point = objects.Point;
var CScreen = config.Screen;
var Clock = THREE.Clock;
//Custom Game Objects
var gameObject = objects.gameObject;
// Setup a Web Worker for Physijs
Physijs.scripts.worker = "/Scripts/lib/Physijs/physijs_worker.js";
Physijs.scripts.ammo = "/Scripts/lib/Physijs/examples/js/ammo.js";
// setup an IIFE structure (Immediately Invoked Function Expression)
var game = (function () {
    // declare game objects
    var havePointerLock;
    var element;
    var scene = new Scene(); // Instantiate Scene Object
    var renderer;
    var camera;
    var control;
    var gui;
    var stats;
    var blocker;
    var instructions;
    var spotLight;
    var groundGeometry;
    var groundPhysicsMaterial;
    var groundMaterial;
    var ground;
    var groundTexture;
    var groundTextureNormal;
    var clock;
    var playerGeometry;
    var playerMaterial;
    var player;
    var sphereGeometry;
    var sphereMaterial;
    var sphere;
    var keyboardControls;
    var mouseControls;
    var isGrounded;
    var velocity = new Vector3(0, 0, 0);
    var prevTime = 0;
    var directionLineMaterial;
    var directionLineGeometry;
    var directionLine;
    //Next Ground Material in the sequence 
    var groundGeometryNext;
    var groundPhysicsMaterialNext;
    var groundMaterialNext;
    var groundNext;
    var groundTextureNext;
    var groundTextureNormalNext;
    //Next Spotlight in the sequence
    var spotLightNext;
    var pointLightTop;
    //Code for player position and setup
    var playersZPosition;
    var generatorCounter;
    var nextGroundZPosition;
    //Code for enemies
    var enemyGeometry;
    var enemyMaterial;
    var enemyOne;
    var enemyTwo;
    var enemyThree;
    //Sphere Pickups
    var sphereGeometryPickup;
    var sphereMaterialPickup;
    var spherePickup;
    //Points and Lives
    var points;
    var lives;
    var canvas;
    var stage;
    var scoreLabel;
    var livesLabel;
    function init() {
        //Initializing Sequencing Variables for next ground
        playersZPosition = 0;
        generatorCounter = 0;
        nextGroundZPosition = 32;
        points = 0;
        lives = 10;
        // Create to HTMLElements
        blocker = document.getElementById("blocker");
        instructions = document.getElementById("instructions");
        //check to see if pointerlock is supported
        havePointerLock = 'pointerLockElement' in document ||
            'mozPointerLockElement' in document ||
            'webkitPointerLockElement' in document;
        // Instantiate Game Controls
        keyboardControls = new objects.KeyboardControls();
        mouseControls = new objects.MouseControls();
        // Check to see if we have pointerLock
        if (havePointerLock) {
            element = document.body;
            instructions.addEventListener('click', function () {
                // Ask the user for pointer lock
                console.log("Requesting PointerLock");
                element.requestPointerLock = element.requestPointerLock ||
                    element.mozRequestPointerLock ||
                    element.webkitRequestPointerLock;
                element.requestPointerLock();
            });
            document.addEventListener('pointerlockchange', pointerLockChange);
            document.addEventListener('mozpointerlockchange', pointerLockChange);
            document.addEventListener('webkitpointerlockchange', pointerLockChange);
            document.addEventListener('pointerlockerror', pointerLockError);
            document.addEventListener('mozpointerlockerror', pointerLockError);
            document.addEventListener('webkitpointerlockerror', pointerLockError);
        }
        // Scene changes for Physijs
        scene.name = "Main";
        scene.fog = new THREE.Fog(0xffffff, 0, 750);
        scene.setGravity(new THREE.Vector3(0, -10, 0));
        scene.addEventListener('update', function () {
            scene.simulate(undefined, 2);
        });
        // setup a THREE.JS Clock object
        clock = new Clock();
        setupRenderer(); // setup the default renderer
        setupCamera(); // setup the camera
        // Spot Light
        spotLight = new SpotLight(0xffffff);
        spotLight.position.set(20, 40, -15);
        spotLight.castShadow = true;
        spotLight.intensity = 2;
        spotLight.lookAt(new Vector3(0, 0, 0));
        spotLight.shadowCameraNear = 2;
        spotLight.shadowCameraFar = 200;
        spotLight.shadowCameraLeft = -5;
        spotLight.shadowCameraRight = 5;
        spotLight.shadowCameraTop = 5;
        spotLight.shadowCameraBottom = -5;
        spotLight.shadowMapWidth = 2048;
        spotLight.shadowMapHeight = 2048;
        spotLight.shadowDarkness = 0.5;
        spotLight.name = "Spot Light";
        spotLightNext = new SpotLight(0xffffff);
        spotLightNext.position.set(0, 50, (64 + nextGroundZPosition));
        spotLightNext.castShadow = true;
        spotLightNext.intensity = 3;
        spotLightNext.lookAt(new Vector3(0, 0, nextGroundZPosition - 16));
        spotLightNext.shadowCameraNear = 2;
        spotLightNext.shadowCameraFar = 200;
        spotLightNext.shadowCameraLeft = -5;
        spotLightNext.shadowCameraRight = 5;
        spotLightNext.shadowCameraTop = 5;
        spotLightNext.shadowCameraBottom = -5;
        spotLightNext.shadowMapWidth = 2048;
        spotLightNext.shadowMapHeight = 2048;
        spotLightNext.shadowDarkness = 0.5;
        spotLightNext.name = "Spot Light Next";
        scene.add(spotLight);
        scene.add(spotLightNext);
        console.log("Added spotLight to scene");
        // Joshua put in function and create moving ground object
        // Ground Object
        groundTexture = new THREE.TextureLoader().load('../../Assets/images/road.jpg');
        groundTexture.wrapS = THREE.RepeatWrapping;
        groundTexture.wrapT = THREE.RepeatWrapping;
        groundTexture.repeat.set(1, 1);
        groundTextureNormal = new THREE.TextureLoader().load('../../Assets/images/road.jpg');
        groundTextureNormal.wrapS = THREE.RepeatWrapping;
        groundTextureNormal.wrapT = THREE.RepeatWrapping;
        groundTextureNormal.repeat.set(1, 1);
        groundMaterial = new PhongMaterial();
        groundMaterial.map = groundTexture;
        groundMaterial.bumpMap = groundTextureNormal;
        groundMaterial.bumpScale = 0.2;
        groundGeometry = new BoxGeometry(32, 1, 32);
        groundPhysicsMaterial = Physijs.createMaterial(groundMaterial, 0, 0);
        ground = new Physijs.ConvexMesh(groundGeometry, groundPhysicsMaterial, 0);
        ground.position.set(0, 0, 0);
        ground.receiveShadow = true;
        ground.name = "Ground";
        scene.add(ground);
        console.log("Added Burnt Ground to scene");
        // Placing new ground texture
        groundTextureNext = new THREE.TextureLoader().load("../../Assets/images/road.jpg");
        groundTextureNext.wrapS = THREE.RepeatWrapping;
        groundTextureNext.wrapT = THREE.RepeatWrapping;
        groundTextureNext.repeat.set(1, 1);
        groundTextureNormalNext = new THREE.TextureLoader().load("../../Assets/images/road.jpg");
        groundTextureNormalNext.wrapS = THREE.RepeatWrapping;
        groundTextureNormalNext.wrapT = THREE.RepeatWrapping;
        groundTextureNext.repeat.set(1, 1);
        groundMaterialNext = new PhongMaterial();
        groundMaterialNext.map = groundTextureNext;
        groundMaterialNext.bumpMap = groundTextureNormalNext;
        groundMaterialNext.bumpScale = 0.2;
        groundGeometryNext = new BoxGeometry(32, 1, 32);
        groundPhysicsMaterialNext = Physijs.createMaterial(groundMaterialNext, 0, 0);
        groundNext = new Physijs.ConvexMesh(groundGeometryNext, groundPhysicsMaterialNext, 0);
        groundNext.position.set(0, 0, nextGroundZPosition);
        groundNext.receiveShadow = true;
        groundNext.name = "Ground";
        scene.add(groundNext);
        sphereGeometryPickup = new SphereGeometry(1, 32, 32);
        sphereMaterialPickup = Physijs.createMaterial(new LambertMaterial({ color: 0xffaa11 }), 0.4, 0);
        spherePickup = new Physijs.SphereMesh(sphereGeometryPickup, sphereMaterialPickup, 1);
        spherePickup.position.set(0, 1000, 0);
        spherePickup.receiveShadow = true;
        spherePickup.castShadow = true;
        spherePickup.name = "SpherePickup";
        scene.add(spherePickup);
        createNewGround();
        createNewEnemies();
        setupCanvas();
        setupScoreboard();
        // Player Object
        playerGeometry = new BoxGeometry(3, 2, 4);
        playerMaterial = Physijs.createMaterial(new LambertMaterial({ color: 0x00ff00 }), 0.4, 0);
        player = new Physijs.BoxMesh(playerGeometry, playerMaterial, 1);
        player.position.set(0, 30, 10);
        player.receiveShadow = true;
        player.castShadow = true;
        player.name = "Player";
        scene.add(player);
        // Collision Check
        player.addEventListener('collision', function (event) {
            if (event.name === "Ground") {
                isGrounded = true;
            }
            if (event.name === "Sphere") {
                console.log("player hit the sphere");
                scene.remove(sphere);
            }
            if (event.name === "SpherePickup") {
                scene.remove(spherePickup);
                points += 3;
                console.log("Points: " + points);
                scoreLabel.text = "SCORE: " + points;
            }
            if (event.name === "Enemy One") {
                scene.remove(enemyOne);
                console.log("Death");
                lives--;
            }
            if (event.name === "Enemy Two") {
                scene.remove(enemyTwo);
                console.log("Death");
                lives--;
            }
            if (event.name === "Enemy Three") {
                scene.remove(enemyThree);
                console.log("Death");
                lives--;
            }
            if (lives <= 0) {
                alert("You are now dead");
            }
        });
        // create parent-child relationship with camera and player
        player.add(camera);
        camera.position.set(0, 4, 15);
        // Add framerate stats
        addStatsObject();
        console.log("Added Stats to scene...");
        document.body.appendChild(renderer.domElement);
        gameLoop(); // render the scene 
        scene.simulate();
        window.addEventListener('resize', onWindowResize, false);
    }
    function setupCanvas() {
        canvas = document.getElementById("canvas");
        canvas.setAttribute("width", config.Screen.WIDTH.toString());
        canvas.setAttribute("height", (config.Screen.HEIGHT * 0.1).toString());
        canvas.style.backgroundColor = "#000000";
        stage = new createjs.Stage(canvas);
    }
    function setupScoreboard() {
        // initialize  score and lives values
        points = 0;
        lives = 5;
        // Add Lives Label
        livesLabel = new createjs.Text("LIVES: " + lives, "40px Consolas", "#ffffff");
        livesLabel.x = config.Screen.WIDTH * 0.1;
        livesLabel.y = (config.Screen.HEIGHT * 0.15) * 0.20;
        stage.addChild(livesLabel);
        console.log("Added Lives Label to stage");
        // Add Score Label
        scoreLabel = new createjs.Text("SCORE: " + points, "40px Consolas", "#ffffff");
        scoreLabel.x = config.Screen.WIDTH * 0.8;
        scoreLabel.y = (config.Screen.HEIGHT * 0.15) * 0.20;
        stage.addChild(scoreLabel);
        console.log("Added Score Label to stage");
    }
    function createNewEnemies() {
        enemyGeometry = new BoxGeometry(4, 4, 4);
        enemyMaterial = Physijs.createMaterial(new LambertMaterial({ color: 0xff0000 }), 0.4, 0);
        enemyOne = new Physijs.BoxMesh(enemyGeometry, enemyMaterial, 1);
        enemyOne.position.set(8, 8, 8);
        enemyOne.receiveShadow = true;
        enemyOne.castShadow = true;
        enemyOne.name = "Enemy One";
        enemyTwo = new Physijs.BoxMesh(enemyGeometry, enemyMaterial, 1);
        enemyTwo.position.set(-8, 8, 8);
        enemyTwo.receiveShadow = true;
        enemyTwo.castShadow = true;
        enemyTwo.name = "Enemy Two";
        enemyThree = new Physijs.BoxMesh(enemyGeometry, enemyMaterial, 1);
        enemyThree.position.set(6, 8, 8);
        enemyThree.receiveShadow = true;
        enemyThree.castShadow = true;
        enemyThree.name = "Enemy Three";
        scene.add(enemyOne);
        scene.add(enemyTwo);
        scene.add(enemyThree);
    }
    function createNewGround() {
        enemyGeometry = new BoxGeometry(4, 4, 4);
        enemyMaterial = Physijs.createMaterial(new LambertMaterial({ color: 0xff0000 }), 0.4, 0);
        if (generatorCounter % 2 == 0) {
            scene.remove(groundNext);
            scene.remove(spotLightNext);
            scene.remove(spherePickup);
            console.log("Created Original Ground");
            // Placing new ground texture
            groundTextureNext = new THREE.TextureLoader().load("../../Assets/images/road.jpg");
            groundTextureNext.wrapS = THREE.RepeatWrapping;
            groundTextureNext.wrapT = THREE.RepeatWrapping;
            groundTextureNext.repeat.set(1, 1);
            groundTextureNormalNext = new THREE.TextureLoader().load("../../Assets/images/road.jpg");
            groundTextureNormalNext.wrapS = THREE.RepeatWrapping;
            groundTextureNormalNext.wrapT = THREE.RepeatWrapping;
            groundTextureNext.repeat.set(1, 1);
            groundMaterialNext = new PhongMaterial();
            groundMaterialNext.map = groundTextureNext;
            groundMaterialNext.bumpMap = groundTextureNormalNext;
            groundMaterialNext.bumpScale = 0.2;
            groundGeometryNext = new BoxGeometry(32, 1, 32);
            groundPhysicsMaterialNext = Physijs.createMaterial(groundMaterialNext, 0, 0);
            groundNext = new Physijs.ConvexMesh(groundGeometryNext, groundPhysicsMaterialNext, 0);
            groundNext.position.set(0, 0, nextGroundZPosition);
            groundNext.receiveShadow = true;
            groundNext.name = "Ground";
            scene.add(groundNext);
            //Placing new Spotlight
            spotLightNext = new SpotLight(0xffffff);
            spotLightNext.position.set(0, 50, (64 + nextGroundZPosition));
            spotLightNext.castShadow = true;
            spotLightNext.intensity = 3;
            spotLightNext.lookAt(new Vector3(0, 0, nextGroundZPosition + 10));
            spotLightNext.shadowCameraNear = 2;
            spotLightNext.shadowCameraFar = 200;
            spotLightNext.shadowCameraLeft = -5;
            spotLightNext.shadowCameraRight = 5;
            spotLightNext.shadowCameraTop = 5;
            spotLightNext.shadowCameraBottom = -5;
            spotLightNext.shadowMapWidth = 2048;
            spotLightNext.shadowMapHeight = 2048;
            spotLightNext.shadowDarkness = 0.5;
            spotLightNext.name = "Spot Light Next";
            console.log("SpotlightNext looking at" + nextGroundZPosition);
            scene.add(spotLightNext);
            var max = nextGroundZPosition;
            var min = nextGroundZPosition - 15;
            sphereGeometryPickup = new SphereGeometry(1, 32, 32);
            sphereMaterialPickup = Physijs.createMaterial(new LambertMaterial({ color: 0xffaa11 }), 0.4, 0);
            spherePickup = new Physijs.SphereMesh(sphereGeometryPickup, sphereMaterialPickup, 1);
            spherePickup.position.set(Math.floor(Math.random() * (15 - -15 + 1)) + -15, 50, Math.floor(Math.random() * (max - min + 1)) + min);
            spherePickup.receiveShadow = true;
            spherePickup.castShadow = true;
            spherePickup.name = "SpherePickup";
            scene.add(spherePickup);
            enemyOne = new Physijs.BoxMesh(enemyGeometry, enemyMaterial, 1);
            enemyOne.position.set(Math.floor(Math.random() * (15 - -15 + 1)) + -15, 50, Math.floor(Math.random() * (max - min + 1)) + min);
            enemyOne.receiveShadow = true;
            enemyOne.castShadow = true;
            enemyOne.name = "Enemy One";
            scene.add(enemyOne);
            enemyTwo = new Physijs.BoxMesh(enemyGeometry, enemyMaterial, 1);
            enemyTwo.position.set(Math.floor(Math.random() * (15 - -15 + 1)) + -15, 50, Math.floor(Math.random() * (max - min + 1)) + min);
            enemyTwo.receiveShadow = true;
            enemyTwo.castShadow = true;
            enemyTwo.name = "Enemy Two";
            scene.add(enemyTwo);
            enemyThree = new Physijs.BoxMesh(enemyGeometry, enemyMaterial, 1);
            enemyThree.position.set(Math.floor(Math.random() * (15 - -15 + 1)) + -15, 50, Math.floor(Math.random() * (max - min + 1)) + min);
            enemyThree.receiveShadow = true;
            enemyThree.castShadow = true;
            enemyThree.name = "Enemy Three";
            scene.add(enemyThree);
        }
        else if (generatorCounter % 2 != 0) {
            scene.remove(ground);
            scene.remove(spotLight);
            scene.remove(spherePickup);
            groundTexture = new THREE.TextureLoader().load("../../Assets/images/road.jpg");
            groundTexture.wrapS = THREE.RepeatWrapping;
            groundTexture.wrapT = THREE.RepeatWrapping;
            groundTexture.repeat.set(1, 1);
            groundTextureNormal = new THREE.TextureLoader().load("../../Assets/images/road.jpg");
            groundTextureNormal.wrapS = THREE.RepeatWrapping;
            groundTextureNormal.wrapT = THREE.RepeatWrapping;
            groundTexture.repeat.set(1, 1);
            groundMaterial = new PhongMaterial();
            groundMaterial.map = groundTexture;
            groundMaterial.bumpMap = groundTextureNormal;
            groundMaterial.bumpScale = 0.2;
            groundGeometry = new BoxGeometry(32, 1, 32);
            groundPhysicsMaterial = Physijs.createMaterial(groundMaterial, 0, 0);
            ground = new Physijs.ConvexMesh(groundGeometry, groundPhysicsMaterial, 0);
            ground.position.set(0, 0, nextGroundZPosition);
            ground.receiveShadow = true;
            ground.name = "Ground";
            scene.add(ground);
            //Placing new Spotlight
            spotLight = new SpotLight(0xffffff);
            spotLight.position.set(0, 50, (64 + nextGroundZPosition));
            spotLight.castShadow = true;
            spotLight.intensity = 3;
            spotLight.lookAt(new Vector3(0, 0, nextGroundZPosition + 10));
            spotLight.shadowCameraNear = 2;
            spotLight.shadowCameraFar = 200;
            spotLight.shadowCameraLeft = -5;
            spotLight.shadowCameraRight = 5;
            spotLight.shadowCameraTop = 5;
            spotLight.shadowCameraBottom = -5;
            spotLight.shadowMapWidth = 2048;
            spotLight.shadowMapHeight = 2048;
            spotLight.shadowDarkness = 0.5;
            spotLight.name = "Spot Light";
            scene.add(spotLight);
            var max = nextGroundZPosition;
            var min = nextGroundZPosition - 15;
            sphereGeometryPickup = new SphereGeometry(1, 32, 32);
            sphereMaterialPickup = Physijs.createMaterial(new LambertMaterial({ color: 0xffaa11 }), 0.4, 0);
            spherePickup = new Physijs.SphereMesh(sphereGeometryPickup, sphereMaterialPickup, 1);
            spherePickup.position.set(Math.floor(Math.random() * (15 - -15 + 1)) + -15, 50, Math.floor(Math.random() * (max - min + 1)) + min);
            spherePickup.receiveShadow = true;
            spherePickup.castShadow = true;
            spherePickup.name = "SpherePickup";
            scene.add(spherePickup);
            enemyOne = new Physijs.BoxMesh(enemyGeometry, enemyMaterial, 1);
            enemyOne.position.set(Math.floor(Math.random() * (15 - -15 + 1)) + -15, 50, Math.floor(Math.random() * (max - min + 1)) + min);
            enemyOne.receiveShadow = true;
            enemyOne.castShadow = true;
            enemyOne.name = "Enemy One";
            scene.add(enemyOne);
            enemyTwo = new Physijs.BoxMesh(enemyGeometry, enemyMaterial, 1);
            enemyTwo.position.set(Math.floor(Math.random() * (15 - -15 + 1)) + -15, 50, Math.floor(Math.random() * (max - min + 1)) + min);
            enemyTwo.receiveShadow = true;
            enemyTwo.castShadow = true;
            enemyTwo.name = "Enemy Two";
            scene.add(enemyTwo);
            enemyThree = new Physijs.BoxMesh(enemyGeometry, enemyMaterial, 1);
            enemyThree.position.set(Math.floor(Math.random() * (15 - -15 + 1)) + -15, 50, Math.floor(Math.random() * (max - min + 1)) + min);
            enemyThree.receiveShadow = true;
            enemyThree.castShadow = true;
            enemyThree.name = "Enemy Three";
            scene.add(enemyThree);
        }
    }
    //PointerLockChange Event Handler
    function pointerLockChange(event) {
        if (document.pointerLockElement === element) {
            // enable our mouse and keyboard controls
            keyboardControls.enabled = true;
            mouseControls.enabled = true;
            blocker.style.display = 'none';
        }
        else {
            // disable our mouse and keyboard controls
            keyboardControls.enabled = false;
            mouseControls.enabled = false;
            blocker.style.display = '-webkit-box';
            blocker.style.display = '-moz-box';
            blocker.style.display = 'box';
            instructions.style.display = '';
            console.log("PointerLock disabled");
        }
    }
    //PointerLockError Event Handler
    function pointerLockError(event) {
        instructions.style.display = '';
        console.log("PointerLock Error Detected!!");
    }
    // Window Resize Event Handler
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    function addControl(controlObject) {
        /* ENTER CODE for the GUI CONTROL HERE */
    }
    // Add Frame Rate Stats to the Scene
    function addStatsObject() {
        stats = new Stats();
        stats.setMode(0);
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';
        document.body.appendChild(stats.domElement);
    }
    // Setup main game loop
    function gameLoop() {
        stats.update();
        checkControls();
        playerPositionCheck();
        // render using requestAnimationFrame
        requestAnimationFrame(gameLoop);
        // render the scene
        renderer.render(scene, camera);
    }
    // Check Controls Function
    function checkControls() {
        if (keyboardControls.enabled) {
            velocity = new Vector3();
            var time = performance.now();
            var delta = (time - prevTime) / 1000;
            if (isGrounded) {
                var direction = new Vector3(0, 0, 0);
                if (keyboardControls.moveForward) {
                    velocity.z -= 500.0 * delta;
                }
                if (keyboardControls.moveLeft) {
                    velocity.x -= 500.0 * delta;
                }
                if (keyboardControls.moveBackward) {
                    velocity.z += 500.0 * delta;
                }
                if (keyboardControls.moveRight) {
                    velocity.x += 500.0 * delta;
                }
                if (keyboardControls.jump) {
                    velocity.y += 4000.0 * delta;
                    if (player.position.y > 4) {
                        isGrounded = false;
                    }
                }
                player.setDamping(0.7, 0.1);
                // Changing player's rotation
                player.setAngularVelocity(new Vector3(0, mouseControls.yaw, 0));
                direction.addVectors(direction, velocity);
                direction.applyQuaternion(player.quaternion);
                if (Math.abs(player.getLinearVelocity().x) < 20 && Math.abs(player.getLinearVelocity().y) < 10) {
                    player.applyCentralForce(direction);
                }
            }
            //reset Pitch and Yaw
            mouseControls.pitch = 0;
            mouseControls.yaw = 0;
            prevTime = time;
            cameraLook();
        } // Controls Enabled ends
        else {
            player.setAngularVelocity(new Vector3(0, 0, 0));
        }
    }
    // Camera Look function
    function cameraLook() {
        var zenith = THREE.Math.degToRad(90);
        var nadir = THREE.Math.degToRad(-90);
        var cameraPitch = camera.rotation.x + mouseControls.pitch;
        // Constrain the Camera Pitch
        camera.rotation.x = THREE.Math.clamp(cameraPitch, nadir, zenith);
    }
    function playerPositionCheck() {
        playersZPosition = player.position.z;
        if (playersZPosition > nextGroundZPosition) {
            nextGroundZPosition += 32;
            console.log("Player z: " + player.position.z + "\n");
            generatorCounter++;
            console.log(generatorCounter);
            createNewGround();
        }
    }
    // Setup default renderer
    function setupRenderer() {
        renderer = new Renderer({ antialias: true });
        renderer.setClearColor(0x404040, 1.0);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(CScreen.WIDTH, CScreen.HEIGHT);
        renderer.shadowMap.enabled = true;
        console.log("Finished setting up Renderer...");
    }
    // Setup main camera for the scene
    function setupCamera() {
        camera = new PerspectiveCamera(35, config.Screen.RATIO, 0.1, 100);
        console.log("Finished setting up Camera...");
    }
    window.onload = init;
    return {
        scene: scene
    };
})();

//# sourceMappingURL=game.js.map
