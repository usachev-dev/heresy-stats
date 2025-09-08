import { assertGreater, fail } from "jsr:@std/assert";
import { Dice, Roller, woundTn } from "./roller.ts";
import type { Weapon, TargetData } from "./data-service.ts";

Deno.test("test dice-roller", () => {
  let dice = new Dice()
  let rollCounter: Record<number, boolean> = {}
  for (let index = 0; index < 999; index++) {
    let roll = dice.roll()
    rollCounter[roll] = true;
    if (roll != dice.lastRoll) {
      fail("last roll should equal roll")
    }
    if (roll < 1 || roll > 6) {
      fail("rolls 1 to 6")
    }
    if (Math.round(roll) != roll) {
      fail("rolls should be round")
    }
  }
  
  if (Object.keys(rollCounter).length !== 6 ) {
    console.log(rollCounter)
    fail("should have all dice values")
  }
});


Deno.test("test rending av", () => {
  let weapon: Weapon = {
        "name": "Pair of Lightning Claws",
        "type": "cc" ,
        "am": 2,
        "sm": 4,
        "ap": 3,
        "dmg": 1,
        "cost": 10,
        "special": [
            {
                "name": "rending",
                "value": 6
            },
            {
                "name": "breaching",
                "value": 6
            }
        ],
        s:4, 
        a: 4,
        ws: 4,
        bs: 4,
        squadSize: 5,
        totalCost: 20
    }

    let target: TargetData = {
      "name": "Land Raider",
        "av": 14,
        "w": 8,
        "ws": 1,
        "save": 0,
        "cost": 265,
        "squadSize": 1
    }

    assertGreater(woundTn(weapon, target), 6, "claws no hurt land raider")
    let roller = new Roller()
    for (let index = 0; index < 9999; index++) {
      let atk = roller.rollAttacks(weapon, target)
      if (atk.dmg > 0 || atk.killed > 0) {
        fail("claws no hurt land raider")
      }
    }
});

