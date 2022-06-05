import { cliExecute, Familiar, Item, itemAmount, Monster, Skill, totalTurnsPlayed } from "kolmafia";
import {
  $item,
  $monster,
  $skill,
  get,
  getBanishedMonsters,
  getKramcoWandererChance,
  have,
  Macro,
} from "libram";
import { MonsterStrategy } from "./combat";
import { atLevel } from "./lib";
import { Task } from "./tasks/structure";

export interface Resource {
  name: string;
  available: () => boolean;
  prepare?: () => void;
  equip?: Item | Familiar | (Item | Familiar)[];
  chance?: () => number;
}

export interface CombatResource extends Resource {
  do: Item | Skill | Macro;
}

export interface BanishSource extends CombatResource {
  do: Item | Skill;
}

const banishSources: BanishSource[] = [
  {
    name: "Bowl Curveball",
    available: () => have($item`cosmic bowling ball`),
    do: $skill`Bowl a Curveball`,
  },
  {
    name: "System Sweep",
    available: () => have($skill`System Sweep`),
    do: $skill`System Sweep`,
  },
  {
    name: "Reflex Hammer",
    available: () => get("_reflexHammerUsed") < 3 && have($item`Lil' Doctor™ bag`),
    do: $skill`Reflex Hammer`,
    equip: $item`Lil' Doctor™ bag`,
  },
  {
    name: "KGB dart",
    available: () =>
      get("_kgbTranquilizerDartUses") < 3 && have($item`Kremlin's Greatest Briefcase`),
    do: $skill`KGB tranquilizer dart`,
    equip: $item`Kremlin's Greatest Briefcase`,
  },
  {
    name: "Latte",
    available: () =>
      (!get("_latteBanishUsed") || get("_latteRefillsUsed") < 2) && // Save one refil for aftercore
      have($item`latte lovers member's mug`),
    prepare: (): void => {
      if (get("_latteBanishUsed")) cliExecute("latte refill cinnamon pumpkin vanilla"); // Always unlocked
    },
    do: $skill`Throw Latte on Opponent`,
    equip: $item`latte lovers member's mug`,
  },
  {
    name: "Middle Finger",
    available: () => !get("_mafiaMiddleFingerRingUsed") && have($item`mafia middle finger ring`),
    do: $skill`Show them your ring`,
    equip: $item`mafia middle finger ring`,
  },
];

export class BanishState {
  already_banished = new Map<Monster, Item | Skill>();
  used_banishes = new Set<Item | Skill>();

  // Record all banishes that are committed to an active task
  constructor(tasks: Task[]) {
    this.already_banished = new Map(
      Array.from(getBanishedMonsters(), (entry) => [entry[1], entry[0]])
    );

    for (const task of tasks) {
      if (task.combat === undefined) continue;
      for (const monster of task.combat.where(MonsterStrategy.Banish)) {
        const banished_with = this.already_banished.get(monster);
        if (banished_with !== undefined) this.used_banishes.add(banished_with);
      }
    }
  }

  // Return true if some of the monsters in the task are banished
  isPartiallyBanished(task: Task): boolean {
    return (
      task.combat
        ?.where(MonsterStrategy.Banish)
        ?.find((monster) => this.already_banished.has(monster)) !== undefined
    );
  }

  // Return true if all requested monsters in the task are banished
  isFullyBanished(task: Task): boolean {
    return (
      task.combat
        ?.where(MonsterStrategy.Banish)
        ?.find((monster) => !this.already_banished.has(monster)) === undefined
    );
  }

  // Return a list of all banishes not allocated to some available task
  unusedBanishes(): BanishSource[] {
    return banishSources.filter(
      (banish) => banish.available() && !this.used_banishes.has(banish.do)
    );
  }
}

export interface WandererSource extends Resource {
  monster: Monster | string;
  chance: () => number;
}

export const wandererSources: WandererSource[] = [
  {
    name: "Voted",
    available: () =>
      have($item`"I Voted!" sticker`) &&
      totalTurnsPlayed() % 11 === 1 &&
      get("lastVoteMonsterTurn") < totalTurnsPlayed() &&
      get("_voteFreeFights") < 3 &&
      atLevel(5),
    equip: $item`"I Voted!" sticker`,
    monster:
      "monsterid 2094 || monsterid 2095 || monsterid 2096 || monsterid 2097 || monsterid 2098",
    chance: () => 1, // when available
  },
  {
    name: "Cursed Magnifying Glass",
    available: () =>
      have($item`cursed magnifying glass`) &&
      get("_voidFreeFights") < 5 &&
      get("cursedMagnifyingGlassCount") >= 13 &&
      (itemAmount($item`barrel of gunpowder`) >= 5 || // Done with cmg + meteor trick
        get("sidequestLighthouseCompleted") !== "none"),
    equip: $item`cursed magnifying glass`,
    monster: "monsterid 2227 || monsterid 2228 || monsterid 2229",
    chance: () => 1, // when available
  },
  {
    name: "Kramco",
    available: () => have($item`Kramco Sausage-o-Matic™`) && atLevel(5),
    equip: $item`Kramco Sausage-o-Matic™`,
    monster: $monster`sausage goblin`,
    chance: () => getKramcoWandererChance(),
  },
];

export function canChargeVoid(): boolean {
  return get("_voidFreeFights") < 5 && get("cursedMagnifyingGlassCount") < 13;
}

export interface RunawaySource extends CombatResource {
  do: Macro;
  banishes: boolean;
  chance: () => number;
}

export const runawayValue =
  have($item`Greatest American Pants`) || have($item`navel ring of navel gazing`)
    ? 0.8 * get("valueOfAdventure")
    : get("valueOfAdventure");

export const runawaySources: RunawaySource[] = [
  {
    name: "Bowl Curveball",
    available: () => false,
    do: new Macro().skill($skill`Bowl a Curveball`),
    chance: () => 1,
    banishes: true,
  },
];

export interface FreekillSource extends CombatResource {
  do: Item | Skill;
}

export const freekillSources: FreekillSource[] = [];
