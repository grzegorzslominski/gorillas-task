import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { MATERIALS } from "./materials";

const cubeMap = new THREE.CubeTextureLoader()
  .setPath("/assets/textures/cubeMap/")
  .load(["px.jpg", "nx.jpg", "py.jpg", "ny.jpg", "pz.jpg", "nz.jpg"]);

let scene;
let camera;
let renderer;
let sceneObjects = [];
let directionalLight;

const meshesDetails = {
  box: {
    geometry: new THREE.BoxGeometry(1, 1, 1),
    material: MATERIALS.phong,
    position: { x: -3, y: 1, z: 0 },
  },
  sphere: {
    geometry: new THREE.SphereGeometry(0.75),
    material: MATERIALS.basic,
    position: { x: 0, y: 1, z: 0 },
  },
  cylinder: {
    geometry: new THREE.CylinderGeometry(1, 1.25),
    material: MATERIALS.shader,
    position: { x: 4, y: 1, z: 0 },
  },
};

function adjustLighting() {
  directionalLight = new THREE.DirectionalLight(0xdddddd);
  directionalLight.position.set(-5, -3, 3);
  directionalLight.castShadow = true;

  directionalLight.shadow.camera.left = -10;
  directionalLight.shadow.camera.right = 10;
  directionalLight.shadow.camera.top = 10;
  directionalLight.shadow.camera.bottom = -10;
  directionalLight.shadow.camera.near = 0.1;
  directionalLight.shadow.camera.far = 1000;

  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;

  scene.add(directionalLight);

  let ambientLight = new THREE.AmbientLight(0xababab);
  scene.add(ambientLight);
}

function addLightSlidersLogic() {
  const axes = ["x", "y", "z"];
  axes.forEach((axis) => {
    const axisSlider = document.getElementById(`${axis}-light`);
    axisSlider.addEventListener("input", (e) => {
      updateLightPosition(axis, parseFloat(e.target.value));
    });
  });
}

function updateLightPosition(axisType, value) {
  directionalLight.position[axisType] = value;
}

function addMeshMaterialsLogic() {
  const objectsKeys = Object.keys(meshesDetails);
  objectsKeys.map((objectKey, index) => {
    const objectMaterialSelect = document.getElementById(`${objectKey}-select`);
    objectMaterialSelect.addEventListener("change", (e) => {
      updateMaterial(index, e.target.value);
    });
  });
}

function updateMaterial(objectIndex, value) {
  sceneObjects[objectIndex].material = MATERIALS[value];
}

function addObject(geometry, material, position) {
  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(position.x, position.y, position.z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  sceneObjects.push(mesh);
}

function createObjects() {
  Object.values(meshesDetails).map((objectDetails) => {
    addObject(
      objectDetails.geometry,
      objectDetails.material,
      objectDetails.position
    );
  });
}

function animationLoop() {
  renderer.render(scene, camera);
  sceneObjects.forEach((object) => {
    object.rotation.x += 0.00125;
    object.rotation.y += 0.00125;
  });
  requestAnimationFrame(animationLoop);
}

function init() {
  scene = new THREE.Scene();
  scene.background = cubeMap;
  const canvasContainer = document.getElementById("canvas-container");
  const width = canvasContainer.offsetWidth;
  const height = canvasContainer.offsetHeight;

  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setClearColor(0xa3a3a3);
  renderer.shadowMap.enabled = true;
  canvasContainer.appendChild(renderer.domElement);

  const orbit = new OrbitControls(camera, renderer.domElement);
  camera.position.set(0, 3, 5);
  orbit.update();

  const grid = new THREE.GridHelper(100, 100);
  scene.add(grid);

  adjustLighting();
  addLightSlidersLogic();
  addMeshMaterialsLogic();
  createObjects();
  animationLoop();
}

init();
