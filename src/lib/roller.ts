import type { TargetData, Weapon } from "./data-service.ts";

export interface AttackResultStats{
    attackedToKillSquad: number;
    ptToKillSquad: number;
    killedPerSquad: number;
    killedPer100pt: number;
    ptsKilledPer100pt: number;
}


function d6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export class Dice {
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
            attackedToKillSquad: 0,
            ptToKillSquad: 0,
            killedPerSquad: 0,
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
            if (deflagrate(weapon)) {
                let addatk = this.rollAttack({
                    ...weapon,
                    dmg: 1,
                    ap: 0,
                    s: deflagrate(weapon),
                    a: atk.dmg % weapon.dmg,
                    special: []
                }, t)
                atk.dmg += addatk.dmg
                atk.killed += addatk.killed
            }
            ptsAttacked += weapon.totalCost
            killed += atk.killed
            ptsKilled += atk.killed * target.cost
            if (atk.dmg > 0 && atk.dmg < target.w) {
                t.w -= atk.dmg
            }
            if (atk.dmg > 0 && atk.dmg >= target.w) {
                t.w = target.w
            }
            if (!result.attackedToKillSquad && killed > target.squadSize) {
                result.attackedToKillSquad = count
            }
            if (!result.ptToKillSquad && killed > target.squadSize) {
                result.ptToKillSquad = weapon.totalCost * count / killed 
            }
            if (count === weapon.squadSize) {
                result.killedPerSquad = killed
            }
            if (!result.killedPer100pt && weapon.totalCost * count >= 100) {
                result.killedPer100pt = killed
            }
            if (!result.ptsKilledPer100pt && weapon.totalCost * count >= 100 && killed > 0) {
                let killerPts = weapon.totalCost * count
                let killedPts = killed * target.cost

                result.ptsKilledPer100pt = (100 * killedPts) / killerPts
            }

            if (
                count >= weapon.squadSize &&
                !!result.attackedToKillSquad &&
                !!result.ptToKillSquad &&
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
        if (!!target.av && weapon.s + 6 < target.av) {
            return result
        }
        new Array(weapon.a).fill(0).forEach(_ => {
            let w = {...weapon}
            let t = {...target}
            let rolledCritical = false;
            let rolledRending = false;

            if (!this.dice.test(hitTn(w, t))) {return result}
            if (critical(w) && this.dice.lastRoll >= critical(w)) {
                w.dmg++
                rolledCritical = true
            }
            if (rending(w) && this.dice.lastRoll >= rending(w)) {
                rolledRending = true
            }

            let wounded = this.dice.test(woundTn(w, t))
            if(!wounded && !rolledCritical && !rolledRending) {return result}
            if (breaching(w) && (this.dice.lastRoll >= breaching(w) || rolledCritical || rolledRending)) {
                w.ap = 2
            }
            if (shred(w) && (this.dice.lastRoll >= shred(w) || rolledCritical || rolledRending)) {
                w.dmg++
            }

            if (this.dice.test(saveTn(w, t))) {return result}

            result.dmg += Math.min(w.dmg, t.w)

             if (w.dmg >= target.w) {
                result.killed++
             }

        })
        
        return result;
    }

}



function specialRule(w: Weapon, rule: string): number {
    let found = w.special.find(s => s.name.toLowerCase() === rule)
    if (found) {
        return found.value
    }
    return 0
}
function breaching(w: Weapon): number {
    return specialRule(w, "breaching")
}
function rending(w: Weapon): number {
    return specialRule(w, "rending")
}
function shred(w: Weapon): number {
    return specialRule(w, "shred")
}
function critical(w: Weapon): number {
    return specialRule(w, "critical")
}
function deflagrate(w: Weapon): number {
    return specialRule(w, "deflagrate")
}
function armourbane(w: Weapon): boolean {
    return !!w.special.find(s => s.name.toLowerCase() === "armourbane")
}

export function canKill(weapon: Weapon, target: TargetData): boolean {
    if (weapon.a <= 0) {
        return false
    }
    if (hitTn(weapon, target) > 6) {
        return false
    } 
    if (woundTn(weapon, target) > 6) {
        return false
    }
    return true
}


export function hitTn(weapon: Weapon, target: TargetData): number {
    if (weapon.type === "shoot") {
        return shoottn(weapon.bs)
    } 
    if (weapon.type === "cc") {
        return cctn(weapon.ws, target.ws)
    }
    return 4;
}

export function shoottn(bs: number) {
    if (bs === 0) {
        return 7
    }
    if (bs >= 6) {
        return 2
    }
    return 7 - bs
}


export function cctn(atkws: number, defws: number): number {
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

export function woundTn(weapon: Weapon, target: TargetData): number {
    if (!!target.av) {
        return woundTnAV(weapon, target.av)
    }
    if (!!target.t) {
        return woundTnT(weapon, target.t)
    }
    return 7
}

export function woundTnT(w: Weapon, t: number): number {
    let s = w.s
    if (t - s > 3) {
        return 7
    }
    if (t - s >= 2) {
        return 6
    }
    if (t - s == 1) {
        return 5
    }
    if (t - s == 0) {
        return 4
    }
    if (t - s == -1) {
        return 3
    }
    if (t - s <= -2) {
        return 2
    }
    return 7
}

export function woundTnAV(w: Weapon, av: number): number {
    let s = w.s
    if (armourbane(w)) {
        s++
    }
    return av - s;
}

export function saveTn(weapon: Weapon, target: TargetData): number {
    if (!target.save && !!target.invul) {
        return target.invul
    }
    if (!target.save) {
        return 7
    }
    if (weapon.ap > 0 && weapon.ap <= target.save) {
        if (!!target.invul) {
            return target.invul
        }
        return 7
    }
    return Math.max(2, target.save)
}
