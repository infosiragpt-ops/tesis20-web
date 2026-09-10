// Escenario 3D de la biblioteca: la sala con su pared, la repisa de figuras,
// la balda de libros, la mesa con la lámpara, y la cámara que baja a la mesa
// cuando se elige un cuento. Toda la interfaz de texto vive en HTML encima.

import * as THREE from "three";
import { tween, ease, after, updateTweens, cancelAllTweens } from "./tween.js";
import {
  WALL_THEMES,
  wallpaperTexture,
  woodTexture,
  paperTexture,
  pagesEdgeTexture,
  spineTexture,
  flatTexture,
  observatoryWindowTexture,
} from "./textures.js";
import { createBook3D, BOOK_W, BOOK_H, BOOK_T } from "./book3d.js";
import { buildToy, ghostify, PIN_TOY, hasToy } from "./toys/index.js";
import { mat, blob, box, cyl, cone } from "./toys/_shared.js";

const SHELF_TOYS = ["buho", "luna", "cometa", "oveja", "arbol", "ballena", "frasco", "barco", "tren", "estrella"];

const CAM = {
  shelf: { pos: [0, 1.42, 3.35], look: [0, 1.25, 0] },
  desk: { pos: [0, 2.1, 3.0], look: [0, 0.3, 0.55] },
  reading: { pos: [-0.14, 1.28, 2.1], look: [-0.14, 0.36, 0.6] },
};

// En pantallas verticales la cámara se aleja y se centra en el pop-up.
const CAM_PORTRAIT = {
  shelf: { pos: [0, 1.38, 3.45], look: [0, 1.27, 0] },
  desk: { pos: [0, 2.8, 4.2], look: [0, 0.2, 0.72] },
  // La distancia conserva las dos páginas completas dentro del ancho estrecho
  // del teléfono; la textura móvil aporta el tamaño extra de lectura.
  reading: { pos: [-0.33, 2.58, 4.25], look: [-0.33, 0.3, 0.92] },
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
  pipo: "cerdito",
  lolo: "cerdito",
  tito: "cerdito",
  paja: "casa",
  madera: "casa",
  ladrillos: "casa",
  arboles: "arbol",
  agua: "bufeo",
  arroyo: "rana",
  boleto: "tren",
  canoa: "barco",
  cueva: "pez",
  dunas: "cactus",
  "estrella-mar": "estrella",
  estrellas: "estrella",
  flores: "picaflor",
  "flor-cristal": "estrella",
  hojas: "arbol",
  luciernagas: "frasco",
  mar: "ballena",
  montanas: "vicuna",
  nenufar: "rana",
  niebla: "luna",
  nubes: "luna",
  orquidea: "picaflor",
  pasto: "oveja",
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
    onClickBook = () => {},
    onHoverToy = () => {},
    onClickToy = () => {},
    onFrame = () => {},
    coverTexture, // (book) => Promise<Texture>
    emblemTexture, // (pinId) => Promise<Texture>
  } = options;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  const isMobile = window.matchMedia("(max-width: 760px)").matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.6 : 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(WALL_THEMES.default.bg);

  const camera = new THREE.PerspectiveCamera(36, 1, 0.05, 40);
  const startPortrait = (canvas.clientWidth || window.innerWidth) / (canvas.clientHeight || window.innerHeight) < 0.85;
  const camPos = new THREE.Vector3(...(startPortrait ? CAM_PORTRAIT : CAM).shelf.pos);
  const camLook = new THREE.Vector3(...(startPortrait ? CAM_PORTRAIT : CAM).shelf.look);
  const shelfPan = { x: 0 };

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

  // Ventana central del observatorio: aporta una profundidad real y una luz
  // nocturna coherente sin convertir el fondo completo en una imagen plana.
  const windowGroup = new THREE.Group();
  windowGroup.position.set(0, 2.12, -0.41);
  const nightView = new THREE.Mesh(
    new THREE.PlaneGeometry(2.45, 1.55),
    new THREE.MeshStandardMaterial({ map: observatoryWindowTexture(), roughness: 0.88, emissive: "#0d2348", emissiveIntensity: 0.24 }),
  );
  windowGroup.add(nightView);
  const frameMat = mat("#5a3824", { rough: 0.48, metal: 0.04 });
  windowGroup.add(box(2.62, 0.1, 0.08, frameMat, { y: 0.81, z: 0.025 }));
  windowGroup.add(box(2.62, 0.1, 0.08, frameMat, { y: -0.81, z: 0.025 }));
  windowGroup.add(box(0.1, 1.7, 0.08, frameMat, { x: -1.28, z: 0.025 }));
  windowGroup.add(box(0.1, 1.7, 0.08, frameMat, { x: 1.28, z: 0.025 }));
  windowGroup.add(box(0.055, 1.58, 0.055, frameMat, { z: 0.04 }));
  windowGroup.add(box(2.5, 0.055, 0.055, frameMat, { z: 0.04 }));
  scene.add(windowGroup);

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

  SHELF_TOYS.forEach((id, i) => {
    const holder = new THREE.Group();
    const x = (i - (SHELF_TOYS.length - 1) / 2) * 0.5;
    holder.position.set(x, 1.84, -0.27);
    holder.scale.setScalar(1.16);
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

  const deskToys = [];
  let pageActors = [];

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
      const remove = () => {
        scene.remove(holder);
        const idx = toyGroups.indexOf(holder);
        if (idx >= 0) toyGroups.splice(idx, 1);
        toyState.delete(holder);
      };
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
    pageActors.forEach((holder) => {
      holder.parent?.remove(holder);
      holder.traverse((obj) => {
        obj.geometry?.dispose?.();
        const materials = Array.isArray(obj.material) ? obj.material : obj.material ? [obj.material] : [];
        materials.forEach((material) => material.dispose?.());
      });
    });
    pageActors = [];
  }

  function updatePageDiorama(page) {
    if (!selected?.dioramaRoot || !page) return;
    clearPageDiorama();

    const candidates = [...(page.cast || []), ...(page.props || [])]
      .map((id) => (hasToy(id) ? id : STORY_PROP_TO_TOY[id]))
      .filter((id, index, list) => id && hasToy(id) && list.indexOf(id) === index)
      .slice(0, 2);

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
    platform.position.set(0, 0.012, 0.018);
    platform.scale.set(1.25, 1, 0.58);
    selected.dioramaRoot.add(platform);
    pageActors.push(platform);

    candidates.forEach((id, index) => {
      const holder = new THREE.Group();
      const actor = buildToy(id);
      const count = candidates.length;
      const target = count === 1 ? 0.62 : 0.48;
      holder.position.set((index - (count - 1) / 2) * 0.12, 0.018, 0.032 + index * 0.004);
      holder.scale.setScalar(target);
      holder.userData.baseY = holder.position.y;
      holder.userData.phase = index * 1.7 + page.t.length * 0.03;
      holder.userData.storyActor = id;
      holder.add(actor);
      selected.dioramaRoot.add(holder);
      pageActors.push(holder);
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
    if (entry) liftBook(entry, true);
    onHoverBook(entry ? entry.book.id : null);
    canvas.style.cursor = entry || hoveredToy ? "pointer" : "";
  }

  function setHoveredToy(holder) {
    if (hoveredToy === holder) return;
    hoveredToy = holder;
    if (holder) {
      popToy(holder);
      onHoverToy(holder.userData.pinId);
    } else {
      onHoverToy(null);
    }
    canvas.style.cursor = holder || hoveredBook ? "pointer" : "";
  }

  function pick() {
    if (!pointerDirty) return;
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
    const hitToys = raycaster.intersectObjects(toyGroups, true);
    if (hitToys.length) {
      let obj = hitToys[0].object;
      while (obj && !obj.userData.toyId) obj = obj.parent;
      setHoveredToy(obj || null);
    } else {
      setHoveredToy(null);
    }
  }

  function updatePointer(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    pointerDirty = true;
  }

  const onPointerMove = (event) => {
    if (dragging && mode === "shelf") {
      const dx = event.clientX - dragging.x;
      if (Math.abs(dx) > 6) dragging.moved = true;
      shelfPan.x = clampPan(dragging.pan - dx * 0.0045);
    }
    updatePointer(event);
  };
  const onPointerDown = (event) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    dragging = { x: event.clientX, pan: shelfPan.x, moved: false };
    updatePointer(event);
    pick();
  };
  const onPointerUp = (event) => {
    const wasDrag = dragging?.moved;
    dragging = null;
    if (wasDrag) return;
    updatePointer(event);
    pick();
    if (hoveredBook && mode === "shelf" && !selected) onClickBook(hoveredBook.book.id);
    else if (hoveredToy) onClickToy(hoveredToy.userData.pinId);
  };
  const onPointerLeave = () => {
    pointer.set(-2, -2);
    pointerDirty = true;
    dragging = null;
  };
  canvas.addEventListener("pointermove", onPointerMove, { passive: true });
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointerleave", onPointerLeave);

  function clampPan(x) {
    const half = ((books.length - 1) * bookSpacing) / 2;
    return Math.max(-half, Math.min(half, x));
  }

  /* ---------------------------- estados ----------------------------- */
  function viewFor(name) {
    return camera.aspect < 0.85 ? CAM_PORTRAIT[name] : CAM[name];
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
    wallB.material.map?.dispose();
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
    if (!entry || selected) return;
    selected = entry;
    setHoveredBook(null);
    mode = "desk";
    tween(spot, { intensity: 0 }, { duration: 0.3 });
    // Otros libros se quedan; el elegido vuela a la mesa.
    const g = entry.group;
    const d = reduceMotion ? 0.01 : 1.15;
    tween(g.position, { x: entry.home.x, y: entry.home.y + 0.5, z: entry.home.z + 0.4 }, { duration: d * 0.35, easing: ease.out });
    tween(g.position, { x: DESK_BOOK.x, y: 0.0, z: DESK_BOOK.z }, { duration: d * 0.75, delay: d * 0.3, easing: ease.inOut });
    tween(g.rotation, { x: -Math.PI / 2, y: 0, z: 0.02 }, { duration: d, easing: ease.inOut });
    tween(g.scale, { x: DESK_BOOK.scale, y: DESK_BOOK.scale, z: DESK_BOOK.scale }, { duration: d, easing: ease.inOut });
    moveCamera(viewFor("desk"), d);
    setWall(bookId);
    spawnDeskToys(entry.book, ownedPins);
    spot.position.set(DESK_BOOK.x, 2.8, 1.4);
    spot.target.position.set(DESK_BOOK.x, 0, DESK_BOOK.z - BOOK_H);
    tween(spot, { intensity: 5 }, { duration: 0.6, delay: d * 0.6 });
  }

  function deselect() {
    if (!selected) return;
    const entry = selected;
    selected = null;
    mode = "shelf";
    closeBook(true);
    clearDeskToys();
    const g = entry.group;
    const d = reduceMotion ? 0.01 : 1.05;
    tween(g.position, { x: entry.home.x, y: entry.home.y + 0.4, z: entry.home.z + 0.5 }, { duration: d * 0.6, easing: ease.inOut });
    tween(g.position, { x: entry.home.x, y: entry.home.y, z: entry.home.z }, { duration: d * 0.4, delay: d * 0.6, easing: ease.outBack });
    tween(g.rotation, { x: entry.home.rx, y: entry.home.ry, z: 0 }, { duration: d, easing: ease.inOut });
    tween(g.scale, { x: 1, y: 1, z: 1 }, { duration: d, easing: ease.inOut });
    moveCamera(viewFor("shelf"), d);
    setWall("default");
    tween(spot, { intensity: 0 }, { duration: 0.4 });
  }

  function openBook() {
    if (!selected || mode === "reading") return;
    mode = "reading";
    const entry = selected;
    const d = reduceMotion ? 0.01 : 1.0;
    const open = { t: 0 };
    tween(open, { t: 1 }, { duration: d, easing: ease.inOut, onUpdate: () => entry.setOpen(open.t) });
    tween(entry.group.position, { x: DESK_BOOK.x + 0.12, z: DESK_BOOK.z }, { duration: d, easing: ease.inOut });
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
    const entry = selected;
    const wasReading = mode === "reading";
    if (mode === "reading") mode = "desk";
    const d = instant || reduceMotion ? 0.01 : 0.8;
    if (wasReading) {
      tween(entry.popupPivot.scale, { y: 0.0001 }, { duration: d * 0.4, easing: ease.in, onComplete: () => { entry.popupPivot.visible = false; } });
      const open = { t: 1 };
      tween(open, { t: 0 }, { duration: d, delay: d * 0.25, easing: ease.inOut, onUpdate: () => entry.setOpen(open.t) });
      tween(entry.group.position, { x: DESK_BOOK.x }, { duration: d, easing: ease.inOut });
      if (!instant) moveCamera(viewFor("desk"), d);
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
    updatePageDiorama(page);
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
    tween(shelfPan, { x: clampPan(entry.home.x) }, { duration: reduceMotion ? 0.01 : 0.6, easing: ease.inOut });
    setHoveredBook(entry);
  }

  function panShelf(direction) {
    tween(shelfPan, { x: clampPan(shelfPan.x + direction * 1.1) }, { duration: reduceMotion ? 0.01 : 0.5, easing: ease.inOut });
  }

  /* ------------------------------ bucle ------------------------------ */
  let frame = 0;
  let last = performance.now();
  let running = true;
  let hidden = false;
  const clock = { t: 0 };

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    const wasPortrait = camera.aspect < 0.85;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    shelfPan.x = clampPan(shelfPan.x);
    if (wasPortrait !== camera.aspect < 0.85) moveCamera(viewFor(mode), 0.4);
  }
  resize();
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
      toy.rotation.y = reduceMotion ? 0 : Math.sin(clock.t * 0.9 + state.phase) * 0.06;
    });

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
      actor.position.y = baseY + Math.sin(clock.t * 1.8 + phase) * 0.009;
      actor.rotation.y = Math.sin(clock.t * 0.85 + phase) * 0.16;
      actor.rotation.z = Math.sin(clock.t * 1.25 + phase) * 0.025;
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

    const panX = mode === "shelf" ? shelfPan.x : 0;
    camera.position.set(camPos.x + panX, camPos.y, camPos.z);
    camera.lookAt(camLook.x + panX, camLook.y, camLook.z);
    renderer.render(scene, camera);
    onFrame();
  }
  loop();

  function dispose() {
    running = false;
    cancelAnimationFrame(frame);
    cancelAllTweens();
    clearPageDiorama();
    window.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", onVisibility);
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointerup", onPointerUp);
    canvas.removeEventListener("pointerleave", onPointerLeave);
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
    projectPopup,
    focusBook,
    panShelf,
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
        selected: selected?.book.id || null,
        book: selected ? { p: selected.group.position.toArray(), r: selected.group.rotation.toArray().slice(0, 3), s: selected.group.scale.x } : null,
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
