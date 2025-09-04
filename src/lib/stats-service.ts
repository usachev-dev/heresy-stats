import type { Attacker, DataService, TargetData, Weapon } from "./data-service";
import { canKill, Roller, type AttackResultStats } from "./roller";
import {mode, mean} from "simple-statistics";

export interface Stats {
    modeToKillOne: number;
    meanPtToKillOne: number;
    meanKilledPer10: number;
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
    constructor(private data: DataService) {
        console.log('StatsService')
        this.table = this.data.attackers.map((atk) => this.attackerStatsFromAttacker(atk, this.data.targets))
    }
    table: AttackerStats[];

    weaponAtTargetStats(weapon: Weapon, target: TargetData): Stats {
        if (!canKill(weapon, target)) {
            return {
                modeToKillOne: 0,
                meanPtToKillOne: 0,
                meanKilledPer10: 0,
                meanKilledPer100pt: 0,
                meanPtsKilledPer100pt: 0,
            };
        }
        let attackResults: AttackResultStats[] = new Array(9999).fill(0).map(() => this.roller.makeAttack(weapon, target));
        
        let result = {
            modeToKillOne: mode(attackResults.map(r => r.attackedToKillOne)),
            meanPtToKillOne: mean(attackResults.map(r => r.ptToKillOne)),
            meanKilledPer10: mean(attackResults.map(r => r.killedPer10)),
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
