import {
  cliExecute,
  outfit as equipOutfit,
  equippedAmount,
  equippedItem,
  familiarWeight,
  Item,
  myBasestat,
  outfitPieces,
  print,
  Slot,
  toSlot,
} from "kolmafia";
import {
  $familiar,
  $item,
  $skill,
  $slot,
  $slots,
  $stat,
  get,
  getKramcoWandererChance,
  have,
  MaximizeOptions,
} from "libram";
import { Resource } from "./resources";
import { Keys, keyStrategy } from "../tasks/keys";
import { towerSkip } from "../tasks/level13";
import { Outfit } from "grimoire-kolmafia";
import { atLevel, haveLoathingLegion } from "../lib";

export function equipFirst<T extends Resource>(outfit: Outfit, resources: T[]): T | undefined {
  for (const resource of resources) {
    if (!resource.available()) continue;
    if (resource.chance && resource.chance() === 0) continue;
    if (!outfit.canEquip(resource.equip ?? [])) continue;
    if (!outfit.equip(resource.equip ?? [])) continue;
    return resource;
  }
  return undefined;
}

export function equipUntilCapped<T extends Resource>(outfit: Outfit, resources: T[]): T[] {
  const result: T[] = [];
  for (const resource of resources) {
    if (!resource.available()) continue;
    if (resource.chance && resource.chance() === 0) continue;
    if (!outfit.canEquip(resource.equip ?? [])) continue;
    if (!outfit.equip(resource.equip ?? [])) continue;
    result.push(resource);
    if (resource.chance && resource.chance() === 1) break;
  }
  return result;
}

export function equipInitial(outfit: Outfit): void {
  if (outfit.modifier?.includes("item")) {
    outfit.equip($familiar`Grey Goose`);
    if (
      !outfit.modifier?.includes("+combat") &&
      !outfit.modifier?.includes(" combat") &&
      !outfit.modifier?.includes("res")
    )
      outfit.equip($item`protonic accelerator pack`);
  }
  // if (spec.modifier.includes("+combat")) outfit.equip($familiar`Jumpsuited Hound Dog`);
  if (outfit.modifier?.includes("meat")) {
    outfit.equip($familiar`Hobo Monkey`);
    outfit.equip($familiar`Leprechaun`); // backup
  }
  if (outfit.modifier?.includes("+combat") && !outfit.modifier?.includes("res"))
    outfit.equip($item`thermal blanket`);
}

export function equipCharging(outfit: Outfit, force_charge_goose: boolean): void {
  if (outfit.skipDefaults) return;

  if (
    familiarWeight($familiar`Grey Goose`) < 6 ||
    (familiarWeight($familiar`Grey Goose`) >= 6 &&
      [...outfit.equips.values()].includes($item`Kramco Sausage-o-Matic™`) &&
      getKramcoWandererChance() === 1) ||
    force_charge_goose
  ) {
    if (outfit.equip($familiar`Grey Goose`)) {
      outfit.equip($item`yule hatchet`);
      if (!atLevel(11)) outfit.equip($item`teacher's pen`);

      // Use latte mug for familiar exp
      if (
        !outfit.modifier?.includes("-combat") &&
        have($item`latte lovers member's mug`) &&
        get("latteModifier").includes("Experience (familiar): 3")
      ) {
        outfit.equip($item`latte lovers member's mug`);
      }

      // Equip an offhand if it is not needed for the -combat umbrella
      if (
        !outfit.modifier?.includes("-combat") ||
        have($skill`Photonic Shroud`) ||
        !have($item`unbreakable umbrella`)
      ) {
        outfit.equip($item`ghostly reins`);
        outfit.equip($item`familiar scrapbook`);
      }
    }
  } else if (
    (!have($item`eleven-foot pole`) ||
      !have($item`ring of Detect Boring Doors`) ||
      !have($item`Pick-O-Matic lockpicks`)) &&
    keyStrategy.useful(Keys.Dungeon) !== false &&
    !towerSkip()
  ) {
    outfit.equip($familiar`Gelatinous Cubeling`);
  } else if (get("camelSpit") < 100 && get("zeppelinProtestors") < 80) {
    outfit.equip($familiar`Melodramedary`);
  }
}

export function equipDefaults(outfit: Outfit, force_charge_goose: boolean): void {
  if (outfit.skipDefaults) return;

  if (outfit.modifier?.includes("-combat")) outfit.equip($familiar`Disgeist`); // low priority

  if (have($familiar`Temporal Riftlet`)) {
    outfit.equip($familiar`Temporal Riftlet`);
  } else if (have($item`gnomish housemaid's kgnee`)) {
    outfit.equip($familiar`Reagnimated Gnome`);
  }

  if (outfit.familiar === $familiar`Grey Goose` && familiarWeight($familiar`Grey Goose`) < 6)
    outfit.equip($item`grey down vest`);
  if (outfit.familiar === $familiar`Melodramedary` && get("camelSpit") < 100)
    outfit.equip($item`dromedary drinking helmet`);
  if (outfit.familiar === $familiar`Reagnimated Gnome`)
    outfit.equip($item`gnomish housemaid's kgnee`);

  if (!outfit.modifier?.includes("meat") || !have($item`backup camera`)) {
    // Leave room for backup camera for nuns
    outfit.equip($item`mafia thumb ring`);
  }
  if (atLevel(11)) outfit.equip($item`lucky gold ring`);

  if (myBasestat($stat`moxie`) <= 200) {
    // Equip some extra equipment for early survivability
    outfit.equip($item`plastic vampire fangs`);
    outfit.equip($item`warbear goggles`);
    outfit.equip($item`burning paper slippers`);
  }

  if (!outfit.modifier) {
    // Default outfit
    outfit.equip($item`giant yellow hat`);
    outfit.equip($item`ice crown`);
    outfit.equip($item`June cleaver`);
    outfit.equip($item`industrial fire extinguisher`);
    if (have($skill`Torso Awareness`)) {
      outfit.equip($item`Jurassic Parka`);
      outfit.equip($item`fresh coat of paint`);
    }
    outfit.equip($item`familiar scrapbook`);
    outfit.equip($item`protonic accelerator pack`);
    outfit.equip($item`unwrapped knock-off retro superhero cape`);
    outfit.equip($item`designer sweatpants`);
    outfit.equip($item`warbear long johns`);
    outfit.equip($item`square sponge pants`);
    outfit.equip($item`Cargo Cultist Shorts`);
    outfit.equip($item`lucky gold ring`);
    if (
      outfit.familiar === $familiar`Grey Goose` &&
      (familiarWeight($familiar`Grey Goose`) < 6 || force_charge_goose)
    )
      outfit.equip($item`teacher's pen`, $slot`acc3`);
    outfit.equip($item`Powerful Glove`);
    outfit.equip($item`backup camera`);
    outfit.equip($item`birch battery`);
    outfit.equip($item`combat lover's locket`);
  } else {
    outfit.modifier += ", 0.01 MP regen, 0.001 HP regen";
    // Defibrillator breaks the Beaten up tests
    if (haveLoathingLegion()) {
      outfit.avoid.push($item`Loathing Legion defibrillator`);
    }
  }

  // Avoid burning CMG void fight just for the modifier
  if (
    have($item`cursed magnifying glass`) &&
    get("cursedMagnifyingGlassCount") >= 13 &&
    ![...outfit.equips.values()].includes($item`cursed magnifying glass`)
  ) {
    outfit.avoid.push($item`cursed magnifying glass`);
  }

  outfit.equip($item`miniature crystal ball`);
  // If we never found a better familiar, just keep charging the goose
  outfit.equip($familiar`Grey Goose`);
}

export function fixFoldables(outfit: Outfit) {
  // Libram outfit cache may not autofold umbrella, so we need to
  if (equippedAmount($item`unbreakable umbrella`) > 0) {
    if (outfit.modifier?.includes("-combat")) {
      if (get("umbrellaState") !== "cocoon") cliExecute("umbrella cocoon");
    } else if (outfit.modifier?.includes("ML") && !outfit.modifier.match("-[\\d .]*ML")) {
      if (get("umbrellaState") !== "broken") cliExecute("umbrella broken");
    } else if (outfit.modifier?.includes("item")) {
      if (get("umbrellaState") !== "bucket style") cliExecute("umbrella bucket");
    } else {
      if (get("umbrellaState") !== "forward-facing") cliExecute("umbrella forward");
    }
  }

  // Libram outfit cache may not autofold camera, so we need to
  if (equippedAmount($item`backup camera`) > 0) {
    if (outfit.modifier?.includes("ML") && !outfit.modifier.match("-[\\d .]*ML")) {
      if (get("backupCameraMode").toLowerCase() !== "ml") cliExecute("backupcamera ml");
    } else if (outfit.modifier?.includes("init") && !outfit.modifier.match("-[\\d .]*init")) {
      if (get("backupCameraMode").toLowerCase() !== "init") cliExecute("backupcamera init");
    } else {
      if (get("backupCameraMode").toLowerCase() !== "meat") cliExecute("backupcamera meat");
    }
    if (!get("backupCameraReverserEnabled")) {
      cliExecute("backupcamera reverser on");
    }
  }

  // Libram outfit cache may not autofold cape, so we need to
  if (equippedAmount($item`unwrapped knock-off retro superhero cape`) > 0) {
    if (
      (outfit.modifier?.includes("res") && get("retroCapeSuperhero") !== "vampire") ||
      get("retroCapeWashingInstructions") !== "hold"
    ) {
      cliExecute("retrocape vampire hold");
    }
  }

  // Libram outfit cache may not autofold parka, so we need to
  if (equippedAmount($item`Jurassic Parka`) > 0) {
    if (outfit.modifier?.includes("cold res")) {
      if (get("parkaMode").toLowerCase() !== "kachungasaur") cliExecute("parka kachungasaur");
    } else if (outfit.modifier?.includes("stench res")) {
      if (get("parkaMode").toLowerCase() !== "dilophosaur") cliExecute("parka dilophosaur");
    } else if (outfit.modifier?.includes("ML") && !outfit.modifier.match("-[\\d .]*ML")) {
      if (get("parkaMode").toLowerCase() !== "spikolodon") cliExecute("parka spikolodon");
    } else if (
      outfit.modifier?.includes("-combat") ||
      (outfit.modifier?.includes("init") &&
        !outfit.modifier.match("-[\\d .]*init") &&
        !outfit.modifier.match("combat"))
    ) {
      if (get("parkaMode").toLowerCase() !== "pterodactyl") cliExecute("parka pterodactyl");
    } else {
      // +meat
      if (get("parkaMode").toLowerCase() !== "kachungasaur") cliExecute("parka kachungasaur");
    }
  }
}

export function cacheDress(outfit: Outfit, extraOptions?: Partial<MaximizeOptions>) {
  const currentEquipScore = cacheScore(outfit.equips);

  const outfits: { name: string; score: number }[] = [0, 1, 2, 3, 4, 5]
    .map((i) => `Script Outfit ${i}`)
    .map((name) => ({ name: name, score: cacheScore(outfit.equips, name) }));
  outfits.sort((a, b) => (a.score < b.score ? -1 : a.score > b.score ? 1 : 0)).reverse();
  if (outfits[0].score > currentEquipScore + 1) {
    print(
      `Equipping ${outfits[0].score - currentEquipScore} items with ${
        outfits[0].name
      } (${outfitPieces(outfits[0].name).join(", ")})`
    );
    equipOutfit(outfits[0].name);
  }

  outfit.dress(extraOptions);
}

const nonAccSlots = $slots`hat, weapon, off-hand, back, shirt, pants`;
const accSlots = $slots`acc1, acc2, acc3`;
const outfitSlots = $slots`hat, weapon, off-hand, back, shirt, pants, acc1, acc2, acc3`;

export function loadItems(outfit?: string): Map<Slot, Item> {
  if (!outfit) {
    return new Map<Slot, Item>(outfitSlots.map((slot) => [slot, equippedItem(slot)]));
  }

  const result = new Map<Slot, Item>();
  const freeAccSlots = $slots`acc3, acc2, acc1`;
  const items = outfitPieces(outfit);
  for (const item of items) {
    const slot = toSlot(item);
    switch (slot) {
      case $slot`weapon`:
        // The second weapon in the item list is the dual-equipped one
        if (result.has($slot`weapon`)) result.set($slot`off-hand`, item);
        else result.set($slot`weapon`, item);
        break;
      case $slot`acc1`:
        result.set(freeAccSlots.pop() ?? $slot`none`, item);
        break;
      default:
        result.set(slot, item);
        break;
    }
  }
  return result;
}

export function cacheScore(desired: Map<Slot, Item>, name?: string): number {
  const items = loadItems(name);

  let overlap = 0;
  for (const slot of nonAccSlots) {
    if (desired.has(slot) && desired.get(slot) === items.get(slot)) overlap++;
  }

  const desiredAccesoriesMet = new Set<Slot>();
  for (const slot of accSlots) {
    const acc = items.get(slot);
    if (acc === undefined) continue;
    const matchedSlot = accSlots.find(
      (slot) => !desiredAccesoriesMet.has(slot) && desired.get(slot) === acc
    );
    if (matchedSlot !== undefined) {
      desiredAccesoriesMet.add(matchedSlot);
      overlap++;
    }
  }

  // print(`${name} (${[...items.values()].join(", ")}): ${overlap}`);
  return overlap;
}
