import { useEffect, useRef, useState } from 'react';

interface Props {
  areaM2?: string | number | null;
}

/** Visualización 3D referencial: una casa genérica a escala dentro del terreno. No representa una construcción real. */
export function LotMassingViewer({ areaM2 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let renderer: any;
    let frameId: number;
    let controls: any;
    let ro: ResizeObserver | undefined;

    (async () => {
      try {
        const THREE = await import('three');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
        if (cancelled || !containerRef.current) return;

        const el = containerRef.current;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Escala del solar: lado del cuadrado a partir del área (clamp para solares atípicos)
        const area = Math.max(80, Math.min(2500, Number(areaM2) || 350));
        const plotSide = Math.sqrt(area);
        const houseW = plotSide * 0.4;
        const houseD = plotSide * 0.35;
        const houseH = plotSide * 0.16 + 2.2;

        const scene = new THREE.Scene();
        scene.background = null;

        const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 500);
        camera.position.set(plotSide * 0.85, plotSide * 0.62, plotSide * 0.95);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        el.appendChild(renderer.domElement);

        // Luces
        scene.add(new THREE.HemisphereLight(0xdfeee0, 0x5a4632, 1.05));
        const sun = new THREE.DirectionalLight(0xfff2df, 1.1);
        sun.position.set(plotSide * 0.6, plotSide * 0.9, plotSide * 0.4);
        scene.add(sun);

        // Solar
        const plot = new THREE.Mesh(
          new THREE.PlaneGeometry(plotSide, plotSide),
          new THREE.MeshStandardMaterial({ color: 0xcfe0c4, roughness: 1 })
        );
        plot.rotation.x = -Math.PI / 2;
        scene.add(plot);

        const grid = new THREE.GridHelper(plotSide, 8, 0x8fae7c, 0xb9cdae);
        (grid.material as any).opacity = 0.5;
        (grid.material as any).transparent = true;
        scene.add(grid);

        // Casa genérica
        const house = new THREE.Group();
        const walls = new THREE.Mesh(
          new THREE.BoxGeometry(houseW, houseH, houseD),
          new THREE.MeshStandardMaterial({ color: 0xf3ead9, roughness: 0.85 })
        );
        walls.position.y = houseH / 2;
        house.add(walls);

        const roof = new THREE.Mesh(
          new THREE.ConeGeometry(Math.max(houseW, houseD) * 0.78, houseH * 0.55, 4),
          new THREE.MeshStandardMaterial({ color: 0xa8503a, roughness: 0.7 })
        );
        roof.rotation.y = Math.PI / 4;
        roof.position.y = houseH + (houseH * 0.55) / 2 - 0.05;
        house.add(roof);

        const door = new THREE.Mesh(
          new THREE.PlaneGeometry(houseW * 0.16, houseH * 0.55),
          new THREE.MeshStandardMaterial({ color: 0x3d2b1f })
        );
        door.position.set(0, (houseH * 0.55) / 2, houseD / 2 + 0.02);
        house.add(door);

        [-1, 1].forEach(side => {
          const win = new THREE.Mesh(
            new THREE.PlaneGeometry(houseW * 0.14, houseH * 0.22),
            new THREE.MeshStandardMaterial({ color: 0x9cc4d4 })
          );
          win.position.set(side * houseW * 0.28, houseH * 0.62, houseD / 2 + 0.02);
          house.add(win);
        });

        house.position.set(-plotSide * 0.05, 0, plotSide * 0.03);
        scene.add(house);

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.minDistance = plotSide * 0.5;
        controls.maxDistance = plotSide * 2.2;
        controls.maxPolarAngle = Math.PI * 0.49;
        controls.target.set(0, houseH * 0.3, 0);
        controls.autoRotate = !reducedMotion;
        controls.autoRotateSpeed = 0.6;
        controls.addEventListener('start', () => { controls.autoRotate = false; });

        const resize = () => {
          const w = el.clientWidth, h = el.clientHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };
        resize();
        ro = new ResizeObserver(resize);
        ro.observe(el);

        const tick = () => {
          controls.update();
          renderer.render(scene, camera);
          frameId = requestAnimationFrame(tick);
        };
        tick();
        setReady(true);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      if (frameId) cancelAnimationFrame(frameId);
      controls?.dispose?.();
      ro?.disconnect();
      if (renderer) {
        renderer.dispose();
        renderer.domElement?.remove();
      }
    };
  }, [areaM2]);

  if (failed) return null;

  return (
    <div>
      <div
        ref={containerRef}
        role="img"
        aria-label="Visualización 3D referencial de una casa a escala dentro del terreno"
        style={{
          height: 320, borderRadius: 14, overflow: 'hidden',
          border: '1px solid var(--pub-border2)',
          background: 'linear-gradient(180deg, #EAF1E4 0%, #DCE7D3 100%)',
          cursor: 'grab',
        }}
      />
      <div style={{ fontSize: 12, color: 'var(--pub-dim)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
        {ready ? 'Arrastrá para girar — modelo referencial, no representa una construcción real.' : 'Cargando visualización 3D…'}
      </div>
    </div>
  );
}
