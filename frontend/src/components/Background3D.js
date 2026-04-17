import React, { useRef, Suspense, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, Environment, Center, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import styled from 'styled-components';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Purple spotlight that moves from L to S (Matched to User Snippet)
const MovingPurpleLight = () => {
    const lightRef = useRef();
    const trailRef = useRef();

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        const x = -8 + (t % 4) * 4; // L to S motion
        const y = Math.sin(t * 2) * 1.5;
        const z = Math.cos(t) * 2;

        // Dynamic color shifting (purple to pink)
        const hue = (Math.sin(t * 0.5) + 1) / 2; // 0 to 1
        const color = new THREE.Color();
        color.setHSL(0.77 + hue * 0.05, 1, 0.7); // purple hues

        // Light position & color
        if (lightRef.current) {
            lightRef.current.position.set(x, y, z);
            lightRef.current.color = color;
        }

        // Trail glowing orb (fake bloom)
        if (trailRef.current) {
            trailRef.current.position.set(x, y, z);
            trailRef.current.material.color = color;
            trailRef.current.material.opacity = 0.35 + Math.sin(t * 2) * 0.1;
        }
    });

    return (
        <>
            <pointLight
                ref={lightRef}
                intensity={3}
                distance={10}
                decay={2}
                castShadow
            />
            <mesh ref={trailRef}>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshStandardMaterial
                    transparent
                    emissive="#d8b4fe"
                    emissiveIntensity={1}
                    opacity={0.5}
                />
            </mesh>
        </>
    );
};

// Mini Liners floating in background
const MiniLiners = () => {
    const count = 35;
    const items = useMemo(() => {
        return new Array(count).fill(0).map(() => ({
            position: [
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20 - 5
            ],
            rotation: [
                Math.random() * Math.PI * 0.2,
                Math.random() * Math.PI * 0.2,
                0
            ],
            scale: 0.3 + Math.random() * 0.5,
        }));
    }, []);

    return (
        <>
            {items.map((item, i) => (
                <Float key={i} speed={1 + Math.random()} rotationIntensity={0.5} floatIntensity={0.5}>
                    <Text
                        position={item.position}
                        rotation={item.rotation}
                        scale={item.scale}
                        fontSize={1}
                    >
                        LINERS
                        <meshStandardMaterial
                            color="#b388ff"
                            emissive="#d8b4fe"
                            emissiveIntensity={0.5}
                            transparent
                            opacity={0.15}
                        />
                    </Text>
                </Float>
            ))}
        </>
    );
};

// Main Background3D component integrating the effect
const Background3D = ({ canvasOpacity = 0.35 }) => {
    const windmillRefs = useRef([]);

    useEffect(() => {
        // Register ScrollTrigger with GSAP
        gsap.registerPlugin(ScrollTrigger);

        // Simple scroll listener that directly updates all windmill rotations
        const handleScroll = () => {
            // Calculate scroll progress
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollProgress = docHeight > 0 ? window.scrollY / docHeight : 0;
            
            // Apply rotation to all windmills
            windmillRefs.current.forEach(ref => {
                if (ref) {
                    ref.style.transform = `rotateZ(${scrollProgress * 1800}deg)`;
                }
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    // Create array of windmill positions across the page
    const windmillPositions = [
        { top: '10%', left: '10%' },
        { top: '20%', right: '15%' },
        { top: '35%', left: '5%' },
        { top: '50%', right: '8%' },
        { top: '65%', left: '12%' },
        { top: '80%', right: '10%' },
        { top: '15%', left: '50%' },
        { top: '45%', left: '85%' },
        { top: '75%', left: '50%' },
    ];

    return (
        <>
            {/* Canvas Background */}
            <BackgroundWrapper>
                <CanvasWrapper opacity={canvasOpacity}>
                    <Canvas 
                        camera={{ position: [0, 0, 20], fov: 35 }} 
                        dpr={1} 
                        performance={{ min: 0.25, max: 0.75 }}
                        gl={{ antialias: false, precision: "lowp" }}
                    >
                        <ambientLight intensity={0.5} />
                        <MovingPurpleLight />
                        <MiniLiners />
                        <Suspense fallback={null}>
                            <Center>
                                <Text
                                    fontSize={6}
                                    letterSpacing={-0.03}
                                    bevelEnabled
                                    bevelSize={0.04}
                                    bevelThickness={0.1}
                                    height={0.6}
                                    curveSegments={16}
                                    lineHeight={1}
                                    position={[0, 0, 0]}
                                    anchorX="center"
                                    anchorY="middle"
                                >
                                    LINERS
                                    <meshPhysicalMaterial
                                        color="#b388ff"
                                        emissive="#d8b4fe"
                                        emissiveIntensity={2}
                                        metalness={1}
                                        roughness={0.1}
                                        reflectivity={1}
                                        clearcoat={1}
                                        clearcoatRoughness={0.1}
                                    />
                                </Text>
                            </Center>
                        </Suspense>
                        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1.2} />
                        <Environment preset="studio" />
                    </Canvas>
                </CanvasWrapper>
            </BackgroundWrapper>

            {/* Scroll-triggered Windmills - Scattered across entire page */}
            {windmillPositions.map((pos, idx) => (
                <WindmillContainer 
                    key={idx}
                    ref={(el) => (windmillRefs.current[idx] = el)}
                    id={`windmill-${idx}`}
                    style={{ top: pos.top, left: pos.left, right: pos.right }}
                >
                    <svg
                        className="pin-windmill-svg"
                        viewBox="0 0 200 200"
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="xMidYMid meet"
                        style={{
                            width: '200px',
                            height: '200px',
                            opacity: 0.4,
                            filter: 'drop-shadow(0 0 40px rgba(168, 85, 247, 0.8)) drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))',
                            display: 'block',
                        }}
                    >
                        {/* Blade 1 - Top */}
                        <path
                            d="M 100 100 L 95 40 Q 100 35 105 40 L 100 100 Z"
                            fill="#a855f7"
                            opacity="0.9"
                        />
                        
                        {/* Blade 2 - Right */}
                        <path
                            d="M 100 100 L 160 95 Q 165 100 160 105 L 100 100 Z"
                            fill="#c084fc"
                            opacity="0.85"
                        />
                        
                        {/* Blade 3 - Bottom */}
                        <path
                            d="M 100 100 L 105 160 Q 100 165 95 160 L 100 100 Z"
                            fill="#a855f7"
                            opacity="0.9"
                        />
                        
                        {/* Blade 4 - Left */}
                        <path
                            d="M 100 100 L 40 105 Q 35 100 40 95 L 100 100 Z"
                            fill="#c084fc"
                            opacity="0.85"
                        />
                        
                        {/* Center hub with gradient effect */}
                        <circle cx="100" cy="100" r="12" fill="#a855f7" opacity="1" />
                        <circle cx="100" cy="100" r="8" fill="#d8b4fe" opacity="1" />
                        
                        {/* Decorative ring around center */}
                        <circle cx="100" cy="100" r="18" fill="none" stroke="#a855f7" strokeWidth="1.5" opacity="0.6" />
                        
                        {/* Outer glow ring */}
                        <circle cx="100" cy="100" r="85" fill="none" stroke="#a855f7" strokeWidth="1" opacity="0.3" />
                    </svg>
                </WindmillContainer>
            ))}
        </>
    );
};

const BackgroundWrapper = styled.div`
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  width: 100vw;
  height: 100vh;
`;

const WindmillContainer = styled.div`
  position: fixed;
  z-index: 1;
  pointer-events: none;
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(-50%, -50%);

  svg {
    transform-origin: center;
    display: block;
  }
`;

const CanvasWrapper = styled.div`
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  opacity: ${props => props.opacity * 0.4};
  background: transparent;

  canvas {
    width: 100vw !important;
    height: 100vh !important;
  }
`;

export default React.memo(Background3D);
