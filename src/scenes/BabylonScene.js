import * as BABYLON from 'babylonjs'
import { CharacterController } from "babylonjs-charactercontroller";
// import CharacterController from '../components/CharacterController'
import * as Colyseus from "colyseus.js";
import Stats from "stats-js";
import "babylonjs-loaders";
// import Player from './Player';
import { Inspector } from 'babylonjs-inspector';
import JoystickController from "joystick-controller";
import * as GUI from 'babylonjs-gui';

var statsFPS = new Stats();
statsFPS.domElement.style.cssText = "position:absolute;top:3px;left:3px;";
statsFPS.showPanel(0); // 0: fps,

var statsMemory = new Stats();
statsMemory.showPanel(2); //2: mb, 1: ms, 3+: custom
statsMemory.domElement.style.cssText = "position:absolute;top:3px;left:84px;";

//add stats for FPS and Memory usage
document.body.appendChild(statsFPS.dom);
document.body.appendChild(statsMemory.dom);

let camera
let engine
let scene
let player
let pbb
let marker

BABYLON.DefaultLoadingScreen.prototype.displayLoadingUI = function () {
    if (document.getElementById("customLoadingScreenDiv")) {
        // Do not add a loading screen if there is already one
        document.getElementById("customLoadingScreenDiv").style.display = "initial";
        return;
    }
    this._loadingDiv = document.createElement("div");
    this._loadingDiv.id = "customLoadingScreenDiv";
    this._loadingDiv.innerHTML = "scene is currently loading";
    var customLoadingScreenCss = document.createElement('style');
    customLoadingScreenCss.type = 'text/css';
    customLoadingScreenCss.innerHTML = `
    #customLoadingScreenDiv{
        background-color: #BB464Bcc;
        color: white;
        font-size:50px;
        text-align:center;
    }
    `;
    document.getElementsByTagName('head')[0].appendChild(customLoadingScreenCss);
    this._resizeLoadingUI();
    window.addEventListener("resize", this._resizeLoadingUI);
    document.body.appendChild(this._loadingDiv);
};

BABYLON.DefaultLoadingScreen.prototype.hideLoadingUI = function () {
    document.getElementById("customLoadingScreenDiv").style.display = "none";
    console.log("scene is now loaded");
};

export const createScene = async (canvas) => {
    engine = new BABYLON.Engine(canvas)
    scene = new BABYLON.Scene(engine)

    await loadMap("demo deui.glb");
    loadPlayer(scene, engine, canvas);
    playerBoundingBox();
    // ambientSound();
    loadTeleportArea(new BABYLON.Vector3(5, 0, 0));

    // get mesh by name "LED" and change material color to green
    const led = scene.getMeshByName("LED");
    led.material = new BABYLON.StandardMaterial("ledMat", scene);
    led.material.diffuseColor = BABYLON.Color3.Green();

    // Add event listener to window object to auto-resize the canvas
    window.addEventListener("resize", () => {
        engine.resize();
        console.log("Resizing window...");
    });

    // create a light
    const light = new BABYLON.HemisphericLight(
        'light',
        new BABYLON.Vector3(0, 1, 0),
        scene
    )

    return { engine, scene };
};

const ambientSound = () => {
    var sphereMat = new BABYLON.StandardMaterial("sphereMat", scene);
    sphereMat.diffuseColor = BABYLON.Color3.Purple();
    sphereMat.backFaceCulling = false;
    sphereMat.alpha = 0.3;

    var sphereMusic1 = BABYLON.Mesh.CreateSphere("musicsphere", 20, 30, scene);
    sphereMusic1.material = sphereMat;
    sphereMusic1.position = new BABYLON.Vector3(0, 0, 0);

    const sound = new BABYLON.Sound("bgm", "assets/sfx/bgm.mp3", scene, null, {
        loop: true,
        autoplay: true,
        spatialSound: true,
        distanceModel: "exponential",
        rolloffFactor: 2,
    });

    sound.setPosition(new BABYLON.Vector3(0, 1, 0));
}

export const loadPlayer = (scene, engine, canvas) => {
    BABYLON.SceneLoader.ImportMesh("", "assets/player/", "ybot2.glb", scene, (meshes, particleSystems, skeletons, animationGroups) => {
        player = meshes[0];
        player.name = "player";
        player.rotation = player.rotationQuaternion.toEulerAngles();
        player.rotationQuaternion = null;
        player.checkCollisions = true;
        player.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);
        player.ellipsoidOffset = new BABYLON.Vector3(0, 1, 0);
        // set the blending speed for the group
        animationGroups.blendingSpeed = 0.01; // adjust this value to control the blending speed
        const myAgmap = {
            "idle": animationGroups[1],
            "walk": animationGroups[10],
            "run": animationGroups[5],
            "walkBack": animationGroups[11],
            "turnLeft": animationGroups[8],
            "turnRight": animationGroups[9],
            "runJump": animationGroups[2],
            "idleJump": animationGroups[2]
        };

        //if the skeleton does not have any animation ranges then set them as below
        // setAnimationRanges(skeleton);
        //rotate the camera behind the player
        var alpha = -player.rotation.y - 4.69;
        var beta = Math.PI / 2.5;
        var target = new BABYLON.Vector3(player.position.x, player.position.y + 1.5, player.position.z);
        camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", alpha, beta, 5, target, scene);
        camera.name = "camera";

        //standard camera setting
        camera.wheelPrecision = 15;
        //
        camera.checkCollisions = true;
        //make sure the keyboard keys controlling camera are different from those controlling player
        //here we will not use any keyboard keys to control camera
        camera.keysLeft = [];
        camera.keysRight = [];
        camera.keysUp = [];
        camera.keysDown = [];
        //how close can the camera come to player
        camera.lowerRadiusLimit = 4.99;
        //how far can the camera go from the player
        camera.upperRadiusLimit = 5;
        camera.attachControl(canvas);

        //var CharacterController = org.ssatguru.babylonjs.component.CharacterController;
        var cc = new CharacterController(player, camera, scene, myAgmap);
        // cc.setupConfig(myAgmap);
        cc.enableBlending();
        // cc.setTurningOff(true);
        //below makes the controller point the camera at the player head which is approx
        //1.5m above the player origin
        cc.setCameraTarget(new BABYLON.Vector3(0, 1.5, 0));
        cc.setCameraElasticity(false);
        //if the camera comes close to the player we want to enter first person mode.
        cc.setNoFirstPerson(true);
        //the height of steps which the player can climb
        cc.setStepOffset(0.4);
        //the minimum and maximum slope the player can go up
        //between the two the player will start sliding down if it stops
        cc.setSlopeLimit(30, 60);

        //tell controller 
        // - which animation range should be used for which player animation
        // - rate at which to play that animation range
        // - wether the animation range should be looped
        //use this if name, rate or looping is different from default
        cc.setIdleAnim("idle", 1, true);
        cc.setTurnLeftAnim("turnLeft", 0.5, true);
        cc.setTurnRightAnim("turnRight", 0.5, true);
        cc.setWalkBackAnim("walkBack", 0.5, true);
        cc.setIdleJumpAnim("idleJump", 0.6, false);
        cc.setRunJumpAnim("runJump", 0.6, false);
        //set the animation range name to "null" to prevent the controller from playing
        //a player animation.
        //here even though we have an animation range called "fall" we donot want to play 
        //the fall animation
        cc.setFallAnim("fall", 2, false);
        cc.setSlideBackAnim("slideBack", 1, false)
        animationGroups[0].stop(); //stop default animation from playing overlapping with idle anim
        cc.start();

        createJoystick(scene, canvas);
        mapTraversal(scene, canvas);

        // Render loop
        engine.runRenderLoop(function () {
            pbb.position = new BABYLON.Vector3(player.position.x, player.position.y + 1, player.position.z);
            pbb.rotation = new BABYLON.Vector3(player.rotation.x, player.rotation.y, player.rotation.z);
            if (marker != null) {
                marker.position = new BABYLON.Vector3(player.position.x, player.position.y + 99, player.position.z);
            }

            scene.render();
            //update stats
            statsFPS.update();
            statsMemory.update();
        });
    });
};

const loadMap = async (map) => {
    engine.displayLoadingUI();
    const importPromise = await BABYLON.SceneLoader.ImportMeshAsync("", "assets/env/", map, scene);
    importPromise.meshes.forEach(m => {
        m.checkCollisions = true;
        m.cullingStrategy = BABYLON.AbstractMesh.CULLINGSTRATEGY_OPTIMISTIC_INCLUSION; // set culling strategy to improve performance
        m.freezeWorldMatrix(); // freeze world matrix to save resources
    });
    importPromise.meshes[0].name = "map";
    engine.hideLoadingUI();
};

export const mapTraversal = (scene, canvas) => {
    // Minimap
    var mm = new BABYLON.FreeCamera("minimap", new BABYLON.Vector3(0, 300, 0), scene);
    mm.setTarget(new BABYLON.Vector3(0.1, 0.1, 0.1));
    mm.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
    mm.orthoLeft = -400 / 2;
    mm.orthoRight = 400 / 2;
    mm.orthoTop = 400 / 2;
    mm.orthoBottom = -400 / 2;
    mm.rotation.y = 0;
    var xstart = 0.85,
        ystart = 0.75;
    var width = 1 - xstart,
        height = 1 - ystart;
    mm.viewport = new BABYLON.Viewport(0.01 * 2, 0, 0.195 * 2, 0.18 * 2);
    mm.renderingGroupId = 1;

    camera.viewport = new BABYLON.Viewport(0, 0, 1, 1);
    scene.activeCamera = camera;
    scene.activeCameras.push(camera);
    camera.attachControl(canvas, true);
    scene.activeCameras.push(mm);
    mm.layerMask = 1
    camera.layerMask = 2

    const greenMaterial = new BABYLON.StandardMaterial("greenMaterial", scene);
    greenMaterial.diffuseColor = new BABYLON.Color3(0, 1, 0);

    const radius = 7;
    const tessellation = 64;
    marker = BABYLON.MeshBuilder.CreateDisc("circle", { radius, tessellation }, scene);
    marker.material = greenMaterial;
    marker.rotation.x = Math.PI / 2;
};

const networkManager = async () => {
    let client = new Colyseus.Client("ws://localhost:2567");
    console.log("Connecting to Colyseus server...");
    //
    // Connect with Colyseus server
    //
    let room = client.joinOrCreate("my_room");
    console.log("Connected to Colyseus server!");
};

const loadTeleportArea = (position) => {
    let teleportBox = BABYLON.MeshBuilder.CreateBox("box", { size: 2 }, scene);
    teleportBox.position = position;
    teleportBox.scaling = new BABYLON.Vector3(1, 2, 1);
    let material = new BABYLON.StandardMaterial("boxMaterial", scene);
    material.diffuseColor = new BABYLON.Color3(0.5, 0.5, 1);
    material.alpha = 0.5;
    teleportBox.material = material;
    teleportBox.computeWorldMatrix(true);
    teleportBox.actionManager = new BABYLON.ActionManager(scene);
    teleportBox.actionManager.registerAction(new BABYLON.ExecuteCodeAction({
        trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
        parameter: pbb
    }, function () {
        console.log("intersect");
        scene.getMeshByName("map").dispose();
        teleportBox.dispose();
        loadMap("arival interior.glb");
        if (scene.getMeshByName("player") != undefined) {
            let player = scene.getMeshByName("player");
            player.position = new BABYLON.Vector3(0, 1, 0);
        }
    }));
};

const createJoystick = (scene, canvas) => {
    //show joystick only on mobile devices
    if (/Mobi|Android/i.test(navigator.userAgent)) {
        let joystick = new JoystickController(
            {
                maxRange: 70,
                level: 10,
                radius: 50,
                joystickRadius: 30,
                opacity: 0.5,
                leftToRight: false,
                bottomToUp: true,
                containerClass: "joystick-container",
                controllerClass: "joystick-controller",
                joystickClass: "joystick",
                distortion: true,
                y: "15%",
            },
            ({ x, y, leveledX, leveledY, distance, angle }) => {
                console.log(x, y, leveledX, leveledY, distance, angle)
                if (y > 45) {
                    cc.run(true)
                }

                else if (y < 45 && y > 0) {
                    cc.run(false)
                    cc.walk(true)
                }

                else if (y <= -45) {
                    cc.walkBack(true);
                }

                else if (y > -45 && y <= 45) {
                    cc.walk(false)
                    cc.walkBack(false);
                    cc.run(false)
                }

                if (x > 40) {
                    cc.turnRight(true);
                }
                if (x < -40) {
                    cc.turnLeft(true);
                }

                if (x <= 40 && x > -40) {
                    cc.turnLeft(false);
                    cc.turnRight(false);
                }
            }
        );
    }
};

const playerBoundingBox = () => {
    var matBB = new BABYLON.StandardMaterial("matBB", scene);
    matBB.emissiveColor = new BABYLON.Color3(1, 1, 1);
    matBB.wireframe = true;

    pbb = BABYLON.Mesh.CreateBox("pbb", 1, scene);
    pbb.scaling = new BABYLON.Vector3(0.6, 2, 0.4);
    pbb.material = matBB;
};

export const updatePlayerPosition = (scene, newPosition) => {
    // Get the player mesh from the scene
    const playerMesh = scene.getMeshByName("player");

    // Update the player's position
    playerMesh.position = newPosition;
};

export const updatePlayerRotation = (scene, rotation) => {
    const player = scene.getMeshByName("player");
    player.rotation = rotation;

    const camera = scene.getCameraByName("camera");
    //rotate the camera behind the player
    var alpha = -player.rotation.y + 4.69;
    camera.alpha = alpha;
};

export const happyAnim = (scene) => {
    const player = scene.getMeshByName("player");
    const animGroup = player.animationGroups[0];
    animGroup.play(true);
};