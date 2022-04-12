export interface PlayerData {
    team: string,
    name: string,
    frags: number,
    deaths: number,
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
        xfer?: number,
        kdx?: number
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

export interface FlatPlayerStats {
    // Metadata
    team: string
    name: string

    // Matches
    matches: number
    win: number
    loss: number
    wl: number
    dm2: number
    dm2_win: number
    dm2_loss: number
    dm2_wl: number
    dm3: number
    dm3_win: number
    dm3_loss: number
    dm3_wl: number
    e1m2: number
    e1m2_win: number
    e1m2_loss: number
    e1m2_wl: number

    // Awards
    t_top_frags: number
    t_top_deaths: number
    t_top_friendkills: number
    t_top_efficiency: number
    t_top_fragstreak: number
    t_top_quadrun: number
    t_top_rlkiller: number
    t_top_boomsticker: number
    t_top_survivor: number
    t_top_annihilator: number

    // Total
    t_frags: number
    t_deaths: number
    t_net: number
    t_tk: number
    t_eff: number
    t_spawnfrags: number

    t_wp_lg: number
    t_wp_rl: number
    t_wp_gl: number
    t_wp_sng: number
    t_wp_ng: number
    t_wp_ssg: number
    t_wp_sg: number

    t_rlskill_ad: number
    t_rlskill_dh: number

    t_armrmhs_ga: number
    t_armrmhs_ya: number
    t_armrmhs_ra: number
    t_armrmhs_mh: number

    t_powerups_q: number
    t_powerups_p: number
    t_powerups_r: number

    t_rl_took: number
    t_rl_killed: number
    t_rl_dropped: number
    t_rl_xfer: number
    t_rl_kdx: number

    t_lg_took: number
    t_lg_killed: number
    t_lg_dropped: number
    t_lg_xfer: number

    t_damage_tkn: number
    t_damage_gvn: number
    t_damage_ewep: number
    t_damage_tm: number
    t_damage_self: number
    t_damage_todie: number

    t_time_quad: number
    t_streaks_frags: number
    t_streaks_quadrun: number

    // Avg
    a_frags: number
    a_deaths: number
    a_net: number
    a_tk: number
    a_eff: number
    a_spawnfrags: number

    a_wp_lg: number
    a_wp_rl: number
    a_wp_gl: number
    a_wp_sng: number
    a_wp_ng: number
    a_wp_ssg: number
    a_wp_sg: number

    a_rlskill_ad: number
    a_rlskill_dh: number

    a_armrmhs_ga: number
    a_armrmhs_ya: number
    a_armrmhs_ra: number
    a_armrmhs_mh: number

    a_powerups_q: number
    a_powerups_p: number
    a_powerups_r: number

    a_rl_took: number
    a_rl_killed: number
    a_rl_dropped: number
    a_rl_xfer: number
    a_rl_kdx: number

    a_lg_took: number
    a_lg_killed: number
    a_lg_dropped: number
    a_lg_xfer: number

    a_damage_tkn: number
    a_damage_gvn: number
    a_damage_ewep: number
    a_damage_tm: number
    a_damage_self: number
    a_damage_todie: number

    a_time_quad: number
    a_streaks_frags: number
    a_streaks_quadrun: number

    // Best
    b_frags: number,
    b_deaths: number,
    b_streaks_frags: number,
    b_streaks_quadrun: number
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
