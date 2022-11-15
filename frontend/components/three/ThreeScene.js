import styles from '../../styles/modules/Home.module.css';
import Logo from '../../asset/logo-only-icon-colored-no-background.svg';
import { vertexShader, fragmentShader } from './shaders';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeScene() {
  return (
    <div className={styles.scene}>
      <Canvas
        shadows={true}
        className={styles.canvas}
        camera={{ position: [1.5, 1.5, 1.5] }}
      >
        <ambientLight intensity={0.5} />
        <CustomGeometryParticles count={4000} />
        <OrbitControls enablePan={false} enableZoom={false} />
      </Canvas>
    </div>
  );
}

const CustomGeometryParticles = (props) => {
  const { count } = props;
  const radius = 2;

  // This reference gives us direct access to our points
  const points = useRef();

  // Generate our positions attributes array
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const distance = Math.sqrt(Math.random() - 0.5) * radius;
      const theta = THREE.MathUtils.randFloatSpread(360);
      const phi = THREE.MathUtils.randFloatSpread(360);

      let x = distance * Math.sin(theta) * Math.cos(phi);
      let y = distance * Math.sin(theta) * Math.sin(phi);
      let z = distance * Math.cos(theta);

      positions.set([x, y, z], i * 3);
    }

    return positions;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: {
        value: 0.0,
      },
      uMouse: {
        value: new THREE.Vector2(0.0, 0.0),
      },
      uRadius: {
        value: radius,
      },
    }),
    [],
  );

  useFrame((state) => {
    const { clock } = state;

    points.current.material.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach='attributes-position'
          count={particlesPosition.length / 3}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
      />
    </points>
  );
};
