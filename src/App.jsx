import { useState, useRef, useMemo, useEffect, Suspense, useCallback } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { Float, Environment, ContactShadows, Points, PointMaterial, useGLTF, useTexture, Html, RoundedBox, Text } from '@react-three/drei'
import { User, Mail, ShoppingCart, Award, Monitor, ExternalLink } from 'lucide-react'
import * as THREE from 'three'
import './index.css'

// ─── Mobile Detection Hook ─────────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

import Spline from '@splinetool/react-spline';

// ─── iPhone 17 Pro Max Model Component ───────────────────────────────────────
function IphoneModel({ position, scale, onClick, onPointerOver, onPointerOut }) {
  const { scene } = useGLTF('/model/iphone_17_pro_max_silver.glb')
  const wallpaperTexture = useTexture('/pic/wallpapaer.png')
  const modelRef = useRef()

  useEffect(() => {
    if (wallpaperTexture) {
      wallpaperTexture.flipY = false
      wallpaperTexture.colorSpace = THREE.SRGBColorSpace
      wallpaperTexture.needsUpdate = true
    }
  }, [wallpaperTexture])

  useFrame((state, delta) => {
    if (modelRef.current) {
      // Continuous slow 360-degree Y rotation
      modelRef.current.rotation.y += delta * 0.35
    }
  })

  const clonedScene = useMemo(() => {
    const cloned = scene.clone()
    cloned.traverse((child) => {
      if (child.isMesh && (child.material?.name === '17ProMax_Screen' || child.name === 'Object_13')) {
        child.material = new THREE.MeshBasicMaterial({
          map: wallpaperTexture,
        })
      }
    })
    return cloned
  }, [scene, wallpaperTexture])

  return (
    <primitive
      ref={modelRef}
      object={clonedScene}
      position={position}
      scale={scale}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    />
  )
}

useGLTF.preload('/model/iphone_17_pro_max_silver.glb')
useTexture.preload('/pic/wallpapaer.png')

// ─── Tech Energy Core Component ───────────────────────────────────────────────
function SpinningRing({ radius, tubeRadius, color, speed, tiltX, tiltZ }) {
  const ref = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    ref.current.rotation.y = t * speed
    ref.current.rotation.x = tiltX + Math.sin(t * 0.5) * 0.05
    ref.current.rotation.z = tiltZ + Math.cos(t * 0.7) * 0.05
  })

  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, tubeRadius, 16, 64]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.8}
        metalness={0.9}
        roughness={0.1}
        transparent
        opacity={0.85}
      />
    </mesh>
  )
}

function TechEnergyCore({ position, scale, onClick, onPointerOver, onPointerOut }) {
  const groupRef = useRef()
  const coreRef = useRef()
  const particlesRef = useRef()

  // Generate small energy particles orbiting the core
  const particleCount = 40
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 0.5 + Math.random() * 0.3
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)
    }
    return positions
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    // Slow rotation of the whole assembly
    if (groupRef.current) groupRef.current.rotation.y = t * 0.15
    // Pulsing core glow
    if (coreRef.current) {
      const pulse = Math.sin(t * 2.5) * 0.15 + 0.85
      coreRef.current.material.emissiveIntensity = pulse * 2
      coreRef.current.scale.setScalar(1 + Math.sin(t * 3) * 0.03)
    }
    // Particles orbit
    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.8
      particlesRef.current.rotation.x = Math.sin(t * 0.4) * 0.3
    }
  })

  return (
    <group position={position} scale={scale}>
      <group ref={groupRef}>
        {/* Central glowing core sphere */}
        <mesh
          ref={coreRef}
          onClick={onClick}
          onPointerOver={onPointerOver}
          onPointerOut={onPointerOut}
        >
          <sphereGeometry args={[0.18, 32, 32]} />
          <meshStandardMaterial
            color="#00e5ff"
            emissive="#00e5ff"
            emissiveIntensity={2}
            transparent
            opacity={0.95}
          />
        </mesh>

        {/* Inner glow sphere (larger, faint) */}
        <mesh>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshBasicMaterial
            color="#00e5ff"
            transparent
            opacity={0.15}
          />
        </mesh>

        {/* Ring 1 — outer, horizontal, fast */}
        <SpinningRing
          radius={0.45}
          tubeRadius={0.012}
          color="#00e5ff"
          speed={1.2}
          tiltX={0}
          tiltZ={0}
        />

        {/* Ring 2 — mid, tilted 60°, medium speed */}
        <SpinningRing
          radius={0.38}
          tubeRadius={0.01}
          color="#40c4ff"
          speed={-0.8}
          tiltX={Math.PI / 3}
          tiltZ={0.2}
        />

        {/* Ring 3 — inner, tilted opposite, slow */}
        <SpinningRing
          radius={0.32}
          tubeRadius={0.008}
          color="#80d8ff"
          speed={1.5}
          tiltX={-Math.PI / 4}
          tiltZ={-0.3}
        />
      </group>

      {/* Orbiting energy particles */}
      <Points ref={particlesRef} positions={particlePositions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#00e5ff"
          size={0.02}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>

      {/* Soft teal/cyan lighting */}
      <pointLight color="#00e5ff" intensity={1.5} distance={4} />
      <pointLight color="#40c4ff" intensity={0.8} distance={3} position={[0, 0.2, 0]} />
    </group>
  )
}

// ─── Spline Error Boundary ───────────────────────────────────────────────────
import React from 'react'

class SplineErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.warn("Spline runtime timeline notice caught:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return null
    }
    return this.props.children
  }
}

function SplineRobotModel() {
  const isMobile = useIsMobile()
  return (
    <Html transform position={[0, -0.5, 0]} scale={isMobile ? 0.3 : 0.5} zIndexRange={[5, 0]}>
      <div style={{ width: isMobile ? '400px' : '800px', height: isMobile ? '400px' : '800px', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
        <SplineErrorBoundary>
          <Spline scene="https://prod.spline.design/ifwJfSH-kdl2oh5D/scene.splinecode" onError={(err) => console.warn('Spline load info:', err)} />
        </SplineErrorBoundary>
      </div>
    </Html>
  );
}

// Starry background like the reference
function Stars(props) {
  const ref = useRef()
  const [sphere] = useState(() => {
    // Fill sphere with random points
    const points = new Float32Array(500 * 3)
    for (let i = 0; i < 500; i++) {
      const r = 20 * Math.cbrt(Math.random())
      const theta = Math.random() * 2 * Math.PI
      const phi = Math.acos(2 * Math.random() - 1)
      points[i * 3] = r * Math.sin(phi) * Math.cos(theta)    // x
      points[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)// y
      points[i * 3 + 2] = r * Math.cos(phi)                  // z
    }
    return points
  })

  useFrame((state, delta) => {
    ref.current.rotation.x -= delta / 10
    ref.current.rotation.y -= delta / 15
  })

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial transparent color="#ffffff" size={0.05} sizeAttenuation={true} depthWrite={false} />
      </Points>
    </group>
  )
}

// 3D Hamburger Menu at top right
function HamburgerMenu() {
  const group = useRef()
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, hovered ? 0.2 : 0, 0.1)
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, hovered ? 0.1 : 0, 0.1)
  })

  const material = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.1, metalness: 0.8 })
  return (
    <group
      ref={group}
      position={[5, 3.5, -4]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={0.4}
      visible={false}
    >
      <mesh material={material} position={[0, 0.4, 0]}>
        <capsuleGeometry args={[0.2, 1, 4, 16]} rotation={[0, 0, Math.PI / 2]} />
      </mesh>
      <mesh material={material} position={[0, 0, 0]}>
        <capsuleGeometry args={[0.2, 1, 4, 16]} rotation={[0, 0, Math.PI / 2]} />
      </mesh>
      <mesh material={material} position={[0, -0.4, 0]}>
        <capsuleGeometry args={[0.2, 1, 4, 16]} rotation={[0, 0, Math.PI / 2]} />
      </mesh>
    </group>
  )
}

// Simple floating mask at top left
function TopLeftMask() {
  const group = useRef()
  useFrame((state) => {
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
  })

  const whiteMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.2, metalness: 0.1 })
  const blackMat = new THREE.MeshStandardMaterial({ color: '#000000', roughness: 0.1, metalness: 0.9 })

  return (
    <group ref={group} position={[-5.5, 3.8, -4]} scale={0.3}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh material={whiteMat}>
          <sphereGeometry args={[1, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
        </mesh>
        {/* Simple sunglasses representation */}
        <mesh material={blackMat} position={[-0.4, 0.2, 0.8]} rotation={[0.1, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} rotation={[Math.PI / 2, 0, 0]} />
        </mesh>
        <mesh material={blackMat} position={[0.4, 0.2, 0.8]} rotation={[0.1, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} rotation={[Math.PI / 2, 0, 0]} />
        </mesh>
        <mesh material={blackMat} position={[0, 0.25, 0.8]}>
          <boxGeometry args={[0.8, 0.1, 0.1]} />
        </mesh>
        {/* Smile cut */}
        <mesh material={blackMat} position={[0, -0.4, 0.85]}>
          <cylinderGeometry args={[0.4, 0.4, 0.1, 16, 1, false, 0, Math.PI]} rotation={[Math.PI / 2, 0, 0]} />
        </mesh>
      </Float>
    </group>
  )
}

// Camera behavior
function CameraRig({ isZoomedIn }) {
  const isMobile = useIsMobile()
  useFrame((state) => {
    const targetZ = isZoomedIn ? (isMobile ? 7.2 : 6.5) : (isMobile ? 8.0 : 7.5);
    const targetY = isZoomedIn ? (isMobile ? -0.1 : -0.2) : 0;

    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.05);
    state.camera.updateProjectionMatrix();
  })
  return null
}

const ICONS = [
  { id: 'about', Icon: User, label: 'ABOUT' },
  { id: 'contact', Icon: Mail, label: 'CONTACT' },
  { id: 'store', Icon: ShoppingCart, label: 'STORE' },
  { id: 'experience', Icon: Award, label: 'EXPERIENCE' },
  { id: 'projects', Icon: Monitor, label: 'PROJECTS' },
  { id: 'resume', Icon: ExternalLink, label: 'RESUME' },
]

function IconBox({ position, rotation, item, onClick }) {
  const [hovered, setHovered] = useState(false)
  const isMobile = useIsMobile()

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={(e) => { e.stopPropagation(); onClick(item.id); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      <RoundedBox args={[0.28, 0.28, 0.06]} radius={0.06}>
        <meshStandardMaterial color={(hovered || isMobile) ? "#444" : "#111"} roughness={0.2} metalness={0.8} />
      </RoundedBox>
      <Html position={[0, 0, 0.04]} transform zIndexRange={[10, 0]} distanceFactor={1.2} style={{ pointerEvents: 'none' }}>
        <div style={{ color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <item.Icon size={18} />
        </div>
      </Html>
      {(hovered || isMobile) && (
        <Html position={[0, -0.25, 0.04]} center zIndexRange={[100, 0]}>
          <div style={{ background: 'rgba(0,0,0,0.85)', color: 'white', padding: '3px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold', pointerEvents: 'none', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
            {item.label}
          </div>
        </Html>
      )}
    </group>
  )
}

function OrbitingIcons({ onIconClick }) {
  const groupRef = useRef()
  const rotationRef = useRef(0)
  const touchStartRef = useRef(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    const handleWheel = (e) => {
      rotationRef.current += e.deltaY * 0.005;
    }

    // Touch support for mobile
    const handleTouchStart = (e) => {
      touchStartRef.current = e.touches[0].clientX;
    }
    const handleTouchMove = (e) => {
      if (touchStartRef.current !== null) {
        const delta = e.touches[0].clientX - touchStartRef.current;
        rotationRef.current += delta * 0.008;
        touchStartRef.current = e.touches[0].clientX;
      }
    }
    const handleTouchEnd = () => {
      touchStartRef.current = null;
    }

    window.addEventListener('wheel', handleWheel);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    }
  }, []);

  useFrame((state, delta) => {
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, rotationRef.current, 0.1)
  })

  const radius = isMobile ? 1.2 : 1.3;

  return (
    <group>
      <group ref={groupRef}>
        {ICONS.map((item, index) => {
          const angle = (index / 6) * Math.PI * 2;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          return <IconBox key={item.id} position={[x, 0, z]} item={item} rotation={[0, -angle - Math.PI / 2, 0]} onClick={onIconClick} />
        })}
      </group>
    </group>
  )
}

function CentralCharacter({ isZoomedIn, onGemClick, onIconClick }) {
  const group = useRef()
  const mouse = useRef({ x: 0, y: 0 })
  const isMobile = useIsMobile()

  useFrame((state) => {
    // Disable parallax on mobile (no mouse hover)
    const targetX = (isZoomedIn || isMobile) ? 0 : (state.mouse.x * Math.PI) / 8;
    const targetY = (isZoomedIn || isMobile) ? 0 : (state.mouse.y * Math.PI) / 8;

    mouse.current.x = THREE.MathUtils.lerp(mouse.current.x, targetX, 0.1)
    mouse.current.y = THREE.MathUtils.lerp(mouse.current.y, targetY, 0.1)
    group.current.rotation.y = mouse.current.x
    group.current.rotation.x = -mouse.current.y
  })

  const phoneScale = isMobile ? 4.2 : 4.8
  const groupScale = isMobile ? 1.5 : 1.8

  return (
    <group ref={group} position={[0, -0.4, 0]} scale={groupScale}>
      {/* iPhone 17 Pro Max 3D Model */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <IphoneModel
          position={[0, 0, 0]}
          scale={phoneScale}
          onClick={(e) => {
            e.stopPropagation();
            onGemClick();
          }}
          onPointerOver={() => document.body.style.cursor = 'pointer'}
          onPointerOut={() => document.body.style.cursor = 'auto'}
        />

        {isZoomedIn && (
          <OrbitingIcons onIconClick={onIconClick} />
        )}
      </Float>

    </group>
  )
}

const PROJECTS_DATA = [
  {
    id: 'et-form',
    title: 'ET-Form UI',
    img: '/pic/et_form.jpg',
    shortDesc: 'A secure educational form and exam platform designed to help institutions create, manage, and proctor forms, surveys, and exams...',
    detailDesc: 'ET-Form UI is a secure educational platform designed to help institutions create, manage, and proctor forms, surveys, and exams. It uses a modern visual builder and incorporates advanced anti-cheating features along with real-time scoring. The robust client-side architecture leverages TypeScript and React for a seamless educational experience.',
    url: 'https://et-form-ui.vercel.app/'
  },
  {
    id: 'flamer-chef',
    title: 'Flamer Chef',
    img: '/pic/flamer_chef.jpg',
    shortDesc: 'A web application designed to help users search, organize, and prepare authentic Cambodian dishes...',
    detailDesc: 'Flamer Chef is a state-of-the-art web application dedicated to Cambodian cuisine. It helps users search, organize, and prepare authentic dishes using ingredients they already have in their kitchen. By utilizing a Smart Fridge Match Engine, it reduces food waste and brings traditional Cambodian recipes to a modern bilingual platform.',
    url: 'https://flamer-chef.vercel.app/'
  },
  {
    id: 'wit',
    title: 'WiT',
    img: '/pic/wit_wedding.jpg',
    shortDesc: 'A premium, minimalist wedding orchestration platform built with a high-end web 3D/interactive stack...',
    detailDesc: 'WiT is a premium, minimalist wedding orchestration platform designed to block planning noise and help you find your rhythm. Built with a high-end web 3D and interactive stack (React Three Fiber, GSAP), it provides an elegant dashboard for managing guest lists, schedules, and more.',
    url: 'https://wedivitetech.vercel.app/'
  }
];

function App() {
  const [isZoomedIn, setIsZoomedIn] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [showResume, setShowResume] = useState(false)
  const [showProjects, setShowProjects] = useState(false)
  const [expandedProject, setExpandedProject] = useState(null)
  const isMobile = useIsMobile()

  const handleGemClick = () => {
    setIsZoomedIn((prev) => !prev)
  }

  const handleBack = () => {
    setIsZoomedIn(false)
    setShowAbout(false)
    setShowResume(false)
    setShowProjects(false)
    setExpandedProject(null)
  }

  const handleIconClick = (id) => {
    if (id === 'about') setShowAbout(true)
    else if (id === 'contact') {
      const subject = encodeURIComponent("Project Inquiry - Let's Work Together!");
      const body = encodeURIComponent("Hi Phanna,\n\nI saw your portfolio and I'm interested in discussing a potential project with you.\n\n[Please provide a brief description of your project here...]\n\nLooking forward to connecting!\n\nBest regards,\n[Your Name/Company]");
      window.location.href = `mailto:tat38254@gmail.com?subject=${subject}&body=${body}`;
    }
    else if (id === 'resume') setShowResume(true)
    else if (id === 'projects') setShowProjects(true)
    else console.log("Clicked:", id) // Handle other actions if needed
  }

  // Suppress asynchronous Spline timeline notices (Missing property)
  useEffect(() => {
    const handleGlobalError = (event) => {
      const msg = event?.message || event?.error?.message || ''
      if (typeof msg === 'string' && msg.includes('Missing property')) {
        if (event.preventDefault) event.preventDefault()
        if (event.stopImmediatePropagation) event.stopImmediatePropagation()
        console.warn('Spline internal timeline notice gracefully handled.')
        return true
      }
    }
    window.addEventListener('error', handleGlobalError, true)
    return () => window.removeEventListener('error', handleGlobalError, true)
  }, [])

  // Remove Spline watermark
  useEffect(() => {
    const removeWatermark = () => {
      // Target the Spline logo/watermark elements
      document.querySelectorAll('a[href*="spline"]').forEach(el => el.remove())
      // Also search inside any shadow roots
      document.querySelectorAll('*').forEach(el => {
        if (el.shadowRoot) {
          el.shadowRoot.querySelectorAll('a[href*="spline"]').forEach(a => a.remove())
          el.shadowRoot.querySelectorAll('[class*="logo"], [class*="watermark"]').forEach(a => a.remove())
        }
      })
    }
    // Run periodically since Spline may inject it after load
    const interval = setInterval(removeWatermark, 500)
    setTimeout(() => clearInterval(interval), 10000) // Stop checking after 10s
    return () => clearInterval(interval)
  }, [])
  return (
    <>
      {/* Put Official Spline at the very absolute, furthest background */}
      <div
        className="spline-bg"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 2,
          pointerEvents: 'none',
          transition: 'opacity 0.5s',
          opacity: isZoomedIn ? 0 : 1,
          overflow: 'hidden',
        }}
      >
        <div style={{ width: '100%', height: 'calc(100% + 50px)' }}>
          <SplineErrorBoundary>
            <Spline
              scene="https://prod.spline.design/ifwJfSH-kdl2oh5D/scene.splinecode"
              onError={(err) => console.warn('Spline background scene notice:', err)}
            />
          </SplineErrorBoundary>
        </div>
      </div>

      {/* Cinematic background text — large, subtle, behind everything */}
      <div
        className={`center-text ${isZoomedIn ? 'blurred' : ''}`}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0',
          opacity: 0.12,
          userSelect: 'none',
        }}
      >
        <span style={{
          fontFamily: "'Abril Fatface', serif",
          fontSize: '20vw',
          color: 'white',
          lineHeight: 0.85,
          letterSpacing: '0.05em',
          textShadow: '0 0 80px rgba(100, 60, 255, 0.3)',
        }}>
          PHAL
        </span>
        <span style={{
          fontFamily: "'Abril Fatface', serif",
          fontSize: '24vw',
          color: 'white',
          lineHeight: 0.85,
          letterSpacing: '-0.02em',
          textShadow: '0 0 80px rgba(100, 60, 255, 0.3)',
        }}>
          PHANNA
        </span>
      </div>

      {/* Wavy text moved to 3D Text component in CentralCharacter */}

      {/* 3D Canvas Context (Foreground) */}
      <div className="canvas-container">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />

          <CameraRig isZoomedIn={isZoomedIn} />

          <Stars />
          <TopLeftMask />

          <Suspense fallback={null}>
            <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
              <CentralCharacter
                isZoomedIn={isZoomedIn}
                onGemClick={handleGemClick}
                onIconClick={handleIconClick}
              />
            </Float>
          </Suspense>

          <Environment preset="city" />
          <ContactShadows position={[0, -4.5, 0]} opacity={0.5} scale={20} blur={2} far={4.5} />
        </Canvas>
      </div>

      {/* UI Elements */}
      <div className="ui-container">
        <div className="top-bar">
          {/* Top bar uses 3D elements in canvas, so left empty for alignment */}
          <div /> <div />
        </div>
        {showAbout && (
          <div className="about-overlay">
            <h2>ABOUT</h2>
            <div className="about-content">
              <div className="about-image-container">
                <img src="/pic/phanna_handsome.png" alt="Phal Phanna" className="about-profile-pic" />
              </div>
              <div className="about-text-container">
                <p>Hi, I’m Phanna, an IT-Engineering student who enjoys building different kinds of technology projects. I’m interested in web development, software development, and UI/UX design.</p>
                <p>I like experimenting with technologies such as Next.js, databases, backend systems, and interface design with Figma. I enjoy creating projects to explore new ideas and improve my development skills.</p>
                <p>I’m always learning, building, and improving to become a skilled developer who creates useful digital products.</p>
              </div>
            </div>
            <button className="close-btn" onClick={() => setShowAbout(false)}>CLOSE</button>
          </div>
        )}

        {showResume && (
          <div className="resume-overlay">
            <div className="resume-header">
              <h2>PHAL PHANNA</h2>
              <h3>Y-2 ITE-Student</h3>
              <div className="resume-contact">
                <span>+855884557187</span>
                <span>+855965345304</span>
                <span>Tat38254@gmail.com</span>
                <span>Phnom Penh</span>
              </div>
            </div>
            
            <div className="resume-section">
              <h4>ABOUT ME</h4>
              <p style={{color: '#ddd', lineHeight: '1.6'}}>Ambitious and highly adaptable Year 2 IT-Engineering student with a deep fascination for technological development and a natural aptitude for leadership. Combines a solid technical foundation with creative problem-solving skills and a strong commitment to community impact through volunteering. Eager to leverage a diverse skill set—spanning tech journalism, UI/UX design, and IT engineering—to drive sustainable, impactful solutions.</p>
            </div>

            <div className="resume-section">
              <h4>EDUCATION</h4>
              <div className="resume-item">
                <div className="resume-item-title">Royal University of Phnom Penh (RUPP)</div>
                <div className="resume-item-subtitle">Bachelor of Science in IT-Engineering | 2024 – Present (Currently Year 2)</div>
              </div>
              <div className="resume-item">
                <div className="resume-item-title">Bunrany Hunsen Memot High School</div>
                <div className="resume-item-subtitle">High School Diploma (Grade: B) | Graduated: 2024</div>
              </div>
            </div>

            <div className="resume-section">
              <h4>EXPERIENCE</h4>
              <div className="resume-item">
                <div className="resume-item-title">Hackathon Competitor</div>
                <div className="resume-item-subtitle">AI Hackathon by First Wave | July 2026</div>
                <ul className="resume-list">
                  <li>Conceptualized and deployed a frictionless multimodal AI copilot designed to visually analyze stagnant business inventory and instantly generate optimized marketing strategies.</li>
                  <li>Utilized rapid development workflows, leveraging the Gemini 2.5 Flash API and Streamlit to build a functional end-to-end prototype under a strict weekend deadline.</li>
                </ul>
              </div>
              <div className="resume-item">
                <div className="resume-item-title">Volunteer Data Entry Assistant</div>
                <div className="resume-item-subtitle">MoEYS EdTech App | 2025</div>
                <ul className="resume-list">
                  <li>Inputted, managed, and organized educational data within the official Ministry of Education, Youth and Sport (MoEYS) EdTech application.</li>
                  <li>Played a hands-on role in ensuring the accuracy and digital accessibility of learning resources for Cambodian students.</li>
                </ul>
              </div>
            </div>

            <div className="resume-section">
              <h4>SKILLS</h4>
              <ul className="resume-list">
                <li><strong>Innovation:</strong> Design Thinking, Product Ideation, Creative Problem Solving, Rapid Prototyping.</li>
                <li><strong>Technical Skills:</strong> IT-Engineering Fundamentals, UI/UX Design, Visual Hierarchy, AI using, C/C++, Java, Python, GitHub.</li>
                <li><strong>Communication:</strong> Technical Writing, Active Listener, Dedicated to continuous improvement.</li>
                <li><strong>Soft Skills:</strong> Natural Leadership, High Adaptability, Patience, Focus, Goal-Oriented.</li>
              </ul>
            </div>

            <div className="resume-actions">
              <a href="/PhannaCV.pdf" target="_blank" rel="noopener noreferrer" className="download-btn">📄 DOWNLOAD PDF</a>
              <button className="close-btn" onClick={() => setShowResume(false)}>CLOSE</button>
            </div>
          </div>
        )}

        {showProjects && (
          <div className="projects-overlay">
            <h2>MY PROJECTS</h2>
            
            {expandedProject ? (
              <div className="expanded-project-view">
                <img src={expandedProject.img} alt={expandedProject.title} className="expanded-project-image" />
                <div className="expanded-project-content">
                  <h3>{expandedProject.title}</h3>
                  <p>{expandedProject.detailDesc}</p>
                  <div className="expanded-project-actions">
                    <button className="back-btn" onClick={() => setExpandedProject(null)}>← BACK TO PROJECTS</button>
                    <a href={expandedProject.url} target="_blank" rel="noopener noreferrer" className="project-link large-link">VISIT WEBSITE</a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="projects-grid">
                {PROJECTS_DATA.map(proj => (
                  <div key={proj.id} className="project-card" onClick={() => setExpandedProject(proj)}>
                    <img src={proj.img} alt={proj.title} className="project-image" />
                    <h3>{proj.title}</h3>
                    <p>{proj.shortDesc}</p>
                    <span className="read-more-btn">Read More →</span>
                  </div>
                ))}
              </div>
            )}

            {!expandedProject && (
              <div className="resume-actions">
                <button className="close-btn" onClick={() => setShowProjects(false)}>CLOSE</button>
              </div>
            )}
          </div>
        )}

        {isZoomedIn && !showAbout && !showResume && !showProjects && (
          <button className="back-button" onClick={handleBack}>↩ BACK</button>
        )}

        <div className="bottom-bar">
          <div>winjiang.art</div>
          <div>all rights reserved ®</div>
        </div>
      </div>
    </>
  )
}

export default App
