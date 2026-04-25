'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

interface VisualDNAProps {
    data: number[][];
}

export function VisualDNA({ data }: VisualDNAProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const width = containerRef.current.clientWidth || 400;
        const height = 350;

        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x050505);
        sceneRef.current = scene;

        // Camera
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(40, 40, 60);

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        rendererRef.current = renderer;

        // Container
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(renderer.domElement);

        // Lights
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambient);
        const dir = new THREE.DirectionalLight(0xffffff, 0.8);
        dir.position.set(50, 50, 50);
        scene.add(dir);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.09;

        // Grid data
        const rows = data.length || 10;
        const cols = data[0]?.length || rows;
        const spacing = 1.2;
        const group = new THREE.Group();

        // Create boxes for each cell
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const v = data[y]?.[x] ?? 0;
                const heightScale = Math.max(0.1, v * 6);

                const geometry = new THREE.BoxGeometry(1, heightScale, 1);
                const hue = Math.floor(200 - v * 160);
                const color = new THREE.Color(`hsl(${hue}, 80%, ${40 + v * 30}%)`);
                const material = new THREE.MeshStandardMaterial({ color, metalness: 0.25, roughness: 0.5 });

                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.x = (x - cols / 2) * spacing;
                mesh.position.z = (y - rows / 2) * spacing;
                mesh.position.y = heightScale / 2 - 0.5;

                group.add(mesh);
            }
        }

        scene.add(group);

        // Floor plane for grounding
        const planeGeo = new THREE.PlaneGeometry(cols * spacing + 10, rows * spacing + 10);
        const planeMat = new THREE.MeshStandardMaterial({ color: 0x0b0b0b, roughness: 1, metalness: 0 });
        const plane = new THREE.Mesh(planeGeo, planeMat);
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -0.6;
        scene.add(plane);

        // Animation
        const clock = new THREE.Clock();
        const animate = () => {
            animationRef.current = requestAnimationFrame(animate);
            const t = clock.getElapsedTime();
            group.rotation.y = t * 0.12;
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Handle resize
        const onResize = () => {
            const w = containerRef.current?.clientWidth || 400;
            renderer.setSize(w, height);
            camera.aspect = w / height;
            camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', onResize);

        // Cleanup
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            window.removeEventListener('resize', onResize);
            controls.dispose();
            renderer.dispose();
            scene.clear();
            if (containerRef.current) containerRef.current.innerHTML = '';
        };
    }, [data]);

    return (
        <div className="flex flex-col items-center">
            <div ref={containerRef} className="w-full rounded-lg overflow-hidden" style={{ width: '100%', maxWidth: 400, height: 350 }} />
            <p className="text-xs text-gray-400 mt-2">3D Structural Fingerprint (interactive)</p>
        </div>
    );
}
