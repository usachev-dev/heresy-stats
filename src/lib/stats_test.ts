import type { Weapon, TargetData } from "./data-service.ts";
import { StatsService } from "./stats-service.ts";
import { DataService } from '../lib/data-service.ts';
import { fail } from "jsr:@std/assert";

Deno.test("test multiwound", () => {
    let data = new DataService()
    let attacker = data.attacker("tactical marine")
    let target1 = data.target("tactical marine")
    let target2 = data.target("Tactical Veteran")

    if (!attacker || !target1 || !target2) {
        fail("NO DATA")
    }

    attacker.a = 3

    let service = new StatsService(data, 99)
    let stats = service.attackerStatsFromAttacker(attacker, [target1, target2])
    let mean1 = stats.results[0].stats.meanToKillSquad * 100
    let mean2 = stats.results[1].stats.meanToKillSquad * 100


    let percent: number = mean1 * 100 / mean2
        if (Math.abs(percent-100) > 15)   {
            console.log(mean1, mean2)
            fail("TOO MUCH DIFFERENCE")
        }
})
