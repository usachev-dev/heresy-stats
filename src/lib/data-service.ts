import weaponsDataRaw from "../data/weapons.json" with { type: "json" };
import targetsDataRaw from "../data/targets.json" with { type: "json" };
import attackersDataRaw from "../data/attackers.json" with { type: "json" };

let weaponsData: WeaponData[] = weaponsDataRaw.map(raw => ({...raw, special: specialParse(raw.special)}))
let attackersData: AttackerData[] = attackersDataRaw.map(raw => ({...raw, squadSize: raw.squadSize || 1}))
let targetsData: TargetData[] = targetsDataRaw.map(raw => ({...raw, squadSize: raw.squadSize || 1}))

function specialParse(data: any): SpecialData[] {
    if (!data) {
        return []
    }
    if (typeof data === "string") {
        return [{
            name: data,
            value: 1
        }]
    }
    if (!Array.isArray(data)) {
        return []
    }
    return data.map(specialParseOne).filter(v => !!v)

}

function specialParseOne(data: any): SpecialData | undefined {
    if (typeof data == "string") {
        return {
            name: data,
            value: 1
        }
    }
    if (Object.hasOwn(data, "name") && Object.hasOwn(data, "value")) {
        return data
    }
    if (Object.hasOwn(data, "name")) {
        return {
            name: data.name,
            value: 1
        }
    }
    return undefined
}

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
    squadSize: number;
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
    squadSize: number;
}


export interface Weapon extends WeaponData {
    type: "shoot" | "cc";
    s: number;
    a: number;
    ws: number;
    bs: number;
    totalCost: number; 
    squadSize: number;
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
    return names.map(name => weaponsData.find(wd => wd.name.toLowerCase() === name.toLowerCase())).filter(v => !!v).map(w => ({
        ...w, 
        cost: w.cost || 0,
        sm: w.sm || 0
    }))
}

function attackerFromData(ad: AttackerData): Attacker {
    let weaponDatas = weaponDatasFromNames(ad.weaponsAvailable)
    let weapons: Weapon[] = [];
    for (let i = 0; i < weaponDatas.length; i++) {
        let wdata = weaponDatas[i]
        let type = typeFromString(wdata.type)
        let s: number = type === "shoot" ? (wdata.s || 0) : ad.s + (wdata.sm || 0)
        let a: number = type === "shoot" ? (wdata.a || 0) : ad.a + (wdata.am || 0)
        let totalCost: number = ad.cost + (wdata.cost || 0)
        let weapon: Weapon = {...wdata,
            type, 
            s,
            a,
            ws: ad.ws,
            bs: ad.bs,
            totalCost,
            squadSize: ad.squadSize,
        }
        pushWeapon(weapon, weapons)
        if (isDouble(weapon)) {
            pushWeapon({
                ...weapon,
                name: weapon.name + ' double',
                a: weapon.a * 2,
                totalCost: weapon.totalCost + (weapon.cost || 0),
            }, weapons)
        }
    }
    

    return {
        ...ad,
        weapons
    }
}

function pushWeapon(weapon: Weapon, weapons: Weapon[]) {
    weapons.push(weapon)
    weapon.special.forEach(special => {
        if (special.name.toLowerCase() === "heavy fp") {
            weapons.push({...weapon, a: weapon.a + 1, name: weapon.name + ' heavy'})
        }
        if (special.name.toLowerCase() === "heavy d") {
            weapons.push({...weapon, dmg: weapon.dmg + 1, name: weapon.name + ' heavy'})
        }
        if (special.name.toLowerCase() === "heavy s") {
            weapons.push({...weapon, s: weapon.s + 1, name: weapon.name + ' heavy'})
        }
        if (special.name.toLowerCase() === "heavy ap") {
            weapons.push({...weapon, ap: weapon.ap - 1, name: weapon.name + ' heavy'})
        }
        if (special.name.toLowerCase() === "ordnance d") {
            weapons.push({...weapon, dmg: weapon.dmg*2, name: weapon.name + ' ordnance'})
        }
        if (special.name.toLowerCase() === "ordnance fp") {
            weapons.push({...weapon, a: weapon.a*2, name: weapon.name + ' ordnance'})
        }
        if (special.name.toLowerCase() === "ordnance s") {
            weapons.push({...weapon, s: weapon.s*2, name: weapon.name + ' ordnance'})
        }
        if (special.name.toLowerCase() === "assault") {
            weapons.push({...weapon, bs: snapShotBs(weapon.bs), name: weapon.name + ' volley'})
        }
        if (special.name.toLowerCase() === "assault steady") {
            weapons.push({...weapon, a: weapon.a * 2, name: weapon.name + ' normal+volley'})
        }
        if (special.name.toLowerCase() === "melta") {
            weapons.push({...weapon, dmg: weapon.dmg*2, name: weapon.name + ' melta range', 
                special: [
                    ...weapon.special, 
                    {
                        name: "armourbane",
                        value: 1
                    }
                ]
            })
        }
    })
}

function isDouble(w: Weapon): boolean {
    return !!w.special.find(s => s.name === 'double')
}

function snapShotBs(bs: number): number {
    return Math.max(1, bs-2)
}

export class DataService {
    attackers: Attacker[] = attackersData.map(attackerFromData);
    targets: TargetData[] = targetsData;
    attacker(name: string): Attacker | undefined {
        return this.attackers.find(a => a.name.toLowerCase() === name.toLowerCase())
    }
    target(name: string): TargetData | undefined {
        return this.targets.find(a => a.name.toLowerCase() === name.toLowerCase())
    }
    constructor() {
    }
}