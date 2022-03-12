export interface PlayerData {
    team: string,
    name: string,
    frags: number,
    net: number,
    tk: number,
    eff: number,
    wp: {
        sg?: number,
        ssg?: number,
        ng?: number,
        sng?: number
        gl?: number,
        rl?: number,
        lg?: number
    },
    rlskill?: {
        ad: number,
        dh: number
    },
    armrmhs: {
        ga: number,
        ya: number,
        ra: number,
        mh: number
    },
    powerups: {
        q: number,
        p: number,
        r: number
    },
    rl?: {
        took: number,
        killed: number,
        dropped: number,
        xfer?: number
    },
    lg?: {
        took: number,
        killed: number,
        dropped: number,
        xfer?: number
    },
    damage: {
        tkn: number,
        gvn: number,
        ewep?: number,
        tm?: number,
        self?: number,
        todie?: number
    },
    time: {
        quad?: number
    },
    streaks: {
        frags: number,
        quadrun?: number
    },
    spawnfrags: number
}


export interface TeamData {
    name: string,
    frags: number,
    eff: number,
    players?: Array<PlayerData>
}

export interface TeamDataObj {
    [index: string]: TeamData
}

export interface TopScorerEntry {
    name?: string,
    score?: number
}

export interface TopScorerStats {
    frags: Array<TopScorerEntry>,
    deaths: Array<TopScorerEntry>,
    friendkills: Array<TopScorerEntry>,
    efficiency: Array<TopScorerEntry>,
    fragstreak: Array<TopScorerEntry>,
    quadrun: Array<TopScorerEntry>,
    rl_killer: Array<TopScorerEntry>,
    boomsticker: Array<TopScorerEntry>,
    survivor: Array<TopScorerEntry>,
    annihilator: Array<TopScorerEntry>
}

export interface MatchDataObj {
    id: string,
    date: string,
    mvd: string,
    map: string,
    teams: TeamDataObj,
    top?: TopScorerStats
}
