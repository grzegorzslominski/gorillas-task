import * as THREE from "three";
import { ParametricGeometry } from "three/addons/geometries/ParametricGeometry.js";

const canvasContainer = document.getElementById("canvas-container");
const width = canvasContainer.offsetWidth;
const height = canvasContainer.offsetHeight;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.z = 25;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
canvasContainer.appendChild(renderer.domElement);

const controls = {
  uValue: 1,
  vValue: 1,
};

const parametricFunction = (u, v, target) => {
  u *= Math.PI * 2 * controls.uValue;
  v *= Math.PI * 2 * controls.vValue;
  target.set(u * Math.sin(v), u * Math.cos(v), v * Math.cos(u));
};

const geometry = new ParametricGeometry(parametricFunction, 25, 25);
const material = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  side: THREE.DoubleSide,
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const changeControlValue = (controlType, value) => {
  if (controlType === "u") {
    controls.uValue = value;
  } else {
    controls.vValue = value;
  }
};

const updateGeometry = (controlType, value) => {
  changeControlValue(controlType, value);
  const newGeometry = new ParametricGeometry(parametricFunction, 25, 25);
  mesh.geometry.dispose();
  mesh.geometry = newGeometry;
  renderer.render(scene, camera);
};

const animate = () => {
  window.requestAnimationFrame(animate);
  mesh.rotation.x += 0.0025;
  mesh.rotation.y += 0.0025;
  renderer.render(scene, camera);
};

const addSlidersLogic = () => {
  document.addEventListener("DOMContentLoaded", () => {
    const uSlider = document.getElementById("u-slider");
    const vSlider = document.getElementById("v-slider");

    uSlider.addEventListener("input", (e) => {
      updateGeometry("u", parseFloat(e.target.value));
    });

    vSlider.addEventListener("input", (e) => {
      updateGeometry("v", parseFloat(e.target.value));
    });
  });
};

const main = () => {
  addSlidersLogic();
  animate();
};

main();
