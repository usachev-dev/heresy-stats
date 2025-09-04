import type { TargetData, Weapon } from "./data-service";

export interface AttackResultStats{
    attackedToKillOne: number;
    ptToKillOne: number;
    killedPer10: number;
    killedPer100pt: number;
    ptsKilledPer100pt: number;
}

function d6(): number {
  return Math.floor(Math.random() * 5) + 1;
}

class Dice {
    rolls: number[] = new Array(9999).fill(0).map(d6)
    current = 0;
    lastRoll = 1;
    public roll(): number {
        let result = this.rolls[this.current]
        this.lastRoll = result;
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

export class Roller {
    dice = new Dice();
    constructor() {}

    
    makeAttack(weapon: Weapon, target: TargetData): AttackResultStats {
        let result: AttackResultStats = {
            attackedToKillOne: 0,
            ptToKillOne: 0,
            killedPer10: 0,
            killedPer100pt: 0,
            ptsKilledPer100pt: 0
        };
        if (!canKill(weapon, target)) {
            return result;
        }
        let t = {...target}
        let killed = 0;
        let ptsKilled = 0;
        let ptsAttacked = 0;

        for (let count = 1; true; count++) {
            
            let atk = this.rollAttack(weapon, t)
            ptsAttacked += weapon.totalCost
            killed += atk.killed
            ptsKilled += atk.killed * target.cost
            if (atk.dmg > 0 && atk.dmg < target.w) {
                t.w -= atk.dmg
            }
            if (atk.dmg > 0 && atk.dmg >= target.w) {
                t.w = target.w
            }
            if (!result.attackedToKillOne && atk.killed > 0) {
                result.attackedToKillOne = count
            }
            if (!result.ptToKillOne && atk.killed > 0) {
                result.ptToKillOne = weapon.totalCost * count
            }
            if (count === 10) {
                result.killedPer10 = killed
            }
            if (!result.killedPer100pt && weapon.totalCost * count >= 100) {
                result.killedPer100pt = killed
            }
            if (!result.ptsKilledPer100pt && weapon.totalCost * count >= 100) {
                result.ptsKilledPer100pt = ptsAttacked
            }

            if (count > 1000) {
                console.log('LOOP', count, weapon.name, target.name, result)
            }
            
            if (
                count >= 10 &&
                !!result.attackedToKillOne &&
                !!result.ptToKillOne &&
                !!result.killedPer100pt &&
                !!result.ptsKilledPer100pt 
            ) {
                break;
            }
 
        }
        return result;
    }
    

    rollAttack(weapon: Weapon, target: TargetData): {killed: number, dmg: number} {
        let result = {killed: 0, dmg: 0};
        
        new Array(weapon.a).fill(0).forEach(_ => {
            let w = {...weapon}
            let t = {...target}

            if (!this.dice.test(hitTn(w, t))) {return result}
            
            if (!this.dice.test(woundTn(w, t))) {return result}

            if (this.dice.test(saveTn(w, t))) {return result}

            result.dmg += Math.min(w.dmg, t.w)

             if (w.dmg >= target.w) {
                result.killed++
             }

        })
        
        return result;
    }

}

export function canKill(weapon: Weapon, target: TargetData): boolean {
    if (hitTn(weapon, target) > 6) {
        return false
    } 
    if (woundTn(weapon, target) > 6) {
        return false;
    }
    return true
}


function hitTn(weapon: Weapon, target: TargetData): number {
    if (weapon.type === "shoot") {
        return shoottn(weapon.bs)
    } 
    if (weapon.type === "cc") {
        return cctn(weapon.ws, target.ws)
    }
    return 4;
}

function shoottn(bs: number) {
    if (bs === 0) {
        return 7
    }
    if (bs >= 6) {
        return 2
    }
    return 7 - bs
}


function cctn(atkws: number, defws: number): number {
    if (atkws === defws) {
        return 4
    }
    if (atkws > defws) {
        if (atkws - defws === 1) {
            return 3
        }
        if (atkws - defws >= 2) {
            return 2
        }
    }
    if (atkws < defws) {
        if (atkws * 2 < defws) return 5
        return 6
    }
    return 4
}

function woundTn(weapon: Weapon, target: TargetData): number {
    if (!!target.av) {
        return woundTnAV(weapon.s, target.av)
    }
    if (!!target.t) {
        return woundTnT(weapon.s, target.t)
    }
    return 7
}

function woundTnT(s: number, t: number): number {
    if (s === t) {
        return 4
    }
    if (t - s > 2 ) {
        return 7
    }
    if (s - t >= 2) {
        return 2
    }
    return 4 - (s - t)
}

function woundTnAV(s: number, av: number): number {
    return av - s;
}

function saveTn(weapon: Weapon, target: TargetData): number {
    if (weapon.ap <= target.save) {
        if (!!target.invul) {
            return target.invul
        }
        return 7
    }
    return target.save
}