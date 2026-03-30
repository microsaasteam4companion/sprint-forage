import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const generatePoints = (count: number) => {
  const points: [number, number, number][] = [];
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(-1 + (2 * i) / count);
    const theta = Math.sqrt(count * Math.PI) * phi;
    const x = Math.cos(theta) * Math.sin(phi) * 1.52;
    const y = Math.sin(theta) * Math.sin(phi) * 1.52;
    const z = Math.cos(phi) * 1.52;
    points.push([x, y, z]);
  }
  return points;
};

const generateConnections = (points: [number, number, number][]) => {
  const connections: [number, number][] = [];
  for (let i = 0; i < points.length; i++) {
    const distances: { index: number; dist: number }[] = [];
    for (let j = 0; j < points.length; j++) {
      if (i === j) continue;
      const dx = points[i][0] - points[j][0];
      const dy = points[i][1] - points[j][1];
      const dz = points[i][2] - points[j][2];
      distances.push({ index: j, dist: Math.sqrt(dx * dx + dy * dy + dz * dz) });
    }
    distances.sort((a, b) => a.dist - b.dist);
    for (let k = 0; k < Math.min(2, distances.length); k++) {
      const pair: [number, number] = [Math.min(i, distances[k].index), Math.max(i, distances[k].index)];
      if (!connections.some(c => c[0] === pair[0] && c[1] === pair[1])) {
        connections.push(pair);
      }
    }
  }
  return connections;
};

const GlobeWireframe = () => {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshBasicMaterial color="#0dd9b5" wireframe transparent opacity={0.06} />
    </mesh>
  );
};

const ConnectionLines = ({ points, connections }: { points: [number, number, number][]; connections: [number, number][] }) => {
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.15;
    }
  });

  const lineGeometries = useMemo(() => {
    return connections.map(([a, b]) => {
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(...points[a]),
        new THREE.Vector3(
          (points[a][0] + points[b][0]) * 0.5 * 1.3,
          (points[a][1] + points[b][1]) * 0.5 * 1.3,
          (points[a][2] + points[b][2]) * 0.5 * 1.3
        ),
        new THREE.Vector3(...points[b])
      );
      const curvePoints = curve.getPoints(20);
      const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
      return geometry;
    });
  }, [points, connections]);

  const lineObjects = useMemo(() => {
    return lineGeometries.map((geo) => {
      const mat = new THREE.LineBasicMaterial({ color: "#0dd9b5", transparent: true, opacity: 0.15 });
      const line = new THREE.Line(geo, mat);
      return line;
    });
  }, [lineGeometries]);

  return (
    <group ref={ref}>
      {lineObjects.map((obj, i) => (
        <primitive key={i} object={obj} />
      ))}
    </group>
  );
};

const NodePoints = ({ points }: { points: [number, number, number][] }) => {
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.15;
    }
  });

  const colors = ["#0dd9b5", "#8b5cf6", "#f59e0b", "#ef4444", "#3b82f6"];

  return (
    <group ref={ref}>
      {points.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshBasicMaterial color={colors[i % colors.length]} />
        </mesh>
      ))}
    </group>
  );
};

const TeamFormation = () => {
  const ref = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.15;
    }
  });

  const teamPositions: [number, number, number][] = [
    [0.8, 1.2, 0.5],
    [-1.0, -0.5, 1.1],
    [0.3, -1.1, -0.9],
    [-0.7, 0.9, -0.8],
    [1.1, 0.1, -0.7],
  ];

  return (
    <group ref={ref}>
      {teamPositions.map((pos, i) => (
        <group key={i}>
          <mesh position={pos}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshBasicMaterial color="#0dd9b5" />
          </mesh>
          <mesh position={pos}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshBasicMaterial color="#0dd9b5" transparent opacity={0.1} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const ForgeGlobe = () => {
  const points = useMemo(() => generatePoints(60), []);
  const connections = useMemo(() => generateConnections(points), [points]);

  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.5} />
        <GlobeWireframe />
        <NodePoints points={points} />
        <ConnectionLines points={points} connections={connections} />
        <TeamFormation />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
        />
      </Canvas>
    </div>
  );
};

export default ForgeGlobe;
