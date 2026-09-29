import test from "node:test";
import assert from "node:assert/strict";
import { BOOKS } from "../../src/nido/cuentos/cuentos-data.js";
import { CONFIDENT, dialogueLines } from "../../src/nido/cuentos/film/dialogue.js";

const book = (id) => BOOKS.find((entry) => entry.id === id);
const tokensOf = (page) => page.x.split(/\s+/).filter(Boolean);
function linesOf(id, index) {
  const entry = book(id);
  const page = entry.pages[index];
  const tokens = tokensOf(page);
  return dialogueLines(tokens, { cast: page.cast, names: entry.names }).map((line) => ({
    ...line,
    text: tokens.slice(line.w0, line.w1 + 1).join(" "),
  }));
}
const confident = (lines) => lines.filter((line) => CONFIDENT.has(line.confidence));

test("cerditos p0: «—Ya son grandes —dijo mamá—» has no speaker on stage (offscreen)", () => {
  const lines = linesOf("cerditos", 0);
  assert.ok(lines.length >= 1);
  assert.match(lines[0].text, /^—Ya son grandes/);
  for (const line of lines) {
    assert.equal(line.confidence, "offscreen", line.text);
    assert.deepEqual(line.speakers, []);
  }
  // The attribution itself is not speech.
  assert.ok(lines.every((line) => !/dijo/.test(line.text)));
});

test("cerditos p1: the only figure on stage says «¡Qué fácil!» (single)", () => {
  const lines = linesOf("cerditos", 1);
  assert.equal(lines.length, 1);
  assert.equal(lines[0].text, "—¡Qué fácil!");
  assert.equal(lines[0].confidence, "single");
  assert.deepEqual(lines[0].speakers, ["pipo"]);
});

test("cerditos p5: the wolf, then Pipo, are named by their attribution (tag)", () => {
  const lines = linesOf("cerditos", 5);
  assert.deepEqual(lines.map((line) => line.speakers), [["lobo"], ["pipo"]]);
  assert.deepEqual(lines.map((line) => line.confidence), ["tag", "tag"]);
  assert.equal(lines[0].text, "—¡Ábreme la puerta, cerdito!");
  assert.equal(lines[1].text, "—¡No, no y no!");
  // «El lobo sopló y sopló…» is narration: no line covers it.
  const tokens = tokensOf(book("cerditos").pages[5]);
  const blow = tokens.indexOf("sopló");
  assert.ok(lines.every((line) => blow < line.w0 || blow > line.w1));
});

test("cerditos p6: the wolf by turn, then both piglets by «dijeron» (plural)", () => {
  const lines = linesOf("cerditos", 6);
  assert.deepEqual(lines.map((line) => line.speakers), [["lobo"], ["lolo", "pipo"]]);
  assert.deepEqual(lines.map((line) => line.confidence), ["turn", "plural"]);
});

test("en dash (clasico-pinocho) and hyphen-minus (clasico-rapunzel) dialogue are detected", () => {
  const pinocho = linesOf("clasico-pinocho", 1);
  assert.ok(pinocho.length >= 3);
  assert.equal(pinocho[0].text, "–¡Hola, padre!");
  assert.equal(pinocho[0].confidence, "tag");
  assert.deepEqual(pinocho[0].speakers, ["pinocho"]);
  // «–gritó Gepeto»: Gepeto is not on stage.
  assert.equal(pinocho[1].confidence, "offscreen");

  const rapunzel = linesOf("clasico-rapunzel", 2);
  assert.equal(rapunzel.length, 1);
  assert.equal(rapunzel[0].text, "-¿Cómo te atreves a robar mis lechugas?");
  const bruja = linesOf("clasico-rapunzel", 3);
  assert.equal(bruja[0].text, "-Puedes llevarte las lechugas que quieras");
  assert.deepEqual(bruja[0].speakers, ["bruja"]);
  assert.equal(bruja[0].confidence, "tag");
  // «-dijo la bruja -, pero a cambio…»: the speech resumes after the attribution.
  assert.match(bruja[1].text, /^pero a cambio/);
  assert.deepEqual(bruja[1].speakers, ["bruja"]);
});

test("quotes: «…» and “…” open lines and the words after the closing quote tag them", () => {
  const cast = ["lobo", "pipo"];
  const names = { lobo: ["lobo"], pipo: ["pipo"] };
  const guillemets = dialogueLines("«¡Ábreme!» gritó el lobo. Pipo no abrió.".split(" "), { cast, names });
  assert.equal(guillemets.length, 1);
  assert.deepEqual(guillemets[0].speakers, ["lobo"]);
  assert.equal(guillemets[0].confidence, "tag");
  const curly = dialogueLines("Entonces: “¡No, no y no!”, dijo Pipo.".split(" "), { cast, names });
  assert.deepEqual(curly[0].speakers, ["pipo"]);
  const straight = dialogueLines('"Hola" dijo Pipo.'.split(" "), { cast, names });
  assert.deepEqual(straight[0].speakers, ["pipo"]);
});

test("speech that never closes ends at its second sentence and only earns a gaze", () => {
  const tokens = "El lobo miró. —Ya voy. Espera un poco. Pipo corrió a casa.".split(" ");
  const lines = dialogueLines(tokens, { cast: ["lobo", "pipo"], names: { lobo: ["lobo"], pipo: ["pipo"] } });
  assert.equal(lines.length, 1);
  assert.equal(tokens.slice(lines[0].w0, lines[0].w1 + 1).join(" "), "—Ya voy. Espera un poco.");
  assert.equal(lines[0].confidence, "name");
  assert.deepEqual(lines[0].speakers, ["lobo"]);
});

test("lines get times from the word starts", () => {
  const tokens = "—¡Hola! —dijo Pipo.".split(" ");
  const [line] = dialogueLines(tokens, { cast: ["pipo"], names: { pipo: ["pipo"] }, starts: [1, 1.5, 1.8], ends: [1.4, 1.7, 2.1] });
  assert.equal(line.t0, 1);
  assert.equal(line.t1, 1.4);
});

test("every page of the library segments without throwing and speakers are on stage", () => {
  let confidentLines = 0;
  for (const entry of BOOKS) {
    entry.pages.forEach((page, index) => {
      const tokens = tokensOf(page);
      const lines = dialogueLines(tokens, { cast: page.cast, names: entry.names });
      let last = -1;
      for (const line of lines) {
        assert.ok(line.w0 > last && line.w1 >= line.w0 && line.w1 < tokens.length, `${entry.id}:${index}`);
        last = line.w1;
        for (const actor of line.speakers) assert.ok(page.cast.includes(actor), `${entry.id}:${index} ${actor}`);
      }
      confidentLines += confident(lines).length;
    });
  }
  assert.ok(confidentLines >= 200, `only ${confidentLines} lines with a known speaker`);
});
