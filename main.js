import * as THREE from "three";
import { ParametricGeometry } from "three/addons/geometries/ParametricGeometry.js";

let scene;
let camera;
let renderer;
let mesh;

const controls = {
  u: 1,
  v: 1,
};

function adjustLighting() {
  const directionalLight = new THREE.DirectionalLight(0xdddddd);
  directionalLight.position.set(-5, 3, 3);
  scene.add(directionalLight);

  let ambientLight = new THREE.AmbientLight(0xababab);
  scene.add(ambientLight);
}

function parametricFunction(u, v, target) {
  u *= Math.PI * 2 * controls.u;
  v *= Math.PI * 2 * controls.v;
  target.set(u * Math.sin(v), u * Math.cos(v), v * Math.cos(u));
}

function updateGeometry(controlType, value) {
  controls[controlType] = value;
  const newGeometry = new ParametricGeometry(parametricFunction, 25, 25);
  mesh.geometry.dispose();
  mesh.geometry = newGeometry;
}

function animate() {
  window.requestAnimationFrame(animate);
  mesh.rotation.x += 0.0025;
  mesh.rotation.y += 0.0025;
  renderer.render(scene, camera);
}

function addSlidersLogic() {
  const uSlider = document.getElementById("u-slider");
  const vSlider = document.getElementById("v-slider");

  uSlider.addEventListener("input", (e) => {
    updateGeometry("u", parseFloat(e.target.value));
  });

  vSlider.addEventListener("input", (e) => {
    updateGeometry("v", parseFloat(e.target.value));
  });
}

function init() {
  const canvasContainer = document.getElementById("canvas-container");
  const width = canvasContainer.offsetWidth;
  const height = canvasContainer.offsetHeight;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.z = 25;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  canvasContainer.appendChild(renderer.domElement);

  const geometry = new ParametricGeometry(parametricFunction, 25, 25);
  const material = new THREE.MeshPhongMaterial({
    color: 0x0095dd,
    shininess: 100,
    side: THREE.DoubleSide,
  });

  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  addSlidersLogic();
  adjustLighting();
  animate();
}

init();
