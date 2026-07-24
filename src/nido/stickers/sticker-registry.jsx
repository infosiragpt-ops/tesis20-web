import { ANIMAL_STICKERS } from "./sticker-animals.jsx";
import { HOME_VEHICLE_STICKERS } from "./sticker-home-vehicles.jsx";
import { NATURE_FOOD_STICKERS } from "./sticker-nature-food.jsx";
import { PEOPLE_STICKERS } from "./sticker-people.jsx";
import { SCHOOL_PLAY_STICKERS } from "./sticker-school-play.jsx";
import { SHAPE_STICKERS } from "./sticker-shapes.jsx";

// Registro único de stickers ilustrados. Los alias cubren nombres del
// currículo que comparten dibujo (p. ej. HouseLine ≈ House).
export const STICKERS = Object.freeze({
  ...ANIMAL_STICKERS,
  ...NATURE_FOOD_STICKERS,
  ...HOME_VEHICLE_STICKERS,
  ...SCHOOL_PLAY_STICKERS,
  ...PEOPLE_STICKERS,
  ...SHAPE_STICKERS,
  HouseLine: HOME_VEHICLE_STICKERS.House,
});
