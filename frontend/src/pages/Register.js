// Register.js
import React, { useState, Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { OrbitControls, Environment, Text, Center } from '@react-three/drei';

import * as THREE from 'three';

// Purple spotlight that moves from L to S
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


// 3D Liners text banner
const LinersBanner = () => {
  return (
    <Canvas camera={{ position: [0, 0, 20], fov: 35 }}>
      <ambientLight intensity={0.5} />
      <MovingPurpleLight />
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
  );
};

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (data.success) {
      localStorage.setItem('token', data.token);
      if (data.user?._id) {
        localStorage.setItem('userId', data.user._id);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      navigate('/home');
    } else {
      setError(data.message || "Registration failed");
    }
  };

  return (
    <FullScreenWrapper as={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <CanvasWrapper><LinersBanner /></CanvasWrapper>
      <StyledWrapper>
        <div className="form-container">
          <p className="title">Register</p>
          <form className="form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Name</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              <label>Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              <label>Password</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              <label>Confirm Password</label>
              <input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
            </div>
            {error && <p style={{ color: 'red', marginTop: '0.5rem' }}>{error}</p>}
            <button type="submit" className="sign">Submit</button>
          </form>
        </div>
      </StyledWrapper>
    </FullScreenWrapper>
  );
};

// Styled Components

const FullScreenWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  position: relative;
  background: #0f172a;
  overflow: hidden;
`;

const CanvasWrapper = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 0;

  canvas {
    opacity: 0.35;
  }
`;

const StyledWrapper = styled.div`
  z-index: 1;

  .form-container {
    font-family: 'Poppins', sans-serif;
    width: 320px;
    background-color: rgba(17, 24, 39, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    padding: 2rem;
    border-radius: 0.75rem;
    color: #f3f4f6;
    box-shadow: 0 0 15px rgba(167, 139, 250, 0.3);
  }

  .title {
    text-align: center;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .input-group {
    margin-top: 1rem;
  }

  label {
    font-size: 0.875rem;
    color: #9ca3af;
    margin-top: 0.75rem;
    display: block;
  }

  input {
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 0.375rem;
    background-color: #111827;
    color: #f3f4f6;
    border: 1px solid #374151;
    outline: none;
  }

  input:focus {
    border-color: #a78bfa;
  }

  .sign {
    margin-top: 1.5rem;
    width: 100%;
    padding: 0.75rem;
    background-color: #a78bfa;
    color: #111827;
    font-weight: 600;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
  }
`;

export default Register;
