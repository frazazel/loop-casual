import {
  buy,
  cliExecute,
  haveEquipped,
  itemAmount,
  mallPrice,
  myLevel,
  runChoice,
  use,
  visitUrl,
} from "kolmafia";
import {
  $coinmaster,
  $effect,
  $familiar,
  $item,
  $items,
  $location,
  $monster,
  $skill,
  get,
  have,
  Macro,
} from "libram";
import { Quest, Task } from "../engine/task";
import { CombatStrategy } from "../engine/combat";
import { OutfitSpec, step } from "grimoire-kolmafia";
import { args } from "../main";

const Diary: Task[] = [
  {
    name: "Forest",
    after: ["Start"],
    acquire: [{ item: $item`blackberry galoshes` }],
    completed: () => step("questL11Black") >= 2,
    do: $location`The Black Forest`,
    outfit: {
      equip: $items`blackberry galoshes`,
      familiar: $familiar`Reassembled Blackbird`,
      modifier: "+combat",
    },
    choices: { 923: 1, 924: 1 },
    combat: new CombatStrategy().ignore($monster`blackberry bush`).kill(),
    limit: { soft: 15 },
  },
  {
    name: "Buy Documents",
    after: ["Forest"],
    completed: () => have($item`forged identification documents`) || step("questL11Black") >= 4,
    do: (): void => {
      visitUrl("woods.php");
      visitUrl("shop.php?whichshop=blackmarket");
      visitUrl("shop.php?whichshop=blackmarket&action=buyitem&whichrow=281&ajax=1&quantity=1");
    },
    limit: { tries: 1 },
    freeaction: true,
  },
  {
    name: "Diary",
    after: ["Buy Documents", "Misc/Unlock Beach"],
    completed: () => step("questL11Black") >= 4,
    do: $location`The Shore, Inc. Travel Agency`,
    choices: { 793: 1 },
    limit: { tries: 1 },
  },
];

const Desert: Task[] = [
  {
    name: "Initial Milestones",
    after: ["Diary"],
    ready: () =>
      (args.milestones || mallPrice($item`milestone`) <= (5 / 3) * get("valueOfAdventure")) &&
      get("desertExploration") === 0,
    completed: () => get("desertExploration") >= 10,
    acquire: [{ item: $item`milestone`, price: (4 / 3) * get("valueOfAdventure"), num: 2 }],
    do: () => use(2, $item`milestone`),
    limit: { tries: 1 },
    freeaction: true,
  },
  {
    name: "Find Gnasir",
    after: ["Diary"],
    ready: () => get("desertExploration") >= 10,
    completed: () =>
      $location`The Arid, Extra-Dry Desert`.noncombatQueue.includes("A Sietch in Time") ||
      get("gnasirProgress") > 0 ||
      get("desertExploration") >= 100,
    outfit: (): OutfitSpec => ({
      avoid: $items`June cleaver, Kramco Sausage-o-Matic™, protonic accelerator pack, cursed magnifying glass`,
    }),
    choices: { 805: 1 },
    do: $location`The Arid, Extra-Dry Desert`,
    limit: { tries: 1 },
  },
  {
    name: "Gnasir Turn-in",
    after: ["Diary", "Find Gnasir"],
    completed: () =>
      (itemAmount($item`worm-riding manual page`) < 15 &&
        (get("gnasirProgress") & 2) > 0 &&
        (get("gnasirProgress") & 4) > 0) ||
      get("desertExploration") >= 100,
    acquire: [
      { item: $item`can of black paint`, useful: () => (get("gnasirProgress") & 2) === 0 },
      { item: $item`killing jar`, useful: () => (get("gnasirProgress") & 4) === 0 },
      { item: $item`drum machine`, useful: () => (get("gnasirProgress") & 16) === 0 },
    ],
    do: () => {
      let res = visitUrl("place.php?whichplace=desertbeach&action=db_gnasir");
      while (res.includes("value=2")) {
        res = runChoice(2);
      }
      runChoice(1);
    },
    post: () => {
      cliExecute("use * desert sightseeing pamphlet");
      if (have($item`worm-riding hooks`)) use($item`drum machine`);
    },
    limit: { tries: 2 },
    freeaction: true,
  },
  {
    name: "Finish with Milestones",
    after: ["Diary", "Gnasir Turn-in"],
    ready: () => (get("gnasirProgress") & 2) > 0 && (get("gnasirProgress") & 4) > 0,
    completed: () => !args.milestones || get("desertExploration") >= 100,
    acquire: [
      {
        item: $item`milestone`,
        price: (4 / 3) * get("valueOfAdventure"),
        num: 20 - Math.ceil(get("desertExploration") / 5),
      },
    ],
    do: () => use(20 - Math.ceil(get("desertExploration") / 5), $item`milestone`),
    limit: { tries: 1 },
    freeaction: true,
  },
  {
    name: "Scrip",
    after: ["Misc/Unlock Beach"],
    ready: () => !args.milestones,
    completed: () =>
      get("desertExploration") >= 100 ||
      have($item`Shore Inc. Ship Trip Scrip`) ||
      have($item`UV-resistant compass`),
    do: $location`The Shore, Inc. Travel Agency`,
    choices: { 793: 1 },
    limit: { tries: 1 },
  },
  {
    name: "Compass",
    after: ["Diary", "Scrip"],
    ready: () => !args.milestones,
    completed: () => get("desertExploration") >= 100 || have($item`UV-resistant compass`),
    do: () => buy($coinmaster`The Shore, Inc. Gift Shop`, 1, $item`UV-resistant compass`),
    limit: { tries: 1 },
    freeaction: true,
  },
  {
    name: "Initial Desert",
    after: ["Diary", "Compass"],
    ready: () => !args.milestones,
    completed: () => get("desertExploration") >= 10,
    do: $location`The Arid, Extra-Dry Desert`,
    outfit: (): OutfitSpec => {
      const handItems = $items`survival knife, UV-resistant compass`.filter((it) => have(it));
      if (
        have($item`industrial fire extinguisher`) &&
        get("_fireExtinguisherCharge") >= 20 &&
        !get("fireExtinguisherDesertUsed") &&
        have($effect`Ultrahydrated`)
      )
        handItems.unshift($item`industrial fire extinguisher`);
      return {
        equip: handItems.slice(0, 2),
        familiar: $familiar`Melodramedary`,
        famequip: $item`dromedary drinking helmet`,
      };
    },
    combat: new CombatStrategy()
      .macro(() =>
        Macro.externalIf(
          have($effect`Ultrahydrated`) && !haveEquipped($item`"I Voted!" sticker`),
          Macro.trySkill($skill`Fire Extinguisher: Zone Specific`)
        )
      )
      .kill(),
    limit: { turns: 5 },
    delay: 5,
    choices: { 805: 1 },
  },
  {
    name: "Desert",
    after: ["Diary", "Compass", "Gnasir Turn-in"],
    ready: () => !args.milestones,
    completed: () => get("desertExploration") >= 100,
    do: $location`The Arid, Extra-Dry Desert`,
    outfit: (): OutfitSpec => {
      const handItems = $items`survival knife, UV-resistant compass`.filter((it) => have(it));
      if (
        have($item`industrial fire extinguisher`) &&
        get("_fireExtinguisherCharge") >= 20 &&
        !get("fireExtinguisherDesertUsed") &&
        have($effect`Ultrahydrated`)
      )
        handItems.unshift($item`industrial fire extinguisher`);
      return {
        equip: handItems.slice(0, 2),
        familiar: $familiar`Melodramedary`,
        famequip: $item`dromedary drinking helmet`,
      };
    },
    combat: new CombatStrategy()
      .macro(() =>
        Macro.externalIf(
          have($effect`Ultrahydrated`) && !haveEquipped($item`"I Voted!" sticker`),
          Macro.trySkill($skill`Fire Extinguisher: Zone Specific`)
        )
      )
      .kill(),
    limit: { turns: 30 },
    delay: 20,
  },
];

function rotatePyramid(goal: number): void {
  const ratchets = (goal - get("pyramidPosition") + 5) % 5;
  const to_buy =
    ratchets - itemAmount($item`tomb ratchet`) - itemAmount($item`crumbling wooden wheel`);
  if (to_buy > 0) {
    buy($item`tomb ratchet`, to_buy);
  }
  visitUrl("place.php?whichplace=pyramid&action=pyramid_control");
  for (let i = 0; i < ratchets; i++) {
    if (have($item`crumbling wooden wheel`)) {
      visitUrl("choice.php?whichchoice=929&option=1&pwd");
    } else {
      visitUrl("choice.php?whichchoice=929&option=2&pwd");
    }
  }
  if (get("pyramidPosition") !== goal) throw `Failed to rotate pyramid to ${goal}`;
  visitUrl("choice.php?whichchoice=929&option=5&pwd");
}

const Pyramid: Task[] = [
  {
    name: "Open Pyramid",
    after: ["Desert", "Manor/Boss", "Palindome/Boss", "Hidden City/Boss"],
    completed: () => step("questL11Pyramid") >= 0,
    do: () => visitUrl("place.php?whichplace=desertbeach&action=db_pyramid1"),
    limit: { tries: 1 },
    freeaction: true,
  },
  {
    name: "Upper Chamber",
    after: ["Open Pyramid"],
    completed: () => step("questL11Pyramid") >= 1,
    do: $location`The Upper Chamber`,
    outfit: { modifier: "+combat" },
    limit: { turns: 6 },
  },
  {
    name: "Middle Chamber",
    after: ["Upper Chamber"],
    completed: () => get("controlRoomUnlock"),
    do: $location`The Middle Chamber`,
    limit: { turns: 11 },
    delay: 9,
  },
  {
    name: "Get Token",
    acquire: [{ item: $item`tomb ratchet`, num: 3 }],
    after: ["Middle Chamber"],
    completed: () =>
      have($item`ancient bronze token`) || have($item`ancient bomb`) || get("pyramidBombUsed"),
    do: () => rotatePyramid(4),
    limit: { tries: 1 },
  },
  {
    name: "Get Bomb",
    acquire: [{ item: $item`tomb ratchet`, num: 4 }],
    after: ["Get Token"],
    completed: () => have($item`ancient bomb`) || get("pyramidBombUsed"),
    do: () => rotatePyramid(3),
    limit: { tries: 1 },
  },
  {
    name: "Use Bomb",
    acquire: [{ item: $item`tomb ratchet`, num: 3 }],
    after: ["Get Bomb"],
    completed: () => get("pyramidBombUsed"),
    do: () => rotatePyramid(1),
    limit: { tries: 1 },
  },
  {
    name: "Boss",
    after: ["Use Bomb"],
    completed: () => step("questL11Pyramid") === 999,
    do: () => visitUrl("place.php?whichplace=pyramid&action=pyramid_state1a"),
    boss: true,
    combat: new CombatStrategy()
      .macro(
        new Macro()
          .trySkill($skill`Saucegeyser`)
          .attack()
          .repeat()
      )
      .kill(),
    limit: { tries: 1 },
  },
];

export const MacguffinQuest: Quest = {
  name: "Macguffin",
  tasks: [
    {
      name: "Start",
      after: ["Toot/Finish"],
      ready: () => myLevel() >= 11,
      completed: () => step("questL11MacGuffin") !== -1,
      do: () => visitUrl("council.php"),
      limit: { tries: 1 },
      freeaction: true,
    },
    ...Diary,
    ...Desert,
    ...Pyramid,
    {
      name: "Finish",
      after: ["Boss"],
      completed: () => step("questL11MacGuffin") === 999,
      do: () => visitUrl("council.php"),
      limit: { tries: 1 },
      freeaction: true,
    },
  ],
};
