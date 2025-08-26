import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import "./App.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons/faCopy";
import { faGithubSquare } from "@fortawesome/free-brands-svg-icons/faGithubSquare";
import { faLinkedin } from "@fortawesome/free-brands-svg-icons/faLinkedin";
import toast, { Toaster } from "react-hot-toast";

const ShaderPlane = () => {
  const meshRef = useRef<THREE.Mesh>(null!);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
    }),
    []
  );

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.2);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform vec2 uResolution;
    varying vec2 vUv;

    float sdCircle(vec2 p, float r) {
      return length(p) - r;
    }

    mat2 rot(float a) {
      float c = cos(a);
      float s = sin(a);
      return mat2(c, -s, s, c);
    }

    void main() {
      vec2 uv = (vUv - 0.5) * 2.0;
      float time = uTime * 0.3;
      
      vec3 col = vec3(0.0);
      vec3 background = vec3(0.08, 0.12, 0.18); // Dark blue-gray base
      
      // Create multiple layers of animated shapes
      for(float i = 0.0; i < 3.0; i++) {
        // Rotate and scale each layer differently
        vec2 p = uv * rot(time * 0.1 * (i + 1.0));
        p *= 1.0 + i * 0.3;
        
        // Create wave distortion
        p.x += sin(p.y * 3.0 + time * (1.0 + i * 0.5)) * 0.3;
        p.y += cos(p.x * 2.0 + time * (1.2 + i * 0.3)) * 0.2;
        
        // Repeat the space
        p = fract(p * 1.5) - 0.5;
        
        // Create distance field
        float d = sdCircle(p, 0.2 - i * 0.05);
        d = abs(sin(d * 8.0 + time * 2.0)) / 8.0;
        d = smoothstep(0.0, 0.1, d);
        d = 1.0 - d;
        
        // Color based on layer
        vec3 layerColor = vec3(0.0);
        if(i == 0.0) layerColor = vec3(0.15, 0.25, 0.4);   // Blue
        if(i == 1.0) layerColor = vec3(0.25, 0.15, 0.35);  // Purple
        if(i == 2.0) layerColor = vec3(0.2, 0.3, 0.25);    // Teal
        
        col += layerColor * d * (0.6 - i * 0.1);
      }
      
      // Add some noise for texture
      float noise = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
      background += noise * 0.02;
      
      // Combine with background
      col = mix(background, background + col, 0.8);
      
      // Add subtle vignette
      float vignette = 1.0 - length(uv * 0.5);
      col *= 0.7 + 0.3 * vignette;
      
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  useFrame((state) => {
    if (meshRef.current) {
      // @ts-ignore
      meshRef.current.material.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} scale={[2, 2, 1]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

export default function App() {
  const handleCopyEmail = async () => {
    const email = "nicolaspavlotsky@gmail.com";

    const fallbackCopy = (text: string) => {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        toast.success("Email copied to clipboard");
      } catch (err) {
        toast.error("Failed to copy email");
        console.error(err);
      }
      document.body.removeChild(textarea);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(email);
        toast.success("Email copied to clipboard");
      } catch (err) {
        fallbackCopy(email);
      }
    } else {
      fallbackCopy(email);
    }
  };

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="overlay" role="banner">
        <main id="main-content" className="wrapper" tabIndex={-1}>
          <h1>Hi, I'm Nico!</h1>

          <p>
            I'm a self-taught front-end developer with over 10 years of
            experience. I have worked on several projects, including my own
            clients. I'm passionate about coding and always looking for new
            challenges.
          </p>

          <p>
            If you're a recruiter or a company seeking a front-end developer,
            feel free to contact me at{" "}
            <strong>nicolaspavlotsky@gmail.com</strong>{" "}
            <button
              onClick={handleCopyEmail}
              aria-label="Copy email address to clipboard"
              title="Copy email address to clipboard"
              type="button"
            >
              <FontAwesomeIcon icon={faCopy} aria-hidden="true" />
            </button>
            .
          </p>

          <nav className="social-links" aria-label="Social media links">
            <a
              href="https://www.linkedin.com/in/nicolas-pavlotsky/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Nicolas Pavlotsky's LinkedIn profile (opens in new tab)"
            >
              <FontAwesomeIcon icon={faLinkedin} aria-hidden="true" />
              <span className="sr-only">LinkedIn</span>
            </a>

            <a
              href="https://github.com/nicolaspavlotsky"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Nicolas Pavlotsky's GitHub profile (opens in new tab)"
            >
              <FontAwesomeIcon icon={faGithubSquare} aria-hidden="true" />
              <span className="sr-only">GitHub</span>
            </a>
          </nav>
        </main>
      </div>
      <Toaster />
      <div
        style={{ width: "100vw", height: "100vh", margin: 0, padding: 0 }}
        aria-hidden="true"
        role="presentation"
      >
        <Canvas
          camera={{ position: [0, 0, 1], fov: 75 }}
          style={{ width: "100%", height: "100%" }}
        >
          <ShaderPlane />
        </Canvas>
      </div>
    </>
  );
}
