import glslCurlNoise from './glslCurlNoise';

const simulationVertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;
}

`;

const simulationFragmentShader = `

uniform sampler2D positions;
uniform float uTime;
uniform float uFrequency;

varying vec2 vUv;

${glslCurlNoise}
void main() {
  vec3 pos = texture2D(positions, vUv).rgb;
  vec3 curlPos = texture2D(positions, vUv).rgb;

  pos = curlNoise(pos * uFrequency + uTime * 0.1);
  curlPos = curlNoise(curlPos * uFrequency + uTime * 0.1);
  curlPos += curlNoise(curlPos * uFrequency * 2.0) * 0.5;

  gl_FragColor = vec4(mix(pos, curlPos, sin(uTime)), 1.0);
}
`;

export { simulationVertexShader, simulationFragmentShader };
