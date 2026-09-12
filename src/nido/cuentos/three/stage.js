// Escenario 3D de la biblioteca: la sala con su pared, la repisa de figuras,
// la balda de libros, la mesa con la lámpara, y la cámara que baja a la mesa
// cuando se elige un cuento. Toda la interfaz de texto vive en HTML encima.

import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { highlightStoryWord } from "./textures.js";
import { WORK_TASKS, buildWorkPieces, buildWorkPile } from "./work-pieces.js";
import { TOY_SCALE } from "./toys/index.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { tween, ease, after, updateTweens, cancelAllTweens } from "./tween.js";
import {
  WALL_THEMES,
  wallpaperTexture,
  woodTexture,
  paperTexture,
  pagesEdgeTexture,
  spineTexture,
  flatTexture,
} from "./textures.js";
import { createBook3D, BOOK_W, BOOK_H, BOOK_T } from "./book3d.js";
import { buildToy, ghostify, PIN_TOY, hasToy } from "./toys/index.js";
import { mat, blob, box, cyl, cone } from "./toys/_shared.js";
import { bookIndexAt, bookPositionAt, clamp, clampZoom, dragScale, settleBook, deskDragIntent, dragProgress, shouldCompleteDrag } from "./library-gestures.js";
import { createToyFeedback } from "./toy-feedback.js";

const SHELF_TOYS = ["buho", "luna", "cometa", "oveja", "arbol", "ballena", "frasco", "barco", "tren", "estrella"];

const CAM = {
  shelf: { pos: [0, 1.62, 3.35], look: [0, 1.44, 0] },
  desk: { pos: [0, 2.1, 3.0], look: [0, 0.3, 0.55] },
  reading: { pos: [-0.14, 1.28, 2.1], look: [-0.14, 0.36, 0.6] },
};

// En pantallas verticales la cámara se aleja y se centra en el pop-up.
const CAM_PORTRAIT = {
  shelf: { pos: [0, 1.56, 3.45], look: [0, 1.42, 0] },
  desk: { pos: [0, 2.8, 4.2], look: [0, 0.2, 0.72] },
  // En vertical el escenario ocupa su propia zona y el texto va debajo.
  reading: { pos: [0.18, 1.6, 2.1], look: [0.18, 0.26, 0.65] },
};

const DESK_BOOK = { x: 0.06, z: 1.24, scale: 1.42 };
const DESK_SLOTS = [
  [-0.92, 0.35],
  [-0.8, 1.32],
  [0.95, 0.3],
  [0.84, 1.36],
  [0.0, 0.08],
];

const STORY_PROP_TO_TOY = {
  paja: "casa",
  madera: "casa",
  ladrillos: "casa",
  cuarto: "farol",
  arboles: "arbol",
  boleto: "tren",
  canoa: "barco",
  dunas: "cactus",
  "estrella-mar": "estrella",
  estrellas: "estrella",
  "flor-cristal": "estrella",
  hojas: "arbol",
  luciernagas: "frasco",
  nenufar: "rana",
  niebla: "luna",
  nubes: "luna",
  puente: "tren",
  raices: "arbol",
  roca: "caracola",
  selva: "arbol",
  sol: "estrella",
  viento: "cometa",
};

export function createStage(canvas, options) {
  const {
    books,
    initialBookId,
    reduceMotion = false,
    onHoverBook = () => {},
    onFocusBook = () => {},
    onZoom = () => {},
    onClickBook = () => {},
    onOpenBook = () => {},
    onCloseBook = () => {},
    onReturnBook = () => {},
    onBookGesture = () => {},
    onHoverToy = () => {},
    onClickToy = () => {},
    // Una figura empieza a desplazarse (entra a escena o se mueve por ella).
    onTravel = () => {},
    // Una pieza de la obra se coloca o se recoge (clave de sonido).
    onWorkSound = () => {},
    onFrame = () => {},
    coverTexture, // (book) => Promise<Texture>
    emblemTexture, // (pinId) => Promise<Texture>
  } = options;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  const isMobile = window.matchMedia("(max-width: 760px)").matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.6 : 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(WALL_THEMES.default.bg);
  // Entorno de habitación precalculado: da reflejos y volumen reales a las
  // tapas brillantes, el vidrio y las figuras sin coste por fotograma.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  scene.environment = environment;
  scene.environmentIntensity = 0.42;

  const camera = new THREE.PerspectiveCamera(36, 1, 0.05, 40);
  const startPortrait = (canvas.clientWidth || window.innerWidth) / (canvas.clientHeight || window.innerHeight) < 0.85;
  const camPos = new THREE.Vector3(...(startPortrait ? CAM_PORTRAIT : CAM).shelf.pos);
  const camLook = new THREE.Vector3(...(startPortrait ? CAM_PORTRAIT : CAM).shelf.look);
  const shelfPan = { x: 0 };
  const zoom = { value: 1 };
  let zoomTarget = 1;
  const feedback = createToyFeedback(scene, camera, reduceMotion);

  /* ------------------------ postprocesado de cine ------------------------ */
  // Sólo en modo película: profundidad de campo (enfoque en quien habla) y un
  // resplandor suave en luces y brillos. En móviles sólo el resplandor, y
  // nada con movimiento reducido o pocos núcleos.
  // Sólo profundidad de campo: el resplandor (bloom) lavaba la página clara.
  let composer = null;
  let bokehPass = null;
  let composerW = 0;
  let composerH = 0;
  const postEnabled = !reduceMotion && !isMobile;
  function ensureComposer() {
    if (composer || !postEnabled) return composer;
    composer = new EffectComposer(renderer);
    composer.setPixelRatio(renderer.getPixelRatio());
    composer.addPass(new RenderPass(scene, camera));
    bokehPass = new BokehPass(scene, camera, { focus: 1, aperture: 0.01, maxblur: 0.002 });
    composer.addPass(bokehPass);
    composer.addPass(new OutputPass());
    return composer;
  }

  /* ------------------------------ luces ------------------------------ */
  scene.add(new THREE.HemisphereLight("#fff4e0", "#5d5148", 0.62));
  const sun = new THREE.DirectionalLight("#fff1d6", 1.95);
  sun.position.set(2.4, 4.2, 3.2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 14;
  sun.shadow.camera.left = -4.5;
  sun.shadow.camera.right = 4.5;
  sun.shadow.camera.top = 4;
  sun.shadow.camera.bottom = -2;
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.015;
  scene.add(sun);

  const lampLight = new THREE.PointLight("#ffd6a0", 1.4, 4.5, 1.6);
  lampLight.position.set(-1.72, 0.78, 1.0);
  scene.add(lampLight);

  // Polvo luminoso de la habitación: profundidad y movimiento muy baratos
  // para móvil, visible sobre todo cuando la cámara baja al libro.
  const dustPositions = new Float32Array(42 * 3);
  for (let i = 0; i < 42; i += 1) {
    dustPositions[i * 3] = -2.3 + ((i * 47) % 97) / 97 * 4.6;
    dustPositions[i * 3 + 1] = 0.35 + ((i * 29) % 89) / 89 * 2.25;
    dustPositions[i * 3 + 2] = 0.12 + ((i * 61) % 83) / 83 * 1.65;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  const ambientDust = new THREE.Points(
    dustGeometry,
    new THREE.PointsMaterial({ color: "#ffe6a1", size: isMobile ? 0.018 : 0.014, transparent: true, opacity: 0.48, depthWrite: false }),
  );
  scene.add(ambientDust);

  // Foco cálido que se enciende sobre el libro elegido / señalado.
  const spot = new THREE.SpotLight("#fff2c4", 0, 4, Math.PI / 9, 0.6, 1.2);
  spot.position.set(0, 2.6, 1.2);
  spot.target.position.set(0, 1, 0);
  scene.add(spot);
  scene.add(spot.target);
  // Modo película: luz principal cálida y contraluz frío que siguen a la
  // escena del diorama (se encienden sólo en cine).
  const cineKey = new THREE.SpotLight("#ffe9c7", 0, 7, Math.PI / 6, 0.55, 1.1);
  const cineRim = new THREE.SpotLight("#bcd6ff", 0, 7, Math.PI / 5, 0.6, 1.1);
  scene.add(cineKey, cineKey.target, cineRim, cineRim.target);

  /* ------------------------------ sala ------------------------------- */
  const wood = woodTexture({ repeat: [4, 1.6] });
  const woodShelf = woodTexture({ base: "#a96a36", dark: "#5b321d", light: "#dc9f5a", seed: 3, repeat: [3, 0.4] });

  let wallTheme = "default";
  const wallGeo = new THREE.PlaneGeometry(10, 3.6);
  const wallA = new THREE.Mesh(wallGeo, new THREE.MeshStandardMaterial({ map: wallpaperTexture(WALL_THEMES.default), roughness: 1 }));
  wallA.material.map.repeat.set(7, 2.5);
  wallA.position.set(0, 1.8, -0.44);
  wallA.receiveShadow = true;
  scene.add(wallA);
  const wallB = new THREE.Mesh(wallGeo, new THREE.MeshStandardMaterial({ map: wallpaperTexture(WALL_THEMES.default), roughness: 1, transparent: true, opacity: 0 }));
  wallB.material.map.repeat.set(7, 2.5);
  wallB.position.set(0, 1.8, -0.435);
  scene.add(wallB);

  const moonLight = new THREE.PointLight("#a9c8ff", 0.75, 5.5, 1.8);
  moonLight.position.set(0.8, 2.4, -0.1);
  scene.add(moonLight);

  const baseboard = box(10, 0.14, 0.05, mat("#f2e8d6", { rough: 0.8 }), { y: 0.07, z: -0.42 });
  scene.add(baseboard);

  const desk = new THREE.Mesh(new THREE.BoxGeometry(10, 0.1, 3.2), new THREE.MeshStandardMaterial({ map: wood, roughness: 0.62 }));
  desk.position.set(0, -0.05, 1.15);
  desk.receiveShadow = true;
  scene.add(desk);

  function shelfBoard(y, depth, z) {
    const board = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.075, depth), new THREE.MeshStandardMaterial({ map: woodShelf, roughness: 0.58 }));
    board.position.set(0, y, z);
    board.castShadow = true;
    board.receiveShadow = true;
    scene.add(board);
    const lip = box(9.6, 0.04, 0.025, mat("#6b3b20", { rough: 0.68 }), { y: y - 0.052, z: z + depth / 2 });
    scene.add(lip);
    [-4.2, 4.2].forEach((x) => {
      const bracket = box(0.05, 0.22, depth * 0.7, mat("#8a5a2c", { rough: 0.8 }), { x, y: y - 0.14, z: z - depth * 0.1 });
      scene.add(bracket);
    });
  }
  shelfBoard(1.8, 0.34, -0.27);
  shelfBoard(0.86, 0.42, -0.22);

  buildLamp(scene);
  buildDeskProps(scene);

  /* ----------------------------- libros ------------------------------ */
  const edgeTex = pagesEdgeTexture();
  const paperTex = paperTexture();
  const bookEntries = [];
  const bookHits = [];
  const bookSpacing = 0.82;

  books.forEach((book, i) => {
    const entry = createBook3D(book, {
      coverTexture: flatTexture(book.accent),
      spineTexture: spineTexture(book),
      edgeTexture: edgeTex,
      paperTexture: paperTex,
    });
    const x = (i - (books.length - 1) / 2) * bookSpacing;
    entry.home = { x, y: 0.89, z: -0.17, rx: -0.035, ry: 0.045 * ((i % 2) * 2 - 1) };
    entry.phase = i * 0.83;
    entry.group.position.set(x, entry.home.y, entry.home.z);
    entry.group.rotation.set(entry.home.rx, entry.home.ry, 0);
    scene.add(entry.group);
    bookEntries.push(entry);
    bookHits.push(entry.hit);
    coverTexture?.(book).then((tex) => {
      entry.coverMat.map = tex;
      entry.coverMat.needsUpdate = true;
    });
  });
  shelfPan.x = bookEntries.find((entry) => entry.book.id === initialBookId)?.home.x || 0;

  /* ----------------------------- figuras ----------------------------- */
  const toyGroups = [];
  const shelfToys = new Map();
  const toyState = new Map();
  const collectedPins = new Set();
  // Protagonista de cada cuento de pie sobre la repisa alta, justo encima de
  // su libro; el del libro enfocado recibe la luz cálida y se anima.
  const heroHolders = new Map();
  const storyLight = new THREE.PointLight("#ffe3a6", 1.6, 2.8, 1.2);
  scene.add(storyLight);

  function releaseToy(holder) {
    holder.parent?.remove(holder);
    const idx = toyGroups.indexOf(holder);
    if (idx >= 0) toyGroups.splice(idx, 1);
    toyState.delete(holder);
    holder.traverse((obj) => {
      obj.geometry?.dispose();
      const list = Array.isArray(obj.material) ? obj.material : obj.material ? [obj.material] : [];
      list.forEach(m => m.dispose());
    });
  }

  function heroToyFor(book) {
    const cast = [...new Set(book.pages.flatMap((page) => page.cast || []))];
    return cast.find((id) => hasToy(id)) || null;
  }

  function updateCameo(book) {
    feedback.clear();
    const color = new THREE.Color(book.accent);
    storyLight.color.copy(color).lerp(new THREE.Color("#fff4cf"), 0.6);
    const entry = bookEntries.find((e) => e.book.id === book.id);
    if (entry) storyLight.position.set(entry.home.x, 2.45, 0.1);
    heroHolders.forEach((holder, id) => {
      const focused = id === book.id;
      const state = toyState.get(holder);
      if (focused && state && !reduceMotion) tween(state, { hop: 0.05 }, { duration: 0.22, easing: ease.out, onComplete: () => tween(state, { hop: 0 }, { duration: 0.45, easing: ease.outBack }) });
      holder.userData.focused = focused;
    });
  }

  // Un protagonista por libro, encima de su lomo.
  bookEntries.forEach((entry, i) => {
    const toyId = heroToyFor(entry.book);
    if (!toyId) return;
    const holder = new THREE.Group();
    holder.position.set(entry.home.x, 1.84, -0.24);
    holder.scale.setScalar(1.28);
    holder.userData.toyId = toyId;
    holder.userData.pinId = toyId;
    holder.userData.heroOf = entry.book.id;
    holder.rotation.y = 0.06 * ((i % 2) * 2 - 1);
    holder.add(buildToy(toyId));
    addHitArea(holder);
    scene.add(holder);
    heroHolders.set(entry.book.id, holder);
    toyGroups.push(holder);
    toyState.set(holder, { phase: i * 1.3, hop: 0, wiggle: 0, spin: 0 });
  });

  // Figuras decorativas entre los protagonistas, más pequeñas.
  SHELF_TOYS.forEach((id, i) => {
    const holder = new THREE.Group();
    // A medio camino entre dos libros consecutivos (el último, al final de la repisa).
    const x = (i - (SHELF_TOYS.length - 1) / 2 + 0.5) * bookSpacing;
    const edge = ((books.length - 1) * bookSpacing) / 2 + bookSpacing / 2;
    holder.position.set(Math.min(Math.max(x, -edge), edge), 1.84, -0.3);
    holder.scale.setScalar(0.78);
    holder.userData.toyId = id;
    holder.userData.pinId = id;
    scene.add(holder);
    shelfToys.set(id, holder);
    toyGroups.push(holder);
    toyState.set(holder, { phase: i * 0.7, hop: 0, wiggle: 0 });
    // La repisa siempre luce las figuras a color: el estado de cada souvenir
    // se ve en la mesa al elegir el cuento y en el álbum.
    mountToy(holder, id, { ghost: false });
  });

  function mountToy(holder, toyId, { ghost }) {
    holder.clear();
    const build = (texture) => {
      const toy = buildToy(toyId, { emblemTexture: texture });
      if (ghost) ghostify(toy);
      holder.add(toy);
      addHitArea(holder);
    };
    if (hasToy(toyId) || !emblemTexture) build(null);
    else emblemTexture(toyId).then(build);
  }

  function setCollected(pins) {
    const next = new Set(pins);
    shelfToys.forEach((holder, id) => {
      if (!collectedPins.has(id) && next.has(id)) popToy(holder);
    });
    collectedPins.clear();
    next.forEach((id) => collectedPins.add(id));
  }

  function addHitArea(holder) {
    // Mantiene fácil el toque aunque la figura salte o tenga patas muy finas.
    const hit = new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.36, 0.27), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
    hit.position.y = 0.18; hit.userData.hitArea = true; holder.add(hit);
  }

  const deskToys = [];
  let pageActors = [];
  // Actores de la página por id (pipo, lobo…) para las acciones narradas.
  const pageActorById = new Map();

  function spawnDeskToys(book, ownedPins) {
    clearDeskToys(true);
    const pins = book.pages.filter((page) => page.pin).map((page) => page.pin);
    pins.slice(0, DESK_SLOTS.length).forEach((pinId, i) => {
      const holder = new THREE.Group();
      const [x, z] = DESK_SLOTS[i];
      holder.position.set(x, 1.4, z);
      holder.userData.toyId = PIN_TOY[pinId] || pinId;
      holder.userData.pinId = pinId;
      holder.rotation.y = (i % 2 ? -1 : 1) * 0.35;
      scene.add(holder);
      toyGroups.push(holder);
      deskToys.push(holder);
      toyState.set(holder, { phase: i * 0.9, hop: 0, wiggle: 0 });
      holder.scale.setScalar(1.05);
      mountToy(holder, PIN_TOY[pinId] || pinId, { ghost: !ownedPins.includes(pinId) });
      tween(holder.position, { y: 0 }, { duration: reduceMotion ? 0.01 : 0.9, delay: 0.25 + i * 0.12, easing: ease.outBounce });
    });
  }

  function clearDeskToys(immediate = false) {
    deskToys.splice(0).forEach((holder, i) => {
      const remove = () => releaseToy(holder);
      if (immediate || reduceMotion) remove();
      else tween(holder.position, { y: 1.6 }, { duration: 0.45, delay: i * 0.05, easing: ease.in, onComplete: remove });
    });
  }

  function popToy(holder) {
    const state = toyState.get(holder);
    if (!state || reduceMotion) return;
    tween(state, { hop: 1 }, {
      duration: 0.55,
      easing: ease.linear,
      onUpdate: (k) => {
        state.hop = Math.sin(k * Math.PI) * 0.09;
        state.wiggle = Math.sin(k * Math.PI * 3) * 0.28 * (1 - k);
      },
      onComplete: () => {
        state.hop = 0;
        state.wiggle = 0;
      },
    });
  }

  function clearPageDiorama() {
    clearWork();
    feedback.clear();
    pageActors.forEach((holder) => {
      releaseToy(holder);
    });
    pageActors = [];
  }

  /**
   * Puestos del diorama. Personajes en primera fila: uno al centro; dos a
   * ±0.085; tres en arco con el protagonista al centro y un pelín adelante.
   * Escenografía en segunda fila, a los lados y más chica, sin tapar la
   * ilustración. `face` gira cada figura hacia el centro.
   */
  function dioramaLayout(castCount, propCount) {
    const slots = [];
    const castScale = castCount === 1 ? 0.72 : castCount === 2 ? 0.6 : 0.52;
    if (castCount === 1) slots.push({ x: 0, z: 0.05, scale: castScale, face: 0 });
    if (castCount === 2) {
      slots.push({ x: -0.085, z: 0.045, scale: castScale, face: 0.28 });
      slots.push({ x: 0.085, z: 0.045, scale: castScale, face: -0.28 });
    }
    if (castCount === 3) {
      slots.push({ x: 0, z: 0.06, scale: castScale * 1.1, face: 0 });
      slots.push({ x: -0.135, z: 0.02, scale: castScale, face: 0.42 });
      slots.push({ x: 0.135, z: 0.02, scale: castScale, face: -0.42 });
    }
    // Escenografía detrás y a los lados, más chica, para que no tape a nadie.
    const propScale = castCount === 0 ? 0.6 : castCount === 1 ? 0.42 : castCount === 2 ? 0.38 : 0.34;
    const propX = castCount >= 3 ? 0.21 : castCount === 2 ? 0.2 : castCount === 1 ? 0.15 : 0.08;
    const propZ = castCount === 0 ? 0.02 : -0.08;
    if (propCount >= 1) slots.push({ x: -propX, z: propZ, scale: propScale, face: 0.35 });
    if (propCount >= 2) slots.push({ x: propX, z: propZ, scale: propScale, face: -0.35 });
    return slots;
  }

  // Narración viva: mientras la voz lee, el protagonista «habla» (un gesto de
  // cabeza por palabra) y los demás lo miran y se mecen. Sin narración vuelven
  // al bamboleo tranquilo.
  let speakingId = null;
  let talkPulse = 0;
  function setSpeaking(actorId) {
    speakingId = actorId || null;
    talkPulse = 0;
  }
  function wordTick() {
    if (speakingId) talkPulse = 1;
  }

  // «Pipo» en la voz → la figura de Pipo se ilumina (aro de luz bajo los pies
  // y brillo en su color), da un saltito y toma la palabra: los demás la miran.
  const glowRingGeometry = new THREE.RingGeometry(0.075, 0.13, 40);
  function nameActor(actorId) {
    const holder = pageActorById.get(actorId);
    if (!holder) return false;
    if (!holder.userData.glowRing) {
      const ring = new THREE.Mesh(glowRingGeometry, new THREE.MeshBasicMaterial({ color: "#ffd873", transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.006;
      holder.add(ring);
      holder.userData.glowRing = ring;
      const emissives = [];
      holder.traverse((obj) => {
        const list = Array.isArray(obj.material) ? obj.material : obj.material ? [obj.material] : [];
        list.forEach((m) => {
          if (m.emissive && !m.map) emissives.push({ material: m, base: m.emissive.clone(), intensity: m.emissiveIntensity });
        });
      });
      holder.userData.emissives = emissives;
    }
    holder.userData.glow = 1;
    speakingId = actorId;
    talkPulse = 1;
    const state = toyState.get(holder);
    if (state && !reduceMotion) tween(state, { hop: 0.045 }, { duration: 0.18, easing: ease.out, onComplete: () => tween(state, { hop: 0 }, { duration: 0.4, easing: ease.outBack }) });
    return true;
  }

  const glowColor = new THREE.Color("#ffb347");
  function applyGlow(holder, dt) {
    const glow = holder.userData.glow;
    if (glow === undefined) return;
    const next = Math.max(0, glow - dt * 0.9);
    holder.userData.glow = next;
    const ring = holder.userData.glowRing;
    if (ring) {
      ring.material.opacity = next * 0.85;
      const s = 1 + (1 - next) * 0.35;
      ring.scale.set(s, s, s);
    }
    // Brillo cálido y contenido: realza a la figura sin blanquear sus colores.
    (holder.userData.emissives || []).forEach(({ material, base, intensity }) => {
      material.emissive.copy(base).lerp(glowColor, next * 0.3);
      material.emissiveIntensity = intensity + next * 0.22;
    });
    if (next === 0) {
      holder.userData.glow = undefined;
      (holder.userData.emissives || []).forEach(({ material, base, intensity }) => {
        material.emissive.copy(base);
        material.emissiveIntensity = intensity;
      });
    }
  }

  // Parpadeo: cada figura cierra los ojos un instante cada pocos segundos.
  function applyBlink(holder, t) {
    if (!holder.userData.eyeParts) {
      const parts = [];
      holder.traverse((obj) => {
        if (!obj.userData.eye) return;
        obj.userData.eyeScaleY ??= obj.scale.y;
        parts.push(obj);
      });
      holder.userData.eyeParts = parts;
      holder.userData.blinkPhase = (toyState.get(holder)?.phase || 0) * 1.7;
    }
    if (!holder.userData.eyeParts.length) return;
    const cycle = 3.6 + ((holder.userData.blinkPhase * 13) % 2.4);
    const phase = (t + holder.userData.blinkPhase) % cycle;
    const closed = phase < 0.13 ? 0.12 : 1;
    holder.userData.eyeParts.forEach((part) => { part.scale.y = part.userData.eyeScaleY * closed; });
  }

  function updatePageDiorama(page) {
    if (!selected?.dioramaRoot || !page) return;
    clearPageDiorama();

    pageActorById.clear();
    // Personajes delante (hasta tres, el protagonista al centro y algo mayor)
    // y escenografía detrás (hasta dos, más pequeña, a los lados), todos
    // mirando ligeramente al centro: composición de diorama, no fila india.
    const castIds = (page.cast || [])
      .map((id) => (hasToy(id) ? id : STORY_PROP_TO_TOY[id]))
      .filter((id, index, list) => id && hasToy(id) && list.indexOf(id) === index)
      .slice(0, 3);
    // Primero los objetos de la historia (la olla, la casa…); el cielo (luna,
    // estrellas, sol, nubes) solo rellena si sobra sitio.
    const SKY = new Set(["luna", "estrellas", "estrella", "sol", "nubes", "niebla", "viento", "nieve"]);
    const propIds = [...(page.props || [])]
      .sort((a, b) => Number(SKY.has(a)) - Number(SKY.has(b)))
      .map((id) => (hasToy(id) ? id : STORY_PROP_TO_TOY[id]))
      .filter((id, index, list) => id && hasToy(id) && !castIds.includes(id) && list.indexOf(id) === index)
      .slice(0, castIds.length >= 3 ? 1 : 2);
    const candidates = [...castIds, ...propIds];

    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.15, 0.012, 48),
      new THREE.MeshPhysicalMaterial({
        color: "#6abfc0",
        transparent: true,
        opacity: 0.28,
        roughness: 0.18,
        metalness: 0.05,
        clearcoat: 0.8,
      }),
    );
    platform.position.set(0, 0.012, 0.0);
    platform.scale.set(castIds.length >= 3 || propIds.length ? 1.6 : 1.25, 1, 0.72);
    selected.dioramaRoot.add(platform);
    pageActors.push(platform);

    const layout = dioramaLayout(castIds.length, propIds.length);
    let enteredSound = false;
    candidates.forEach((id, index) => {
      const holder = new THREE.Group();
      const actor = buildToy(id);
      const slot = layout[index];
      // Las criaturas pequeñas (mariposa, picaflor…) no miden lo que un cerdito.
      const target = slot.scale * (TOY_SCALE[id] || 1);
      holder.position.set(slot.x, 0.018, slot.z);
      holder.rotation.y = slot.face;
      holder.scale.setScalar(target);
      holder.userData.baseY = holder.position.y;
      holder.userData.baseRotY = slot.face;
      holder.userData.isCast = index < castIds.length;
      holder.userData.phase = index * 1.7 + page.t.length * 0.03;
      holder.userData.storyActor = id;
      holder.userData.toyId = id;
      holder.userData.pinId = id;
      holder.userData.baseX = holder.position.x;
      // Acción sostenida durante la página (ver `acts` en cuentos-data.js).
      holder.userData.act = page.acts?.[id] || null;
      holder.userData.pageAct = holder.userData.act;
      holder.userData.slotX = slot.x;
      holder.userData.faceTurn = 0;
      holder.userData.travel = null;
      // `enter`: la figura entra caminando (o volando, nadando…) desde un lado.
      // Sin indicación, cada personaje entra a escena alternando lados, salvo
      // si duerme; `enter: "none"` lo deja quieto desde el principio.
      const enter = page.enter?.[id] ?? (holder.userData.isCast && holder.userData.pageAct !== "sleep" && !reduceMotion ? (index % 2 ? "right" : "left") : null);
      if (enter === "left" || enter === "right") {
        const act = ["fly", "swim", "run", "jump"].includes(holder.userData.act) ? holder.userData.act : "walk";
        holder.userData.baseX = slot.x + (enter === "right" ? 0.3 : -0.3);
        holder.position.x = holder.userData.baseX;
        holder.userData.travel = { to: slot.x, act, speed: travelSpeed(act), then: holder.userData.pageAct, hide: false };
        holder.userData.act = act;
        if (!enteredSound) {
          enteredSound = true;
          onTravel(id, act);
        }
      }
      pageActorById.set(id, holder);
      holder.add(actor);
      addHitArea(holder);
      selected.dioramaRoot.add(holder);
      pageActors.push(holder);
      toyGroups.push(holder);
      toyState.set(holder, { phase: index * 1.7, hop: 0, wiggle: 0, spin: 0 });
      if (!reduceMotion) {
        holder.scale.setScalar(0.001);
        tween(holder.scale, { x: target, y: target, z: target }, { duration: 0.55, delay: index * 0.08, easing: ease.outBack });
      }
    });

    for (let i = 0; i < 7; i += 1) {
      const spark = blob(
        0.006 + (i % 3) * 0.0015,
        mat(i % 2 ? "#fff0a8" : "#b8fbef", { emissive: i % 2 ? "#ffd967" : "#73e0d0", emissiveIntensity: 2 }),
        { x: -0.13 + (i / 6) * 0.26, y: 0.055 + (i % 3) * 0.045, z: 0.038 },
      );
      spark.userData.baseY = spark.position.y;
      spark.userData.phase = i * 0.9;
      spark.userData.storySpark = true;
      selected.dioramaRoot.add(spark);
      pageActors.push(spark);
    }
    setupWork(page);
    after(0.75, () => {
      if (cinema) measureDiorama();
    });
  }

  /**
   * Acción breve de un actor (soplar, temblar, correr…) disparada desde la
   * narración; cuando termina vuelve a la acción sostenida de la página.
   */
  function playAct(actorId, act, ms = 1500) {
    const holder = pageActorById.get(actorId);
    if (!holder) return false;
    holder.userData.burst = { act, until: performance.now() + ms };
    return true;
  }

  /* ------------------------------ cine ------------------------------ */
  // La cámara entra en la ilustración y sigue la narración: plano general
  // con acercamiento lento al empezar la página, reencuadre suave hacia quien
  // habla y deriva casi imperceptible. El lector puede orbitar arrastrando y
  // acercarse con la rueda o el pellizco; tras unos segundos sin tocar, la
  // cámara retoma el paseo automático.
  let cinema = false;
  let cineDrag = null;
  const cine = {
    yaw: 0, pitch: 0, userUntil: 0, started: 0, seed: 0,
    radius: 0.16, center: new THREE.Vector3(), focus: new THREE.Vector3(),
    bookCenter: new THREE.Vector3(), bookRadius: 0.5,
    pos: new THREE.Vector3(), look: new THREE.Vector3(), lastSpeaker: null, cutYaw: 0,
  };
  const tmpQuat = new THREE.Quaternion();
  const tmpBox = new THREE.Box3();
  const cineFront = new THREE.Vector3();
  const cineUp = new THREE.Vector3();
  const cineRight = new THREE.Vector3();
  const cineDir = new THREE.Vector3();
  const cineSide = new THREE.Vector3();
  const WORLD_UP = new THREE.Vector3(0, 1, 0);
  const cineTarget = new THREE.Vector3();
  const cineFocusTarget = new THREE.Vector3();
  const cineActorPos = new THREE.Vector3();

  function measureDiorama() {
    if (!selected?.dioramaRoot) return;
    tmpBox.setFromObject(selected.dioramaRoot);
    if (!tmpBox.isEmpty()) {
      tmpBox.getCenter(cine.center);
      const size = tmpBox.getSize(new THREE.Vector3());
      cine.radius = Math.max(0.1, Math.max(size.x, size.y, size.z) * 0.5);
    }
    // El libro abierto entero (las dos hojas y la lámina): la cámara de cine
    // lo encuadra completo, nunca se pega a la lámina.
    tmpBox.setFromObject(selected.group);
    if (!tmpBox.isEmpty()) {
      tmpBox.getCenter(cine.bookCenter);
      const size = tmpBox.getSize(new THREE.Vector3());
      cine.bookRadius = Math.max(0.2, Math.hypot(size.x, size.y, size.z) * 0.5);
    }
  }

  function setCinema(on) {
    if (Boolean(on) === cinema) return;
    cinema = Boolean(on);
    if (cinema) {
      cine.yaw = 0;
      cine.pitch = 0;
      cine.userUntil = 0;
      cine.started = clock.t;
      cine.seed = Math.random() * 6;
      cine.cutYaw = 0;
      cine.lastSpeaker = null;
      measureDiorama();
      cine.pos.copy(camera.position);
      cine.look.copy(camLook);
      cine.focus.copy(cine.center);
      tween(cineKey, { intensity: 1.4 }, { duration: 0.9 });
      tween(cineRim, { intensity: 0.9 }, { duration: 0.9 });
      return;
    }
    leaveCinema();
    moveCamera(viewFor("reading"), reduceMotion ? 0.01 : 0.9);
  }

  // Al salir del cine la cámara continúa desde donde estaba (sin salto).
  function leaveCinema() {
    if (cinema) {
      camPos.copy(cine.pos);
      camLook.copy(cine.look);
    }
    cinema = false;
    cineDrag = null;
    tween(cineKey, { intensity: 0 }, { duration: 0.5 });
    tween(cineRim, { intensity: 0 }, { duration: 0.5 });
  }

  function updateCinemaCamera(dt) {
    if (!selected?.popupPivot) return false;
    selected.popupPivot.getWorldQuaternion(tmpQuat);
    cineFront.set(0, 0, 1).applyQuaternion(tmpQuat).normalize();
    cineUp.set(0, 1, 0).applyQuaternion(tmpQuat).normalize();
    cineRight.crossVectors(cineUp, cineFront).normalize();
    const t = clock.t;
    const since = t - cine.started;
    // Entra con un acercamiento muy leve y se queda viendo el libro entero.
    const k = Math.min(1, since / 8);
    const push = 1.08 - 0.08 * (1 - Math.cos(k * Math.PI)) * 0.5;
    // Foco: el centro del libro abierto, apenas inclinado hacia quien habla.
    const speaker = speakingId ? pageActorById.get(speakingId) : null;
    cineFocusTarget.copy(cine.bookCenter);
    if (speaker && speaker.visible) {
      speaker.getWorldPosition(cineActorPos);
      cineFocusTarget.lerp(cineActorPos, 0.12);
      if (cine.lastSpeaker !== speakingId) {
        cine.lastSpeaker = speakingId;
        const side = cineActorPos.clone().sub(cine.bookCenter).dot(cineRight);
        cine.cutYaw = Math.sign(side) * 0.05;
      }
    } else if (!speakingId) cine.lastSpeaker = null;
    const userActive = performance.now() < cine.userUntil;
    if (!userActive) {
      const ease = 1 - Math.exp(-dt * 0.8);
      cine.yaw += (0 - cine.yaw) * ease;
      cine.pitch += (0 - cine.pitch) * ease;
    }
    const yaw = Math.max(-0.7, Math.min(0.7, Math.sin(t * 0.11 + cine.seed) * 0.07 + cine.cutYaw + cine.yaw));
    const pitch = Math.max(-0.2, Math.min(0.45, Math.sin(t * 0.08 + cine.seed) * 0.03 + cine.pitch));
    // Distancia para que quepa el libro completo con el campo de visión actual.
    const fovV = (camera.fov * Math.PI) / 180;
    const fovH = 2 * Math.atan(Math.tan(fovV / 2) * camera.aspect);
    const fit = cine.bookRadius / Math.sin(Math.min(fovV, fovH) / 2);
    // La esfera sobreestima (el libro es plano y ancho): 0,6 lo deja entero
    // en cuadro y grande.
    const dist = (fit * 0.6 * push) / Math.max(0.5, zoom.value);
    // Dirección base: la de la vista de lectura (el libro visto desde el
    // frente y un poco desde arriba), girada por la deriva y el arrastre.
    const view = viewFor("reading");
    cineDir.set(view.pos[0] - view.look[0], view.pos[1] - view.look[1], view.pos[2] - view.look[2]).normalize();
    cineDir.applyAxisAngle(WORLD_UP, yaw);
    cineSide.crossVectors(WORLD_UP, cineDir).normalize();
    cineDir.applyAxisAngle(cineSide, -pitch).normalize();
    cineTarget.copy(cineFocusTarget).addScaledVector(cineDir, dist);
    const smooth = reduceMotion ? 1 : 1 - Math.exp(-dt * 2.4);
    cine.pos.lerp(cineTarget, smooth);
    cine.focus.lerp(cineFocusTarget, reduceMotion ? 1 : 1 - Math.exp(-dt * 3));
    cine.look.copy(cine.focus);
    camera.position.copy(cine.pos);
    camera.lookAt(cine.look);
    // Luces de cine alrededor de la lámina.
    const reach = cine.radius * 3.2;
    cineKey.position.copy(cine.center).addScaledVector(cineRight, -0.6 * reach).addScaledVector(cineUp, 0.9 * reach).addScaledVector(cineFront, 0.8 * reach);
    cineKey.target.position.copy(cine.center);
    cineRim.position.copy(cine.center).addScaledVector(cineRight, 0.5 * reach).addScaledVector(cineUp, 0.8 * reach).addScaledVector(cineFront, -0.6 * reach);
    cineRim.target.position.copy(cine.center);
    // El fondo pintado deriva muy despacio, como una cámara sobre el decorado.
    const map = selected.popup?.material?.map;
    if (map) {
      map.repeat.set(0.92, 0.92);
      map.offset.set(0.04 + Math.sin(t * 0.06 + cine.seed) * 0.035, 0.04 + Math.cos(t * 0.045 + cine.seed) * 0.03);
    }
    return true;
  }

  function resetBackdropDrift() {
    const map = selected?.popup?.material?.map;
    if (map && map.repeat.x !== 1) {
      map.repeat.set(1, 1);
      map.offset.set(0, 0);
    }
  }

  /* --------------------------- desplazamientos ---------------------- */
  const TRAVEL_X = { left: -0.17, right: 0.17, center: 0, "away-left": -0.55, "away-right": 0.55 };
  function travelSpeed(act) {
    if (act === "run") return 0.26;
    if (act === "fly") return 0.22;
    if (act === "swim") return 0.18;
    if (act === "jump") return 0.2;
    return 0.13;
  }

  /**
   * La figura camina (o corre, vuela, nada…) hasta un punto de la escena:
   * «left», «right», «center» o fuera de escena («away-left»/«away-right»).
   */
  function travelTo(actorId, where, act = "walk", ms = 0) {
    const holder = pageActorById.get(actorId);
    if (!holder || !(where in TRAVEL_X)) return false;
    const to = holder.userData.slotX + TRAVEL_X[where];
    holder.userData.travel = { to, act, speed: travelSpeed(act), then: holder.userData.pageAct ?? null, hide: where.startsWith("away") };
    holder.userData.burst = { act, until: performance.now() + Math.max(ms || 0, (Math.abs(to - holder.userData.baseX) / travelSpeed(act)) * 1000 + 300) };
    holder.visible = true;
    onTravel(actorId, act);
    return true;
  }

  function updateTravel(actor, dt) {
    // Cada personaje que no habla ni actúa da, de vez en cuando, unos pasos
    // cortos por su zona: la escena nunca está congelada.
    if (!actor.userData.travel && !actor.userData.burst && !actor.userData.working && actor.userData.isCast && actor.userData.storyActor !== speakingId && !reduceMotion) {
      const now = clock.t;
      if (!actor.userData.nextStroll) actor.userData.nextStroll = now + 4 + Math.random() * 6;
      else if (now > actor.userData.nextStroll) {
        actor.userData.nextStroll = now + 7 + Math.random() * 8;
        const pageAct = actor.userData.pageAct;
        if (pageAct !== "sleep") {
          const act = pageAct === "fly" || pageAct === "swim" ? pageAct : "walk";
          actor.userData.travel = { to: actor.userData.slotX + (Math.random() - 0.5) * 0.07, act, speed: 0.06, then: pageAct, hide: false, gentle: true };
        }
      }
    }
    const travel = actor.userData.travel;
    let turn = 0;
    if (travel) {
      const dx = travel.to - actor.userData.baseX;
      const step = travel.speed * dt;
      if (Math.abs(dx) <= step) {
        actor.userData.baseX = travel.to;
        actor.userData.travel = null;
        actor.userData.act = travel.then;
        if (travel.hide) actor.visible = false;
      } else {
        actor.userData.baseX += Math.sign(dx) * step;
        actor.userData.act = travel.act;
        turn = Math.sign(dx) * (travel.gentle ? 0.3 : 0.85);
      }
    }
    const current = actor.userData.faceTurn || 0;
    actor.userData.faceTurn = current + (turn - current) * Math.min(1, dt * 6);
  }

  /* -------------------------------- obra ------------------------------ */
  // «Se les ve trabajando»: junto a la figura hay una pila de material y, al
  // otro lado, la construcción. La figura va a la pila, carga unas piezas,
  // vuelve y las coloca una a una (la casa crece) hasta terminar. Con
  // `built` la obra aparece terminada; los cues `scene` la hacen volar
  // («voló») o derrumbarse («cayó»). Las tareas de recoger (flores,
  // caracolas) reparten las piezas por el suelo y la figura las va juntando.
  let work = null;
  const WORK_PILE_X = -0.17;
  const WORK_SITE_X = 0.16;
  const WORK_SCALE = 1.4;

  function clearWork() {
    if (!work) return;
    work.root.parent?.remove(work.root);
    work.root.traverse((obj) => {
      if (obj.isMesh) obj.geometry?.dispose();
    });
    work.pieces.forEach((piece) => piece.object.parent?.remove(piece.object));
    if (work.holder) work.holder.userData.working = false;
    work = null;
  }

  function setupWork(page) {
    clearWork();
    const spec = page?.work;
    if (!spec || !WORK_TASKS[spec.task] || !selected?.dioramaRoot) return;
    const task = WORK_TASKS[spec.task];
    // Delante de la lámina del pop-up (z > 0.02) y detrás de la fila de personajes.
    const root = new THREE.Group();
    root.position.set(0, 0.018, 0.07);
    selected.dioramaRoot.add(root);
    const site = new THREE.Group();
    site.position.set(task.gather ? 0 : WORK_SITE_X, 0, task.gather ? 0.01 : 0);
    site.scale.setScalar(task.gather ? 1.1 : WORK_SCALE);
    root.add(site);
    const pieces = buildWorkPieces(spec.task);
    pieces.forEach((piece) => {
      piece.object.visible = Boolean(task.gather || spec.built);
      piece.object.traverse((obj) => {
        if (obj.isMesh) {
          obj.castShadow = true;
          obj.receiveShadow = true;
        }
      });
      site.add(piece.object);
    });
    const pile = spec.built ? null : buildWorkPile(spec.task);
    if (pile) {
      pile.position.set(WORK_PILE_X, 0, 0);
      pile.scale.setScalar(WORK_SCALE);
      pile.traverse((obj) => {
        if (obj.isMesh) obj.castShadow = true;
      });
      root.add(pile);
    }
    const holder = spec.actor && !spec.built ? pageActorById.get(spec.actor) || null : null;
    work = { spec, task, root, site, pile, pieces, holder, placed: spec.built ? pieces.length : 0, phase: holder ? "start" : "done", timer: 0, carried: [] };
    if (holder) holder.userData.working = true;
  }

  function workTravel(x, act = "walk") {
    const holder = work.holder;
    holder.userData.travel = { to: x, act, speed: 0.27, then: holder.userData.pageAct, hide: false };
    holder.userData.act = act;
  }

  /** Hay una figura a medio trabajo (para que la página espere a que termine). */
  function isWorking() {
    return Boolean(work && work.holder && work.phase !== "done");
  }

  function carry(piece, index) {
    const holder = work.holder;
    holder.attach(piece.object);
    piece.object.visible = true;
    const d = reduceMotion ? 0.01 : 0.3;
    tween(piece.object.position, { x: 0, y: 0.09 + index * 0.02, z: 0.11 }, { duration: d, easing: ease.out });
    const rot = work.task.carryRot || [0, 0, 0];
    tween(piece.object.rotation, { x: rot[0], y: rot[1], z: rot[2] }, { duration: d });
  }

  function placeCarried(piece) {
    work.site.attach(piece.object);
    const d = reduceMotion ? 0.01 : 0.28;
    tween(piece.object.position, { x: piece.pos[0], y: piece.pos[1] + 0.03, z: piece.pos[2] }, {
      duration: d,
      easing: ease.out,
      onComplete: () => tween(piece.object.position, { y: piece.pos[1] }, { duration: reduceMotion ? 0.01 : 0.16, easing: ease.in }),
    });
    tween(piece.object.rotation, { x: piece.rot[0], y: piece.rot[1], z: piece.rot[2] }, { duration: d * 1.4 });
    tween(piece.object.scale, { x: 1, y: 1, z: 1 }, { duration: d * 1.4 });
  }

  function updateWork(dt) {
    if (!work || !work.holder || work.phase === "done") return;
    const holder = work.holder;
    const traveling = Boolean(holder.userData.travel);
    work.timer -= dt;
    const finish = () => {
      work.phase = "done";
      holder.userData.working = false;
      holder.userData.burst = { act: "cheer", until: performance.now() + 3000 };
    };
    switch (work.phase) {
      case "start":
        if (!traveling) {
          work.phase = "toPile";
          workTravel(work.task.gather ? work.pieces[work.placed].pos[0] : WORK_PILE_X + 0.07);
        }
        break;
      case "toPile":
        if (!traveling) {
          work.phase = "pick";
          work.timer = 0.45;
          holder.userData.burst = { act: "build", until: performance.now() + 450 };
          if (work.task.gather) {
            work.carried = [work.pieces[work.placed]];
            carry(work.carried[0], 0);
          } else {
            const count = Math.min(work.task.batch, work.pieces.length - work.placed);
            work.carried = work.pieces.slice(work.placed, work.placed + count);
            work.carried.forEach((piece, index) => {
              piece.object.position.set(WORK_PILE_X - work.site.position.x, 0.02, 0);
              carry(piece, index);
            });
          }
        }
        break;
      case "pick":
        if (work.timer <= 0) {
          if (work.task.gather) {
            const piece = work.carried[0];
            tween(piece.object.scale, { x: 0.001, y: 0.001, z: 0.001 }, { duration: 0.35, easing: ease.in, onComplete: () => { piece.object.visible = false; } });
            work.carried = [];
            work.placed += 1;
            onWorkSound(work.task.sound);
            if (work.placed >= work.pieces.length) finish();
            else {
              work.phase = "toPile";
              workTravel(work.pieces[work.placed].pos[0]);
            }
          } else {
            work.phase = "toSite";
            workTravel(WORK_SITE_X - 0.1);
          }
        }
        break;
      case "toSite":
        if (!traveling) {
          work.phase = "place";
          work.timer = 0.2;
        }
        break;
      case "place":
        if (work.timer <= 0) {
          const piece = work.carried.shift();
          if (piece) {
            placeCarried(piece);
            work.placed += 1;
            onWorkSound(work.task.sound);
            holder.userData.burst = { act: "build", until: performance.now() + 500 };
            work.timer = 0.5;
          } else if (work.placed >= work.pieces.length) finish();
          else {
            work.phase = "toPile";
            workTravel(WORK_PILE_X + 0.07);
          }
        }
        break;
      default:
        break;
    }
  }

  /** Evento de escena sobre la obra: «scatter» (vuela por los aires) o «collapse» (se derrumba). */
  function sceneEvent(kind) {
    if (!work) return false;
    const placed = work.pieces.filter((piece) => piece.object.visible && piece.object.parent === work.site);
    placed.forEach((piece, i) => {
      const o = piece.object;
      const d = reduceMotion ? 0.01 : 1;
      if (kind === "scatter") {
        const dir = i % 2 ? 1 : -1;
        tween(o.position, { x: o.position.x + dir * (0.25 + Math.random() * 0.3), y: o.position.y + 0.2 + Math.random() * 0.25, z: o.position.z + (Math.random() - 0.5) * 0.2 }, {
          duration: d * (0.9 + Math.random() * 0.5),
          delay: d * i * 0.04,
          easing: ease.out,
          onComplete: () => { o.visible = false; },
        });
        tween(o.rotation, { x: o.rotation.x + Math.random() * 6, y: o.rotation.y + Math.random() * 6, z: o.rotation.z + Math.random() * 6 }, { duration: d * 1.2, delay: d * i * 0.04 });
      } else if (kind === "collapse") {
        tween(o.position, { x: o.position.x + (Math.random() - 0.5) * 0.08, y: 0.008 + Math.random() * 0.02, z: o.position.z + (Math.random() - 0.5) * 0.06 }, { duration: d * (0.45 + i * 0.05), delay: d * i * 0.03, easing: ease.in });
        tween(o.rotation, { x: (Math.random() - 0.5) * 1.2, y: Math.random() * 3, z: (Math.random() > 0.5 ? Math.PI / 2 : 0) + (Math.random() - 0.5) * 0.5 }, { duration: d * (0.5 + i * 0.05), delay: d * i * 0.03 });
      }
    });
    if (work.holder) {
      work.phase = "done";
      work.holder.userData.working = false;
    }
    return true;
  }

  function findPart(holder, key) {
    const cache = (holder.userData.parts ??= {});
    if (key in cache) return cache[key];
    let found = null;
    holder.traverse((obj) => {
      if (!found && obj.userData[key]) found = obj;
    });
    cache[key] = found;
    return found;
  }
  function findParts(holder, key) {
    const cache = (holder.userData.partLists ??= {});
    if (key in cache) return cache[key];
    const list = [];
    holder.traverse((obj) => {
      if (obj.userData[key]) list.push(obj);
    });
    cache[key] = list;
    return list;
  }

  // Aplica la acción vigente de un actor (catálogo en cuentos-acts.js):
  // movimientos procedurales sobre el grupo entero y sobre las partes que la
  // figura declara en userData (head, arm, wing, flutter, tail, ear, leg,
  // spray). El bucle principal restaura la pose de reposo de esas partes cada
  // fotograma, así que aquí sólo se suman desplazamientos.
  function applyAct(actor, t) {
    const burst = actor.userData.burst;
    if (burst && performance.now() > burst.until) actor.userData.burst = null;
    const act = actor.userData.burst?.act || actor.userData.act;
    const baseX = actor.userData.baseX ?? actor.position.x;
    const baseY = actor.userData.baseY ?? 0;
    actor.position.x = baseX;
    if (!act) return false;
    const head = findPart(actor, "head");
    const arms = findParts(actor, "arm");
    const wings = findParts(actor, "wing");
    const flutters = findParts(actor, "flutter");
    const tails = findParts(actor, "tail");
    const ears = findParts(actor, "ear");
    const legs = findParts(actor, "leg");
    const ph = actor.userData.phase || 0;
    const armsUp = (amount, wobble = 0) => arms.forEach((arm) => { arm.rotation.z += arm.userData.arm * amount + Math.sin(t * 6 + ph) * wobble; });
    const flap = (speed, amount) => {
      wings.forEach((wing) => { wing.rotation.z += Math.sin(t * speed + ph) * amount * wing.userData.wing; });
      flutters.forEach((part) => { part.rotation.y += Math.sin(t * speed + ph) * amount * 0.8 * part.userData.flutter; });
    };
    const stride = (speed, amount) => {
      legs.forEach((leg) => { leg.rotation.x += Math.sin(t * speed + ph) * amount * leg.userData.leg; });
      arms.forEach((arm) => { arm.rotation.x += Math.sin(t * speed + ph + Math.PI) * amount * 0.8 * arm.userData.arm; });
    };
    const wagTail = (speed, amount) => tails.forEach((tail) => { tail.rotation[tail.userData.tail === "x" ? "x" : "y"] += Math.sin(t * speed + ph) * amount; });
    actor.rotation.x = 0;
    switch (act) {
      case "blow": {
        // Toma aire y sopla: se inclina hacia adelante e hincha la cabeza.
        const k = Math.max(0, Math.sin(t * 5));
        actor.rotation.x = -0.22 - k * 0.12;
        if (head) head.scale.multiplyScalar(1 + k * 0.22);
        return true;
      }
      case "howl": {
        actor.rotation.x = 0.28;
        if (head) {
          head.rotation.x -= 0.35;
          head.scale.multiplyScalar(1 + Math.max(0, Math.sin(t * 3)) * 0.1);
        }
        return true;
      }
      case "shiver": {
        actor.position.x = baseX + Math.sin(t * 38) * 0.005;
        actor.rotation.z = Math.sin(t * 38) * 0.03;
        ears.forEach((ear) => { ear.rotation.z += Math.sin(t * 38) * 0.08; });
        return true;
      }
      case "run": {
        actor.position.y = baseY + Math.abs(Math.sin(t * 9)) * 0.022;
        actor.rotation.z = Math.sin(t * 9) * 0.09;
        actor.rotation.x = -0.12;
        stride(9, 0.55);
        wagTail(9, 0.2);
        return true;
      }
      case "walk": {
        actor.position.y = baseY + Math.abs(Math.sin(t * 5)) * 0.01;
        actor.rotation.z = Math.sin(t * 5) * 0.04;
        actor.rotation.x = -0.05;
        stride(5, 0.35);
        wagTail(5, 0.12);
        return true;
      }
      case "build": {
        arms.forEach((arm) => { arm.rotation.x += -0.6 + Math.sin(t * 7 + arm.userData.arm) * 0.55; });
        actor.position.y = baseY + Math.max(0, Math.sin(t * 7)) * 0.006;
        return true;
      }
      case "cheer": {
        actor.position.y = baseY + Math.abs(Math.sin(t * 6 + ph)) * 0.03;
        actor.rotation.y += Math.sin(t * 4 + ph) * 0.35;
        armsUp(1.7, 0.25);
        flap(12, 0.4);
        wagTail(8, 0.25);
        return true;
      }
      case "sleep": {
        actor.rotation.z = 0.12;
        if (head) {
          head.rotation.z += 0.22;
          head.rotation.x += 0.18;
          head.scale.multiplyScalar(1 + Math.sin(t * 1.6) * 0.03);
        }
        ears.forEach((ear) => { ear.rotation.z += 0.25 * ear.userData.ear; });
        return true;
      }
      case "look": {
        actor.rotation.x = 0.08;
        if (head) head.rotation.x -= 0.42 + Math.sin(t * 1.3 + ph) * 0.05;
        actor.rotation.z = Math.sin(t * 0.9 + ph) * 0.03;
        return true;
      }
      case "listen": {
        if (head) head.rotation.z += Math.sin(t * 1.4 + ph) * 0.22;
        ears.forEach((ear) => {
          ear.rotation.z += Math.sin(t * 5 + ph + ear.userData.ear) * 0.2 * ear.userData.ear;
          ear.rotation.x -= 0.15;
        });
        actor.rotation.y += Math.sin(t * 0.7 + ph) * 0.12;
        return true;
      }
      case "think": {
        if (head) {
          head.rotation.z += 0.22;
          head.rotation.x -= 0.12;
        }
        arms.forEach((arm) => {
          if (arm.userData.arm > 0) {
            arm.rotation.z += 1.4;
            arm.rotation.x -= 0.6;
          }
        });
        actor.rotation.y += Math.sin(t * 0.8 + ph) * 0.1;
        return true;
      }
      case "nod": {
        if (head) head.rotation.x += 0.1 + Math.sin(t * 5 + ph) * 0.18;
        else actor.rotation.x = Math.sin(t * 5 + ph) * 0.1;
        return true;
      }
      case "sing": {
        if (head) {
          head.rotation.x -= 0.3 + Math.sin(t * 3 + ph) * 0.08;
          head.scale.multiplyScalar(1 + Math.max(0, Math.sin(t * 6 + ph)) * 0.06);
        }
        actor.position.y = baseY + Math.abs(Math.sin(t * 3 + ph)) * 0.01;
        actor.rotation.z = Math.sin(t * 1.5 + ph) * 0.06;
        armsUp(0.8, 0.15);
        findParts(actor, "spray").forEach((jet) => jet.scale.multiplyScalar(1.2 + Math.max(0, Math.sin(t * 3 + ph)) * 0.5));
        return true;
      }
      case "raise": {
        armsUp(2.1, 0.1);
        if (head) head.rotation.x -= 0.25;
        actor.position.y = baseY + Math.max(0, Math.sin(t * 2 + ph)) * 0.008;
        return true;
      }
      case "wave": {
        arms.forEach((arm) => { if (arm.userData.arm > 0) arm.rotation.z += 2.2 + Math.sin(t * 10 + ph) * 0.3; });
        if (head) head.rotation.z += 0.1;
        return true;
      }
      case "fly": {
        actor.position.y = baseY + 0.045 + Math.sin(t * 2.5 + ph) * 0.02;
        actor.rotation.x = -0.1;
        actor.rotation.z = Math.sin(t * 1.7 + ph) * 0.1;
        flap(18, 0.55);
        return true;
      }
      case "jump": {
        const k = Math.max(0, Math.sin(t * 4.2 + ph));
        actor.position.y = baseY + k * 0.09;
        actor.rotation.x = -k * 0.25;
        legs.forEach((leg) => { leg.rotation.x -= k * 0.5; });
        armsUp(k * 1.2);
        wagTail(4.2, 0.25);
        return true;
      }
      case "swim": {
        actor.rotation.z = Math.sin(t * 2.2 + ph) * 0.12;
        actor.rotation.x = Math.sin(t * 2.2 + ph + 1) * 0.15;
        actor.position.y = baseY + Math.sin(t * 2.2 + ph) * 0.012;
        wagTail(6, 0.35);
        flutters.forEach((part) => { part.rotation.y += Math.sin(t * 6 + ph) * 0.3 * part.userData.flutter; });
        return true;
      }
      case "sniff": {
        actor.rotation.x = 0.12;
        if (head) {
          head.rotation.x += 0.5 + Math.sin(t * 14 + ph) * 0.05;
          head.rotation.y += Math.sin(t * 2 + ph) * 0.2;
        }
        actor.position.y = baseY + Math.abs(Math.sin(t * 2 + ph)) * 0.004;
        wagTail(4, 0.25);
        return true;
      }
      case "peck": {
        const k = Math.max(0, Math.sin(t * 14 + ph));
        if (head) head.rotation.x += k * 0.5;
        else actor.rotation.x = k * 0.3;
        actor.position.y = baseY + k * 0.003;
        return true;
      }
      case "dance": {
        actor.rotation.y += Math.sin(t * 4 + ph) * 0.5;
        actor.position.y = baseY + Math.abs(Math.sin(t * 8 + ph)) * 0.02;
        actor.rotation.z = Math.sin(t * 4 + ph) * 0.12;
        arms.forEach((arm) => { arm.rotation.z += arm.userData.arm * (1.2 + Math.sin(t * 8 + ph + arm.userData.arm) * 0.6); });
        flap(10, 0.35);
        ears.forEach((ear) => { ear.rotation.z += Math.sin(t * 8 + ph) * 0.15 * ear.userData.ear; });
        wagTail(8, 0.3);
        return true;
      }
      default:
        return false;
    }
  }

  /* --------------------------- interacción --------------------------- */
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(-2, -2);
  let pointerDirty = false;
  let hoveredBook = null;
  let hoveredToy = null;
  let mode = "shelf";
  let selected = null;
  let dragging = null;
  // Arrastre del libro sobre la mesa (abrir la tapa / devolverlo a la repisa).
  let deskDrag = null;
  let hoveringDeskBook = false;
  let openT = 0;
  let hintTimer = 0;
  let hintTween = null;
  // Mientras el libro vuela, se abre o se cierra no se aceptan gestos: un
  // arrastre a medio vuelo dejaba la pose a medias.
  let busyUntil = 0;
  let openingPending = false;
  let gestureNotice = "";
  const DESK_POSE = { x: DESK_BOOK.x, y: 0, z: DESK_BOOK.z, rx: -Math.PI / 2, ry: 0, rz: 0.02 };
  let focusedId = null;
  let panTween = null;
  let wheelTimer = 0;
  const pointers = new Map();
  let pinch = null;

  function activateBook(entry) {
    if (!entry || entry.book.id === focusedId) return;
    focusedId = entry.book.id;
    canvas.dataset.focusedBook = focusedId;
    setWall(focusedId);
    updateCameo(entry.book);
    onFocusBook(focusedId);
  }

  function liftBook(entry, lifted) {
    if (mode !== "shelf" || selected) return;
    const target = lifted
      ? { x: entry.home.x, y: entry.home.y + 0.06, z: entry.home.z + 0.16 }
      : { x: entry.home.x, y: entry.home.y, z: entry.home.z };
    tween(entry.group.position, target, { duration: reduceMotion ? 0.01 : 0.35, easing: ease.outBack });
    tween(entry.group.rotation, { x: lifted ? 0.02 : entry.home.rx, y: lifted ? 0 : entry.home.ry }, { duration: 0.35, easing: ease.out });
    const s = lifted ? 1.08 : 1;
    tween(entry.group.scale, { x: s, y: s, z: s }, { duration: 0.35, easing: ease.outBack });
    tween(entry.coverMat, { emissiveIntensity: lifted ? 0.28 : 0.06 }, { duration: 0.35, easing: ease.out });
    if (lifted) {
      spot.target.position.set(entry.home.x, entry.home.y + BOOK_H / 2, entry.home.z);
      spot.position.set(entry.home.x, 2.7, 1.3);
      tween(spot, { intensity: 4.2 }, { duration: 0.35, easing: ease.out });
    } else if (hoveredBook === entry) {
      tween(spot, { intensity: 0 }, { duration: 0.4, easing: ease.out });
    }
  }

  function setHoveredBook(entry) {
    if (hoveredBook === entry) return;
    if (hoveredBook) liftBook(hoveredBook, false);
    hoveredBook = entry;
    if (entry) { liftBook(entry, true); activateBook(entry); }
    onHoverBook(entry ? entry.book.id : null);
    canvas.style.cursor = entry || hoveredToy ? "pointer" : "";
  }

  function setHoveredToy(holder) {
    if (hoveredToy === holder) return;
    hoveredToy = holder;
    feedback.show(holder);
    if (holder) {
      popToy(holder);
      onHoverToy(holder.userData.pinId);
    } else {
      onHoverToy(null);
    }
    canvas.style.cursor = holder || hoveredBook ? "pointer" : "";
  }

  function pick() {
    if (!pointerDirty || dragging?.moved || pinch) return;
    pointerDirty = false;
    raycaster.setFromCamera(pointer, camera);
    if (mode === "shelf" && !selected) {
      const hitBooks = raycaster.intersectObjects(bookHits, false);
      if (hitBooks.length) {
        const entry = bookEntries.find((e) => e.hit === hitBooks[0].object);
        setHoveredToy(null);
        setHoveredBook(entry || null);
        return;
      }
      setHoveredBook(null);
    }
    const hitToys = raycaster.intersectObjects(toyGroups.filter(holder => holder.visible && (!holder.userData.storyActor || mode === "reading")), true);
    if (hitToys.length) {
      let obj = hitToys[0].object;
      while (obj && !obj.userData.toyId) obj = obj.parent;
      setHoveredToy(obj || null);
    } else {
      setHoveredToy(null);
    }
    let overDeskBook = false;
    if (selected && !hoveredToy && !isBusy()) {
      if (mode === "desk") overDeskBook = raycaster.intersectObject(selected.hit, false).length > 0;
      else if (mode === "reading") overDeskBook = raycaster.intersectObjects([selected.coverSurface, selected.pageSurface], false).length > 0;
    }
    if (overDeskBook !== hoveringDeskBook) {
      hoveringDeskBook = overDeskBook;
      if (!hoveredToy && !hoveredBook) canvas.style.cursor = overDeskBook ? "grab" : "";
    }
  }

  /* ------------------------- gestos en la mesa ------------------------- */

  function lockFor(seconds) {
    busyUntil = Math.max(busyUntil, performance.now() + seconds * 1000);
  }
  function isBusy() {
    return openingPending || performance.now() < busyUntil;
  }
  // Avisa a la interfaz qué gesto va y si ya se puede soltar; solo cuando cambia.
  function notifyGesture(kind = null, ready = false) {
    const key = `${kind}:${ready}`;
    if (gestureNotice === key) return;
    gestureNotice = key;
    onBookGesture(kind, ready);
  }

  function setOpenT(t) {
    openT = clamp(t, 0, 1);
    selected?.setOpen(openT);
  }

  // Ancho del libro en píxeles de pantalla: el recorrido completo de «abrir».
  const cornerVec = new THREE.Vector3();
  function projectedBookWidth() {
    if (!selected) return 300;
    const g = selected.group;
    g.updateMatrixWorld(true);
    const a = cornerVec.set(-BOOK_W / 2, 0.02, BOOK_T / 2).applyMatrix4(g.matrixWorld).project(camera).x;
    const b = cornerVec.set(BOOK_W / 2, 0.02, BOOK_T / 2).applyMatrix4(g.matrixWorld).project(camera).x;
    return Math.max(120, (Math.abs(b - a) / 2) * canvas.clientWidth);
  }

  /**
   * Punto del borde derecho de la tapa donde anclar la pista de arrastre: la
   * esquina inferior si cabe en pantalla y, si no (pantallas bajas, donde el
   * libro llega hasta el borde), un punto más arriba del mismo borde.
   */
  function projectCorner() {
    if (!selected || mode !== "desk") return null;
    const g = selected.group;
    g.updateMatrixWorld(true);
    const rect = canvas.getBoundingClientRect();
    let best = null;
    for (const yLocal of [0.06, BOOK_H * 0.3, BOOK_H * 0.55]) {
      cornerVec.set(BOOK_W / 2 - 0.04, yLocal, BOOK_T / 2 + 0.01).applyMatrix4(g.matrixWorld).project(camera);
      const point = {
        x: rect.left + ((cornerVec.x + 1) / 2) * rect.width,
        y: rect.top + ((1 - cornerVec.y) / 2) * rect.height,
        // La pista aparece solo cuando el gesto ya se acepta (libro quieto).
        visible: cornerVec.z < 1 && !deskDrag && !isBusy(),
      };
      best = point;
      const inside = point.x > rect.left + rect.width * 0.04 && point.x < rect.right - rect.width * 0.04 && point.y > rect.top + rect.height * 0.12 && point.y < rect.bottom - rect.height * 0.09;
      if (inside) break;
    }
    return best;
  }

  function stopHint() {
    clearTimeout(hintTimer);
    hintTimer = 0;
    hintTween?.cancel();
    hintTween = null;
  }

  // Invitación: cada pocos segundos la tapa se levanta un poco por la esquina.
  function scheduleHint(delay = 1.6) {
    stopHint();
    if (reduceMotion) return;
    hintTimer = setTimeout(() => {
      hintTimer = 0;
      if (mode !== "desk" || deskDrag || !selected) return;
      const lift = { t: openT };
      hintTween = tween(lift, { t: 0.09 }, {
        duration: 0.38,
        easing: ease.out,
        onUpdate: () => setOpenT(lift.t),
        onComplete: () => {
          hintTween = tween(lift, { t: 0 }, { duration: 0.5, easing: ease.outBack, onUpdate: () => setOpenT(lift.t), onComplete: () => scheduleHint(3.4) });
        },
      });
    }, delay * 1000);
  }

  function startDeskDrag(event) {
    stopHint();
    const g = selected.group;
    deskDrag = {
      mode,
      // Pose de partida (mesa o lectura): a ella vuelve un gesto cancelado.
      snapshot: {
        x: g.position.x, y: g.position.y, z: g.position.z,
        rx: g.rotation.x, ry: g.rotation.y, rz: g.rotation.z,
        scale: g.scale.x,
        open: openT,
        popup: selected.popupPivot.scale.y,
      },
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      lastTime: performance.now(),
      velocity: 0,
      intent: null,
      progress: 0,
      openDistance: projectedBookWidth() * 0.9,
      returnDistance: Math.max(160, canvas.clientHeight * 0.34),
    };
    canvas.style.cursor = "grabbing";
    canvas.dataset.dragging = "true";
  }

  function applyDeskDrag(progress) {
    const entry = selected;
    if (!entry) return;
    const g = entry.group;
    const snap = deskDrag.snapshot;
    if (deskDrag.intent === "open") {
      setOpenT(progress);
      g.position.x = snap.x + 0.12 * progress;
    } else if (deskDrag.intent === "close") {
      // En lectura: la tapa vuelve sobre las páginas y el pop-up se pliega.
      setOpenT(snap.open * (1 - progress));
      g.position.x = snap.x - 0.12 * progress;
      entry.popupPivot.scale.y = Math.max(0.0001, snap.popup * (1 - progress * 2));
    } else if (deskDrag.intent === "return") {
      // El libro se levanta y gira hacia su pose de pie mientras sube.
      const k = ease.out(progress);
      g.position.set(snap.x, snap.y + 0.55 * k, snap.z - 0.35 * k);
      g.rotation.x = snap.rx + (entry.home.rx - snap.rx) * k;
      g.rotation.y = snap.ry + (entry.home.ry - snap.ry) * k;
      g.rotation.z = snap.rz * (1 - k);
      g.scale.setScalar(snap.scale + (1 - snap.scale) * k);
      if (snap.open > 0) setOpenT(snap.open * (1 - 0.15 * k));
    } else {
      // Sin intención clara: el libro apenas acompaña al dedo y vuelve.
      g.rotation.z = snap.rz + progress * 0.04;
    }
  }

  function settleDeskBook(snap = null, duration = 0.42) {
    const entry = selected;
    if (!entry) return;
    const g = entry.group;
    const target = snap || { x: DESK_POSE.x, y: DESK_POSE.y, z: DESK_POSE.z, rx: DESK_POSE.rx, ry: DESK_POSE.ry, rz: DESK_POSE.rz, scale: DESK_BOOK.scale, open: 0, popup: entry.popupPivot.scale.y };
    lockFor(duration);
    const open = { t: openT };
    tween(open, { t: target.open }, { duration, easing: ease.outBack, onUpdate: () => setOpenT(open.t) });
    tween(g.position, { x: target.x, y: target.y, z: target.z }, { duration, easing: ease.outBack });
    tween(g.rotation, { x: target.rx, y: target.ry, z: target.rz }, { duration, easing: ease.out });
    tween(g.scale, { x: target.scale, y: target.scale, z: target.scale }, { duration, easing: ease.out });
    tween(entry.popupPivot.scale, { y: target.popup }, { duration, easing: ease.out });
  }

  function moveDeskDrag(event) {
    const drag = deskDrag;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.intent) {
      drag.intent = deskDragIntent(dx, dy, 8, drag.mode);
      if (!drag.intent) return;
      if (drag.intent !== "none") {
        setHoveredToy(null);
        feedback.clear();
      }
    }
    const now = performance.now();
    const step = drag.intent === "open" ? drag.lastX - event.clientX : drag.intent === "close" ? event.clientX - drag.lastX : drag.lastY - event.clientY;
    drag.velocity = step / Math.max(8, now - drag.lastTime);
    drag.lastTime = now;
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    if (drag.intent === "open") drag.progress = dragProgress(-dx, drag.openDistance);
    else if (drag.intent === "close") drag.progress = dragProgress(dx, drag.openDistance);
    else if (drag.intent === "return") drag.progress = dragProgress(-dy, drag.returnDistance);
    else drag.progress = dragProgress(Math.hypot(dx, dy), 400);
    applyDeskDrag(drag.progress);
    if (drag.intent !== "none") notifyGesture(drag.intent, shouldCompleteDrag(drag.progress, 0));
  }

  function endDeskDrag(cancelled = false) {
    const drag = deskDrag;
    deskDrag = null;
    delete canvas.dataset.dragging;
    canvas.style.cursor = hoveringDeskBook ? "grab" : "";
    if (!drag || !selected) {
      notifyGesture();
      return;
    }
    const recent = performance.now() - drag.lastTime < 120 ? drag.velocity : 0;
    const commit = !cancelled && drag.intent && drag.intent !== "none" && shouldCompleteDrag(drag.progress, recent);
    if (commit && drag.intent === "open") {
      // La apertura real la decide la app (carga la página); mientras tanto no
      // se aceptan más gestos y la tapa se queda donde la dejó el dedo.
      openingPending = true;
      notifyGesture("opening");
      onOpenBook(selected.book.id);
      return;
    }
    if (commit && drag.intent === "close") {
      notifyGesture();
      onCloseBook(selected.book.id);
      return;
    }
    if (commit && drag.intent === "return") {
      notifyGesture();
      onReturnBook(selected.book.id);
      return;
    }
    if (!cancelled && !drag.intent && drag.mode === "desk") {
      // Un toque sobre el libro cerrado también lo abre.
      openingPending = true;
      notifyGesture("opening");
      onOpenBook(selected.book.id);
      return;
    }
    notifyGesture();
    if (drag.intent) settleDeskBook(drag.snapshot);
    if (drag.mode === "desk") scheduleHint(2.4);
  }

  function updatePointer(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    pointerDirty = true;
  }

  const onPointerMove = (event) => {
    if (pointers.has(event.pointerId)) pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pinch && pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      setZoom(pinch.zoom * Math.hypot(a.x - b.x, a.y - b.y) / pinch.distance);
      return;
    }
    if (deskDrag && event.pointerId === deskDrag.pointerId) {
      moveDeskDrag(event);
      return;
    }
    if (cineDrag && event.pointerId === cineDrag.id) {
      const dx = event.clientX - cineDrag.x;
      const dy = event.clientY - cineDrag.y;
      if (Math.hypot(dx, dy) > 6) {
        cineDrag.moved = true;
        if (dragging) dragging.moved = true;
        canvas.dataset.dragging = "true";
      }
      if (cineDrag.moved) {
        cine.yaw = cineDrag.yaw - dx * 0.0055;
        cine.pitch = Math.max(-0.3, Math.min(0.4, cineDrag.pitch + dy * 0.0035));
        cine.userUntil = performance.now() + 5000;
      }
      return;
    }
    if (dragging && pointers.has(event.pointerId) && mode === "shelf") {
      const dx = event.clientX - dragging.x;
      if (Math.abs(dx) > 6) dragging.moved = true;
      if (dragging.moved) {
        const next = clampPan(dragging.pan - dx * dragScale(camPos.z, camera.fov, canvas.clientHeight, camera.zoom));
        const now = performance.now();
        dragging.velocity = (next - shelfPan.x) / Math.max(8, now - dragging.lastTime);
        dragging.lastTime = now;
        shelfPan.x = next;
        activateBook(bookEntries[bookIndexAt(next, books.length, bookSpacing)]);
        canvas.dataset.dragging = "true";
        return;
      }
    }
    updatePointer(event);
  };
  const onPointerDown = (event) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    if (isBusy()) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    canvas.setPointerCapture(event.pointerId);
    panTween?.cancel();
    clearTimeout(wheelTimer);
    if (pointers.size === 2) {
      if (deskDrag) endDeskDrag(true);
      const [a, b] = [...pointers.values()];
      pinch = { distance: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), zoom: zoomTarget };
      if (dragging) dragging.moved = true;
      return;
    }
    dragging = { x: event.clientX, pan: shelfPan.x, moved: false, velocity: 0, lastTime: performance.now() };
    updatePointer(event);
    pick();
    dragging.toy = hoveredToy;
    dragging.book = hoveredBook;
    if (cinema && mode === "reading") {
      // En cine, arrastrar orbita la cámara alrededor de la escena.
      cineDrag = { id: event.pointerId, x: event.clientX, y: event.clientY, yaw: cine.yaw, pitch: cine.pitch, moved: false };
      return;
    }
    if ((mode === "desk" || mode === "reading") && selected && !hoveredToy && hoveringDeskBook) startDeskDrag(event);
  };
  const onPointerUp = (event) => {
    if (!pointers.has(event.pointerId)) return;
    pointers.delete(event.pointerId);
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    if (pinch) {
      if (!pointers.size) { pinch = null; dragging = null; pointerDirty = false; delete canvas.dataset.dragging; }
      return;
    }
    if (deskDrag && event.pointerId === deskDrag.pointerId) {
      dragging = null;
      endDeskDrag(false);
      pointerDirty = true;
      return;
    }
    if (cineDrag && event.pointerId === cineDrag.id) {
      const orbited = cineDrag.moved;
      cineDrag = null;
      if (orbited) {
        dragging = null;
        delete canvas.dataset.dragging;
        pointerDirty = true;
        return;
      }
    }
    const wasDrag = dragging?.moved;
    const pressedToy = dragging?.toy;
    const pressedBook = dragging?.book;
    const velocity = performance.now() - (dragging?.lastTime || 0) < 100 ? dragging?.velocity || 0 : 0;
    dragging = null;
    delete canvas.dataset.dragging;
    if (wasDrag) {
      if (mode === "shelf") focusBook(bookEntries[settleBook(shelfPan.x, velocity, books.length, bookSpacing)].book.id);
      pointerDirty = false;
      return;
    }
    updatePointer(event);
    pick();
    if (pressedBook && hoveredBook === pressedBook && mode === "shelf" && !selected) onClickBook(pressedBook.book.id);
    else if (pressedToy && pressedToy === hoveredToy) {
      const state = toyState.get(pressedToy);
      popToy(pressedToy);
      if (state && !reduceMotion) tween(state, { spin: (state.spin || 0) + Math.PI * 2 }, { duration: 1.1, easing: ease.inOut });
      feedback.show(pressedToy, true);
      onClickToy(pressedToy.userData.pinId);
    }
  };
  const onPointerLeave = () => {
    if (pointers.size) return;
    pointer.set(-2, -2);
    pointerDirty = true;
    dragging = null;
  };
  const onPointerCancel = () => {
    if (deskDrag) endDeskDrag(true);
    for (const id of pointers.keys()) if (canvas.hasPointerCapture(id)) canvas.releasePointerCapture(id);
    pointers.clear(); pinch = null; dragging = null; cineDrag = null; pointerDirty = false;
    delete canvas.dataset.dragging;
    setHoveredToy(null); setHoveredBook(null);
    if (mode === "shelf") focusBook(bookEntries[bookIndexAt(shelfPan.x, books.length, bookSpacing)].book.id);
  };
  const onWheel = (event) => {
    event.preventDefault();
    if (deskDrag || isBusy()) return;
    if (mode === "shelf" && !event.ctrlKey && (event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY))) {
      panTween?.cancel();
      const delta = (event.deltaX || event.deltaY) * (event.deltaMode === 1 ? 16 : 1);
      shelfPan.x = clampPan(shelfPan.x + delta * dragScale(camPos.z, camera.fov, canvas.clientHeight, camera.zoom));
      activateBook(bookEntries[bookIndexAt(shelfPan.x, books.length, bookSpacing)]);
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => focusBook(bookEntries[bookIndexAt(shelfPan.x, books.length, bookSpacing)].book.id), 140);
    } else setZoom(zoomTarget * Math.exp(-event.deltaY * (event.deltaMode === 1 ? 0.025 : 0.002)));
  };
  canvas.addEventListener("pointermove", onPointerMove, { passive: true });
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointerleave", onPointerLeave);
  canvas.addEventListener("pointercancel", onPointerCancel);
  canvas.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("blur", onPointerCancel);
  // Escape cancela el gesto en curso y devuelve el libro a su pose.
  const onKeyDown = (event) => {
    if (event.key === "Escape" && deskDrag) {
      event.preventDefault();
      endDeskDrag(true);
    }
  };
  window.addEventListener("keydown", onKeyDown);

  // El desplazamiento se acota para que la fila de libros siempre llene el
  // ancho visible: sin paredes vacías a los lados en pantallas anchas. Cuando
  // caben todos, la repisa se queda centrada.
  function clampPan(x) {
    const half = ((books.length - 1) * bookSpacing) / 2 + bookSpacing / 2;
    const view = viewFor("shelf");
    const distance = Math.abs(view.pos[2] - (-0.17));
    const visibleHalf = Math.tan((camera.fov * Math.PI) / 360) * distance * camera.aspect / Math.max(0.8, zoomTarget);
    const limit = Math.max(0, half - visibleHalf);
    return Math.max(-limit, Math.min(limit, x));
  }

  /* ---------------------------- estados ----------------------------- */
  function viewFor(name) {
    return window.innerWidth / window.innerHeight < 0.85 ? CAM_PORTRAIT[name] : CAM[name];
  }

  function moveCamera(view, duration = 1.1) {
    tween(camPos, { x: view.pos[0], y: view.pos[1], z: view.pos[2] }, { duration: reduceMotion ? 0.01 : duration, easing: ease.inOut });
    tween(camLook, { x: view.look[0], y: view.look[1], z: view.look[2] }, { duration: reduceMotion ? 0.01 : duration, easing: ease.inOut });
  }

  function setWall(themeKey) {
    if (wallTheme === themeKey) return;
    wallTheme = themeKey;
    const theme = WALL_THEMES[themeKey] || WALL_THEMES.default;
    const nextTex = wallpaperTexture(theme);
    nextTex.repeat.set(7, 2.5);
    if (wallB.material.map !== wallA.material.map) wallB.material.map?.dispose();
    wallB.material.map = nextTex;
    wallB.material.needsUpdate = true;
    tween(wallB.material, { opacity: 1 }, {
      duration: reduceMotion ? 0.01 : 0.9,
      easing: ease.inOut,
      onComplete: () => {
        wallA.material.map?.dispose();
        wallA.material.map = nextTex;
        wallA.material.needsUpdate = true;
        wallB.material.opacity = 0;
      },
    });
    scene.background.set(theme.bg);
  }

  function selectBook(bookId, ownedPins = []) {
    const entry = bookEntries.find((e) => e.book.id === bookId);
    if (!entry || selected || isBusy()) return false;
    activateBook(entry);
    panTween?.cancel();
    feedback.clear();
    setZoom(1);
    selected = entry;
    setHoveredBook(null);
    mode = "desk";
    tween(spot, { intensity: 0 }, { duration: 0.3 });
    // Otros libros se quedan; el elegido vuela a la mesa.
    const g = entry.group;
    const d = reduceMotion ? 0.01 : 1.15;
    lockFor(d);
    tween(g.position, { x: entry.home.x, y: entry.home.y + 0.5, z: entry.home.z + 0.4 }, { duration: d * 0.3, easing: ease.out,
      onComplete: () => tween(g.position, { x: DESK_BOOK.x, y: 0.0, z: DESK_BOOK.z }, { duration: d * 0.7, easing: ease.inOut }) });
    tween(g.rotation, { x: -Math.PI / 2, y: 0, z: 0.02 }, { duration: d, easing: ease.inOut });
    tween(g.scale, { x: DESK_BOOK.scale, y: DESK_BOOK.scale, z: DESK_BOOK.scale }, { duration: d, easing: ease.inOut });
    moveCamera(viewFor("desk"), d);
    setWall(bookId);
    spawnDeskToys(entry.book, ownedPins);
    spot.position.set(DESK_BOOK.x, 2.8, 1.4);
    spot.target.position.set(DESK_BOOK.x, 0, DESK_BOOK.z - BOOK_H);
    tween(spot, { intensity: 5 }, { duration: 0.6, delay: d * 0.6 });
    scheduleHint(d + 0.9);
    return true;
  }

  function deselect() {
    if (!selected) return;
    const entry = selected;
    stopHint();
    if (deskDrag) endDeskDrag(true);
    openingPending = false;
    notifyGesture();
    closeBook(true);
    clearPageDiorama();
    selected = null;
    mode = "shelf";
    setZoom(1);
    clearDeskToys();
    const g = entry.group;
    const d = reduceMotion ? 0.01 : 1.05;
    lockFor(d);
    tween(g.position, { x: entry.home.x, y: entry.home.y + 0.4, z: entry.home.z + 0.5 }, { duration: d * 0.6, easing: ease.inOut });
    tween(g.position, { x: entry.home.x, y: entry.home.y, z: entry.home.z }, { duration: d * 0.4, delay: d * 0.6, easing: ease.outBack });
    tween(g.rotation, { x: entry.home.rx, y: entry.home.ry, z: 0 }, { duration: d, easing: ease.inOut });
    tween(g.scale, { x: 1, y: 1, z: 1 }, { duration: d, easing: ease.inOut });
    moveCamera(viewFor("shelf"), d);
    setWall(entry.book.id);
    focusBook(entry.book.id);
    tween(spot, { intensity: 0 }, { duration: 0.4 });
  }

  function openBook() {
    if (!selected || mode === "reading") return;
    mode = "reading";
    stopHint();
    if (deskDrag) endDeskDrag(true);
    openingPending = false;
    notifyGesture();
    feedback.clear();
    setZoom(1);
    const entry = selected;
    // Si venía de un arrastre, la tapa sigue desde donde quedó.
    const d = (reduceMotion ? 0.01 : 1.0) * (1 - openT * 0.6);
    lockFor(d);
    const open = { t: openT };
    tween(open, { t: 1 }, { duration: d, easing: ease.inOut, onUpdate: () => setOpenT(open.t) });
    tween(entry.group.position, { x: DESK_BOOK.x + 0.12, y: 0, z: DESK_BOOK.z }, { duration: d, easing: ease.inOut });
    tween(entry.group.rotation, { x: DESK_POSE.rx, y: DESK_POSE.ry, z: DESK_POSE.rz }, { duration: d, easing: ease.inOut });
    tween(entry.group.scale, { x: DESK_BOOK.scale, y: DESK_BOOK.scale, z: DESK_BOOK.scale }, { duration: d, easing: ease.inOut });
    moveCamera(viewFor("reading"), d);
    after(d * 0.7, () => {
      entry.popupPivot.visible = true;
      tween(entry.popupPivot.scale, { y: 1 }, { duration: reduceMotion ? 0.01 : 0.6, easing: ease.outBack });
    });
    deskToys.forEach((holder, i) => {
      const [x, z] = DESK_SLOTS[i];
      tween(holder.position, { x: x * 1.25, z: z + 0.12 }, { duration: d, easing: ease.inOut });
    });
  }

  function closeBook(instant = false) {
    if (!selected) return;
    if (cinema) leaveCinema();
    if (deskDrag && !instant) endDeskDrag(true);
    const entry = selected;
    const wasReading = mode === "reading";
    if (mode === "reading") mode = "desk";
    const d = instant || reduceMotion ? 0.01 : 0.8;
    if (!instant) lockFor(d);
    if (instant) setOpenT(0);
    if (wasReading) {
      tween(entry.popupPivot.scale, { y: 0.0001 }, { duration: d * 0.4, easing: ease.in, onComplete: () => { entry.popupPivot.visible = false; } });
      const open = { t: openT };
      tween(open, { t: 0 }, { duration: d * Math.max(0.35, openT), delay: d * 0.25, easing: ease.inOut, onUpdate: () => setOpenT(open.t) });
      tween(entry.group.position, { x: DESK_BOOK.x }, { duration: d, easing: ease.inOut });
      if (!instant) moveCamera(viewFor("desk"), d);
      if (!instant) scheduleHint(d + 1.2);
      deskToys.forEach((holder, i) => {
        const [x, z] = DESK_SLOTS[i];
        tween(holder.position, { x, z }, { duration: d, easing: ease.inOut });
      });
    }
  }

  function showPage(texture) {
    if (!selected) return;
    const entry = selected;
    const pivot = entry.popupPivot;
    const d = reduceMotion ? 0.01 : 0.28;
    const leaf = { t: 0 };
    entry.setTurn(0);
    tween(leaf, { t: 1 }, {
      duration: reduceMotion ? 0.01 : 0.74,
      easing: ease.inOut,
      onUpdate: () => entry.setTurn(leaf.t),
      onComplete: () => entry.endTurn(),
    });
    tween(pivot.scale, { y: 0.0001 }, {
      duration: d,
      easing: ease.in,
      onComplete: () => {
        entry.setPopupTexture(texture);
        pivot.visible = true;
        tween(pivot.scale, { y: 1 }, { duration: reduceMotion ? 0.01 : 0.55, easing: ease.outBack });
      },
    });
  }

  function setPopupTextureNow(texture) {
    selected?.setPopupTexture(texture);
  }

  function setStoryPage(texture, page) {
    selected?.setStoryTexture(texture);
    if (selected) selected.storyTexture = texture;
    updatePageDiorama(page);
  }

  /** Resalta en la página del libro la palabra que está sonando (−1 = ninguna). */
  function setStoryWord(index) {
    if (selected?.storyTexture) highlightStoryWord(selected.storyTexture, index);
  }

  const tmpVec = new THREE.Vector3();
  function projectPopup(u, v) {
    if (!selected || mode !== "reading") return null;
    const entry = selected;
    tmpVec.set((u - 0.5) * entry.popupW, (1 - v) * entry.popupH, 0.002);
    entry.popup.localToWorld(tmpVec);
    tmpVec.project(camera);
    const rect = canvas.getBoundingClientRect();
    return {
      x: rect.left + ((tmpVec.x + 1) / 2) * rect.width,
      y: rect.top + ((1 - tmpVec.y) / 2) * rect.height,
      visible: tmpVec.z < 1 && entry.popupPivot.visible && entry.popupPivot.scale.y > 0.9,
    };
  }

  function focusBook(bookId) {
    const entry = bookEntries.find((e) => e.book.id === bookId);
    if (!entry || mode !== "shelf") return;
    panTween = tween(shelfPan, { x: clampPan(entry.home.x) }, { duration: reduceMotion ? 0.01 : 0.45, easing: ease.out });
    activateBook(entry);
    setHoveredBook(entry);
  }

  function panShelf(direction) {
    const index = bookIndexAt(shelfPan.x, books.length, bookSpacing) + direction;
    focusBook(bookEntries[bookIndexAt(bookPositionAt(index, books.length, bookSpacing), books.length, bookSpacing)].book.id);
  }

  function setZoom(value) {
    if (deskDrag) endDeskDrag(true);
    zoomTarget = clampZoom(value);
    onZoom(Math.round(zoomTarget * 100));
  }

  /* ------------------------------ bucle ------------------------------ */
  let frame = 0;
  let last = performance.now();
  let running = true;
  let hidden = false;
  const clock = { t: 0 };

  function resize() {
    if (deskDrag) endDeskDrag(true);
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    shelfPan.x = clampPan(shelfPan.x);
    moveCamera(viewFor(mode), 0.4);
  }
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  window.addEventListener("resize", resize);
  const onVisibility = () => {
    hidden = document.hidden;
    if (!hidden) {
      last = performance.now();
      loop();
    }
  };
  document.addEventListener("visibilitychange", onVisibility);

  function loop() {
    if (!running || hidden) return;
    frame = requestAnimationFrame(loop);
    const now = performance.now();
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    clock.t += dt;
    updateTweens(now / 1000);
    pick();

    // Vaivén de las figuras y salto/wiggle al pasar el cursor.
    toyGroups.forEach((holder) => {
      const state = toyState.get(holder);
      if (!state) return;
      const toy = holder.children[0];
      if (!toy) return;
      const idle = reduceMotion ? 0 : Math.sin(clock.t * 1.6 + state.phase) * 0.006;
      toy.position.y = idle + state.hop;
      toy.rotation.z = state.wiggle;
      toy.rotation.y = (state.spin || 0) + (reduceMotion ? 0 : Math.sin(clock.t * 0.9 + state.phase) * 0.1);
      if (!holder.userData.movingParts) {
        // Partes articuladas que declara cada figura (ver toys/*.js): su pose
        // de reposo se guarda una vez y se restaura cada fotograma; los
        // movimientos de abajo y las acciones (applyAct) sólo suman sobre ella.
        const parts = []; toy.traverse(obj => {
          const u = obj.userData;
          if (u.flutter || u.sway || u.head || u.arm || u.wing || u.tail || u.ear || u.leg || u.spray) {
            u.restRotation = obj.rotation.clone();
            u.restScale = obj.scale.clone();
            parts.push(obj);
          }
        });
        holder.userData.movingParts = parts;
      }
      holder.userData.movingParts.forEach(part => {
        part.rotation.copy(part.userData.restRotation);
        part.scale.copy(part.userData.restScale);
        if (reduceMotion) return;
        if (part.userData.flutter) part.rotation.y += Math.sin(clock.t * 9 + state.phase) * 0.6 * part.userData.flutter;
        if (part.userData.sway) part.rotation.z += Math.sin(clock.t * 3 + state.phase) * 0.13 * part.userData.sway;
        // Las colas se mueven solas, despacio; las orejas apenas.
        if (part.userData.tail) part.rotation[part.userData.tail === "x" ? "x" : "y"] += Math.sin(clock.t * 2.4 + state.phase) * 0.1;
        if (part.userData.ear && !part.userData.sway) part.rotation.z += Math.sin(clock.t * 1.7 + state.phase + part.userData.ear) * 0.04 * part.userData.ear;
      });
      if (!reduceMotion) applyBlink(holder, clock.t);
      applyGlow(holder, dt);
      // El protagonista del libro enfocado en la repisa se mece un poco más.
      if (holder.userData.heroOf && !reduceMotion) {
        const focused = holder.userData.focused;
        toy.rotation.y += focused ? Math.sin(clock.t * 2.4 + state.phase) * 0.22 : 0;
        toy.position.y += focused ? Math.abs(Math.sin(clock.t * 3.1 + state.phase)) * 0.012 : 0;
      }
    });

    updateWork(dt);
    pageActors.forEach((actor) => {
      if (reduceMotion) return;
      const phase = actor.userData.phase || 0;
      const baseY = actor.userData.baseY ?? actor.position.y;
      if (actor.userData.storySpark) {
        actor.position.y = baseY + Math.sin(clock.t * 2.2 + phase) * 0.012;
        actor.scale.setScalar(0.75 + Math.sin(clock.t * 3.1 + phase) * 0.22);
        return;
      }
      if (!actor.userData.storyActor) return;
      updateTravel(actor, dt);
      const faceTurn = actor.userData.faceTurn || 0;
      const baseRotY = actor.userData.baseRotY || 0;
      const isSpeaker = speakingId && actor.userData.storyActor === speakingId;
      const listening = speakingId && !isSpeaker && actor.userData.isCast;
      actor.position.y = baseY + Math.sin(clock.t * 1.8 + phase) * 0.009;
      // Respiración: el cuerpo entero se hincha apenas.
      const body = actor.children[0];
      if (body) body.scale.y = 1 + Math.sin(clock.t * 1.4 + phase) * 0.012;
      const head = findPart(actor, "head");
      if (isSpeaker) {
        // Habla: pequeño salto y cabeceo por palabra, que se apaga solo, y
        // las manos acompañan (gesticula) mientras dura la frase.
        talkPulse = Math.max(0, talkPulse - dt * 4.5);
        actor.position.y += talkPulse * 0.014;
        actor.rotation.y = baseRotY + faceTurn + Math.sin(clock.t * 2.2 + phase) * 0.08;
        actor.rotation.z = Math.sin(clock.t * 1.25 + phase) * 0.025 + talkPulse * 0.06;
        actor.rotation.x = -talkPulse * 0.12;
        if (head) {
          head.scale.setScalar(1 + talkPulse * 0.09);
          head.rotation.y += Math.sin(clock.t * 1.7 + phase) * 0.08;
          head.rotation.z += talkPulse * 0.05;
        }
        findParts(actor, "arm").forEach((arm) => {
          const side = arm.userData.arm;
          arm.rotation.z += side * (0.22 + talkPulse * 0.35) + Math.sin(clock.t * 2.6 + phase + side) * 0.1;
          arm.rotation.x -= talkPulse * 0.3 + Math.max(0, Math.sin(clock.t * 1.9 + phase - side)) * 0.12;
        });
      } else if (listening) {
        // Los demás se giran hacia quien habla (la cabeza va primero) y se mecen despacio.
        const speaker = pageActorById.get(speakingId);
        const toward = speaker ? Math.atan2(speaker.position.x - actor.position.x, 0.3) * 0.6 : 0;
        actor.rotation.y += (toward + faceTurn - actor.rotation.y) * Math.min(1, dt * 3);
        actor.rotation.z = Math.sin(clock.t * 1.6 + phase) * 0.04;
        if (head) head.rotation.y += toward * 0.45;
      } else {
        actor.rotation.y = baseRotY + faceTurn + Math.sin(clock.t * 0.85 + phase) * 0.16;
        actor.rotation.z = Math.sin(clock.t * 1.25 + phase) * 0.025;
      }
      applyAct(actor, clock.t);
    });

    // Los libros respiran apenas en la repisa; el seleccionado conserva la
    // animación de elevación y luz sin competir con el resto de la escena.
    if (mode === "shelf" && !reduceMotion) {
      bookEntries.forEach((entry) => {
        if (entry !== hoveredBook) entry.group.rotation.z = Math.sin(clock.t * 0.72 + entry.phase) * 0.006;
      });
    }

    // Luz de la lámpara con un parpadeo casi imperceptible.
    lampLight.intensity = 1.35 + Math.sin(clock.t * 7.3) * 0.03 + Math.sin(clock.t * 2.1) * 0.03;
    ambientDust.rotation.y = Math.sin(clock.t * 0.12) * 0.05;
    ambientDust.position.y = Math.sin(clock.t * 0.28) * 0.025;

    zoom.value += (zoomTarget - zoom.value) * (reduceMotion ? 1 : 1 - Math.exp(-dt * 12));
    if (cinema && mode === "reading" && updateCinemaCamera(dt)) {
      // En cine la rueda y el pellizco acercan la cámara, no la lente.
      camera.zoom = 1;
    } else {
      if (mode === "reading") resetBackdropDrift();
      const panX = mode === "shelf" ? shelfPan.x : 0;
      camera.position.set(camPos.x + panX, camPos.y, camPos.z);
      camera.lookAt(camLook.x + panX, camLook.y, camLook.z);
      camera.zoom = zoom.value;
    }
    camera.updateProjectionMatrix();

    feedback.update(dt);
    if (cinema && mode === "reading" && ensureComposer()) {
      if (composerW !== canvas.clientWidth || composerH !== canvas.clientHeight) {
        composerW = canvas.clientWidth;
        composerH = canvas.clientHeight;
        composer.setSize(composerW, composerH);
      }
      if (bokehPass) bokehPass.uniforms.focus.value = camera.position.distanceTo(cine.focus);
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
    onFrame();
  }
  activateBook(bookEntries.find(entry => entry.book.id === initialBookId) || bookEntries[0]);
  loop();

  function dispose() {
    stopHint();
    environment.dispose();
    running = false;
    cancelAnimationFrame(frame);
    cancelAllTweens();
    clearPageDiorama();
    feedback.dispose();
    clearTimeout(wheelTimer);
    window.removeEventListener("resize", resize);
    resizeObserver.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointerup", onPointerUp);
    canvas.removeEventListener("pointerleave", onPointerLeave);
    canvas.removeEventListener("pointercancel", onPointerCancel);
    canvas.removeEventListener("wheel", onWheel);
    window.removeEventListener("blur", onPointerCancel);
    window.removeEventListener("keydown", onKeyDown);
    scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose?.();
      const materials = Array.isArray(obj.material) ? obj.material : obj.material ? [obj.material] : [];
      materials.forEach((m) => {
        m.map?.dispose?.();
        m.dispose?.();
      });
    });
    renderer.dispose();
  }

  const api = {
    selectBook,
    deselect,
    openBook,
    closeBook,
    showPage,
    setPopupTextureNow,
    setStoryPage,
    playAct,
    travelTo,
    sceneEvent,
    isWorking,
    setCinema,
    setStoryWord,
    setSpeaking,
    wordTick,
    nameActor,
    projectPopup,
    projectCorner,
    /** La app no pudo abrir el cuento: la tapa vuelve a cerrarse. */
    cancelOpenRequest() {
      openingPending = false;
      notifyGesture();
      if (selected && mode === "desk") {
        settleDeskBook();
        scheduleHint(2);
      }
    },
    focusBook,
    panShelf,
    setZoom,
    setCollected,
    setWall,
    resize,
    dispose,
    get mode() {
      return mode;
    },
    debug() {
      return {
        mode,
        focus: focusedId,
        theme: wallTheme,
        zoom: camera.zoom,
        label: feedback.label,
        actors: toyGroups.filter(holder => holder.visible).map(holder => {
          const p = new THREE.Vector3(); holder.getWorldPosition(p); p.y += 0.13; p.project(camera);
          return { id: holder.userData.toyId, story: Boolean(holder.userData.storyActor), spin: toyState.get(holder)?.spin || 0,
            x: canvas.getBoundingClientRect().left + (p.x + 1) / 2 * canvas.clientWidth,
            y: canvas.getBoundingClientRect().top + (1 - p.y) / 2 * canvas.clientHeight };
        }),
        selected: selected?.book.id || null,
        book: selected ? { p: selected.group.position.toArray(), r: selected.group.rotation.toArray().slice(0, 3), s: selected.group.scale.x } : null,
        open: openT,
        drag: deskDrag ? { intent: deskDrag.intent, progress: deskDrag.progress } : null,
        work: work
          ? {
              phase: work.phase,
              placed: work.placed,
              carried: work.carried.length,
              traveling: Boolean(work.holder?.userData.travel),
              x: work.holder ? Number(work.holder.userData.baseX.toFixed(3)) : null,
              visible: work.pieces.filter((piece) => piece.object.visible).length,
              atSite: work.pieces.filter((piece) => piece.object.parent === work.site && piece.object.visible).length,
            }
          : null,
        busy: isBusy(),
        cam: [camPos.toArray(), camLook.toArray(), shelfPan.x],
      };
    },
  };
  if (import.meta.env?.DEV && typeof window !== "undefined") window.__nidoStage = api;
  return api;
}

/* --------------------------- decoración ---------------------------- */

function buildLamp(scene) {
  const g = new THREE.Group();
  g.position.set(-1.72, 0, 1.0);
  const darkWood = mat("#3d2a1e", { rough: 0.55 });
  const brass = mat("#c9a35a", { rough: 0.35, metal: 0.6 });
  const shade = new THREE.MeshStandardMaterial({ color: "#fff4dc", roughness: 0.9, side: THREE.DoubleSide, emissive: new THREE.Color("#ffd9a0"), emissiveIntensity: 0.35 });
  g.add(cyl(0.2, 0.22, 0.05, darkWood, { y: 0.025 }));
  g.add(cyl(0.06, 0.08, 0.04, brass, { y: 0.07 }));
  g.add(cyl(0.016, 0.016, 0.58, brass, { y: 0.36 }));
  const cover = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.22, 0.24, 32, 1, true), shade);
  cover.position.set(0, 0.8, 0);
  cover.castShadow = true;
  g.add(cover);
  g.add(blob(0.035, mat("#fff6dd", { emissive: "#ffe6b0", emissiveIntensity: 1.2 }), { y: 0.74 }));
  scene.add(g);
}

function buildDeskProps(scene) {
  // Pila de libros a la izquierda
  const stack = new THREE.Group();
  stack.position.set(-2.1, 0, 1.9);
  ["#5b8fb5", "#d9a05a", "#c9524f"].forEach((color, i) => {
    const b = box(0.44, 0.05, 0.32, mat(color, { rough: 0.6 }), { y: 0.025 + i * 0.052, ry: (i - 1) * 0.12 });
    stack.add(b);
    stack.add(box(0.4, 0.04, 0.29, mat("#f3e7cf", { rough: 0.95 }), { y: 0.025 + i * 0.052, ry: (i - 1) * 0.12 }));
  });
  scene.add(stack);

  // Cubos con letras (colores sólidos) a la derecha
  const blocks = new THREE.Group();
  blocks.position.set(1.95, 0, 1.05);
  [["#f2e6d2", 0, 0, 0.3], ["#f2e6d2", 0.16, 0.06, -0.4], ["#f2e6d2", 0.02, 0.135, 0.9]].forEach(([c, x, y, ry], i) => {
    const cube = box(0.13, 0.13, 0.13, mat(c, { rough: 0.7 }), { x, y: y + 0.065, z: i * 0.05, ry });
    blocks.add(cube);
    const face = box(0.1, 0.1, 0.004, mat(["#e0574a", "#3f7fb5", "#4fae5e"][i], { rough: 0.6 }), { x, y: y + 0.065, z: i * 0.05 + 0.067, ry });
    blocks.add(face);
  });
  scene.add(blocks);

  // Pelota
  const ball = blob(0.11, mat("#e0574a", { rough: 0.45 }), { x: 2.35, y: 0.11, z: 1.75 });
  scene.add(ball);
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.108, 0.02, 12, 40), mat("#f7f1e6", { rough: 0.5 }));
  band.position.set(2.35, 0.11, 1.75);
  band.rotation.x = Math.PI / 2 + 0.3;
  band.castShadow = true;
  scene.add(band);
  const band2 = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.014, 12, 40), mat("#3f7fb5", { rough: 0.5 }));
  band2.position.set(2.35, 0.11, 1.75);
  band2.rotation.x = Math.PI / 2 + 0.3;
  band2.rotation.z = 0.5;
  scene.add(band2);

  // Vaso con crayones
  const cup = new THREE.Group();
  cup.position.set(-2.45, 0, 1.15);
  cup.add(cyl(0.09, 0.08, 0.16, mat("#f3ebdd", { rough: 0.7 }), { y: 0.08 }));
  cup.add(cyl(0.092, 0.092, 0.03, mat("#4f8fbf", { rough: 0.6 }), { y: 0.1 }));
  ["#e0574a", "#f2c14e", "#4fae5e", "#3f7fb5", "#f0893f"].forEach((c, i) => {
    const a = (i / 5) * Math.PI * 2;
    cup.add(cyl(0.012, 0.012, 0.26, mat(c, { rough: 0.6 }), { x: Math.cos(a) * 0.04, y: 0.2, z: Math.sin(a) * 0.04, rz: Math.cos(a) * 0.12, rx: Math.sin(a) * 0.12 }));
    cup.add(cone(0.012, 0.03, mat(c, { rough: 0.6 }), { x: Math.cos(a) * 0.055, y: 0.34, z: Math.sin(a) * 0.055 }));
  });
  scene.add(cup);
}
