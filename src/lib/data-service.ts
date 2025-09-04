import weaponsData from "../data/weapons.json" with { type: "json" };
import targetsData from "../data/targets.json" with { type: "json" };
import attackersData from "../data/attackers.json" with { type: "json" };

export interface WeaponData {
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

export interface SpecialData {
    name: string;
    value: number;
}

export interface AttackerData {
    name: string;
    a: number;
    ws: number;
    bs: number;
    s: number;
    weaponsAvailable: string[];
    cost: number;
}

export interface TargetData {
    name: string;
    t?: number;
    av?: number;
    w: number;
    ws: number;
    save: number;
    invul?: number;
    cost: number;
}


export interface Weapon extends WeaponData {
    type: "shoot" | "cc";
    s: number;
    a: number;
    ws: number;
    bs: number;
    totalCost: number; 
}

export interface Attacker extends AttackerData {
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
            ws: ad.ws,
            bs: ad.bs,
            totalCost
        }
    })
        

    return {
        ...ad,
        weapons
    }
}

export class DataService {
    attackers: Attacker[] = attackersData.map(attackerFromData);
    targets: TargetData[] = targetsData;
}