// Libro en 3D: tapas, lomo, bloque de páginas y la ilustración pop-up que se
// levanta de la página derecha. El origen del grupo está en el centro de la
// base del libro cerrado, de pie, con la portada mirando a +z y el lomo en -x.

import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export const BOOK_W = 0.5;
export const BOOK_H = 0.75;
export const BOOK_T = 0.075;
const COVER_T = 0.01;

export function createBook3D(book, { coverTexture, spineTexture, edgeTexture, paperTexture, insideColor = "#f7efdc" }) {
  const group = new THREE.Group();
  group.userData.bookId = book.id;

  const edgeMat = new THREE.MeshStandardMaterial({ map: edgeTexture, roughness: 0.86 });
  const paperMat = new THREE.MeshStandardMaterial({ map: paperTexture, roughness: 0.94 });
  const coverMat = new THREE.MeshPhysicalMaterial({
    map: coverTexture,
    roughness: 0.32,
    metalness: 0.035,
    clearcoat: 0.3,
    clearcoatRoughness: 0.48,
    emissive: new THREE.Color(book.accent).multiplyScalar(0.08),
    emissiveIntensity: 0.06,
  });
  const insideMat = new THREE.MeshStandardMaterial({ color: insideColor, roughness: 0.95 });
  const backMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(book.accent).multiplyScalar(0.35), roughness: 0.5, clearcoat: 0.08 });
  const spineMat = new THREE.MeshPhysicalMaterial({ map: spineTexture, roughness: 0.48, clearcoat: 0.1 });

  // Bloque de páginas: caras [+x, -x, +y, -y, +z, -z]
  const pagesW = BOOK_W - 0.012;
  const pagesT = BOOK_T - COVER_T * 2;
  const pages = new THREE.Mesh(
    new RoundedBoxGeometry(pagesW, BOOK_H - 0.012, pagesT, 4, 0.008),
    [edgeMat, edgeMat, edgeMat, edgeMat, paperMat, paperMat],
  );
  pages.position.set(0.006, BOOK_H / 2, 0);
  pages.castShadow = true;
  pages.receiveShadow = true;
  group.add(pages);

  // Tapa trasera y lomo
  const back = new THREE.Mesh(new RoundedBoxGeometry(BOOK_W, BOOK_H, COVER_T, 4, 0.007), backMat);
  back.position.set(0, BOOK_H / 2, -BOOK_T / 2 + COVER_T / 2);
  back.castShadow = true;
  back.receiveShadow = true;
  group.add(back);

  const spine = new THREE.Mesh(new THREE.BoxGeometry(COVER_T, BOOK_H, BOOK_T), [spineMat, spineMat, backMat, backMat, backMat, backMat]);
  spine.position.set(-BOOK_W / 2 + COVER_T / 2, BOOK_H / 2, 0);
  spine.castShadow = true;
  group.add(spine);

  // Tapa delantera con pivote en el lomo para abrirla
  const pivot = new THREE.Group();
  pivot.position.set(-BOOK_W / 2, 0, BOOK_T / 2 - COVER_T / 2);
  const front = new THREE.Mesh(
    new RoundedBoxGeometry(BOOK_W, BOOK_H, COVER_T, 4, 0.007),
    [backMat, backMat, backMat, backMat, coverMat, insideMat],
  );
  front.position.set(BOOK_W / 2, BOOK_H / 2, 0);
  front.castShadow = true;
  front.receiveShadow = true;
  pivot.add(front);

  // Hoja editorial dentro de la tapa izquierda. La textura se actualiza con
  // cada página para que el texto forme parte del libro y no tape el diorama.
  const storyMat = new THREE.MeshStandardMaterial({
    color: "#fffaf0",
    roughness: 0.92,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  });
  const storyPage = new THREE.Mesh(new THREE.PlaneGeometry(BOOK_W * 0.94, BOOK_H * 0.95), storyMat);
  storyPage.position.set(BOOK_W / 2, BOOK_H / 2, -COVER_T / 2 - 0.0015);
  storyPage.rotation.y = Math.PI;
  storyPage.receiveShadow = true;
  pivot.add(storyPage);
  group.add(pivot);

  // Ilustración pop-up: plano anclado por su base sobre la página derecha.
  const popupW = BOOK_W * 0.96;
  const popupH = popupW * 0.82;
  const popupGeo = new THREE.PlaneGeometry(popupW, popupH);
  popupGeo.translate(0, popupH / 2, 0);
  const popupMat = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.7, side: THREE.DoubleSide, transparent: true, opacity: 1 });
  const popup = new THREE.Mesh(popupGeo, popupMat);
  popup.castShadow = true;
  const popupPivot = new THREE.Group();
  popupPivot.position.set(0.006, BOOK_H * 0.7, BOOK_T / 2 + 0.002);
  popupPivot.rotation.x = Math.PI / 2 * 0.86;
  popupPivot.scale.set(1, 0.0001, 1);
  popupPivot.visible = false;
  popupPivot.add(popup);

  // Las figuras 3D animadas de la página viven delante de la ilustración.
  const dioramaRoot = new THREE.Group();
  dioramaRoot.position.set(0, 0, 0.02);
  popupPivot.add(dioramaRoot);
  group.add(popupPivot);

  // Marco de cartulina detrás del pop-up para que parezca recortado
  const frameGeo = new THREE.PlaneGeometry(popupW + 0.012, popupH + 0.012);
  frameGeo.translate(0, popupH / 2 - 0.006 + 0.006, -0.0015);
  const frame = new THREE.Mesh(frameGeo, new THREE.MeshStandardMaterial({ color: "#fbf3e1", roughness: 0.9, side: THREE.DoubleSide }));
  frame.castShadow = true;
  popupPivot.add(frame);

  // Hoja fina que cruza físicamente el lomo durante el cambio de página.
  const turnPivot = new THREE.Group();
  turnPivot.position.set(-BOOK_W / 2, 0, BOOK_T / 2 + 0.005);
  const turnMat = new THREE.MeshStandardMaterial({ map: paperTexture, roughness: 0.94, side: THREE.DoubleSide });
  const turnLeaf = new THREE.Mesh(new THREE.PlaneGeometry(BOOK_W * 0.98, BOOK_H * 0.98, 12, 1), turnMat);
  turnLeaf.position.set(BOOK_W / 2, BOOK_H / 2, 0);
  turnLeaf.castShadow = true;
  turnPivot.add(turnLeaf);
  turnPivot.visible = false;
  group.add(turnPivot);

  // Caja de impacto invisible, algo más grande, para el raycast
  const hit = new THREE.Mesh(new THREE.BoxGeometry(BOOK_W + 0.08, BOOK_H + 0.06, BOOK_T + 0.16), new THREE.MeshBasicMaterial({ visible: false }));
  hit.position.set(0, BOOK_H / 2, 0);
  hit.userData.bookId = book.id;
  group.add(hit);

  return {
    book,
    group,
    hit,
    pivot,
    popup,
    popupPivot,
    dioramaRoot,
    turnPivot,
    popupW,
    popupH,
    coverMat,
    // Superficies para el gesto de arrastre: la tapa (abrir/cerrar) y el bloque
    // de páginas (devolver a la repisa desde la lectura).
    coverSurface: front,
    pageSurface: pages,
    /** 0 = cerrado, 1 = abierto del todo (tapa a la izquierda, plana). */
    setOpen(t) {
      pivot.rotation.y = -Math.PI * Math.max(0, Math.min(1, t));
    },
    setPopupTexture(texture) {
      popupMat.map = texture;
      popupMat.needsUpdate = true;
    },
    setStoryTexture(texture) {
      storyMat.map = texture;
      storyMat.needsUpdate = true;
    },
    setTurn(t) {
      turnPivot.visible = true;
      turnPivot.rotation.y = -Math.PI * Math.max(0, Math.min(1, t));
    },
    endTurn() {
      turnPivot.visible = false;
      turnPivot.rotation.y = 0;
    },
  };
}
