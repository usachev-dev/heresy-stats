import type { Attacker, DataService, TargetData, Weapon } from "./data-service.ts";
import { canKill, Roller, type AttackResultStats } from "./roller.ts";
import {mean, median} from "simple-statistics";

export interface Stats {
    medianToKillSquad: number;
    meanPtToKillSquad: number;
    meanKilledPerSquad: number;
    meanKilledPer100pt: number;
    meanPtsKilledPer100pt: number;
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
 

export class StatsService {
    roller = new Roller();
    constructor(private data: DataService, private testCount: number) {
        this.table = this.data.attackers.map((atk) => this.attackerStatsFromAttacker(atk, this.data.targets))
    }
    table: AttackerStats[];

    weaponAtTargetStats(weapon: Weapon, target: TargetData): Stats {
        if (!canKill(weapon, target)) {
            return {
                medianToKillSquad: 0,
                meanPtToKillSquad: 0,
                meanKilledPerSquad: 0,
                meanKilledPer100pt: 0,
                meanPtsKilledPer100pt: 0,
            };
        }
        let attackResults: AttackResultStats[] = new Array(this.testCount).fill(0).map(() => this.roller.makeAttack(weapon, target));
        
        let result = {
            medianToKillSquad: median(attackResults.map(r => r.attackedToKillSquad)),
            meanPtToKillSquad: mean(attackResults.map(r => r.ptToKillSquad)),
            meanKilledPerSquad: mean(attackResults.map(r => r.killedPerSquad)),
            meanKilledPer100pt: mean(attackResults.map(r => r.killedPer100pt)),
            meanPtsKilledPer100pt: mean(attackResults.map(r => r.ptsKilledPer100pt)),
        };
        return result;
    }
        
    attackerStatsFromAttacker(atk: Attacker, targetsData: TargetData[]): AttackerStats {
        let results: AttackResult[] = []
        atk.weapons.forEach(weapon => {
            targetsData.forEach(target => {
                results.push({
                    weapon,
                    target,
                    stats: this.weaponAtTargetStats(weapon, target)
                })
            })
        })

        return {
            attacker: atk, 
            results,
        }
    }
}
