import * as THREE from "three";

const cubeMap = new THREE.CubeTextureLoader()
  .setPath("/assets/textures/cubeMap/")
  .load(["px.jpg", "nx.jpg", "py.jpg", "ny.jpg", "pz.jpg", "nz.jpg"]);

const refractionVertexShader = `
    varying vec3 vReflect;
    varying vec3 vRefract[3];
    varying float vReflectionFactor;
    uniform float refractionRatio;

    void main() {

        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        
        vec3 worldNormal = normalize(normalMatrix * normal);
        vec3 I = worldPosition.xyz - cameraPosition;

        vReflect = reflect(I, worldNormal);
        vRefract[0] = refract(normalize(I), worldNormal, refractionRatio);
        vRefract[1] = refract(normalize(I), worldNormal, refractionRatio * 0.99);
        vRefract[2] = refract(normalize(I), worldNormal, refractionRatio * 0.98);
        
        vReflectionFactor = pow((1.0 + dot(I, worldNormal)), 3.0);
        
        gl_Position = projectionMatrix * mvPosition;
    }
`;

const refractionFragmentShader = `
    uniform samplerCube tCube;
    varying vec3 vReflect;
    varying vec3 vRefract[3];
    varying float vReflectionFactor;

    void main() {
   
        vec4 reflectedColor = textureCube(tCube, vec3(-vReflect.x, vReflect.yz));
        vec4 refractedColor = vec4(1.0);
      
        refractedColor.r = textureCube(tCube, vec3(-vRefract[0].x, vRefract[0].yz)).r;
        refractedColor.g = textureCube(tCube, vec3(-vRefract[1].x, vRefract[1].yz)).g;
        refractedColor.b = textureCube(tCube, vec3(-vRefract[2].x, vRefract[2].yz)).b;

        gl_FragColor = mix(refractedColor, reflectedColor, clamp(vReflectionFactor, 0.0, 1.0));
        gl_FragColor.a = 0.8;
    }
`;

export const MATERIALS = {
  phong: new THREE.MeshPhongMaterial({ color: 0x0095dd, shininess: 200 }),
  basic: new THREE.MeshBasicMaterial({
    wireframe: true,
    wireframeLinewidth: 2,
  }),
  normal: new THREE.MeshNormalMaterial(),
  glass: new THREE.MeshPhysicalMaterial({
    transmission: 1,
    thickness: 1.5,
    roughness: 0.07,
  }),
  shader: new THREE.ShaderMaterial({
    uniforms: {
      tCube: { value: cubeMap },
      refractionRatio: { value: 0.98 },
    },
    vertexShader: refractionVertexShader,
    fragmentShader: refractionFragmentShader,
    transparent: true,
    depthWrite: false,
  }),
};
