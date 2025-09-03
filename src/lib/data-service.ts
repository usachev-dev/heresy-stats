import weaponsData from "../data/weapons.json" with { type: "json" };
import targetsData from "../data/targets.json" with { type: "json" };
import attackersData from "../data/attackers.json" with { type: "json" };

let diceCount = 9999;
let attackerCount = 10;

interface WeaponData {
    name: string;
    type?: string;
    a?: number;
    am?: number;
    s?: number;
    sm?: number;
    ap: number;
    dmg: number;
    special: SpecialData[];
    cost?: number;
}

interface SpecialData {
    name: string;
    value: number;
}

interface AttackerData {
    name: string;
    a: number;
    ws: number;
    bs: number;
    s: number;
    weaponsAvailable: string[];
    cost: number;
}

interface TargetData {
    name: string;
    t: number;
    w: number;
    ws: number;
    save: number;
    invul?: number;
}

function d6(): number {
  return Math.floor(Math.random() * 5) + 1;
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

interface Weapon extends WeaponData {
    type: "shoot" | "cc";
    s: number;
    a: number;
    totalCost: number; 
}

interface Attacker extends AttackerData {
    weapons: Weapon[];
}

function typeFromString(s: string | undefined): "shoot" | "cc" {
    if (!s) {
        return "shoot";
    }
    switch (s.toLowerCase()) {
        case "cc":
            return "cc"
        case "shoot":
        default:
            return "shoot";
    }
}

function weaponDatasFromNames(names: string[]): WeaponData[] {
    return names.map(name => weaponsData.find(wd => wd.name === name)).filter(v => !!v).map(w => ({
        ...w, 
        cost: w.cost || 0,
        sm: w.sm || 0
    }))
}

function attackerFromData(ad: AttackerData): Attacker {
    let weaponDatas = weaponDatasFromNames(ad.weaponsAvailable)
    let weapons = weaponDatas.map(wdata => {
        let type = typeFromString(wdata.type)
        let s: number = type === "shoot" ? (wdata.s || 0) : ad.s + (wdata.sm || 0)
        let a: number = type === "shoot" ? (wdata.a || 0) : ad.a + (wdata.am || 0)
        let totalCost: number = ad.cost + (wdata.cost || 0)
        return {...wdata,
            type, 
            s,
            a,
            totalCost
        }
    })
        

    return {
        ...ad,
        weapons
    }
}

export interface AttackResults {
    attackerCount: number;
    weapon: Weapon;
    targetResults: {
        target: TargetData;
        meanDmg: number;
        meanPerPT: number;
        medianDmg: number;
        medianPerPT: number;
        dispersion: number;
    }[]
}

export interface AttackerStats {
    attacker: Attacker;
    results: AttackResults[]
};

function attackerStatsFromAttacker(atk: Attacker, dice: Dice): AttackerStats {
    let results: AttackResults[] = []
    atk.weapons.forEach(weapon => {
        let result: AttackResults = {
            attackerCount,
            weapon,
            targetResults: []
        }
        targetsData.forEach(target => {
            result.targetResults.push({
                target,
                //TODO
                meanDmg: 0,
                meanPerPT: 0,
                medianDmg: 0,
                medianPerPT: 0,
                dispersion: 0,
            })
        })
        results.push(result);
    })

    return {
        attacker: atk,
        results,
    }
}


export class DataService {
    attackers: Attacker[] = attackersData.map(attackerFromData);
    
    dice = new Dice();

    constructor() {
        console.log(this.table)
    }

    table: AttackerStats[] = this.attackers.map((atk) => attackerStatsFromAttacker(atk, this.dice))
}