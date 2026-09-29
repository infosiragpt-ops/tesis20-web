// Dialogue detection and speaker attribution for a page body (WP1). Pure.
//
// Openers found in the library: em dash (—), en dash (–), a hyphen-minus
// glued to a letter, ¿ or ¡ (-¿Cómo…), «…» and “…” (straight quotes are
// accepted too). Dashes follow the Spanish convention:
//   narration → (dash) speech → (dash) attribution → (dash) speech again.
// Only lines whose speaker is really known (tag, plural, single, turn) make
// an actor talk; `name` is a guess for gaze only.

import { wordKey } from "../cuentos-voice-plan.js";

const SPEECH_VERB = /^(dijo|dijeron|gritó|gritaron|preguntó|respondió|contestó|exclamó|susurró|murmuró|pensó|añadió|chilló|saludó|llamó|repitió)$/;
const PLURAL_VERB = /^(dijeron|gritaron)$/;
// Words that may sit between the verb and its subject («dijo el lobo»,
// «dijeron los dos cerditos»).
const DETERMINERS = new Set([
  "el", "la", "los", "las", "un", "una", "unos", "unas", "su", "sus", "mi", "mis", "tu", "tus",
  "este", "esta", "estos", "estas", "ese", "esa", "esos", "esas", "aquel", "aquella", "al", "del",
  "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "pequeño", "pequeña", "viejo", "vieja",
]);
// Family words that name a speaker without an article («—dijo mamá»).
const KIN = new Set(["mamá", "papá", "mamita", "papito", "madre", "padre", "abuela", "abuelo", "abuelita", "abuelito", "tía", "tío", "hermana", "hermano"]);
export const CONFIDENT = new Set(["tag", "plural", "single", "turn"]);

const DASHES = "—–";
const OPEN_QUOTES = "«“„\"”";
const CLOSE_QUOTES = "»”\"“";
const TRAILING_PUNCT = /[.,;:!?…)\]]+$/u;
const SENTENCE_END = /[.!?…][»”"'’)\]—–-]*$/u;
const LETTER_START = /^[\p{L}¿¡]/u;

function isBareDash(token) {
  return /^[—–-]+[.,;:]*$/u.test(token);
}

// Rest of the token after a leading dialogue dash, or null.
function afterLeadingDash(token) {
  if (DASHES.includes(token[0])) return token.slice(1);
  if (token[0] === "-" && LETTER_START.test(token.slice(1))) return token.slice(1);
  return null;
}

function hasTrailingDash(token) {
  if (isBareDash(token)) return false;
  const core = token.replace(TRAILING_PUNCT, "");
  const last = core.at(-1);
  if (last && DASHES.includes(last)) return core.length > 1;
  return last === "-" && /\p{L}[!?.…]*-$/u.test(core);
}

// "upper" when the text after a dash starts a new utterance (capital, ¿, ¡,
// a quote), "lower" when it reads as an attribution («—dijo»).
function caseOf(text) {
  const match = String(text || "").match(/[\p{L}¿¡«“"]/u);
  if (!match) return "upper";
  const ch = match[0];
  if ("¿¡«“\"".includes(ch)) return "upper";
  return ch === ch.toLowerCase() && ch !== ch.toUpperCase() ? "lower" : "upper";
}

function opensQuote(token) {
  const core = token.replace(/^[-—–(]+/u, "");
  return core.length > 0 && OPEN_QUOTES.includes(core[0]);
}

function closesQuote(token) {
  const core = token.replace(/[.,;:!?…)\]—–-]+$/u, "");
  return core.length > 0 && CLOSE_QUOTES.includes(core.at(-1));
}

function isCapitalized(token) {
  const match = String(token).match(/\p{L}/u);
  return Boolean(match && match[0] !== match[0].toLowerCase());
}

/**
 * Dialogue lines of a page body.
 *
 * @param {string[]} bodyWords body tokens (`page.x.split(/\s+/).filter(Boolean)`)
 * @param {{ cast?: string[], names?: Record<string,string[]>, starts?: number[]|null, ends?: number[]|null }} options
 *   `starts`/`ends` are per body word, in seconds; lines get `t0`/`t1` from them.
 * @returns {{ w0:number, w1:number, t0:number|null, t1:number|null, speakers:string[], confidence:string, utterance:number }[]}
 */
export function dialogueLines(bodyWords, { cast = [], names = {}, starts = null, ends = null } = {}) {
  const tokens = (bodyWords || []).map((word) => String(word ?? ""));
  const n = tokens.length;
  const keys = tokens.map(wordKey);
  const castList = [...new Set(cast || [])];
  const castSet = new Set(castList);
  const nameOf = new Map();
  for (const [actor, words] of Object.entries(names || {})) {
    if (!castSet.has(actor)) continue;
    for (const word of words || []) {
      const key = wordKey(word);
      if (key && !nameOf.has(key)) nameOf.set(key, actor);
    }
  }

  /* ---------------------------- segmentation ---------------------------- */
  const utterances = [];
  let state = "N"; // N narration · S dash speech · A attribution · Q quoted speech
  let u = null;
  let seg = null;
  let sentenceEnds = 0;
  let pending = null; // what a spaced dash opens on the next token
  let prevEnded = false;

  const begin = (kind, i) => {
    u = { kind, segments: [], attribution: [], cut: false, unclosed: false };
    utterances.push(u);
    seg = { w0: i, w1: i };
    u.segments.push(seg);
    sentenceEnds = 0;
    if (kind === "quote") {
      u.unclosed = true;
      for (let j = i; j < n; j += 1) {
        if (closesQuote(tokens[j]) && (j > i || tokens[j].length > 2)) {
          u.unclosed = false;
          break;
        }
      }
    }
  };
  const resume = (i) => {
    seg = { w0: i, w1: i };
    u.segments.push(seg);
    sentenceEnds = 0;
  };
  const endSegment = (i) => {
    if (seg) seg.w1 = Math.max(seg.w0, i);
    seg = null;
  };
  const nextIsDash = (i) => i + 1 < n && (isBareDash(tokens[i + 1]) || afterLeadingDash(tokens[i + 1]) !== null);

  for (let i = 0; i < n; i += 1) {
    const token = tokens[i];
    const ended = SENTENCE_END.test(token);
    if (state !== "Q" && isBareDash(token)) {
      const nextCase = caseOf(tokens[i + 1]);
      if (state === "N") pending = "speech";
      else if (state === "S") {
        endSegment(i - 1);
        if (nextCase === "lower") state = "A";
        else {
          state = "N";
          pending = "speech";
        }
      } else if (state === "A") {
        if (prevEnded) {
          state = "N";
          pending = "speech";
        } else pending = "resume";
      }
      prevEnded = false;
      continue;
    }

    if (pending) {
      if (pending === "speech" || !u) {
        begin("dash", i);
        state = "S";
      } else {
        resume(i);
        state = "S";
      }
      pending = null;
    } else if (state === "N") {
      if (afterLeadingDash(token) !== null) {
        begin("dash", i);
        state = "S";
      } else if (opensQuote(token)) {
        begin("quote", i);
        state = "Q";
      } else {
        prevEnded = ended;
        continue;
      }
    } else if (state === "S") {
      const rest = afterLeadingDash(token);
      if (rest !== null && i > seg.w0) {
        endSegment(i - 1);
        if (caseOf(rest) === "lower") state = "A";
        else begin("dash", i);
      }
    } else if (state === "A") {
      const rest = afterLeadingDash(token);
      if (rest !== null) {
        if (prevEnded) begin("dash", i);
        else resume(i);
        state = "S";
      } else if (prevEnded) {
        state = "N";
        if (opensQuote(token)) {
          begin("quote", i);
          state = "Q";
        } else {
          prevEnded = ended;
          continue;
        }
      }
    }

    if (state === "S") {
      seg.w1 = i;
      if (ended) sentenceEnds += 1;
      if (hasTrailingDash(token)) {
        endSegment(i);
        state = "A";
      } else if (ended && sentenceEnds >= 2 && i < n - 1 && !nextIsDash(i)) {
        // No closing mark: the speech ends at its second sentence end.
        endSegment(i);
        u.cut = true;
        state = "N";
      }
    } else if (state === "A") {
      u.attribution.push(i);
      if (hasTrailingDash(token)) pending = "resume";
    } else if (state === "Q") {
      seg.w1 = i;
      if (ended) sentenceEnds += 1;
      if (closesQuote(token) && (i > seg.w0 || token.length > 2)) {
        endSegment(i);
        // The attribution clause after a closing quote: up to 9 tokens,
        // stopping at the end of that sentence.
        for (let j = i + 1; j < Math.min(n, i + 10); j += 1) {
          if (opensQuote(tokens[j]) || afterLeadingDash(tokens[j]) !== null) break;
          u.attribution.push(j);
          if (SENTENCE_END.test(tokens[j])) break;
        }
        state = "N";
      } else if (u.unclosed && ended && sentenceEnds >= 2 && i < n - 1) {
        endSegment(i);
        u.cut = true;
        state = "N";
      }
    }
    prevEnded = ended;
  }

  /* ----------------------------- attribution ---------------------------- */
  const namesIn = (from, to) => {
    const found = [];
    for (let j = from; j < to; j += 1) {
      const actor = keys[j] && nameOf.get(keys[j]);
      if (actor && !found.includes(actor)) found.push(actor);
    }
    return found;
  };

  function attribute(clause) {
    const at = clause.findIndex((j) => keys[j] && SPEECH_VERB.test(keys[j]));
    if (at < 0) return null;
    const verb = clause[at];
    const plural = PLURAL_VERB.test(keys[verb]);
    const verbGlued = /[\p{L}]$/u.test(tokens[verb]);
    // The subject right after the verb: «—dijo el lobo», «—dijo mamá».
    if (verbGlued) {
      let j = verb + 1;
      let determiner = false;
      while (j < n && keys[j] && DETERMINERS.has(keys[j]) && j - verb <= 3) {
        determiner = true;
        if (!/[\p{L}]$/u.test(tokens[j])) break;
        j += 1;
      }
      if (j < n && keys[j]) {
        const actor = nameOf.get(keys[j]);
        if (actor) {
          if (!plural) return { confidence: "tag", speakers: [actor] };
          const group = [actor];
          // «dijeron Pipo y Lolo»
          for (let k = j + 1; k < Math.min(n, j + 6); k += 1) {
            const other = keys[k] && nameOf.get(keys[k]);
            if (other && !group.includes(other)) group.push(other);
            else if (!["y", "e"].includes(keys[k])) break;
          }
          return { confidence: "tag", speakers: group };
        }
        const noun = determiner || isCapitalized(tokens[j]) || KIN.has(keys[j]);
        if (noun && !plural) return { confidence: "offscreen", speakers: [] };
        if (noun && plural) return { confidence: "plural", speakers: [] };
      }
    }
    // «—saludó alegre Pinocho»: any cast name in the clause.
    const inClause = namesIn(clause[0], clause.at(-1) + 1);
    if (inClause.length) return { confidence: "tag", speakers: plural ? inClause : [inClause.find((actor) => clause.some((j) => j > verb && nameOf.get(keys[j]) === actor)) || inClause.at(-1)] };
    return plural ? { confidence: "plural", speakers: [] } : null;
  }

  const lastNameBefore = (w0) => {
    for (let j = w0 - 1; j >= Math.max(0, w0 - 25); j -= 1) {
      const actor = keys[j] && nameOf.get(keys[j]);
      if (actor) return actor;
    }
    return null;
  };

  const resolved = utterances.map((item) => {
    const found = attribute(item.attribution);
    return {
      item,
      speakers: found?.speakers || [],
      confidence: found?.confidence === "tag" || found?.confidence === "offscreen" ? found.confidence : null,
      plural: found?.confidence === "plural",
      guess: lastNameBefore(item.segments[0].w0),
    };
  });

  const others = (speakers) => castList.filter((actor) => !speakers.includes(actor));
  // plural: everyone on stage except whoever spoke the adjacent line.
  resolved.forEach((r, k) => {
    if (r.confidence || !r.plural) return;
    const adjacent = resolved[k - 1] || resolved[k + 1];
    const exclude = adjacent ? (adjacent.confidence === "tag" ? adjacent.speakers : adjacent.guess ? [adjacent.guess] : []) : [];
    const speakers = others(exclude);
    r.speakers = speakers.length ? speakers : [...castList];
    r.confidence = r.speakers.length ? "plural" : null;
  });
  // A speech that never closed only earns a gaze.
  resolved.forEach((r) => {
    if (r.item.cut && !r.confidence) {
      r.confidence = "name";
      r.speakers = r.guess ? [r.guess] : [];
    }
  });
  // single: only one figure on stage.
  resolved.forEach((r) => {
    if (!r.confidence && castList.length === 1) {
      r.confidence = "single";
      r.speakers = [castList[0]];
    }
  });
  // turn: lines alternate between two parties.
  for (let changed = true; changed; ) {
    changed = false;
    resolved.forEach((r, k) => {
      if (r.confidence) return;
      for (const adjacent of [resolved[k - 1], resolved[k + 1]]) {
        if (!adjacent || !CONFIDENT.has(adjacent.confidence) || !adjacent.speakers.length) continue;
        const rest = others(adjacent.speakers);
        if (rest.length === 1) {
          r.confidence = "turn";
          r.speakers = rest;
          changed = true;
          return;
        }
      }
    });
  }
  resolved.forEach((r) => {
    if (r.confidence) return;
    r.confidence = r.guess ? "name" : "none";
    r.speakers = r.guess ? [r.guess] : [];
  });

  /* -------------------------------- lines ------------------------------- */
  const timeAt = (list, i) => (Array.isArray(list) && Number.isFinite(list[i]) ? list[i] : null);
  const lines = [];
  resolved.forEach((r, index) => {
    for (const segment of r.item.segments) {
      if (segment.w1 < segment.w0) continue;
      lines.push({
        w0: segment.w0,
        w1: segment.w1,
        t0: timeAt(starts, segment.w0),
        t1: timeAt(ends, segment.w1) ?? timeAt(starts, segment.w1 + 1) ?? timeAt(starts, segment.w1),
        speakers: [...r.speakers],
        confidence: r.confidence,
        utterance: index,
      });
    }
  });
  return lines;
}
