import { Layer, PluginObject, TiledResource } from "@excaliburjs/plugin-tiled";
import {
  TileMap,
  vec,
  Vector,
  Sprite,
  Graphic,
  Scene,
  SpriteSheet,
} from "excalibur";
import { Resources } from "./resources";

import { app } from "electron";
import { create } from "domain";

export async function saveGame(id: number) {
  const data = JSON.stringify(saveData);

  const success = await window.electron.ipcRenderer.invoke(
    "save-file",
    id,
    data
  );
}

export async function createSave(id: number) {
  const data = JSON.stringify(saveData);

  const success = await window.electron.ipcRenderer.invoke(
    "create-save",
    id,
    data
  );
  console.log("Create file status: " + success);
}

export async function loadGame(id: number) {
  const data = await window.electron.ipcRenderer.invoke("load-file", id);

  if (data) {
    saveData = JSON.parse(data);
  } else {
    createSave(1);
    loadGame(1)
  }
}

export const gameConstants = {
  AnimationSpeed: 200,
};

export const settings = {};

export var saveData = {
  highscore: 0,
};

export const gameSprites = {
  mapSpriteSheet: SpriteSheet.fromImageSource({
    image: Resources["ground"],
    grid: { rows: 4, columns: 4, spriteWidth: 16, spriteHeight: 16 },
  }),
  playerSpriteSheet: SpriteSheet.fromImageSource({
    image: Resources["playerSpriteSheet"],
    grid: { rows: 3, columns: 7, spriteWidth: 16, spriteHeight: 16 },
  }),
};

export function inRange(value: number, start: number, end: number): boolean {
  if (start <= value && value <= end) {
    return true;
  } else {
    return false;
  }
}

export function getRandom(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

export function round(value, precision) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}

export function moveTowards(
  start: Vector,
  end: Vector,
  magnitude: number
): Vector {
  // Calculate the direction vector from start to end
  const direction = end.sub(start).normalize();

  // Calculate the distance between start and end
  const distanceToEnd = end.distance(start);

  // If the distance is less than the threshold, return the vector to the end position
  if (distanceToEnd <= 5) {
    return end.sub(start); // Directly move to the end position
  }

  // Calculate the vector of the specified magnitude
  let resultVector = direction.scale(magnitude);

  // If the result vector would overshoot the end position, return a vector to the end position
  if (magnitude > distanceToEnd) {
    resultVector = end.sub(start);
  }

  return resultVector;
}

export function removeDuplicates(arr) {
  return [...new Set(arr)];
}

export function moveTowards1(
  from: Vector,
  to: Vector,
  magnitude: number,
  oneAxis: boolean = false
): Vector {
  let relx = to.x - from.x;
  let rely = to.y - from.y;
  let angle = Math.atan2(rely, relx);

  let moveVec = vec(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
  console.log(moveVec);

  let distanceLeft = Math.sqrt(relx * relx + rely * rely);

  if (distanceLeft < magnitude) {
    return vec(relx, rely);
  }

  if (oneAxis) {
    if (magnitude > Math.abs(relx)) {
      return vec(relx, 0);
    } else {
      return vec(magnitude, 0);
    }
  } else {
    if (magnitude > Math.abs(rely)) {
      return vec(0, rely);
    } else {
      return vec(0, magnitude);
    }
  }

  // Calculate the move vector based on the angle and magnitude

  // If oneAxis is true, adjust the moveVec to move only along one axis

  return moveVec;
}

export function posAroundPoint(
  point: Vector,
  angle: number,
  distanceFromPoint: number
) {
  return point.add(
    vec(
      distanceFromPoint * Math.cos(angle),
      distanceFromPoint * Math.sin(angle)
    )
  );
}

export function weightedRandom(
  array: any[],
  weights: number[] /* weights should add up to 100 */
) {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  return array.find((_, i) => (random -= weights[i]) <= 0);
}
