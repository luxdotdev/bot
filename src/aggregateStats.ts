import type { PlayerStat } from "@prisma/client";
import { round } from "./lib/utils";

export type Hero = Support | Tank | Damage;

export type HeroName = Hero["name"];

export type Ana = {
  name: "Ana";
  image: "ana.png";
};

export type Ashe = {
  name: "Ashe";
  image: "ashe.png";
};

export type Baptiste = {
  name: "Baptiste";
  image: "baptiste.png";
};

export type Bastion = {
  name: "Bastion";
  image: "bastion.png";
};

export type Brigitte = {
  name: "Brigitte";
  image: "brigitte.png";
};

export type Cassidy = {
  name: "Cassidy";
  image: "cassidy.png";
};

export type Doomfist = {
  name: "Doomfist";
  image: "doomfist.png";
};

export type Dva = {
  name: "D.Va";
  image: "dva.png";
};

export type Echo = {
  name: "Echo";
  image: "echo.png";
};

export type Genji = {
  name: "Genji";
  image: "genji.png";
};

export type Hanzo = {
  name: "Hanzo";
  image: "hanzo.png";
};

export type Illari = {
  name: "Illari";
  image: "illari.png";
};

export type JunkerQueen = {
  name: "Junker Queen";
  image: "junkerqueen.png";
};

export type Junkrat = {
  name: "Junkrat";
  image: "junkrat.png";
};

export type Kiriko = {
  name: "Kiriko";
  image: "kiriko.png";
};

export type Lifeweaver = {
  name: "Lifeweaver";
  image: "lifeweaver.png";
};

export type Lucio = {
  name: "Lúcio";
  image: "lucio.png";
};

export type Mauga = {
  name: "Mauga";
  image: "mauga.png";
};

export type Mei = {
  name: "Mei";
  image: "mei.png";
};

export type Mercy = {
  name: "Mercy";
  image: "mercy.png";
};

export type Moira = {
  name: "Moira";
  image: "moira.png";
};

export type Orisa = {
  name: "Orisa";
  image: "orisa.png";
};

export type Pharah = {
  name: "Pharah";
  image: "pharah.png";
};

export type Ramattra = {
  name: "Ramattra";
  image: "ramattra.png";
};

export type Reaper = {
  name: "Reaper";
  image: "reaper.png";
};

export type Reinhardt = {
  name: "Reinhardt";
  image: "reinhardt.png";
};

export type Roadhog = {
  name: "Roadhog";
  image: "roadhog.png";
};

export type Sigma = {
  name: "Sigma";
  image: "sigma.png";
};

export type Sojourn = {
  name: "Sojourn";
  image: "sojourn.png";
};

export type Soldier76 = {
  name: "Soldier: 76";
  image: "soldier76.png";
};

export type Sombra = {
  name: "Sombra";
  image: "sombra.png";
};

export type Symmetra = {
  name: "Symmetra";
  image: "symmetra.png";
};

export type Torbjorn = {
  name: "Torbjörn";
  image: "torbjorn.png";
};

export type Tracer = {
  name: "Tracer";
  image: "tracer.png";
};

export type Venture = {
  name: "Venture";
  image: "venture.png";
};

export type Widowmaker = {
  name: "Widowmaker";
  image: "widowmaker.png";
};

export type Winston = {
  name: "Winston";
  image: "winston.png";
};

export type WreckingBall = {
  name: "Wrecking Ball";
  image: "wreckingball.png";
};

export type Zarya = {
  name: "Zarya";
  image: "zarya.png";
};

export type Zenyatta = {
  name: "Zenyatta";
  image: "zenyatta.png";
};

export type Tank =
  | Dva
  | Doomfist
  | JunkerQueen
  | Mauga
  | Orisa
  | Ramattra
  | Reinhardt
  | Roadhog
  | Sigma
  | Winston
  | WreckingBall
  | Zarya;
export type Damage =
  | Ashe
  | Bastion
  | Cassidy
  | Echo
  | Genji
  | Hanzo
  | Junkrat
  | Mei
  | Pharah
  | Reaper
  | Sojourn
  | Soldier76
  | Sombra
  | Symmetra
  | Torbjorn
  | Tracer
  | Venture
  | Widowmaker;
export type Support =
  | Ana
  | Baptiste
  | Brigitte
  | Illari
  | Kiriko
  | Lifeweaver
  | Lucio
  | Mercy
  | Moira
  | Zenyatta;

export const heroRoleMapping: Record<HeroName, "Tank" | "Damage" | "Support"> =
  {
    Ana: "Support",
    Ashe: "Damage",
    Baptiste: "Support",
    Bastion: "Damage",
    Brigitte: "Support",
    Cassidy: "Damage",
    Doomfist: "Tank",
    "D.Va": "Tank",
    Echo: "Damage",
    Genji: "Damage",
    Hanzo: "Damage",
    Illari: "Support",
    "Junker Queen": "Tank",
    Junkrat: "Damage",
    Kiriko: "Support",
    Lifeweaver: "Support",
    Lúcio: "Support",
    Mauga: "Tank",
    Mei: "Damage",
    Mercy: "Support",
    Moira: "Support",
    Orisa: "Tank",
    Pharah: "Damage",
    Ramattra: "Tank",
    Reaper: "Damage",
    Reinhardt: "Tank",
    Roadhog: "Tank",
    Sigma: "Tank",
    Sojourn: "Damage",
    "Soldier: 76": "Damage",
    Sombra: "Damage",
    Symmetra: "Damage",
    Torbjörn: "Damage",
    Tracer: "Damage",
    Venture: "Damage",
    Widowmaker: "Damage",
    Winston: "Tank",
    "Wrecking Ball": "Tank",
    Zarya: "Tank",
    Zenyatta: "Support",
  };

export const roleHeroMapping: Record<
  "Tank" | "Damage" | "Support",
  HeroName[]
> = {
  Tank: [
    "D.Va",
    "Doomfist",
    "Junker Queen",
    "Mauga",
    "Orisa",
    "Ramattra",
    "Reinhardt",
    "Roadhog",
    "Sigma",
    "Winston",
    "Wrecking Ball",
    "Zarya",
  ],
  Damage: [
    "Ashe",
    "Bastion",
    "Cassidy",
    "Echo",
    "Genji",
    "Hanzo",
    "Junkrat",
    "Mei",
    "Pharah",
    "Reaper",
    "Sojourn",
    "Soldier: 76",
    "Sombra",
    "Symmetra",
    "Torbjörn",
    "Tracer",
    "Venture",
    "Widowmaker",
  ],
  Support: [
    "Ana",
    "Baptiste",
    "Brigitte",
    "Illari",
    "Kiriko",
    "Lifeweaver",
    "Lúcio",
    "Mercy",
    "Moira",
    "Zenyatta",
  ],
};

export const heroPriority = {
  Damage: 1,
  Tank: 2,
  Support: 3,
};

export type PlayerStatRows = PlayerStat[];

export type PlayerData = {
  id: number;
  playerName: string;
  role: string;
  playerTeam: string;
  timePlayed: number;
  eliminations: number;
  kills: number;
  assists: number;
  deaths: number;
  kd: number;
  kad: number;
  heroDmgDealt: number;
  dmgReceived: number;
  healingReceived: number;
  healingDealt: number;
  dmgToHealsRatio: number;
  ultsCharged: number;
  ultsUsed: number;
  mostPlayedHero: HeroName;
};

export function determineRole(heroName: HeroName) {
  return heroRoleMapping[heroName] || "Flex";
}

export function aggregatePlayerData(rows: PlayerStatRows): PlayerData[] {
  const playerMap = new Map<string, PlayerData>();
  const playerMaxMatchTime = new Map<string, number>();
  const teamElimsMap = new Map<string, number>();
  const heroTimeMap = new Map<string, Map<HeroName, number>>();

  rows.forEach((row, index) => {
    let player = playerMap.get(row.player_name);

    // Update team total eliminations
    const currentTeamElims = teamElimsMap.get(row.player_team) || 0;
    teamElimsMap.set(row.player_team, currentTeamElims + row.eliminations);

    if (!player) {
      player = {
        id: index, // You need to define how you want to handle the ID
        playerName: row.player_name,
        role: determineRole(row.player_hero as HeroName),
        playerTeam: row.player_team,
        eliminations: 0,
        kills: 0,
        assists: 0,
        deaths: 0,
        kd: 0,
        kad: 0,
        heroDmgDealt: 0,
        dmgReceived: 0,
        healingReceived: 0,
        healingDealt: 0,
        dmgToHealsRatio: 0,
        ultsCharged: 0,
        ultsUsed: 0,
        timePlayed: 0,
        mostPlayedHero: row.player_hero as HeroName,
      };
    }

    const currentMaxTime = playerMaxMatchTime.get(row.player_name) || 0;
    if (row.match_time > currentMaxTime) {
      playerMaxMatchTime.set(row.player_name, row.match_time);
    }

    // Update hero time for each player
    let heroTimes = heroTimeMap.get(row.player_name);
    if (!heroTimes) {
      heroTimes = new Map<HeroName, number>();
      heroTimeMap.set(row.player_name, heroTimes);
    }
    heroTimes.set(
      row.player_hero as HeroName,
      (heroTimes.get(row.player_hero as HeroName) || 0) + row.hero_time_played
    );

    // Update the stats
    player.eliminations += row.eliminations;
    player.kills += row.final_blows;
    player.assists += row.offensive_assists;
    player.deaths += row.deaths;
    player.heroDmgDealt += row.hero_damage_dealt;
    player.dmgReceived += row.damage_taken;
    player.healingReceived += row.healing_received;
    player.healingDealt += row.healing_dealt;
    player.ultsCharged += row.ultimates_earned;
    player.ultsUsed += row.ultimates_used;
    player.timePlayed += row.hero_time_played;

    // Recalculate ratios - you will need to define these calculations
    player.kd = player.deaths !== 0 ? player.kills / player.deaths : 0;
    player.kad =
      player.deaths !== 0 ? (player.kills + player.assists) / player.deaths : 0;
    player.dmgToHealsRatio = player.heroDmgDealt / player.healingReceived;

    // round all fields to 2 decimal places
    player.kd = round(player.kd);
    player.kad = round(player.kad);
    player.heroDmgDealt = round(player.heroDmgDealt);
    player.dmgReceived = round(player.dmgReceived);
    player.healingReceived = round(player.healingReceived);
    player.healingDealt = round(player.healingDealt);
    player.dmgToHealsRatio = round(player.dmgToHealsRatio);

    playerMap.set(row.player_name, player);
  });

  heroTimeMap.forEach((heroTimes, playerName) => {
    let mostPlayedHero = "None";
    let maxTime = 0;

    heroTimes.forEach((time, hero) => {
      if (time > maxTime) {
        mostPlayedHero = hero;
        maxTime = time;
      }
    });

    const playerData = playerMap.get(playerName);
    if (playerData) {
      playerData.mostPlayedHero = mostPlayedHero as HeroName;
      playerData.role = determineRole(mostPlayedHero as HeroName);
      playerMap.set(playerName, playerData);
    }
  });

  // Set time played for each player
  playerMaxMatchTime.forEach((maxTime, playerName) => {
    const player = playerMap.get(playerName) || {
      // ... Initialize other fields for the player
      timePlayed: 0,
      // ... Other fields
    };

    player.timePlayed = maxTime;
    playerMap.set(playerName, player as PlayerData);
  });

  return Array.from(playerMap.values());
}
