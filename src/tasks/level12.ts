import {
  availableAmount,
  cliExecute,
  create,
  equippedAmount,
  Item,
  itemAmount,
  mallPrice,
  myTurncount,
  sell,
  use,
  visitUrl,
} from "kolmafia";
import {
  $coinmaster,
  $effect,
  $effects,
  $familiar,
  $item,
  $items,
  $location,
  $monster,
  $monsters,
  $skill,
  ensureEffect,
  get,
  have,
  Macro,
  set,
} from "libram";
import { Quest, Task } from "../engine/task";
import { OutfitSpec, step } from "grimoire-kolmafia";
import { OverridePriority } from "../engine/priority";
import { CombatStrategy } from "../engine/combat";
import { atLevel, debug } from "../lib";
import { forceItemPossible, yellowRayPossible } from "../engine/resources";
import { args } from "../main";

export function flyersDone(): boolean {
  return get("flyeredML") >= 10000;
}

const Flyers: Task[] = [
  {
    name: "Flyers Start",
    after: ["Enrage"],
    completed: () =>
      have($item`rock band flyers`) || get("sidequestArenaCompleted") !== "none" || warSkip(),
    outfit: { equip: $items`beer helmet, distressed denim pants, bejeweled pledge pin` },
    do: (): void => {
      visitUrl("bigisland.php?place=concert&pwd");
    },
    freeaction: true,
    limit: { tries: 1 },
  },
  {
    name: "Flyers End",
    after: ["Flyers Start"],
    priority: () => OverridePriority.Free,
    ready: () => flyersDone(), // Buffer for mafia tracking
    completed: () => get("sidequestArenaCompleted") !== "none" || warSkip(),
    outfit: { equip: $items`beer helmet, distressed denim pants, bejeweled pledge pin` },
    do: (): void => {
      visitUrl("bigisland.php?place=concert&pwd");
      cliExecute("refresh inv");
      if (have($item`rock band flyers`)) {
        debug("Mafia tracking was incorrect for rock band flyers; continuing to flyer...");
        set(
          "_loopgyou_flyeredML_buffer",
          get("_loopgyou_flyeredML_buffer", 0) + (get("flyeredML") - 9900)
        );
        set("flyeredML", 9900);
      } else if (get("_loopgyou_flyeredML_buffer", 0) > 0) {
        debug(
          `Mafia tracking was incorrect for rock band flyers; quest completed at ${
            get("flyeredML") + get("_loopgyou_flyeredML_buffer", 0)
          }`
        );
      }
    },
    freeaction: true,
    limit: { soft: 10, message: "See https://kolmafia.us/threads/flyeredml-tracking-wrong.27567/" },
  },
];

const Lighthouse: Task[] = [
  // Saber into more lobsterfrogmen
  // Or backup into the Boss Bat's lair
  {
    name: "Lighthouse",
    after: ["Enrage"],
    ready: () => step("questL04Bat") >= 3 || have($item`Fourth of May Cosplay Saber`),
    completed: () =>
      itemAmount($item`barrel of gunpowder`) >= 5 ||
      get("sidequestLighthouseCompleted") !== "none" ||
      !have($item`backup camera`) ||
      !have($item`Fourth of May Cosplay Saber`) ||
      warSkip(),
    do: $location`Sonofa Beach`,
    outfit: (): OutfitSpec => {
      if (!have($item`Fourth of May Cosplay Saber`)) return { modifier: "+combat" };

      // Look for the first lobsterfrogman
      if (
        get("_saberForceMonster") !== $monster`lobsterfrogman` ||
        get("_saberForceMonsterCount") === 0
      ) {
        return { modifier: "+combat", equip: $items`Fourth of May Cosplay Saber` };
      }

      // Reuse the force to track more lobsterfrogman
      if (get("_saberForceMonsterCount") === 1 && itemAmount($item`barrel of gunpowder`) < 4) {
        return { equip: $items`Fourth of May Cosplay Saber` };
      }

      return {};
    },
    combat: new CombatStrategy()
      .macro(() => {
        if (
          equippedAmount($item`Fourth of May Cosplay Saber`) > 0 &&
          get("_saberForceUses") < 5 &&
          (get("_saberForceMonster") !== $monster`lobsterfrogman` ||
            get("_saberForceMonsterCount") === 0 ||
            (get("_saberForceMonsterCount") === 1 && itemAmount($item`barrel of gunpowder`) < 4))
        ) {
          return new Macro().skill($skill`Use the Force`);
        }
        return new Macro();
      })
      .kill($monster`lobsterfrogman`),
    choices: { 1387: 2 },
    limit: { tries: 20 },
  },
  {
    name: "Lighthouse Basic",
    after: ["Enrage", "Lighthouse"],
    completed: () =>
      itemAmount($item`barrel of gunpowder`) >= 5 ||
      get("sidequestLighthouseCompleted") !== "none" ||
      warSkip(),
    do: $location`Sonofa Beach`,
    outfit: { modifier: "+combat" },
    combat: new CombatStrategy().kill($monster`lobsterfrogman`),
    limit: { soft: 40 },
  },
  {
    name: "Lighthouse End",
    after: ["Lighthouse Basic"],
    completed: () => get("sidequestLighthouseCompleted") !== "none" || warSkip(),
    outfit: { equip: $items`beer helmet, distressed denim pants, bejeweled pledge pin` },
    do: (): void => {
      visitUrl("bigisland.php?place=lighthouse&action=pyro&pwd");
    },
    freeaction: true,
    limit: { tries: 1 },
  },
];

const Junkyard: Task[] = [
  {
    name: "Junkyard Start",
    after: ["Enrage"],
    completed: () =>
      have($item`molybdenum magnet`) || get("sidequestJunkyardCompleted") !== "none" || warSkip(),
    outfit: { equip: $items`beer helmet, distressed denim pants, bejeweled pledge pin` },
    do: (): void => {
      visitUrl("bigisland.php?action=junkman&pwd");
    },
    freeaction: true,
    limit: { tries: 1 },
  },
  {
    name: "Junkyard Hammer",
    after: ["Junkyard Start"],
    completed: () =>
      have($item`molybdenum hammer`) || get("sidequestJunkyardCompleted") !== "none" || warSkip(),
    acquire: [{ item: $item`seal tooth` }],
    outfit: { equip: $items`beer helmet, distressed denim pants, bejeweled pledge pin` },
    do: $location`Next to that Barrel with Something Burning in it`,
    orbtargets: () => $monsters`batwinged gremlin, batwinged gremlin (tool)`,
    combat: new CombatStrategy()
      .macro(
        new Macro()
          .while_(
            "!match whips out && !times 28 && !hpbelow 30",
            new Macro().item($item`seal tooth`)
          )
          .if_("match whips out", new Macro().item(`molybdenum magnet`)),
        $monster`batwinged gremlin (tool)`
      )
      .banish($monster`A.M.C. gremlin`)
      .kill($monster`batwinged gremlin (tool)`)
      .ignoreSoftBanish($monsters`batwinged gremlin, vegetable gremlin`),
    limit: { soft: 15 },
  },
  {
    name: "Junkyard Wrench",
    after: ["Junkyard Start"],
    completed: () =>
      have($item`molybdenum crescent wrench`) ||
      get("sidequestJunkyardCompleted") !== "none" ||
      warSkip(),
    acquire: [{ item: $item`seal tooth` }],
    outfit: { equip: $items`beer helmet, distressed denim pants, bejeweled pledge pin` },
    do: $location`Over Where the Old Tires Are`,
    orbtargets: () => $monsters`erudite gremlin, erudite gremlin (tool)`,
    combat: new CombatStrategy()
      .macro(
        new Macro()
          .while_(
            "!match whips out && !times 28 && !hpbelow 30",
            new Macro().item($item`seal tooth`)
          )
          .if_("match whips out", new Macro().item(`molybdenum magnet`)),
        $monster`erudite gremlin (tool)`
      )
      .banish($monster`A.M.C. gremlin`)
      .kill($monster`erudite gremlin (tool)`)
      .ignoreSoftBanish($monsters`erudite gremlin, spider gremlin`),
    limit: { soft: 15 },
  },
  {
    name: "Junkyard Pliers",
    after: ["Junkyard Start"],
    acquire: [{ item: $item`seal tooth` }],
    completed: () =>
      have($item`molybdenum pliers`) || get("sidequestJunkyardCompleted") !== "none" || warSkip(),
    outfit: { equip: $items`beer helmet, distressed denim pants, bejeweled pledge pin` },
    do: $location`Near an Abandoned Refrigerator`,
    orbtargets: () => $monsters`spider gremlin, spider gremlin (tool)`,
    combat: new CombatStrategy()
      .macro(
        new Macro()
          .while_(
            "!match whips out && !times 28 && !hpbelow 30",
            new Macro().item($item`seal tooth`)
          )
          .if_("match whips out", new Macro().item(`molybdenum magnet`)),
        $monster`spider gremlin (tool)`
      )
      .banish($monster`A.M.C. gremlin`)
      .kill($monster`spider gremlin (tool)`)
      .ignoreSoftBanish($monsters`batwinged gremlin, spider gremlin`),
    limit: { soft: 15 },
  },
  {
    name: "Junkyard Screwdriver",
    after: ["Junkyard Start"],
    completed: () =>
      have($item`molybdenum screwdriver`) ||
      get("sidequestJunkyardCompleted") !== "none" ||
      warSkip(),
    acquire: [{ item: $item`seal tooth` }],
    outfit: { equip: $items`beer helmet, distressed denim pants, bejeweled pledge pin` },
    do: $location`Out by that Rusted-Out Car`,
    orbtargets: () => $monsters`vegetable gremlin, vegetable gremlin (tool)`,
    combat: new CombatStrategy()
      .macro(
        new Macro()
          .while_(
            "!match whips out && !times 28 && !hpbelow 30",
            new Macro().item($item`seal tooth`)
          )
          .if_("match whips out", new Macro().item(`molybdenum magnet`)),
        $monster`vegetable gremlin (tool)`
      )
      .banish($monster`A.M.C. gremlin`)
      .kill($monster`vegetable gremlin (tool)`)
      .ignoreSoftBanish($monsters`erudite gremlin, vegetable gremlin`),
    limit: { soft: 15 },
  },
  {
    name: "Junkyard End",
    after: ["Junkyard Hammer", "Junkyard Wrench", "Junkyard Pliers", "Junkyard Screwdriver"],
    completed: () => get("sidequestJunkyardCompleted") !== "none" || warSkip(),
    outfit: { equip: $items`beer helmet, distressed denim pants, bejeweled pledge pin` },
    do: (): void => {
      visitUrl("bigisland.php?action=junkman&pwd");
    },
    freeaction: true,
    limit: { tries: 1 },
  },
];

const Orchard: Task[] = [
  {
    name: "Orchard Hatching",
    after: ["Enrage"],
    completed: () =>
      have($item`filthworm hatchling scent gland`) ||
      have($effect`Filthworm Larva Stench`) ||
      have($item`filthworm drone scent gland`) ||
      have($effect`Filthworm Drone Stench`) ||
      have($item`filthworm royal guard scent gland`) ||
      have($effect`Filthworm Guard Stench`) ||
      have($item`heart of the filthworm queen`) ||
      get("sidequestOrchardCompleted") !== "none" ||
      warSkip(),
    do: $location`The Hatching Chamber`,
    outfit: () => {
      if (yellowRayPossible()) return {};
      else return { modifier: "item" };
    },
    combat: new CombatStrategy().yellowRay($monster`larval filthworm`),
    limit: { soft: 10 },
  },
  {
    name: "Orchard Feeding",
    after: ["Orchard Hatching"],
    completed: () =>
      have($item`filthworm drone scent gland`) ||
      have($effect`Filthworm Drone Stench`) ||
      have($item`filthworm royal guard scent gland`) ||
      have($effect`Filthworm Guard Stench`) ||
      have($item`heart of the filthworm queen`) ||
      get("sidequestOrchardCompleted") !== "none" ||
      warSkip(),
    do: $location`The Feeding Chamber`,
    outfit: () => {
      if (yellowRayPossible()) return {};
      else return { modifier: "item" };
    },
    combat: new CombatStrategy().yellowRay($monster`filthworm drone`),
    effects: $effects`Filthworm Larva Stench`,
    limit: { soft: 10 },
  },
  {
    name: "Orchard Guard",
    after: ["Orchard Feeding"],
    completed: () =>
      have($item`filthworm royal guard scent gland`) ||
      have($effect`Filthworm Guard Stench`) ||
      have($item`heart of the filthworm queen`) ||
      get("sidequestOrchardCompleted") !== "none" ||
      warSkip(),
    do: $location`The Royal Guard Chamber`,
    effects: $effects`Filthworm Drone Stench`,
    outfit: () => {
      if (yellowRayPossible()) return {};
      else return { modifier: "item" };
    },
    combat: new CombatStrategy().yellowRay($monster`filthworm royal guard`),
    limit: { soft: 10 },
  },
  {
    name: "Orchard Queen",
    after: ["Orchard Guard"],
    completed: () =>
      have($item`heart of the filthworm queen`) ||
      get("sidequestOrchardCompleted") !== "none" ||
      warSkip(),
    do: $location`The Filthworm Queen's Chamber`,
    effects: $effects`Filthworm Guard Stench`,
    combat: new CombatStrategy().kill(),
    limit: { tries: 2 }, // allow wanderer
    boss: true,
  },
  {
    name: "Orchard Finish",
    after: ["Orchard Queen", "Open Orchard"],
    completed: () => get("sidequestOrchardCompleted") !== "none" || warSkip(),
    outfit: { equip: $items`beer helmet, distressed denim pants, bejeweled pledge pin` },
    do: (): void => {
      visitUrl("bigisland.php?place=orchard&action=stand&pwd");
    },
    freeaction: true,
    limit: { tries: 1 },
  },
];

const Nuns: Task[] = [
  {
    name: "Nuns",
    after: ["Open Nuns"],
    completed: () => get("sidequestNunsCompleted") !== "none" || warSkip(),
    priority: () => (have($effect`Winklered`) ? OverridePriority.Effect : OverridePriority.None),
    prepare: () => {
      if (have($item`SongBoom™ BoomBox`) && get("boomBoxSong") !== "Total Eclipse of Your Meat")
        cliExecute("boombox meat");
      if (!get("concertVisited")) ensureEffect($effect`Winklered`);
    },
    do: $location`The Themthar Hills`,
    outfit: () => {
      if (have($familiar`Trick-or-Treating Tot`) && have($item`li'l pirate costume`)) {
        return {
          modifier: "meat",
          familiar: $familiar`Trick-or-Treating Tot`,
          equip: $items`beer helmet, distressed denim pants, bejeweled pledge pin, li'l pirate costume`,
        };
      }
      return {
        modifier: "meat",
        equip: $items`beer helmet, distressed denim pants, bejeweled pledge pin, amulet coin`, // Use amulet coin (if we have) to avoid using orb
      };
    },
    freecombat: true, // Do not equip cmg or carn plant
    combat: new CombatStrategy()
      .macro(new Macro().trySkill($skill`Bowl Straight Up`).trySkill($skill`Sing Along`))
      .kill(),
    limit: { soft: 25 },
    boss: true,
  },
];

export const WarQuest: Quest = {
  name: "War",
  tasks: [
    {
      name: "Start",
      after: [],
      ready: () => atLevel(12) && councilSafe(),
      completed: () => step("questL12War") !== -1,
      do: () => visitUrl("council.php"),
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Outfit Hippy",
      after: ["Misc/Unlock Island"],
      completed: () =>
        (have($item`filthy corduroys`) && have($item`filthy knitted dread sack`)) || warSkip(),
      do: $location`Hippy Camp`,
      limit: { soft: 10 },
      choices: {
        136: () => (have($item`filthy corduroys`) ? 2 : 1),
        137: () => (have($item`filthy corduroys`) ? 1 : 2),
      },
      outfit: () => {
        if (forceItemPossible()) return { modifier: "+combat" };
        else return { modifier: "item" };
      },
      combat: new CombatStrategy().forceItems(),
    },
    {
      name: "Outfit Frat",
      after: ["Start", "Outfit Hippy"],
      completed: () =>
        (have($item`beer helmet`) &&
          have($item`distressed denim pants`) &&
          have($item`bejeweled pledge pin`)) ||
        warSkip(),
      do: $location`Frat House`,
      limit: { soft: 10 },
      choices: { 142: 3, 143: 3, 144: 3, 145: 1, 146: 3, 1433: 3 },
      outfit: () => {
        if (forceItemPossible())
          return {
            equip: $items`filthy corduroys, filthy knitted dread sack`,
            modifier: "+combat",
          };
        else
          return { equip: $items`filthy corduroys, filthy knitted dread sack`, modifier: "item" };
      },
      combat: new CombatStrategy().forceItems(),
    },
    {
      name: "Enrage",
      after: ["Start", "Misc/Unlock Island", "Outfit Frat"],
      ready: warReady,
      completed: () => step("questL12War") >= 1,
      outfit: {
        equip: $items`beer helmet, distressed denim pants, bejeweled pledge pin`,
        modifier: "-combat",
      },
      do: $location`Wartime Hippy Camp (Frat Disguise)`,
      choices: { 142: 3, 143: 3, 144: 3, 145: 1, 146: 3, 1433: 3 },
      limit: { soft: 20 },
    },
    ...Flyers,
    ...Lighthouse,
    ...Junkyard,
    {
      name: "Open Orchard",
      after: ["Flyers End", "Lighthouse End", "Junkyard End"],
      acquire: [
        { item: $item`beer helmet` },
        { item: $item`distressed denim pants` },
        { item: $item`bejeweled pledge pin` },
      ],
      completed: () => get("hippiesDefeated") >= 64 || warSkip(),
      outfit: { equip: $items`beer helmet, distressed denim pants, bejeweled pledge pin` },
      do: $location`The Battlefield (Frat Uniform)`,
      post: dimesForGarters,
      combat: new CombatStrategy().kill(),
      limit: { tries: 10 },
    },
    ...Orchard,
    {
      name: "Open Nuns",
      after: ["Orchard Finish"],
      acquire: [
        { item: $item`beer helmet` },
        { item: $item`distressed denim pants` },
        { item: $item`bejeweled pledge pin` },
      ],
      completed: () => get("hippiesDefeated") >= 192 || warSkip(),
      outfit: { equip: $items`beer helmet, distressed denim pants, bejeweled pledge pin` },
      do: $location`The Battlefield (Frat Uniform)`,
      combat: new CombatStrategy().kill(),
      limit: { tries: 9 },
    },
    ...Nuns,
    {
      name: "Clear",
      after: ["Nuns"],
      acquire: [
        { item: $item`beer helmet` },
        { item: $item`distressed denim pants` },
        { item: $item`bejeweled pledge pin` },
      ],
      completed: () => get("hippiesDefeated") >= 1000 || warSkip(),
      outfit: { equip: $items`beer helmet, distressed denim pants, bejeweled pledge pin` },
      do: $location`The Battlefield (Frat Uniform)`,
      post: dimesForGarters,
      combat: new CombatStrategy().kill(),
      limit: { tries: 30 },
    },
    {
      // Use stuffing fluffers to finish the war (iff delaywar was passed)
      name: "Fluffers",
      after: ["Enrage"],
      completed: () =>
        get("hippiesDefeated") >= 1000 || get("fratboysDefeated") >= 1000 || !args.delaywar,
      outfit: {
        equip: $items`beer helmet, distressed denim pants, bejeweled pledge pin`,
      },
      do: (): void => {
        while (get("hippiesDefeated") < 1000) {
          ensureFluffers(1);
          use($item`stuffing fluffer`);
        }
      },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Boss Hippie",
      after: ["Clear", "Fluffers"],
      completed: () => step("questL12War") === 999,
      ready: warReady,
      outfit: { equip: $items`beer helmet, distressed denim pants, bejeweled pledge pin` },
      prepare: dimesForGarters,
      do: (): void => {
        visitUrl("bigisland.php?place=camp&whichcamp=1&confirm7=1");
        visitUrl("bigisland.php?action=bossfight&pwd");
      },
      combat: new CombatStrategy().killHard(),
      limit: { tries: 1 },
      boss: true,
    },
  ],
};

export function councilSafe(): boolean {
  // Check if it is safe to visit the council without making the war outfit worse
  // (It is harder to get the hippy outfit after the war starts)
  return (
    args.delaywar ||
    !atLevel(12) ||
    (have($item`filthy corduroys`) && have($item`filthy knitted dread sack`)) ||
    (have($item`beer helmet`) &&
      have($item`distressed denim pants`) &&
      have($item`bejeweled pledge pin`))
  );
}

function dimesForGarters(): void {
  if (itemAmount($item`gauze garter`) >= 20) return;
  const to_sell = $items`pink clay bead, purple clay bead, green clay bead, communications windchimes, bullet-proof corduroys, round purple sunglasses, reinforced beaded headband`;
  for (const it of to_sell) {
    if (itemAmount(it) > 0) sell(it.buyer, itemAmount(it), it);
  }

  if ($coinmaster`Quartersmaster`.availableTokens >= 2) cliExecute("make * gauze garter");
}

/* Skip this until ronin if the war is delayed. */
function warReady() {
  return !args.delaywar || myTurncount() >= 1000;
}

/* Skip this entirely, either post-ronin or when delaying until ronin. */
function warSkip() {
  return args.delaywar || myTurncount() >= 1000;
}

function ensureFluffers(flufferCount: number): void {
  // From bean-casual
  while (availableAmount($item`stuffing fluffer`) < flufferCount) {
    if (itemAmount($item`cashew`) >= 3) {
      create(1, $item`stuffing fluffer`);
      continue;
    }
    const neededFluffers = flufferCount - availableAmount($item`stuffing fluffer`);
    const stuffingFlufferSources: [Item, number][] = [
      [$item`cashew`, 3],
      [$item`stuffing fluffer`, 1],
      [$item`cornucopia`, (1 / 3.5) * 3],
    ];
    stuffingFlufferSources.sort(
      ([item1, mult1], [item2, mult2]) => mallPrice(item1) * mult1 - mallPrice(item2) * mult2
    );
    const [stuffingFlufferSource, sourceMultiplier] = stuffingFlufferSources[0];

    const neededOfSource = Math.ceil(neededFluffers * sourceMultiplier);
    cliExecute(`acquire ${neededOfSource} ${stuffingFlufferSource}`);
    if (itemAmount(stuffingFlufferSource) < neededOfSource) {
      throw `Unable to acquire ${stuffingFlufferSource}; maybe raising your pricing limit will help?`;
    }
    if (stuffingFlufferSource === $item`cornucopia`) {
      use(neededOfSource, $item`cornucopia`);
    }
    if (stuffingFlufferSource !== $item`stuffing fluffer`) {
      create(
        clamp(Math.floor(availableAmount($item`cashew`) / 3), 0, neededFluffers),
        $item`stuffing fluffer`
      );
    }
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(n, max));
}
