const vertex = /*glsl*/ `
varying vec3 vWorldPosition;
varying vec3 vNormal;
uniform mat4 viewMatrixInv;
void main() {
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    vNormal = (viewMatrixInv * vec4(normalMatrix * normal, 0.0)).xyz;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
`;

export default vertex;
