import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface HealthIntelligence3DProps {
  isDark?: boolean;
  className?: string;
  interactive?: boolean;
}

export const HealthIntelligence3D: React.FC<HealthIntelligence3DProps> = ({
  isDark = true,
  className = "w-full h-full min-h-[420px]",
  interactive = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Group for all core elements
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Primary Particle Universe (Health Data Points)
    const particleCount = 750;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    const primaryColor = isDark ? new THREE.Color(0x06B6D4) : new THREE.Color(0x1E3A8A); // Cyan / Deep Sapphire Ink
    const secondaryColor = isDark ? new THREE.Color(0x10B981) : new THREE.Color(0x0F766E); // Emerald / Deep Teal Ink
    const accentColor = isDark ? new THREE.Color(0x818CF8) : new THREE.Color(0x6D28D9); // Indigo / Deep Violet Ink

    const radius = 6.2;
    for (let i = 0; i < particleCount; i++) {
      // Fibonacci sphere distribution for harmonious organic cellular shape
      const phi = Math.acos(-1 + (2 * i) / particleCount);
      const theta = Math.sqrt(particleCount * Math.PI) * phi;

      const r = radius + (Math.random() - 0.5) * 2.2;
      const x = r * Math.cos(theta) * Math.sin(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color variation across nodes
      const mixRatio = Math.random();
      const c = mixRatio > 0.6 ? primaryColor : (mixRatio > 0.3 ? secondaryColor : accentColor);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      scales[i] = Math.random() * 2.5 + 1.0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    // Particle Shader / Material
    const particleMaterial = new THREE.PointsMaterial({
      size: isDark ? 0.22 : 0.20,
      vertexColors: true,
      transparent: true,
      opacity: isDark ? 0.85 : 0.70,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
    });

    const particles = new THREE.Points(geometry, particleMaterial);
    coreGroup.add(particles);

    // Flowing Neural / Biological Lattice Rings
    const ringGeometries: THREE.BufferGeometry[] = [];
    const ringMaterials: THREE.LineBasicMaterial[] = [];
    const rings: THREE.Line[] = [];

    const ringCount = 5;
    for (let r = 0; r < ringCount; r++) {
      const ringGeo = new THREE.BufferGeometry();
      const points: THREE.Vector3[] = [];
      const ringRadius = 4.5 + r * 0.9;
      const segments = 90;

      for (let s = 0; s <= segments; s++) {
        const angle = (s / segments) * Math.PI * 2;
        const wave = Math.sin(angle * 4 + r) * 0.45;
        points.push(new THREE.Vector3(
          Math.cos(angle) * (ringRadius + wave),
          Math.sin(angle) * (ringRadius + wave),
          (Math.sin(angle * 3) * 1.5) + (r - 2) * 0.7
        ));
      }

      ringGeo.setFromPoints(points);
      ringGeometries.push(ringGeo);

      const ringMat = new THREE.LineBasicMaterial({
        color: r % 2 === 0 ? (isDark ? 0x22D3EE : 0x1E3A8A) : (isDark ? 0x34D399 : 0x0F766E),
        transparent: true,
        opacity: isDark ? 0.35 - (r * 0.04) : 0.28 - (r * 0.03),
        blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      });
      ringMaterials.push(ringMat);

      const line = new THREE.Line(ringGeo, ringMat);
      line.rotation.x = (r * Math.PI) / 6;
      line.rotation.y = (r * Math.PI) / 4;
      rings.push(line);
      coreGroup.add(line);
    }

    // Inner Translucent Core (Abstract Organ of Health Intelligence)
    const innerCoreGeo = new THREE.IcosahedronGeometry(2.8, 2);
    const innerCoreMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x0891B2 : 0x2563EB,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.22 : 0.18,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending
    });
    const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    coreGroup.add(innerCore);

    // Mouse Parallax Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newWidth, height: newHeight } = entry.contentRect;
        if (newWidth > 0 && newHeight > 0) {
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        }
      }
    });
    resizeObserver.observe(container);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Slow organic rotation
        coreGroup.rotation.y += 0.0035;
        coreGroup.rotation.x += 0.0012;
        innerCore.rotation.y -= 0.006;
        innerCore.rotation.z += 0.004;

        // Oscillate rings subtly
        rings.forEach((ring, idx) => {
          ring.rotation.z += 0.002 * (idx % 2 === 0 ? 1 : -1);
        });

        // Breathing particle pulse
        const posAttr = geometry.attributes.position as THREE.BufferAttribute;
        const currentPositions = posAttr.array as Float32Array;
        const timePulse = Math.sin(elapsedTime * 1.5) * 0.003;

        for (let i = 0; i < particleCount; i++) {
          currentPositions[i * 3] += currentPositions[i * 3] * timePulse;
          currentPositions[i * 3 + 1] += currentPositions[i * 3 + 1] * timePulse;
          currentPositions[i * 3 + 2] += currentPositions[i * 3 + 2] * timePulse;
        }
        posAttr.needsUpdate = true;
      }

      // Parallax easing
      targetX += (mouseX * 1.2 - targetX) * 0.05;
      targetY += (mouseY * 1.2 - targetY) * 0.05;
      coreGroup.position.x = targetX * 1.8;
      coreGroup.position.y = targetY * 1.4;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);

      geometry.dispose();
      particleMaterial.dispose();
      innerCoreGeo.dispose();
      innerCoreMat.dispose();
      ringGeometries.forEach(g => g.dispose());
      ringMaterials.forEach(m => m.dispose());
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isDark, interactive, prefersReducedMotion]);

  if (!hasWebGL) {
    return (
      <div className={`relative flex items-center justify-center p-8 overflow-hidden rounded-2xl ${isDark ? 'bg-cyan-950/20 border border-cyan-500/20' : 'bg-sky-50 border border-sky-200'} ${className}`}>
        <div className="relative z-10 text-center max-w-sm">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full border border-cyan-500/40 flex items-center justify-center bg-cyan-500/10 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20" />
          </div>
          <p className="text-xs uppercase tracking-widest font-mono-code text-cyan-600 dark:text-cyan-400 font-semibold mb-1">Health Intelligence Core</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Continuous multimodal synthesis across reports, clinical markers, and imaging scans.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} id="three-health-canvas-wrapper">
      <div ref={containerRef} className="w-full h-full" />
      {/* Subtle scientific radial depth backdrop */}
      <div className={`pointer-events-none absolute inset-0 -z-10 rounded-full blur-3xl opacity-30 ${
        isDark ? 'bg-gradient-to-tr from-cyan-600/30 via-teal-500/20 to-indigo-600/20' : 'bg-gradient-to-tr from-sky-400/20 via-teal-300/20 to-blue-400/20'
      }`} />
    </div>
  );
};
