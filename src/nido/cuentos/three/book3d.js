// Libro en 3D: tapas, lomo, bloque de páginas y la ilustración pop-up que se
// levanta de la página derecha. El origen del grupo está en el centro de la
// base del libro cerrado, de pie, con la portada mirando a +z y el lomo en -x.

import * as THREE from "three";

export const BOOK_W = 0.34;
export const BOOK_H = 0.48;
export const BOOK_T = 0.05;
const COVER_T = 0.007;

export function createBook3D(book, { coverTexture, spineTexture, edgeTexture, paperTexture, insideColor = "#f7efdc" }) {
  const group = new THREE.Group();
  group.userData.bookId = book.id;

  const edgeMat = new THREE.MeshStandardMaterial({ map: edgeTexture, roughness: 0.9 });
  const paperMat = new THREE.MeshStandardMaterial({ map: paperTexture, roughness: 0.95 });
  const coverMat = new THREE.MeshStandardMaterial({ map: coverTexture, roughness: 0.55 });
  const insideMat = new THREE.MeshStandardMaterial({ color: insideColor, roughness: 0.95 });
  const backMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(book.accent).multiplyScalar(0.35), roughness: 0.6 });
  const spineMat = new THREE.MeshStandardMaterial({ map: spineTexture, roughness: 0.6 });

  // Bloque de páginas: caras [+x, -x, +y, -y, +z, -z]
  const pagesW = BOOK_W - 0.012;
  const pagesT = BOOK_T - COVER_T * 2;
  const pages = new THREE.Mesh(
    new THREE.BoxGeometry(pagesW, BOOK_H - 0.012, pagesT),
    [edgeMat, edgeMat, edgeMat, edgeMat, paperMat, paperMat],
  );
  pages.position.set(0.006, BOOK_H / 2, 0);
  pages.castShadow = true;
  pages.receiveShadow = true;
  group.add(pages);

  // Tapa trasera y lomo
  const back = new THREE.Mesh(new THREE.BoxGeometry(BOOK_W, BOOK_H, COVER_T), backMat);
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
    new THREE.BoxGeometry(BOOK_W, BOOK_H, COVER_T),
    [backMat, backMat, backMat, backMat, coverMat, insideMat],
  );
  front.position.set(BOOK_W / 2, BOOK_H / 2, 0);
  front.castShadow = true;
  front.receiveShadow = true;
  pivot.add(front);
  group.add(pivot);

  // Ilustración pop-up: plano anclado por su base sobre la página derecha.
  const popupW = BOOK_W * 0.96;
  const popupH = popupW * 0.64;
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
  group.add(popupPivot);

  // Marco de cartulina detrás del pop-up para que parezca recortado
  const frameGeo = new THREE.PlaneGeometry(popupW + 0.012, popupH + 0.012);
  frameGeo.translate(0, popupH / 2 - 0.006 + 0.006, -0.0015);
  const frame = new THREE.Mesh(frameGeo, new THREE.MeshStandardMaterial({ color: "#fbf3e1", roughness: 0.9, side: THREE.DoubleSide }));
  frame.castShadow = true;
  popupPivot.add(frame);

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
    popupW,
    popupH,
    coverMat,
    /** 0 = cerrado, 1 = abierto del todo (tapa a la izquierda, plana). */
    setOpen(t) {
      pivot.rotation.y = -Math.PI * Math.max(0, Math.min(1, t));
    },
    setPopupTexture(texture) {
      popupMat.map = texture;
      popupMat.needsUpdate = true;
    },
  };
}
