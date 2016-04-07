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
import Scene = Physijs.Scene;
import Renderer = THREE.WebGLRenderer;
import PerspectiveCamera = THREE.PerspectiveCamera;
import BoxGeometry = THREE.BoxGeometry;
import CubeGeometry = THREE.CubeGeometry;
import PlaneGeometry = THREE.PlaneGeometry;
import SphereGeometry = THREE.SphereGeometry;
import Geometry = THREE.Geometry;
import AxisHelper = THREE.AxisHelper;
import LambertMaterial = THREE.MeshLambertMaterial;
import MeshBasicMaterial = THREE.MeshBasicMaterial;
import LineBasicMaterial = THREE.LineBasicMaterial;
import PhongMaterial = THREE.MeshPhongMaterial;
import Material = THREE.Material;
import Texture = THREE.Texture;
import Line = THREE.Line;
import Mesh = THREE.Mesh;
import Object3D = THREE.Object3D;
import SpotLight = THREE.SpotLight;
import PointLight = THREE.PointLight;
import AmbientLight = THREE.AmbientLight;
import Control = objects.Control;
import GUI = dat.GUI;
import Color = THREE.Color;
import Vector3 = THREE.Vector3;
import Face3 = THREE.Face3;
import Point = objects.Point;
import CScreen = config.Screen;
import Clock = THREE.Clock;

//Custom Game Objects
import gameObject = objects.gameObject;

// Setup a Web Worker for Physijs
Physijs.scripts.worker = "/Scripts/lib/Physijs/physijs_worker.js";
Physijs.scripts.ammo = "/Scripts/lib/Physijs/examples/js/ammo.js";


// setup an IIFE structure (Immediately Invoked Function Expression)
var game = (() => {

    // declare game objects
    var havePointerLock: boolean;
    var element: any;
    var scene: Scene = new Scene(); // Instantiate Scene Object
    var renderer: Renderer;
    var camera: PerspectiveCamera;
    var control: Control;
    var gui: GUI;
    var stats: Stats;
    var blocker: HTMLElement;
    var instructions: HTMLElement;
    var spotLight: SpotLight;
    var groundGeometry: CubeGeometry;
    var groundPhysicsMaterial: Physijs.Material;
    var groundMaterial: PhongMaterial;
    var ground: Physijs.Mesh;
    var groundTexture: Texture;
    var groundTextureNormal: Texture;
    var clock: Clock;
    var playerGeometry: CubeGeometry;
    var playerMaterial: Physijs.Material;
    var player: Physijs.Mesh;
    var sphereGeometry: SphereGeometry;
    var sphereMaterial: Physijs.Material;
    var sphere: Physijs.Mesh;
    var keyboardControls: objects.KeyboardControls;
    var mouseControls: objects.MouseControls;
    var isGrounded: boolean;
    var velocity: Vector3 = new Vector3(0, 0, 0);
    var prevTime: number = 0;
    var directionLineMaterial: LineBasicMaterial;
    var directionLineGeometry: Geometry;
    var directionLine: Line;
    
    //Next Ground Material in the sequence 
    var groundGeometryNext: CubeGeometry;
    var groundPhysicsMaterialNext: Physijs.Material;
    var groundMaterialNext: PhongMaterial;
    var groundNext: Physijs.Mesh;
    var groundTextureNext: Texture;
    var groundTextureNormalNext: Texture;
    
    //Next Spotlight in the sequence
    var spotLightNext: SpotLight;
    var pointLightTop: PointLight;
    
    //Code for player position and setup
    var playersZPosition: number;
    var generatorCounter: number;
    var nextGroundZPosition: number;
    
    //Code for enemies
    var enemyGeometry: CubeGeometry;
    var enemyMaterial: Physijs.Material;
    var enemyOne: Physijs.Mesh;
    var enemyTwo: Physijs.Mesh;
    var enemyThree: Physijs.Mesh;
    
    
    //Sphere Pickups
    var sphereGeometryPickup: SphereGeometry
    var sphereMaterialPickup: Physijs.Material;
    var spherePickup: Physijs.Mesh;
    
    //Points and Lives
    var points: number;
    var lives: number;
    var canvas: HTMLElement;
    var stage: createjs.Stage;
    var scoreLabel: createjs.Text;
    var livesLabel: createjs.Text;
    

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

            instructions.addEventListener('click', () => {

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

        scene.addEventListener('update', () => {
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
        spotLightNext.position.set(0,50,(64 + nextGroundZPosition));
        spotLightNext.castShadow = true;
        spotLightNext.intensity = 3;
        spotLightNext.lookAt(new Vector3(0,0,nextGroundZPosition -16));
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
        ground.position.set(0,0,0);
        ground.receiveShadow = true;
        ground.name = "Ground";
        scene.add(ground);
        console.log("Added Burnt Ground to scene");
        
          // Placing new ground texture
        groundTextureNext = new THREE.TextureLoader().load("../../Assets/images/road.jpg");
        groundTextureNext.wrapS = THREE.RepeatWrapping;
        groundTextureNext.wrapT = THREE.RepeatWrapping;
        groundTextureNext.repeat.set(1,1);
            
        groundTextureNormalNext = new THREE.TextureLoader().load("../../Assets/images/road.jpg");
        groundTextureNormalNext.wrapS = THREE.RepeatWrapping;
        groundTextureNormalNext.wrapT = THREE.RepeatWrapping;
        groundTextureNext.repeat.set(1,1);
            
        groundMaterialNext = new PhongMaterial();
        groundMaterialNext.map = groundTextureNext;
        groundMaterialNext.bumpMap = groundTextureNormalNext;
        groundMaterialNext.bumpScale = 0.2;
            
        groundGeometryNext = new BoxGeometry(32,1,32);
        groundPhysicsMaterialNext = Physijs.createMaterial(groundMaterialNext,0,0);
        groundNext = new Physijs.ConvexMesh(groundGeometryNext ,groundPhysicsMaterialNext,0);
        groundNext.position.set(0,0,nextGroundZPosition);
        groundNext.receiveShadow = true;
        groundNext.name = "Ground";
        scene.add(groundNext);
        
        sphereGeometryPickup = new SphereGeometry(1,32,32);
        sphereMaterialPickup = Physijs.createMaterial(new LambertMaterial({color: 0xffaa11}),0.4,0);
        spherePickup = new Physijs.SphereMesh(sphereGeometryPickup,sphereMaterialPickup,1);
        spherePickup.position.set(0,1000,0);
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
        player.addEventListener('collision', (event) => {

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
            if(event.name === "Enemy One"){
                scene.remove(enemyOne);
                console.log("Death");
                lives--;
            }
            if(event.name === "Enemy Two"){
                scene.remove(enemyTwo);
                console.log("Death");
                lives--;
            }
            if(event.name === "Enemy Three"){
                scene.remove(enemyThree);
                console.log("Death");
                lives--;
            }
            
            if(lives <= 0){
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
    
    function setupCanvas(): void {
        canvas = document.getElementById("canvas");
        canvas.setAttribute("width", config.Screen.WIDTH.toString());
        canvas.setAttribute("height", (config.Screen.HEIGHT * 0.1).toString());
        canvas.style.backgroundColor = "#000000";
        stage = new createjs.Stage(canvas);
    }

    function setupScoreboard(): void {
        // initialize  score and lives values
        points = 0;
        lives = 5;

        // Add Lives Label
        livesLabel = new createjs.Text(
            "LIVES: " + lives,
            "40px Consolas",
            "#ffffff"
        );
        livesLabel.x = config.Screen.WIDTH * 0.1;
        livesLabel.y = (config.Screen.HEIGHT * 0.15) * 0.20;
        stage.addChild(livesLabel);
        console.log("Added Lives Label to stage");

        // Add Score Label
        scoreLabel = new createjs.Text(
            "SCORE: " + points,
            "40px Consolas",
            "#ffffff"
        );
        scoreLabel.x = config.Screen.WIDTH * 0.8;
        scoreLabel.y = (config.Screen.HEIGHT * 0.15) * 0.20;
        stage.addChild(scoreLabel);
        console.log("Added Score Label to stage");
    }
    
    function createNewEnemies():void{
        
        enemyGeometry = new BoxGeometry(4,4,4);
        enemyMaterial = Physijs.createMaterial(new LambertMaterial({ color: 0xff0000 }), 0.4, 0);
        enemyOne = new Physijs.BoxMesh(enemyGeometry,enemyMaterial,1);
        enemyOne.position.set(8,8,8);
        enemyOne.receiveShadow = true;
        enemyOne.castShadow = true;
        enemyOne.name = "Enemy One";
        
        enemyTwo = new Physijs.BoxMesh(enemyGeometry,enemyMaterial,1);
        enemyTwo.position.set(-8,8,8);
        enemyTwo.receiveShadow = true;
        enemyTwo.castShadow = true;
        enemyTwo.name = "Enemy Two";
        
        enemyThree = new Physijs.BoxMesh(enemyGeometry,enemyMaterial,1);
        enemyThree.position.set(6,8,8);
        enemyThree.receiveShadow = true;
        enemyThree.castShadow = true;
        enemyThree.name = "Enemy Three";
        
        scene.add(enemyOne);
        scene.add(enemyTwo);
        scene.add(enemyThree);
    }
    
    
    function createNewGround():void{
        enemyGeometry = new BoxGeometry(4,4,4);
        enemyMaterial = Physijs.createMaterial(new LambertMaterial({ color: 0xff0000 }), 0.4, 0);
        
        if(generatorCounter % 2 == 0){
            
            scene.remove(groundNext);
            scene.remove(spotLightNext);
            scene.remove(spherePickup);
            
            console.log("Created Original Ground");
            
            // Placing new ground texture
            groundTextureNext = new THREE.TextureLoader().load("../../Assets/images/road.jpg");
            groundTextureNext.wrapS = THREE.RepeatWrapping;
            groundTextureNext.wrapT = THREE.RepeatWrapping;
            groundTextureNext.repeat.set(1,1);
            
            groundTextureNormalNext = new THREE.TextureLoader().load("../../Assets/images/road.jpg");
            groundTextureNormalNext.wrapS = THREE.RepeatWrapping;
            groundTextureNormalNext.wrapT = THREE.RepeatWrapping;
            groundTextureNext.repeat.set(1,1);
            
            groundMaterialNext = new PhongMaterial();
            groundMaterialNext.map = groundTextureNext;
            groundMaterialNext.bumpMap = groundTextureNormalNext;
            groundMaterialNext.bumpScale = 0.2;
            
            groundGeometryNext = new BoxGeometry(32,1,32);
            groundPhysicsMaterialNext = Physijs.createMaterial(groundMaterialNext,0,0);
            groundNext = new Physijs.ConvexMesh(groundGeometryNext ,groundPhysicsMaterialNext,0);
            groundNext.position.set(0,0,nextGroundZPosition);
            groundNext.receiveShadow = true;
            groundNext.name = "Ground";
            scene.add(groundNext);
            
            //Placing new Spotlight
            spotLightNext = new SpotLight(0xffffff);
            spotLightNext.position.set(0,50,(64 + nextGroundZPosition));
            spotLightNext.castShadow = true;
            spotLightNext.intensity = 3;
            spotLightNext.lookAt(new Vector3(0,0,nextGroundZPosition+10));
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
            
            
            var max = nextGroundZPosition ;
            var min = nextGroundZPosition - 15;
            
            sphereGeometryPickup = new SphereGeometry(1,32,32);
            sphereMaterialPickup = Physijs.createMaterial(new LambertMaterial({color: 0xffaa11}),0.4,0);
            spherePickup = new Physijs.SphereMesh(sphereGeometryPickup,sphereMaterialPickup,1);
            spherePickup.position.set(Math.floor(Math.random() * (15 - -15 + 1)) + -15,50,Math.floor(Math.random() * (max - min + 1)) + min);
            spherePickup.receiveShadow = true;
            spherePickup.castShadow = true;
            spherePickup.name = "SpherePickup";
            scene.add(spherePickup);
            
            enemyOne = new Physijs.BoxMesh(enemyGeometry,enemyMaterial,1);
            enemyOne.position.set(Math.floor(Math.random() * (15 - -15 + 1)) + -15,50,Math.floor(Math.random() * (max - min + 1)) + min);
            enemyOne.receiveShadow = true;
            enemyOne.castShadow = true;
            enemyOne.name = "Enemy One";
            scene.add(enemyOne);
            
            enemyTwo = new Physijs.BoxMesh(enemyGeometry,enemyMaterial,1);
            enemyTwo.position.set(Math.floor(Math.random() * (15 - -15 + 1)) + -15,50,Math.floor(Math.random() * (max - min + 1)) + min);
            enemyTwo.receiveShadow = true;
            enemyTwo.castShadow = true;
            enemyTwo.name = "Enemy Two";
            scene.add(enemyTwo);
            
            enemyThree = new Physijs.BoxMesh(enemyGeometry,enemyMaterial,1);
            enemyThree.position.set(Math.floor(Math.random() * (15 - -15 + 1)) + -15,50,Math.floor(Math.random() * (max - min + 1)) + min);
            enemyThree.receiveShadow = true;
            enemyThree.castShadow = true;
            enemyThree.name = "Enemy Three";
            scene.add(enemyThree);
            
            
        }else if(generatorCounter % 2 != 0){
            
            scene.remove(ground);
            scene.remove(spotLight);
            scene.remove(spherePickup);
           
            
            groundTexture = new THREE.TextureLoader().load("../../Assets/images/road.jpg");
            groundTexture.wrapS = THREE.RepeatWrapping;
            groundTexture.wrapT = THREE.RepeatWrapping;
            groundTexture.repeat.set(1,1);
            
            groundTextureNormal = new THREE.TextureLoader().load("../../Assets/images/road.jpg");
            groundTextureNormal.wrapS = THREE.RepeatWrapping;
            groundTextureNormal.wrapT = THREE.RepeatWrapping;
            groundTexture.repeat.set(1,1);
            
            groundMaterial = new PhongMaterial();
            groundMaterial.map = groundTexture;
            groundMaterial.bumpMap = groundTextureNormal;
            groundMaterial.bumpScale = 0.2;
            
            groundGeometry = new BoxGeometry(32,1,32);
            groundPhysicsMaterial = Physijs.createMaterial(groundMaterial,0,0);
            ground = new Physijs.ConvexMesh(groundGeometry ,groundPhysicsMaterial,0);
            ground.position.set(0,0, nextGroundZPosition);
            ground .receiveShadow = true;
            ground .name = "Ground";
            
            scene.add(ground);           
            
            //Placing new Spotlight
            spotLight  = new SpotLight(0xffffff);
            spotLight.position.set(0,50,(64 + nextGroundZPosition));
            spotLight .castShadow = true;
            spotLight.intensity = 3;
            spotLight.lookAt(new Vector3(0,0,nextGroundZPosition +10));
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
            
            sphereGeometryPickup = new SphereGeometry(1,32,32);
            sphereMaterialPickup = Physijs.createMaterial(new LambertMaterial({color: 0xffaa11}),0.4,0);
            spherePickup = new Physijs.SphereMesh(sphereGeometryPickup,sphereMaterialPickup,1);
            spherePickup.position.set(Math.floor(Math.random() * (15 - -15 + 1)) + -15,50,Math.floor(Math.random() * (max - min + 1)) + min);
            spherePickup.receiveShadow = true;
            spherePickup.castShadow = true;
            spherePickup.name = "SpherePickup";
            scene.add(spherePickup);
            
            enemyOne = new Physijs.BoxMesh(enemyGeometry,enemyMaterial,1);
            enemyOne.position.set(Math.floor(Math.random() * (15 - -15 + 1)) + -15,50,Math.floor(Math.random() * (max - min + 1)) + min);
            enemyOne.receiveShadow = true;
            enemyOne.castShadow = true;
            enemyOne.name = "Enemy One";
            scene.add(enemyOne);
            
            enemyTwo = new Physijs.BoxMesh(enemyGeometry,enemyMaterial,1);
            enemyTwo.position.set(Math.floor(Math.random() * (15 - -15 + 1)) + -15,50,Math.floor(Math.random() * (max - min + 1)) + min);
            enemyTwo.receiveShadow = true;
            enemyTwo.castShadow = true;
            enemyTwo.name = "Enemy Two";
            scene.add(enemyTwo);
            
            enemyThree = new Physijs.BoxMesh(enemyGeometry,enemyMaterial,1);
            enemyThree.position.set(Math.floor(Math.random() * (15 - -15 + 1)) + -15,50,Math.floor(Math.random() * (max - min + 1)) + min);
            enemyThree.receiveShadow = true;
            enemyThree.castShadow = true;
            enemyThree.name = "Enemy Three";
            scene.add(enemyThree);
            
        }
    }

    //PointerLockChange Event Handler
    function pointerLockChange(event): void {
        if (document.pointerLockElement === element) {
            // enable our mouse and keyboard controls
            keyboardControls.enabled = true;
            mouseControls.enabled = true;
            blocker.style.display = 'none';
        } else {
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
    function pointerLockError(event): void {
        instructions.style.display = '';
        console.log("PointerLock Error Detected!!");
    }

    // Window Resize Event Handler
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function addControl(controlObject: Control): void {
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
    function gameLoop(): void {
        stats.update();

        checkControls();
        
        playerPositionCheck();

        // render using requestAnimationFrame
        requestAnimationFrame(gameLoop);

        // render the scene
        renderer.render(scene, camera);
    }


    // Check Controls Function
    function checkControls(): void {
        if (keyboardControls.enabled) {
            velocity = new Vector3();

            var time: number = performance.now();
            var delta: number = (time - prevTime) / 1000;

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
    function cameraLook(): void {
        var zenith: number = THREE.Math.degToRad(90);
        var nadir: number = THREE.Math.degToRad(-90);
        var cameraPitch: number = camera.rotation.x + mouseControls.pitch;
        // Constrain the Camera Pitch
        camera.rotation.x = THREE.Math.clamp(cameraPitch, nadir, zenith);
        

    }
    
    
    function playerPositionCheck():void{
        
        playersZPosition = player.position.z;
        
        if(playersZPosition > nextGroundZPosition){
            nextGroundZPosition += 32;
            console.log("Player z: " + player.position.z + "\n");
            generatorCounter++;
            console.log(generatorCounter);
            createNewGround();
        }
        
        
    }

    // Setup default renderer
    function setupRenderer(): void {
        renderer = new Renderer({ antialias: true });
        renderer.setClearColor(0x404040, 1.0);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(CScreen.WIDTH, CScreen.HEIGHT);
        renderer.shadowMap.enabled = true;
        console.log("Finished setting up Renderer...");
        
        
    }

    // Setup main camera for the scene
    function setupCamera(): void {
        camera = new PerspectiveCamera(35, config.Screen.RATIO, 0.1, 100);
        console.log("Finished setting up Camera...");
    }

    window.onload = init;

    return {
        scene: scene
    }

})();