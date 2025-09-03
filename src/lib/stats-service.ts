import type { Attacker, DataService, TargetData, Weapon } from "./data-service";
const diceCount = 9999;

function d6(): number {
  return Math.floor(Math.random() * 5) + 1;
}

export interface Stats {
    medianToKillOne: number;
    meanPtsToKill100pts: number;
    ptToKillOne: number;
    meanKilledPer10: number;
    meanKilledPer100pt: number;
    dispersion: number;
}

function newStats(): Stats {
    return {
        medianToKillOne: 0,
        meanPtsToKill100pts: 0,
        ptToKillOne: 0,
        meanKilledPer10: 0,
        meanKilledPer100pt: 0,
        dispersion: 0,
    }
}

export interface AttackResult {
    weapon: Weapon;
    target: TargetData;
    stats: Stats;
}

export interface AttackerStats {
    attacker: Attacker;
    results: AttackResult[]
};

function weaponAtTargetStats(weapon: Weapon, target: TargetData, dice: Dice): Stats {
    let result = newStats();
    //TODO
    return result;
}

function attackerStatsFromAttacker(atk: Attacker, targetsData: TargetData[], dice: Dice): AttackerStats {
    let results: AttackResult[] = []
    atk.weapons.forEach(weapon => {
        targetsData.forEach(target => {
            results.push({
                weapon,
                target,
            
                stats: weaponAtTargetStats(weapon, target, dice)
            })
        })
    })

    return {
        attacker: atk, 
        results,
    }
}


class Dice {
    rolls: number[] = new Array(diceCount).fill(0).map(d6)
    current = 0;
    public roll(): number {
        let result = this.rolls[this.current]
        if (this.current < this.rolls.length - 1) {
            this.current++
        } else {
            this.current = 0
        }
        return result
    }

    test(tn: number): boolean {
        return this.roll() >= tn; 
    }
}

export class StatsService {
    dice = new Dice();
    constructor(private data: DataService) {
        this.table = this.data.attackers.map((atk) => attackerStatsFromAttacker(atk, this.data.targets, this.dice))
    }
    table: AttackerStats[];

}