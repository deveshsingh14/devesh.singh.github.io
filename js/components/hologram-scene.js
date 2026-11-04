// Three.js scene for the hero hologram (loaded on demand by hero-hologram.js).
// The logo is traced from assets/logo.png (1254px square) and extruded; the left
// half is drawn once and mirrored. Colours follow the site's data-theme attribute.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const COLORS = {
    dark: { a: '#d8340c', b: '#ff8a4c', holo: '#ff5731', ember: '#ffb070' },
    light: { a: '#e04812', b: '#ff8a52', holo: '#c2410c', ember: '#d9541e' },
};
const THEMES = {
    dark: { blend: THREE.AdditiveBlending, gain: 1.25, glow: 0.35, emissive: 0.28, under: 4, disc: 0.55 },
    light: { blend: THREE.NormalBlending, gain: 1.6, glow: 0.16, emissive: 0.0, under: 1.5, disc: 0.3 },
};

const W = 1254, CX = 627, CY = 625, K = 260;
const LEFT_HALF = [
    [['M', 110, 400], ['L', 370, 400], ['Q', 470, 400, 520, 500], ['Q', 600, 680, 627, 850], ['L', 405, 465], ['Q', 390, 443, 360, 443], ['L', 160, 443], ['Q', 125, 440, 110, 400]],
    [['M', 110, 605], ['L', 452, 605], ['Q', 462, 606, 468, 615], ['L', 480, 645], ['L', 160, 645], ['Q', 125, 642, 110, 605]],
    [['M', 110, 810], ['L', 560, 810], ['Q', 590, 812, 622, 850], ['L', 160, 850], ['Q', 125, 847, 110, 810]],
];
const BASE_Y = -1.55;
const CONE_H = 3.0;
const EMBERS = 200;
const INTRO_SECONDS = 1.9;

const point = (x, y, mirrored) => [((mirrored ? W - x : x) - CX) / K, (CY - y) / K];

function buildShape(cmds, mirrored) {
    const shape = new THREE.Shape();
    for (const [op, ...a] of cmds) {
        if (op === 'M') shape.moveTo(...point(a[0], a[1], mirrored));
        else if (op === 'L') shape.lineTo(...point(a[0], a[1], mirrored));
        else shape.quadraticCurveTo(...point(a[0], a[1], mirrored), ...point(a[2], a[3], mirrored));
    }
    return shape;
}

function glowTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(255,255,255,1)');
    r.addColorStop(0.35, 'rgba(255,255,255,.35)');
    r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
}

export function createHologram(mount) {
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hero = mount.closest('#hero') || mount;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.localClippingEnabled = true;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    mount.prepend(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    // Logo body: extruded shapes with a left-to-right colour gradient in vertex colours.
    const shapes = [...LEFT_HALF.map((c) => buildShape(c, false)), ...LEFT_HALF.map((c) => buildShape(c, true))];
    const geo = new THREE.ExtrudeGeometry(shapes, { depth: 0.16, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.018, bevelSegments: 4, curveSegments: 28 });
    geo.translate(0, 0, -0.08);
    geo.computeVertexNormals();
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(geo.attributes.position.count * 3), 3));

    const logo = new THREE.Group();
    scene.add(logo);
    const printPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 10);
    const bodyMat = new THREE.MeshPhysicalMaterial({
        vertexColors: true, metalness: 0.4, roughness: 0.26, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 0.6,
        emissive: new THREE.Color('#3a0d00'), emissiveIntensity: 0.28, clippingPlanes: [printPlane],
    });
    logo.add(new THREE.Mesh(geo, bodyMat));

    // Hologram shell: edge glow, scanlines, scan sweep and a glitch offset.
    const shellGeo = geo.clone();
    shellGeo.scale(1.012, 1.03, 1.25);
    const shellMat = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false,
        uniforms: { uColor: { value: new THREE.Color() }, uTime: { value: 0 }, uSweepY: { value: 0 }, uGlitch: { value: 0 }, uGain: { value: 1 }, uBoost: { value: 0 } },
        vertexShader: `
            uniform float uTime; uniform float uGlitch;
            varying vec3 vN; varying vec3 vV; varying vec3 vW;
            void main() {
                vec3 p = position;
                float band = floor(p.y * 14.0);
                float r = fract(sin(band * 43.13 + floor(uTime * 24.0)) * 43758.5453);
                p.x += uGlitch * (r - 0.5) * 0.22;
                vec4 w = modelMatrix * vec4(p, 1.0);
                vW = w.xyz;
                vN = normalize(mat3(modelMatrix) * normal);
                vV = normalize(cameraPosition - w.xyz);
                gl_Position = projectionMatrix * viewMatrix * w;
            }`,
        fragmentShader: `
            uniform vec3 uColor; uniform float uTime; uniform float uSweepY; uniform float uGain; uniform float uBoost;
            varying vec3 vN; varying vec3 vV; varying vec3 vW;
            void main() {
                float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2);
                float lines = 0.5 + 0.5 * sin(vW.y * 90.0 - uTime * 6.0);
                float sweep = exp(-pow((vW.y - uSweepY) * 5.0, 2.0));
                float a = f * (0.7 + uBoost) + lines * 0.1 + sweep * 0.45 + uBoost * 0.15;
                gl_FragColor = vec4(uColor, clamp(a * uGain, 0.0, 1.0));
            }`,
    });
    logo.add(new THREE.Mesh(shellGeo, shellMat));

    // Projector: emitter rings, glow disc, tap pulse ring and light cone.
    const glowTex = glowTexture();
    const emitter = new THREE.Group();
    emitter.position.y = BASE_Y;
    scene.add(emitter);
    const ringMat = new THREE.MeshBasicMaterial();
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.014, 12, 160), ringMat);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.006, 8, 160), ringMat);
    ring1.rotation.x = ring2.rotation.x = Math.PI / 2;
    emitter.add(ring1, ring2);

    const discMat = new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false });
    const disc = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4), discMat);
    disc.rotation.x = -Math.PI / 2;
    emitter.add(disc);

    const pulseMat = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, opacity: 0, side: THREE.DoubleSide });
    const pulse = new THREE.Mesh(new THREE.RingGeometry(0.97, 1, 160), pulseMat);
    pulse.rotation.x = -Math.PI / 2;
    pulse.position.y = 0.01;
    emitter.add(pulse);

    const coneMat = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, side: THREE.DoubleSide,
        uniforms: { uColor: { value: new THREE.Color() }, uTime: { value: 0 }, uGain: { value: 1 } },
        vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: `
            uniform vec3 uColor; uniform float uTime; uniform float uGain; varying vec2 vUv;
            void main() {
                float fade = pow(1.0 - vUv.y, 1.8);
                float streak = 0.65 + 0.35 * sin(vUv.x * 6.2831 * 24.0 + uTime * 0.8);
                float flick = 0.93 + 0.07 * sin(uTime * 13.0);
                float a = fade * streak * flick * 0.14;
                gl_FragColor = vec4(uColor, clamp(a * uGain, 0.0, 1.0));
            }`,
    });
    const cone = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 1.35, CONE_H, 96, 1, true), coneMat);
    cone.position.y = BASE_Y + CONE_H / 2;
    scene.add(cone);

    // Soft halo behind the logo (stands in for bloom, which would break the transparent canvas).
    const haloMat = new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false });
    const halo = new THREE.Sprite(haloMat);
    halo.scale.set(6.5, 3.2, 1);
    halo.position.set(0, -0.1, -0.6);
    scene.add(halo);

    // Embers rising through the cone.
    const emberPos = new Float32Array(EMBERS * 3);
    const emberSpeed = new Float32Array(EMBERS);
    const emberPhase = new Float32Array(EMBERS);
    const seedEmber = (i, anyHeight) => {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.sqrt(Math.random()) * 1.3;
        emberPos[i * 3] = Math.cos(angle) * radius;
        emberPos[i * 3 + 1] = BASE_Y + (anyHeight ? Math.random() * CONE_H : 0);
        emberPos[i * 3 + 2] = Math.sin(angle) * radius;
        emberSpeed[i] = 0.18 + Math.random() * 0.4;
        emberPhase[i] = Math.random() * 6.28;
    };
    for (let i = 0; i < EMBERS; i++) seedEmber(i, true);
    const emberGeo = new THREE.BufferGeometry();
    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));
    const emberMat = new THREE.PointsMaterial({ size: 0.04, map: glowTex, transparent: true, depthWrite: false, opacity: 0.85 });
    scene.add(new THREE.Points(emberGeo, emberMat));

    const under = new THREE.PointLight('#ff5731', 4, 6);
    under.position.set(0, -1.1, 1.2);
    scene.add(under);
    const rim = new THREE.DirectionalLight('#ffffff', 1.4);
    rim.position.set(-3, 4, -4);
    scene.add(rim);

    // Theme: dark is the site default (no attribute); light sets data-theme="light".
    const colA = new THREE.Color(), colB = new THREE.Color(), colMix = new THREE.Color();
    function applyTheme() {
        const key = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        const c = COLORS[key], t = THEMES[key];
        colA.set(c.a);
        colB.set(c.b);
        const pos = geo.attributes.position, col = geo.attributes.color;
        for (let i = 0; i < pos.count; i++) {
            colMix.copy(colA).lerp(colB, THREE.MathUtils.clamp((pos.getX(i) + 2) / 4, 0, 1));
            col.setXYZ(i, colMix.r, colMix.g, colMix.b);
        }
        col.needsUpdate = true;
        bodyMat.emissiveIntensity = t.emissive;
        for (const m of [shellMat, coneMat]) {
            m.uniforms.uColor.value.set(c.holo);
            m.uniforms.uGain.value = t.gain;
        }
        for (const m of [shellMat, coneMat, discMat, emberMat, pulseMat, haloMat]) {
            m.blending = t.blend;
            m.needsUpdate = true;
        }
        ringMat.color.set(c.holo);
        discMat.color.set(c.holo);
        pulseMat.color.set(c.holo);
        haloMat.color.set(c.holo);
        emberMat.color.set(c.ember);
        discMat.opacity = t.disc;
        haloMat.opacity = t.glow;
        under.color.set(c.holo);
        under.intensity = t.under;
        if (!running) renderer.render(scene, camera);
    }
    new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    function resize() {
        const w = mount.clientWidth, h = mount.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.position.set(0, 0.5, Math.max(6.0, 8.6 / camera.aspect));
        camera.lookAt(0, -0.45, 0);
        camera.updateProjectionMatrix();
        if (!running) renderer.render(scene, camera);
    }
    new ResizeObserver(resize).observe(mount);

    // Pointer tilt follows the mouse anywhere in the hero; a tap on the logo sends a pulse.
    let px = 0, py = 0;
    hero.addEventListener('pointermove', (e) => {
        const b = mount.getBoundingClientRect();
        px = THREE.MathUtils.clamp(((e.clientX - b.left) / b.width) * 2 - 1, -1.5, 1.5);
        py = THREE.MathUtils.clamp(((e.clientY - b.top) / b.height) * 2 - 1, -1.5, 1.5);
    });
    hero.addEventListener('pointerleave', () => { px = 0; py = 0; });
    let pulseT = 9;
    mount.addEventListener('pointerdown', () => { pulseT = 0; });

    const clock = new THREE.Clock(false);
    let t = 0, rx = 0, ry = 0, introStart = still ? -99 : 0.2, nextGlitch = 5, glitchUntil = -1;
    let running = false, active = false, frame = 0;

    function tick() {
        if (!running) return;
        const dt = Math.min(clock.getDelta(), 0.05);
        if (!still) t += dt;

        ry += ((px * 0.45 + (still ? 0 : Math.sin(t * 0.35) * 0.22)) - ry) * 0.06;
        rx += ((py * 0.25) - rx) * 0.06;
        logo.rotation.set(rx, ry, 0);
        logo.position.y = still ? 0 : Math.sin(t * 1.1) * 0.06;

        const intro = (t - introStart) / INTRO_SECONDS;
        let sweepY = -1.3 + ((t * 0.42) % 1) * 2.8;
        if (intro < 0) {
            printPlane.constant = -2;
        } else if (intro < 1) {
            printPlane.constant = -1.05 + (1 - Math.pow(1 - intro, 3)) * 2.2 + logo.position.y;
            sweepY = printPlane.constant;
        } else {
            printPlane.constant = 10;
        }

        const glitchOn = !still && intro >= 1;
        if (glitchOn && t > nextGlitch) {
            glitchUntil = t + 0.18;
            nextGlitch = t + 4 + Math.random() * 5;
        }
        const glitch = glitchOn && t < glitchUntil ? 1 : 0;
        shellMat.uniforms.uGlitch.value = glitch;
        logo.position.x = glitch ? (Math.random() - 0.5) * 0.05 : 0;

        pulseT += dt;
        const p = Math.min(pulseT / 1.1, 1);
        pulse.scale.setScalar(1.35 + p * 2.6);
        pulseMat.opacity = (1 - p) * 0.9;
        shellMat.uniforms.uBoost.value = Math.max(0, 1 - pulseT / 0.6) * 0.8;

        shellMat.uniforms.uTime.value = t;
        shellMat.uniforms.uSweepY.value = sweepY;
        coneMat.uniforms.uTime.value = t;
        ring2.rotation.z = t * 0.4;

        if (!still) {
            for (let i = 0; i < EMBERS; i++) {
                emberPos[i * 3 + 1] += emberSpeed[i] * dt;
                emberPos[i * 3] += Math.sin(t * 2 + emberPhase[i]) * 0.0015;
                if (emberPos[i * 3 + 1] > BASE_Y + CONE_H) seedEmber(i, false);
            }
            emberGeo.attributes.position.needsUpdate = true;
        }

        renderer.render(scene, camera);
        frame = requestAnimationFrame(tick);
    }

    function update() {
        const shouldRun = active && !document.hidden;
        if (shouldRun && !running) {
            running = true;
            clock.start();
            frame = requestAnimationFrame(tick);
        } else if (!shouldRun && running) {
            running = false;
            clock.stop();
            cancelAnimationFrame(frame);
        }
    }
    document.addEventListener('visibilitychange', update);

    applyTheme();
    resize();

    return {
        setActive(value) {
            active = value;
            update();
        },
    };
}
