const normalize = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");

function setEmptyState(container, count) {
  container.querySelector("[data-directory-empty]").hidden = count > 0;
}

function setupCareers(container) {
  const query = container.querySelector("#career-query");
  const area = container.querySelector("#career-area");
  const clear = container.querySelector("[data-directory-clear]");
  const count = container.querySelector("[data-directory-count]");
  const cards = [...container.querySelectorAll("[data-career-area]")];

  const update = () => {
    const term = normalize(query.value.trim());
    let total = 0;
    cards.forEach((card) => {
      const areaMatches = !area.value || card.dataset.careerArea === area.value;
      let cardCount = 0;
      card.querySelectorAll("li").forEach((item) => {
        const matches = areaMatches && (!term || normalize(item.textContent).includes(term));
        item.hidden = !matches;
        if (matches) cardCount += 1;
      });
      card.hidden = cardCount === 0;
      card.querySelector("header strong").textContent = String(cardCount);
      total += cardCount;
    });
    count.textContent = `${total} ${total === 1 ? "carrera encontrada" : "carreras encontradas"}`;
    clear.disabled = !query.value && !area.value;
    setEmptyState(container, total);
  };

  query.addEventListener("input", update);
  area.addEventListener("change", update);
  clear.addEventListener("click", () => {
    query.value = "";
    area.value = "";
    update();
    query.focus();
  });
  update();
}

function setupTeachers(container) {
  const name = container.querySelector("#teacher-name");
  const career = container.querySelector("#teacher-career");
  const university = container.querySelector("#teacher-university");
  const clear = container.querySelector("[data-directory-clear]");
  const count = container.querySelector("[data-directory-count]");
  const cards = [...container.querySelectorAll("[data-teacher-card]")];

  const update = () => {
    const nameTerm = normalize(name.value.trim());
    let total = 0;
    cards.forEach((card) => {
      const matches =
        (!nameTerm || normalize(card.dataset.name).includes(nameTerm)) &&
        (!career.value || card.dataset.careers.split("|").includes(career.value)) &&
        (!university.value || card.dataset.universities.split("|").includes(university.value));
      card.hidden = !matches;
      if (matches) total += 1;
    });
    count.textContent = `${total} ${total === 1 ? "docente encontrado" : "docentes encontrados"}`;
    clear.disabled = !name.value && !career.value && !university.value;
    setEmptyState(container, total);
  };

  name.addEventListener("input", update);
  career.addEventListener("change", update);
  university.addEventListener("change", update);
  clear.addEventListener("click", () => {
    name.value = "";
    career.value = "";
    university.value = "";
    update();
    name.focus();
  });
  update();
}

const directory = document.querySelector("[data-academic-directory]");
if (directory?.dataset.academicDirectory === "careers") setupCareers(directory);
if (directory?.dataset.academicDirectory === "teachers") setupTeachers(directory);
