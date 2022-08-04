# Overview

This is a Grey You softcore script, based on the [loop-casual](https://github.com/Kasekopf/loop-casual) framework.

### Strategy

The script is designed to be run as part of a loop. In particular, it expects that something like [garbo](https://github.com/Loathing-Associates-Scripting-Society/garbage-collector) will use the rest of the turns. This means that profitable daily resources (e.g. copiers) are avoided, but other resources (free runaways, kills, some wanderers) are used to save turns where possible.

### Installation

To install the script, use the following command in the KoLMafia CLI.

```
svn checkout https://github.com/Kasekopf/loop-casual/branches/release/
```

### Usage

1. In aftercore, run `loopgyou sim` to verify that the script is installed, and to confirm that you meet the requirements (see below for more details).
2. Ascend into a Grey You Softcore run. The cold medicine cabinet is required in your workshed. Prefer the Vole sign until you have finished most of the path progression. Astral mask or astral belt are both useful, but neither is required. Prefer candles for your eurdora.
3. Run `loopgyou` and watch it go! If you are more hesitent, you can run `loopgyou actions 10` to only do 10 things and stop.

Run `loopgyou help` for the full set of script options:

```
The arguments accepted by the script are listed below. Note that you can combine multiple options; for example "loopgyou pulls=18 tune=blender" will save 2 pulls and switch moon sign to Blender during the run. Most options also have an associated setting to set an option permanently; for example "set loopgyou_pulls=18" will cause the script to always save 2 pulls (unless overriden by using the pulls option at runtime).
Options:
  sim - Check if you have the requirements to run this script.
  version - Show script version and exit.
  actions NUMBER - Maximum number of actions to perform, if given. Can be used to execute just a few steps at a time. [setting: loopgyou_actions]
  class NUMBER - If given, break the prism and choose a class at the end of the run. You will be reduced to 40 adventures with full organs after breaking the prism. [default: 0] [setting: loopgyou_class]
    class 0 - Stay as Grey You
    class 1 - Seal Clubber
    class 2 - Turtle Tamer
    class 3 - Pastamancer
    class 4 - Saurceror
    class 5 - Disco Bandit
    class 6 - Accordion Thief
  pulls NUMBER - Number of pulls to use. Lower this if you would like to save some pulls for in-ronin farming. [default: 20] [setting: loopgyou_pulls]
  verboseequip - Print out equipment usage before each task. [setting: loopgyou_verboseequip]
  tune TEXT - Use your hewn moon-rune spoon to retune to this sign when optimal. [setting: loopgyou_tune]
  help - Show this message and exit.
```

### Will this script work for me?

Run `loopgyou sim` to see "Is the script intended to work unmodified on my character?". A sample output is below, but it may be slightly out of date.

```
> loopgyou sim
Checking your character... Legend: ✓ Have / X Missing & Required / X Missing & Optional
IoTMs
✓ Clan VIP Lounge key - YRs, -combat
✓ Cold medicine cabinet - QoL Equipment
✓ grey gosling - Adventures

IoTMs (Optional)
✓ baby camelCalf - Desert progress
✓ backup camera - Lobsterfrogmen, ML, init
✓ bottled Vampire Vintner - Pygmy killing
✓ Cargo Cultist Shorts - War outfit
✓ combat lover's locket - Reminiscing
✓ Cosmic bowling ball - Banishes, Pygmy killing
✓ cursed magnifying glass - Lobsterfrogmen, delay
✓ Deck of Every Card - Get a key for the NS tower
✓ designer sweatpants - Sleaze damage
✓ fresh coat of paint - Minor boosts in moxie sign
✓ haunted doghouse - Ghost dog chow
✓ hewn moon-rune spoon - Access to an extra monster absorb (see tune arg)
✓ industrial fire extinguisher - Harem outfit, Bat hole, stone wool, Crypt, Ultrahydrated
✓ June cleaver - Cold damage, QoL, sometimes +famexp and +adv
✓ MayDay™ contract - +combat, early meat
✓ miniature crystal ball - Monster prediction
✓ Powerful Glove - Pixels and lobsterfrogmen
✓ protonic accelerator pack - Wanderers
✓ shortest-order cook - Kill the Wall of Skin, initial exp
✓ SongBoom™ BoomBox - In-run meat source
✓ SpinMaster™ lathe - Equipment
✓ Summon Clip Art - Amulet coin (via familiar jacks)
✓ unbreakable umbrella - -combat modifier, ML
✓ unwrapped knock-off retro superhero cape - Slay the dead in crypt, pygmy killing

Combat Lover's Locket Monsters (Optional)
✓ cloud of disembodied whiskers - For absorbing adventures
✓ Little Man in the Canoe - For absorbing adventures
✓ mountain man - For ore
✓ One-Eyed Willie - For absorbing adventures
✓ pygmy witch lawyer - For Infinite Loop
✓ revolving bugbear - For absorbing adventures
✓ vicious gnauga - For absorbing adventures

Miscellany (Optional)
✓ Cornbeefadon - Amulet coin, with clip art
✓ hobo monkey - Meat drops
✓ woim - Bonus initiative

Expensive Pulls (Optional)
✓ deck of lewd playing cards - Pull
✓ Greatest American Pants OR navel ring of navel gazing - Pull
✓ mafia thumb ring - Pull
✓ old patched suit-pants - Pull
✓ Space Trip safety headphones OR HOA regulation book - Pull
✓ transparent pants - Pull

You have everything! You are the shiniest star. This script should work great.
```

### Manual Installation

If you would like to make your own modifications to the script, the recommended way is to compile and install the script manually.

1. Compile the script, following instructions in the [kol-ts-starter](https://github.com/docrostov/kol-ts-starter).
2. Copy [loopgyou.ccs](KoLmafia/ccs/loopgyou.ccs) from KoLmafia/ccs to your Mafia css directory.
3. Copy loopgyou.js and loopgyou-combat.js from KoLmafia/scripts/loop-gyou to your Mafia scripts directory.
