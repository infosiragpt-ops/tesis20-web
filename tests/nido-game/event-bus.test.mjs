import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createEventBus,
  GAME_TO_PLATFORM,
  PLATFORM_TO_GAME,
} from "../../src/nido/game/core/event-bus.js";

test("emite y recibe eventos del contrato", () => {
  const bus = createEventBus();
  const received = [];
  bus.on(GAME_TO_PLATFORM.LEVEL_COMPLETED, (payload) => received.push(payload));
  bus.emit(GAME_TO_PLATFORM.LEVEL_COMPLETED, { round: 3 });
  assert.deepEqual(received, [{ round: 3 }]);
});

test("un oyente roto no interrumpe a los demás", () => {
  const bus = createEventBus();
  let delivered = false;
  bus.on(PLATFORM_TO_GAME.PAUSE_GAME, () => {
    throw new Error("oyente roto");
  });
  bus.on(PLATFORM_TO_GAME.PAUSE_GAME, () => {
    delivered = true;
  });
  bus.emit(PLATFORM_TO_GAME.PAUSE_GAME);
  assert.equal(delivered, true);
});

test("off y clear evitan fugas", () => {
  const bus = createEventBus();
  let count = 0;
  const off = bus.on(GAME_TO_PLATFORM.OBJECT_COLLECTED, () => {
    count += 1;
  });
  bus.emit(GAME_TO_PLATFORM.OBJECT_COLLECTED);
  off();
  bus.emit(GAME_TO_PLATFORM.OBJECT_COLLECTED);
  assert.equal(count, 1);
  bus.on(GAME_TO_PLATFORM.OBJECT_COLLECTED, () => {
    count += 1;
  });
  bus.clear();
  bus.emit(GAME_TO_PLATFORM.OBJECT_COLLECTED);
  assert.equal(count, 1);
});
