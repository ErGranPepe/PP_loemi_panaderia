import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const RotatingBread: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);
  const breadRef = useRef<THREE.Mesh | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const check = () => setEnabled(window.innerWidth >= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    // Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Load 3D bread model
    const loader = new GLTFLoader();
    loader.load(
      '/models/bread.glb', // Path to 3D bread model file (you need to add this file)
      (gltf) => {
        const bread = gltf.scene;
        breadRef.current = bread;
        bread.scale.set(2, 2, 2);
        scene.add(bread);
      },
      undefined,
      (error) => {
        console.error('Error loading 3D model:', error);
      }
    );

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      if (breadRef.current) {
        breadRef.current.rotation.y = rotationRef.current;
        // Add subtle deformation or "crujido" effect here if desired
      }
      renderer.render(scene, camera);
    };
    animate();

    // Scroll event to update rotation and parallax effect
    const onScroll = () => {
      const scrollTop = window.scrollY || window.pageYOffset;
      rotationRef.current = scrollTop * 0.01; // Adjust rotation speed
      // Add parallax vertical translation
      camera.position.y = -scrollTop * 0.05; // Move camera up/down for parallax
      // Optional: Add subtle scaling for depth effect
      if (breadRef.current) {
        const scale = 2 + scrollTop * 0.001; // Slight scale increase on scroll
        breadRef.current.scale.set(scale, scale, scale);
      }
    };
    window.addEventListener('scroll', onScroll);

    // Resize handler
    const onResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  if (!enabled) return null;
  return <div ref={mountRef} style={{ width: '100%', height: '100vh', position: 'absolute', top: 0, left: 0, zIndex: -1 }} />;
};

export default RotatingBread;
