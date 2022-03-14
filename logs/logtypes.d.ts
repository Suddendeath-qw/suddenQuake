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

export interface PlayerStats extends FlatPlayerMatches, FlatPlayerStats {
    team: string
    name: string
}

interface FlatPlayerMatches {
        // Matches
        matches: number
        win: number
        loss: number
        dm2: number
        dm2_win: number
        dm2_loss: number
        dm3: number
        dm3_win: number
        dm3_loss: number
        e1m2: number
        e1m2_win: number
        e1m2_loss: number
}

interface FlatStats {
      // Flat stats
      frags: number
      net: number
      tk: number
      eff: number
      spawnfrags: number
  
      wp_lg: number
      wp_rl: number
      wp_gl: number
      wp_sng: number
      wp_ng: number
      wp_ssg: number
      wp_sg: number
  
      rlskill_ad: number
      rlskill_dh: number
  
      armrmhs_ga: number
      armrmhs_ya: number
      armrmhs_ra: number
      armrmhs_mh: number
  
      powerups_q: number
      powerups_p: number
      powerups_r: number
  
      rl_took: number
      rl_killed: number
      rl_dropped: number
      rl_xfer: number
  
      lg_took: number
      lg_killed: number
      lg_dropped: number
      lg_xfer: number
  
      damage_tkn: number
      damage_gvn: number
      damage_ewep: number
      damage_tm: number
      damage_self: number
      damage_todie: number
  
      time_quad: number
      streaks_frags: number
      streaks_quadrun: number
}

interface FlatPlayerStats {
    // Metadata
    team: string
    name: string

    // Matches
    matches: number
    win: number
    loss: number
    dm2: number
    dm2_win: number
    dm2_loss: number
    dm3: number
    dm3_win: number
    dm3_loss: number
    e1m2: number
    e1m2_win: number
    e1m2_loss: number

    // Flat stats
    frags: number
    net: number
    tk: number
    eff: number
    spawnfrags: number

    wp_lg: number
    wp_rl: number
    wp_gl: number
    wp_sng: number
    wp_ng: number
    wp_ssg: number
    wp_sg: number

    rlskill_ad: number
    rlskill_dh: number

    armrmhs_ga: number
    armrmhs_ya: number
    armrmhs_ra: number
    armrmhs_mh: number

    powerups_q: number
    powerups_p: number
    powerups_r: number

    rl_took: number
    rl_killed: number
    rl_dropped: number
    rl_xfer: number

    lg_took: number
    lg_killed: number
    lg_dropped: number
    lg_xfer: number

    damage_tkn: number
    damage_gvn: number
    damage_ewep: number
    damage_tm: number
    damage_self: number
    damage_todie: number

    time_quad: number
    streaks_frags: number
    streaks_quadrun: number
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
