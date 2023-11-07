import * as THREE from "https://cdn.skypack.dev/three@0.142.0";
import { OrbitControls } from "https://unpkg.com/three@0.142.0/examples/jsm/controls/OrbitControls.js";
import { AssetManager } from "./AssetManager.js";
import {
  MeshBVH,
  MeshBVHVisualizer,
  MeshBVHUniformStruct,
  SAH,
} from "https://unpkg.com/three-mesh-bvh@0.5.10/build/index.module.js";

import vertexShaderDiamond from "./diamondShader/vertex.js";
import fragmentShaderDiamond from "./diamondShader/fragment.js";

async function main() {
  // Setup basic renderer, controls, and profiler
  const clientWidth = window.innerWidth * 0.99;
  const clientHeight = window.innerHeight * 0.98;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    clientWidth / clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1, 4);
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(clientWidth, clientHeight);
  document.body.appendChild(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);

  const environment = await new THREE.CubeTextureLoader().loadAsync([
    "whiteStudio/px.png",
    "whiteStudio/nx.png",
    "whiteStudio/py.png",
    "whiteStudio/ny.png",
    "whiteStudio/pz.png",
    "whiteStudio/nz.png",
  ]);

  let diamondGeo = (await AssetManager.loadGLTFAsync("diamond.glb")).scene
    .children[0].children[0].children[0].children[0].children[0].geometry;

  const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
  });
  const cubeCamera = new THREE.CubeCamera(1, 100000, cubeRenderTarget);
  scene.add(cubeCamera);
  cubeCamera.position.set(0, 5, 0);
  cubeCamera.update(renderer, scene);

  const makeDiamond = (
    geo,
    { color = new THREE.Color(1, 1, 1), ior = 2.4 } = {}
  ) => {
    const mergedGeometry = geo;
    mergedGeometry.boundsTree = new MeshBVH(mergedGeometry.toNonIndexed(), {
      lazyGeneration: false,
      strategy: SAH,
    });
    const collider = new THREE.Mesh(mergedGeometry);
    collider.material.wireframe = true;
    collider.material.opacity = 0.5;
    collider.material.transparent = true;
    collider.visible = false;
    collider.boundsTree = mergedGeometry.boundsTree;
    scene.add(collider);
    const visualizer = new MeshBVHVisualizer(collider, 20);
    visualizer.visible = false;
    visualizer.update();
    scene.add(visualizer);
    const diamond = new THREE.Mesh(
      geo,
      new THREE.ShaderMaterial({
        uniforms: {
          envMap: { value: environment },
          bvh: { value: new MeshBVHUniformStruct() },
          bounces: { value: 3 },
          color: { value: color },
          ior: { value: ior },
          correctMips: { value: true },
          projectionMatrixInv: { value: camera.projectionMatrixInverse },
          viewMatrixInv: { value: camera.matrixWorld },
          chromaticAberration: { value: false },
          aberrationStrength: { value: 0.01 },
          resolution: { value: new THREE.Vector2(clientWidth, clientHeight) },
        },
        vertexShader: vertexShaderDiamond,
        fragmentShader: fragmentShaderDiamond,
      })
    );
    diamond.material.uniforms.bvh.value.updateFrom(collider.boundsTree);
    return diamond;
  };

  const diamond = makeDiamond(diamondGeo);
  scene.add(diamond);

  function animate() {
    controls.update();

    renderer.render(scene, camera);

    window.requestAnimationFrame(animate);
  }
  animate();
}
main();
