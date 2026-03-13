import { useState, useRef, useMemo, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { Float, Environment, ContactShadows, Points, PointMaterial, useGLTF, Html, RoundedBox } from '@react-three/drei'
import { User, Mail, ShoppingCart, Award, Monitor, ExternalLink } from 'lucide-react'
import * as THREE from 'three'
import SplineLoader from '@splinetool/loader'
import './index.css'

function SplineRobotModel() {
  const obj = useLoader(SplineLoader, 'https://prod.spline.design/ifwJfSH-kdl2oh5D/scene.splinecode');
  const clonedScene = useMemo(() => {
    const clone = obj.clone();
    
    // Clean up unnecessary things like lights/cameras from Spline
    // Spline usually adds a directional light and ambient light.
    const toRemove = [];
    clone.traverse((child) => {
      if (child.isCamera || child.isLight) {
        toRemove.push(child);
      }
    });
    toRemove.forEach(c => c.removeFromParent());
    
    return clone;
  }, [obj]);

  return <primitive object={clonedScene} position={[0, -1, 0]} scale={1} />;
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
    >
      <mesh material={material} position={[0, 0.4, 0]}>
        <capsuleGeometry args={[0.2, 1, 4, 16]} rotation={[0,0,Math.PI/2]}/>
      </mesh>
      <mesh material={material} position={[0, 0, 0]}>
        <capsuleGeometry args={[0.2, 1, 4, 16]} rotation={[0,0,Math.PI/2]}/>
      </mesh>
      <mesh material={material} position={[0, -0.4, 0]}>
        <capsuleGeometry args={[0.2, 1, 4, 16]} rotation={[0,0,Math.PI/2]}/>
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
    <group ref={group} position={[-5, 3.5, -4]} scale={0.5}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh material={whiteMat}>
          <sphereGeometry args={[1, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
        </mesh>
        {/* Simple sunglasses representation */}
        <mesh material={blackMat} position={[-0.4, 0.2, 0.8]} rotation={[0.1, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} rotation={[Math.PI/2,0,0]}/>
        </mesh>
        <mesh material={blackMat} position={[0.4, 0.2, 0.8]} rotation={[0.1, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} rotation={[Math.PI/2,0,0]}/>
        </mesh>
        <mesh material={blackMat} position={[0, 0.25, 0.8]}>
          <boxGeometry args={[0.8, 0.1, 0.1]} />
        </mesh>
        {/* Smile cut */}
        <mesh material={blackMat} position={[0, -0.4, 0.85]}>
          <cylinderGeometry args={[0.4, 0.4, 0.1, 16, 1, false, 0, Math.PI]} rotation={[Math.PI/2,0,0]}/>
        </mesh>
      </Float>
    </group>
  )
}

// Camera behavior
function CameraRig({ isZoomedIn }) {
  useFrame((state) => {
    const targetZ = isZoomedIn ? 8.5 : 10;
    const targetY = isZoomedIn ? -2.0 : 0;
    
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
  
  return (
    <group 
      position={position} 
      rotation={rotation}
      onClick={(e) => { e.stopPropagation(); onClick(item.id); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor='pointer'; }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor='auto'; }}
    >
      <RoundedBox args={[0.5, 0.5, 0.1]} radius={0.1}>
        <meshStandardMaterial color={hovered ? "#333" : "#111"} roughness={0.2} metalness={0.8} />
      </RoundedBox>
      <Html position={[0, 0, 0.06]} transform zIndexRange={[10, 0]} distanceFactor={1.5} style={{ pointerEvents: 'none' }}>
        <div style={{ color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <item.Icon size={32} />
        </div>
      </Html>
      {hovered && (
        <Html position={[0, -0.4, 0.05]} center zIndexRange={[100, 0]}>
          <div style={{ background: 'rgba(0,0,0,0.8)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', pointerEvents: 'none', letterSpacing: '1px' }}>
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

  useEffect(() => {
    const handleWheel = (e) => {
      // Update rotation based on scroll amount
      rotationRef.current += e.deltaY * 0.005;
    }

    window.addEventListener('wheel', handleWheel);

    return () => {
      window.removeEventListener('wheel', handleWheel);
    }
  }, []);

  useFrame((state, delta) => {
    // Smoothly interpolate to the target rotation
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, rotationRef.current, 0.1)
  })

  const radius = 1.6;

  return (
    <group>
      <group ref={groupRef}>
         {ICONS.map((item, index) => {
           const angle = (index / 6) * Math.PI * 2;
           const x = Math.cos(angle) * radius;
           const z = Math.sin(angle) * radius;
           return <IconBox key={item.id} position={[x, 0, z]} item={item} rotation={[0, -angle - Math.PI/2, 0]} onClick={onIconClick} />
         })}
      </group>
    </group>
  )
}

// 3D character in the center
function CentralCharacter({ isZoomedIn, onGemClick, onIconClick }) {
  const group = useRef()
  const mouse = useRef({ x: 0, y: 0 })

  useFrame((state) => {
    const targetX = isZoomedIn ? 0 : (state.mouse.x * Math.PI) / 8;
    const targetY = isZoomedIn ? 0 : (state.mouse.y * Math.PI) / 8;
    
    mouse.current.x = THREE.MathUtils.lerp(mouse.current.x, targetX, 0.1)
    mouse.current.y = THREE.MathUtils.lerp(mouse.current.y, targetY, 0.1)
    group.current.rotation.y = mouse.current.x
    group.current.rotation.x = -mouse.current.y
  })

  const blackBody = new THREE.MeshPhysicalMaterial({ color: '#111', roughness: 0.2, metalness: 0.8, clearcoat: 0.5 })
  const whiteMat = new THREE.MeshStandardMaterial({ color: '#fff', roughness: 0.5 })
  const glassMat = new THREE.MeshPhysicalMaterial({ color: '#000', metalness: 0.9, roughness: 0.1, transmission: 0.5, thickness: 0.5 })
  const gemMat = new THREE.MeshPhysicalMaterial({ color: '#ff1111', roughness: 0, metalness: 0.1, transmission: 0.9, thickness: 1, clearcoat: 1 })

  return (
    <group ref={group} position={[0, -1, 0]} scale={2}>
      {!isZoomedIn && (
        <group>
          <Suspense fallback={null}>
            <SplineRobotModel />
          </Suspense>
        </group>
      )}

      {/* Large Red Gem */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh 
          material={gemMat} 
          position={[0, -0.5, 0.8]} 
          scale={1.2}
          onClick={(e) => {
            e.stopPropagation();
            onGemClick();
          }}
          onPointerOver={() => document.body.style.cursor = 'pointer'}
          onPointerOut={() => document.body.style.cursor = 'auto'}
        >
          <octahedronGeometry args={[0.6, 0]} />
        </mesh>
        
        {isZoomedIn && (
          <OrbitingIcons onIconClick={onIconClick} />
        )}
      </Float>

    </group>
  )
}

function App() {
  const [isZoomedIn, setIsZoomedIn] = useState(false)
  const [showAbout, setShowAbout] = useState(false)

  const handleGemClick = () => {
    setIsZoomedIn(true)
  }

  const handleBack = () => {
    setIsZoomedIn(false)
    setShowAbout(false)
  }

  const handleIconClick = (id) => {
    if (id === 'about') setShowAbout(true)
    else if (id === 'contact') window.location.href = 'mailto:hello@phalphanna.com'
    else console.log("Clicked:", id) // Handle other actions if needed
  }

  return (
    <>
      {/* Wavy Background Text */}
      <div className={`center-text ${isZoomedIn ? 'blurred' : ''}`}>
        <span 
          style={{ 
            display: 'block', 
            transform: 'perspective(500px) rotateY(-5deg) skew(-10deg)', 
            marginBottom: '-0.2em' 
          }}
        >
          PHAL
        </span>
        <span 
          style={{ 
            display: 'block', 
            transform: 'perspective(500px) rotateY(10deg) skew(5deg)' 
          }}
        >
          PHANNA
        </span>
      </div>

      {/* 3D Canvas Context */}
      <div className="canvas-container">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <CameraRig isZoomedIn={isZoomedIn} />
          
          <Stars />
          <HamburgerMenu />
          <TopLeftMask />
          
          <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
             <CentralCharacter 
               isZoomedIn={isZoomedIn} 
               onGemClick={handleGemClick} 
               onIconClick={handleIconClick} 
             />
          </Float>

          <Environment preset="city" />
          <ContactShadows position={[0, -4.5, 0]} opacity={0.5} scale={20} blur={2} far={4.5} />
        </Canvas>
      </div>

      {/* UI Elements */}
      <div className="ui-container">
        <div className="top-bar">
           {/* Top bar uses 3D elements in canvas, so left empty for alignment */}
           <div/> <div/>
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

        {isZoomedIn && !showAbout && (
          <button className="back-button" onClick={handleBack}>↩ BACK</button>
        )}

        <div className="bottom-bar">
          <div>ALANNN.ART</div>
          <div>ALL RIGHTS RESERVED®</div>
        </div>
      </div>
    </>
  )
}

export default App
