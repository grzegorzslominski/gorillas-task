import { GLTFLoader } from "https://unpkg.com/three@0.142.0/examples/jsm/loaders/GLTFLoader.js";
const AssetManager = {};
AssetManager.gltfLoader = new GLTFLoader();
AssetManager.loadGLTFAsync = (url) => {
  return new Promise((resolve, reject) => {
    AssetManager.gltfLoader.load(url, (obj) => {
      resolve(obj);
    });
  });
};

export { AssetManager };
