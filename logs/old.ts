
class PlayerStats {
    name: string
    matches: number
    wins: number
    losses: number
    total: PlayerData
    avg: PlayerData

    constructor (name:string) {
        this.name = name
        this.matches = 0
        this.wins = 0
        this.losses = 0

    }

    addPlayerStats (stats:PlayerData, mapName:string, isWin:boolean) {
        // Make sure it's the correct player
        if (stats.name !== this.name)  throw new Error("player name mismatch, got " + stats.name + " expected " + this.name)

        this.matches++
        this.maps[mapName]++
        if (isWin) this.wins++
        if (!isWin) this.losses++

        // If this is the first entry
        this.total = this.calcTotalStats(stats) 
        this.avg = this.calcAverageStats(stats, mapName)
        //console.log(this.avg)
    }

    private calcTotalStats(stats:PlayerData):PlayerData {
        let obj = {...this.total}

        // Root keys
        Object.keys(stats).forEach(key => {
            if (typeof stats[key] === "number") {
                obj[key] = this.calcTotal(obj[key], stats[key])
            }
            else if (typeof stats[key] === "object") {
                Object.keys(stats[key]).forEach(key2 => {
                    obj[key][key2] = this.calcTotal(obj[key][key2], stats[key][key2])
                })
            }
        })

        return obj;

    }

    private calcAverageStats(stats:PlayerData, mapName:string):PlayerData {
        let obj = {...this.avg}

        // Root keys
        Object.keys(stats).forEach(key => {
            if (typeof stats[key] === "number") {
                obj[key] = this.calcAvg(obj[key], stats[key], this.matches)
            }
            else if (typeof stats[key] === "object") {
                Object.keys(stats[key]).forEach(key2 => {
                    let mapItem = mapItems.any.includes(itemFix(key2))
                    let mapsWithItem = mapsWith(key2);

                    //console.log(mapItem, key2, itemFix(key2), mapsWithItem)
    
                    // If it is not a map item
                    if (!mapItem) {
                        obj[key][key2] = this.calcAvg(obj[key][key2], stats[key][key2], this.matches)
                    }
                    // If it is a map item and the current map has it, calc new avg
                    else if (mapItem && mapsWithItem.includes(mapName)) {
                        // Sum all of the played matches on those maps with mapItem
                        let nMapsWithItem = 0
                        mapsWithItem.forEach(mName => nMapsWithItem += this.maps[mName])
                        obj[key][key2] = this.calcAvg(obj[key][key2], stats[key][key2], nMapsWithItem)
                    }
                    else return // Don't count this towards average LG/Pent on DM2 for example
                })
            }
        })

        //console.log(obj)

        return obj;
    }

    createFlatObject () {

    }

    private calcTotal (a:number, b:number):number {
        if (typeof a !== "number") a = 0
        return a + b;
    }

    private calcAvg (a:number, b:number, n:number):number {
        if (typeof a !== "number") a = 0

        return ((a * (n - 1)) + b) / n
    }
}