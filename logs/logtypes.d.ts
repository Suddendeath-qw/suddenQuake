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
