var STATTAGS = 'MaxHitPoints MaxMagicPoints Attack Defense Speed Dexterity HpRegen MpRegen'.split(' ');
var pcstats = {
    0: 'Shots fired',
    1: 'Hits',
    2: 'Ability uses',
    3: 'Tiles discovered',
    4: 'Teleports',
    5: 'Potions drunk',
    6: 'Kills',
    7: 'Assists',
    8: 'God kills',
    9: 'Assists against Gods',
    10: 'Cube kills',
    11: 'Oryx kills',
    12: 'Quests completed',
    13: 'Pirate Caves',
    14: 'Undead Lairs',
    15: 'Abyss of Demons',
    16: 'Snake Pits',
    17: 'Spider Dens',
    18: 'Sprite Worlds',
    20: 'Minutes active',
    21: 'Tomb of the Ancients',
    22: 'Ocean Trenches',
    23: 'Forbidden Jungles',
    24: 'Manor of the Immortals',
    25: 'Forest Mazes',
    26: 'Lair of Draconis',
    27: 'Candyland Hunting Grounds',
    28: 'Haunted Cemeteries',
    29: 'Cave of A Thousand Treasures',
    30: 'Mad Labs',
    31: 'Davy Jones\' Lockers',
    34: 'Ice Caves',
    35: 'Deadwater Docks',
    36: 'The Crawling Depths',
    37: 'Woodland Labyrinths',
    38: 'Battle for the Nexus',
    39: 'The Shatters',
    40: 'Belladonna\'s Garden',
    41: 'Puppet Master\'s Theatre',
    42: 'Toxic Sewers',
    43: 'The Hive',
    44: 'Mountain Temple',
    45: 'The Nest',
    47: 'Lost Halls',
    48: 'Cultist Hideouts',
    49: 'The Void',
    50: 'Puppet Master\'s Encore',
    51: 'Lair of Shaitan',
    52: 'Parasite Chambers',
    53: 'Magic Woods',
    54: 'Cnidarian Reef',
    55: 'Secluded Thicket',
    56: 'Cursed Library',
    57: 'Fungal Cavern',
    58: 'Crystal Cavern',
    59: 'Ancient Ruins',
    60: 'Dungeon types',
    61: 'Forax',
    62: 'Heroic Abyss of Demons',
    63: 'Heroic Undead Lair',
    64: 'High Tech Terror',
    65: 'Ice Tomb',
    66: 'Katalund',
    67: 'Mad God Mayhems',
    68: 'Malogia',
    69: 'Oryx\'s Castle',
    70: 'Oryx\'s Chamber',
    71: 'Oryx\'s Sanctuary',
    72: 'Rainbow Road',
    73: 'Santa Workshop',
    74: 'The Machine',
    75: 'Untaris',
    76: 'Wine Cellar',
    77: 'Party level-ups',
    78: 'Lesser Gods kills',
    79: 'Encounter kills',
    80: 'Hero kills',
    82: 'Critter kills',
    83: 'Beast kills',
    84: 'Humanoid kills',
    85: 'Undead kills',
    86: 'Nature kills',
    87: 'Construct kills',
    88: 'Grotesque kills',
    89: 'Structure kills',
    90: 'The Third Dimension',
    91: 'Beachzone',
    92: 'Hidden Interregnum',
    93: 'Sulfurous Wetlands',
    94: 'Kogbold Steamworks',
    95: 'Moonlight Village',
    96: 'Advanced Kogbold Steamworks',
    97: 'Advanced Nest',
    98: 'The Tavern',
    99: 'Queen Bunny Chamber',
    100: 'Stat Potions consumed',
};
var shortpcstats = {
    13: 'pcave',
    14: 'udl',
    15: 'abby',
    16: 'snake',
    17: 'spider',
    18: 'sprite',
    21: 'tomb',
    22: 'ot',
    23: 'jungle',
    24: 'manor',
    25: 'forest',
    26: 'lod',
    27: 'cland',
    28: 'cem',
    29: 'tcave',
    30: 'lab',
    31: 'davy',
    34: 'Ice Caves',
    35: 'ddocks',
    36: 'cdepths',
    37: 'wlab',
    38: 'bnex',
    39: 'shats',
    40: 'bella',
    41: 'pup',
    42: 'sew',
    43: 'hive',
    44: 'temple',
    45: 'nest',
    47: 'lh',
    48: 'cult',
    49: 'void',
    50: 'encore',
    51: 'shaitan',
    52: 'para',
    53: 'mwoods',
    54: 'reef',
    55: 'thicket',
    56: 'lib',
    57: 'fungal',
    58: 'crystal',
    59: 'ruins',
    61: 'Forax',
    62: 'habby',
    63: 'hudl',
    64: 'htt',
    65: 'Ice Tomb',
    66: 'Katalund',
    67: 'mgm',
    68: 'Malogia',
    69: 'castle',
    70: 'o1',
    71: 'o3',
    72: 'rroad',
    73: 'workshop',
    74: 'machine',
    75: 'Untaris',
    76: 'o2',
    90: '3d',
    91: 'Beachzone',
    92: 'interregnum',
    93: 'wetland',
    94: 'kog',
    95: 'mv',
    96: 'akog',
    97: 'anest',
    98: 'tavern',
    99: 'bunny'
};
var tunnelrat = [13, 23, 17, 16, 18, 24, 14, 15, 22, 21];

var explosivejourney = [31, 30, 27, 28, 29, 26, 35, 37, 36, 39, 51, 40];

var travelofthedecade = [50, 42, 43, 44, 90, 45, 47, 48, 49, 54, 52, 53, 55, 56, 71, 59, 64, 93];

var firststeps = [13, 25, 23, 17, 42];

var kingofthemountains = [16, 18, 15, 43, 30, 53, 41, 28, 56, 59, 93];

var conqueroroftherealm = [31, 40, 26, 44, 90, 24, 21, 39, 45, 57, 58, 47, 94];

var enemyofthecourt = [51, 50, 54, 55, 64];

var epicbattles = [35, 37, 36, 45, 55];

var farout = [68, 75, 61, 66];

var heroofthenexus = [
    13, 25, 17, 16, 23, 42, 59, 53, 18, 27, 29, 14, 15, 24, 41, 43, 56, 28, 30,
    52, 31, 44, 90, 26, 35, 37, 36, 24, 40, 21, 57, 58, 47, 48, 49, 93, 94, 69,
    51, 50, 54, 55, 64, 71, 72, 91
];

var seasonsbeatins = [40, 67, 38, 73, 74, 68, 75, 61, 66, 72, 91];

var realmofthemadgod = [
    13, 25, 17, 16, 23, 42, 59, 53, 18, 27, 29, 14, 15, 24, 41, 43, 56, 28, 30,
    52, 31, 44, 90, 26, 35, 37, 36, 24, 40, 21, 57, 58, 47, 48, 49, 93, 94, 69,
    51, 50, 54, 55, 64, 71, 72, 91
];
var bonuses = {
    'Ancestor': function (s, c, d) {
        return (parseInt(d.Account.Stats.TotalFame) === 0) ? { mul: 0, add: 20 } : 0;
    },
    'Maxed': function (s, c, d) {
        return 0;
        var bonus = { mul: 0, add: 0 };
        var hasBonus = false;

        for (var t = 0; t < STATTAGS.length; t++) {
            var stat = c[STATTAGS[t]] || 0;
            var carrcl = classes[c.ObjectType];
            if (carrcl && parseInt(stat) === carrcl[3][t]) {
                hasBonus = true;
                if (STATTAGS[t] === 'MaxHitPoints' || STATTAGS[t] === 'MaxMagicPoints') {
                    bonus.mul += 0.05;
                    bonus.add += 200;
                } else {
                    bonus.mul += 0.025;
                    bonus.add += 100;
                }
            }
        }

        return hasBonus ? bonus : 0;
    },
    'life': function (s, c, d) {
        var bonus = { mul: 0.05, add: 200 };
        var stat = c.MaxHitPoints || 0;
        var carrcl = classes[c.ObjectType];

        if (carrcl && parseInt(stat) === carrcl[3][STATTAGS.indexOf('MaxHitPoints')]) {
            return bonus;
        } else {
            return 0;
        }
    },
    'mana': function (s, c, d) {
        var bonus = { mul: 0.05, add: 200 };
        var stat = c.MaxMagicPoints || 0;
        var carrcl = classes[c.ObjectType];
        if (carrcl && parseInt(stat) === carrcl[3][STATTAGS.indexOf('MaxMagicPoints')]) {
            return bonus;
        } else {
            return 0;
        }
    },
    'attack': function (s, c, d) {
        var bonus = { mul: 0.025, add: 100 };
        var stat = c.Attack || 0;
        var carrcl = classes[c.ObjectType];
        if (carrcl && parseInt(stat) === carrcl[3][STATTAGS.indexOf('Attack')]) {
            return bonus;
        } else {
            return 0;
        }
    },
    'defense': function (s, c, d) {
        var bonus = { mul: 0.025, add: 100 };
        var stat = c.Defense || 0;
        var carrcl = classes[c.ObjectType];
        if (carrcl && parseInt(stat) === carrcl[3][STATTAGS.indexOf('Defense')]) {
            return bonus;
        } else {
            return 0;
        }
    },
    'speed': function (s, c, d) {
        var bonus = { mul: 0.025, add: 100 };
        var stat = c.Speed || 0;
        var carrcl = classes[c.ObjectType];
        if (carrcl && parseInt(stat) === carrcl[3][STATTAGS.indexOf('Speed')]) {
            return bonus;
        } else {
            return 0;
        }
    },
    'dexterity': function (s, c, d) {
        var bonus = { mul: 0.025, add: 100 };
        var stat = c.Dexterity || 0;
        var carrcl = classes[c.ObjectType];

        if (carrcl && parseInt(stat) === carrcl[3][STATTAGS.indexOf('Dexterity')]) {
            return bonus;
        } else {
            return 0;
        }
    },
    'vit': function (s, c, d) {
        var bonus = { mul: 0.025, add: 100 };
        var stat = c.HpRegen || 0;
        var carrcl = classes[c.ObjectType];
        if (carrcl && parseInt(stat) === carrcl[3][STATTAGS.indexOf('HpRegen')]) {
            return bonus;
        } else {
            return 0;
        }
    },
    'wis': function (s, c, d) {
        var bonus = { mul: 0.025, add: 100 };
        var stat = c.MpRegen || 0;
        var carrcl = classes[c.ObjectType];
        if (carrcl && parseInt(stat) === carrcl[3][STATTAGS.indexOf('MpRegen')]) {
            return bonus;
        } else {
            return 0;
        }
    },
    'Cartography': function (s) {
        var tiles = s[3];
        var bonus = 0;

        if (tiles >= 25000000) {
            bonus += Math.floor(tiles / 25000000) * 2500;
        }
        if (tiles >= 10000000) {
            bonus += 1000;
        }
        if (tiles >= 4000000) {
            bonus += 400;
        }
        if (tiles >= 1000000) {
            bonus += 100;
        }
        if (tiles >= 200000) {
            bonus += 20;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'QuestCompletes': function (s) {
        var quests = s[12];
        var bonus = 0;

        if (quests >= 2000) {
            bonus += Math.floor(quests / 2000) * 5000;
        }
        if (quests >= 1000) {
            bonus += 2000;
        }
        if (quests >= 400) {
            bonus += 800;
        }
        if (quests >= 100) {
            bonus += 200;
        }
        if (quests >= 25) {
            bonus += 20;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'EnemyHit': function (s) {
        var hits = s[1];
        var bonus = 0;

        if (hits >= 2000000) {
            bonus += Math.floor(hits / 2000000) * 2500;
        }
        if (hits >= 800000) {
            bonus += 1000;
        }
        if (hits >= 200000) {
            bonus += 400;
        }
        if (hits >= 40000) {
            bonus += 100;
        }
        if (hits >= 8000) {
            bonus += 20;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'PartyLevelUps': function (s) {
        var levelUps = s[77];
        var bonus = 0;

        if (levelUps >= 1000) {
            bonus += Math.floor(levelUps / 1000) * 1000;
        }
        if (levelUps >= 400) {
            bonus += 400;
        }
        if (levelUps >= 100) {
            bonus += 200;
        }
        if (levelUps >= 50) {
            bonus += 50;
        }
        if (levelUps >= 25) {
            bonus += 20;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'PotionDrinker': function (s) {
        var potions = s[5];
        var bonus = 0;

        if (potions >= 2000) {
            bonus += Math.floor(potions / 2000) * 1000;
        }
        if (potions >= 1000) {
            bonus += 400;
        }
        if (potions >= 400) {
            bonus += 200;
        }
        if (potions >= 100) {
            bonus += 50;
        }
        if (potions >= 25) {
            bonus += 20;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'AbilityUse': function (s) {
        var abilities = s[2];
        var bonus = 0;

        if (abilities >= 25000) {
            bonus += Math.floor(abilities / 25000) * 1000;
        }
        if (abilities >= 10000) {
            bonus += 400;
        }
        if (abilities >= 2500) {
            bonus += 200;
        }
        if (abilities >= 500) {
            bonus += 50;
        }
        if (abilities >= 100) {
            bonus += 20;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'Teleports': function (s) {
        var teleports = s[4];
        var bonus = 0;

        if (teleports >= 2500) {
            bonus += Math.floor(teleports / 2500) * 1000;
        }
        if (teleports >= 1000) {
            bonus += 400;
        }
        if (teleports >= 500) {
            bonus += 200;
        }
        if (teleports >= 200) {
            bonus += 50;
        }
        if (teleports >= 50) {
            bonus += 20;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'MonsterKills': function (s) {
        var kills = s[6]; // replace monsterKillIndex with the actual index for monster kills in s
        var bonus = 0;

        if (kills >= 100000) {
            bonus += Math.floor(kills / 100000) * 1000;
        }
        if (kills >= 50000) {
            bonus += 400;
        }
        if (kills >= 10000) {
            bonus += 200;
        }
        if (kills >= 5000) {
            bonus += 50;
        }
        if (kills >= 2000) {
            bonus += 20;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'GodKills': function (s) {
        var godKills = s[8]; // replace godKillIndex with the actual index for god kills in s
        var bonus = 0;

        if (godKills >= 50000) {
            bonus += Math.floor(godKills / 50000) * 2500;
        }
        if (godKills >= 10000) {
            bonus += 1000;
        }
        if (godKills >= 5000) {
            bonus += 400;
        }
        if (godKills >= 1000) {
            bonus += 100;
        }
        if (godKills >= 200) {
            bonus += 20;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'LesserGodKills': function (s) {
        var lesserGodKills = s[78]; // replace lesserGodKillIndex with the actual index for lesser god kills in s
        var bonus = 0;

        if (lesserGodKills >= 25000) {
            bonus += Math.floor(lesserGodKills / 25000) * 2500;
        }
        if (lesserGodKills >= 5000) {
            bonus += 1000;
        }
        if (lesserGodKills >= 2000) {
            bonus += 400;
        }
        if (lesserGodKills >= 500) {
            bonus += 100;
        }
        if (lesserGodKills >= 100) {
            bonus += 20;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'OryxKills': function (s) {
        var oryxKills = s[11]; // replace oryxKillIndex with the actual index for Oryx kills in s
        var bonus = 0;

        if (oryxKills >= 500) {
            bonus += Math.floor(oryxKills / 500) * 8000;
        }
        if (oryxKills >= 250) {
            bonus += 3000;
        }
        if (oryxKills >= 100) {
            bonus += 1000;
        }
        if (oryxKills >= 20) {
            bonus += 500;
        }
        if (oryxKills >= 1) {
            bonus += 200;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'EncounterKills': function (s) {
        var encounterKills = s[79]; // replace encounterKillIndex with the actual index for encounter kills in s
        var bonus = 0;

        if (encounterKills >= 1250) {
            bonus += Math.floor(encounterKills / 1250) * 5000;
        }
        if (encounterKills >= 500) {
            bonus += 2000;
        }
        if (encounterKills >= 200) {
            bonus += 800;
        }
        if (encounterKills >= 50) {
            bonus += 200;
        }
        if (encounterKills >= 5) {
            bonus += 20;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'HeroKills': function (s) {
        var heroKills = s[80]; // replace heroKillIndex with the actual index for hero kills in s
        var bonus = 0;

        if (heroKills >= 2500) {
            bonus += Math.floor(heroKills / 2500) * 2500;
        }
        if (heroKills >= 1250) {
            bonus += 1000;
        }
        if (heroKills >= 500) {
            bonus += 400;
        }
        if (heroKills >= 100) {
            bonus += 100;
        }
        if (heroKills >= 5) {
            bonus += 20;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'CubeKills': function (s) {
        var cubeKills = s[10]; // replace cubeKillIndex with the actual index for cube kills in s
        var bonus = 0;

        if (cubeKills >= 50000) {
            bonus += Math.floor(cubeKills / 50000) * 2500;
        }
        if (cubeKills >= 10000) {
            bonus += 1000;
        }
        if (cubeKills >= 5000) {
            bonus += 400;
        }
        if (cubeKills >= 1000) {
            bonus += 100;
        }
        if (cubeKills >= 200) {
            bonus += 20;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'CritterKills': function (s) {
        var critterKills = s[82]; // Replace critterKillIndex with the actual index for critter kills in s
        var bonus = 0;

        if (critterKills >= 50000) {
            bonus += Math.floor(critterKills / 50000) * 2500;
        }
        if (critterKills >= 10000) {
            bonus += 1000;
        }
        if (critterKills >= 5000) {
            bonus += 400;
        }
        if (critterKills >= 1000) {
            bonus += 100;
        }
        if (critterKills >= 200) {
            bonus += 20;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'BeastKills': function (s) {
        var beastKills = s[83]; // Replace beastKillIndex with the actual index for beast kills in s
        var bonus = 0;

        if (beastKills >= 50000) {
            bonus += Math.floor(beastKills / 50000) * 2500;
        }
        if (beastKills >= 10000) {
            bonus += 1000;
        }
        if (beastKills >= 5000) {
            bonus += 400;
        }
        if (beastKills >= 1000) {
            bonus += 100;
        }
        if (beastKills >= 200) {
            bonus += 20;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'HumanoidKills': function (s) {
        var humanoidKills = s[84]; // Replace humanoidKillIndex with the actual index for humanoid kills in s
        var bonus = 0;

        if (humanoidKills >= 50000) {
            bonus += Math.floor(humanoidKills / 50000) * 2500;
        }
        if (humanoidKills >= 10000) {
            bonus += 1000;
        }
        if (humanoidKills >= 5000) {
            bonus += 400;
        }
        if (humanoidKills >= 1000) {
            bonus += 100;
        }
        if (humanoidKills >= 200) {
            bonus += 20;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'UndeadKills': function (s) {
        var undeadKills = s[85]; // Replace undeadKillIndex with the actual index for undead kills in s
        var bonus = 0;

        if (undeadKills >= 50000) {
            bonus += Math.floor(undeadKills / 50000) * 2500;
        }
        if (undeadKills >= 10000) {
            bonus += 1000;
        }
        if (undeadKills >= 5000) {
            bonus += 400;
        }
        if (undeadKills >= 1000) {
            bonus += 100;
        }
        if (undeadKills >= 200) {
            bonus += 20;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'NatureKills': function (s) {
        var natureKills = s[86]; // Replace natureKillIndex with the actual index for nature kills in s
        var bonus = 0;

        if (natureKills >= 50000) {
            bonus += Math.floor(natureKills / 50000) * 2500;
        }
        if (natureKills >= 10000) {
            bonus += 1000;
        }
        if (natureKills >= 5000) {
            bonus += 400;
        }
        if (natureKills >= 1000) {
            bonus += 100;
        }
        if (natureKills >= 200) {
            bonus += 20;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'ConstructKills': function (s) {
        var constructKills = s[87]; // Replace constructKillIndex with the actual index for construct kills in s
        var bonus = 0;

        if (constructKills >= 50000) {
            bonus += Math.floor(constructKills / 50000) * 2500;
        }
        if (constructKills >= 10000) {
            bonus += 1000;
        }
        if (constructKills >= 5000) {
            bonus += 400;
        }
        if (constructKills >= 1000) {
            bonus += 100;
        }
        if (constructKills >= 200) {
            bonus += 20;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'GrotesqueKills': function (s) {
        var grotesqueKills = s[88]; // Replace grotesqueKillIndex with the actual index for grotesque kills in s
        var bonus = 0;

        if (grotesqueKills >= 50000) {
            bonus += Math.floor(grotesqueKills / 50000) * 2500;
        }
        if (grotesqueKills >= 10000) {
            bonus += 1000;
        }
        if (grotesqueKills >= 5000) {
            bonus += 400;
        }
        if (grotesqueKills >= 1000) {
            bonus += 100;
        }
        if (grotesqueKills >= 200) {
            bonus += 20;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'StructureKills': function (s) {
        var structureKills = s[89]; // Replace structureKillIndex with the actual index for structure kills in s
        var bonus = 0;

        if (structureKills >= 50000) {
            bonus += Math.floor(structureKills / 50000) * 2500;
        }
        if (structureKills >= 10000) {
            bonus += 1000;
        }
        if (structureKills >= 5000) {
            bonus += 400;
        }
        if (structureKills >= 1000) {
            bonus += 100;
        }
        if (structureKills >= 200) {
            bonus += 20;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'PirateCaves': function (s) {
        var pirateCaves = s[13]; // Replace 45 with the actual index for Pirate Caves in s
        var bonus = 0;

        if (pirateCaves >= 100) {
            bonus += Math.floor(pirateCaves / 100) * 60;
        }
        if (pirateCaves >= 40) {
            bonus += 20;
        }
        if (pirateCaves >= 20) {
            bonus += 10;
        }
        if (pirateCaves >= 10) {
            bonus += 5;
        }
        if (pirateCaves >= 1) {
            bonus += 2;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'ForestMazes': function (s) {
        var forestMazes = s[25]; // Replace 45 with the actual index for Forest Mazes in s
        var bonus = 0;

        if (forestMazes >= 100) {
            bonus += Math.floor(forestMazes / 100) * 60;
        }
        if (forestMazes >= 40) {
            bonus += 20;
        }
        if (forestMazes >= 20) {
            bonus += 10;
        }
        if (forestMazes >= 10) {
            bonus += 5;
        }
        if (forestMazes >= 1) {
            bonus += 2;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'ForbiddenJungles': function (s) {
        var forbiddenJungles = s[23]; // Replace 45 with the actual index for Forbidden Jungles in s
        var bonus = 0;

        if (forbiddenJungles >= 100) {
            bonus += Math.floor(forbiddenJungles / 100) * 80;
        }
        if (forbiddenJungles >= 40) {
            bonus += 30;
        }
        if (forbiddenJungles >= 20) {
            bonus += 15;
        }
        if (forbiddenJungles >= 10) {
            bonus += 8;
        }
        if (forbiddenJungles >= 1) {
            bonus += 4;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'TheHive': function (s) {
        var theHive = s[43]; // Replace 45 with the actual index for The Hive in s
        var bonus = 0;

        if (theHive >= 100) {
            bonus += Math.floor(theHive / 100) * 80;
        }
        if (theHive >= 40) {
            bonus += 30;
        }
        if (theHive >= 20) {
            bonus += 15;
        }
        if (theHive >= 10) {
            bonus += 8;
        }
        if (theHive >= 1) {
            bonus += 4;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'SpiderDen': function (s) {
        var spiderDen = s[17];
        var bonus = 0;

        if (spiderDen >= 100) {
            bonus += Math.floor(spiderDen / 100) * 100;
        }
        if (spiderDen >= 40) {
            bonus += 40;
        }
        if (spiderDen >= 20) {
            bonus += 20;
        }
        if (spiderDen >= 10) {
            bonus += 10;
        }
        if (spiderDen >= 1) {
            bonus += 5;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'AncientRuins': function (s) {
        var ancientRuins = s[59];
        var bonus = 0;

        if (ancientRuins >= 100) {
            bonus += Math.floor(ancientRuins / 100) * 800;
        }
        if (ancientRuins >= 40) {
            bonus += 300;
        }
        if (ancientRuins >= 20) {
            bonus += 150;
        }
        if (ancientRuins >= 10) {
            bonus += 80;
        }
        if (ancientRuins >= 1) {
            bonus += 40;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'SnakePit': function (s) {
        var snakePit = s[16];
        var bonus = 0;

        if (snakePit >= 100) {
            bonus += Math.floor(snakePit / 100) * 500;
        }
        if (snakePit >= 40) {
            bonus += 200;
        }
        if (snakePit >= 20) {
            bonus += 100;
        }
        if (snakePit >= 10) {
            bonus += 50;
        }
        if (snakePit >= 1) {
            bonus += 25;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'SpriteWorld': function (s) {
        var spriteWorld = s[18];
        var bonus = 0;

        if (spriteWorld >= 100) {
            bonus += Math.floor(spriteWorld / 100) * 500;
        }
        if (spriteWorld >= 40) {
            bonus += 200;
        }
        if (spriteWorld >= 20) {
            bonus += 100;
        }
        if (spriteWorld >= 10) {
            bonus += 50;
        }
        if (spriteWorld >= 1) {
            bonus += 25;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'MagicWoods': function (s) {
        var magicWoods = s[53];
        var bonus = 0;

        if (magicWoods >= 100) {
            bonus += Math.floor(magicWoods / 100) * 700;
        }
        if (magicWoods >= 40) {
            bonus += 280;
        }
        if (magicWoods >= 20) {
            bonus += 140;
        }
        if (magicWoods >= 10) {
            bonus += 70;
        }
        if (magicWoods >= 1) {
            bonus += 35;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'UndeadLair': function (s) {
        var undeadLair = s[14];
        var bonus = 0;

        if (undeadLair >= 100) {
            bonus += Math.floor(undeadLair / 100) * 700;
        }
        if (undeadLair >= 40) {
            bonus += 280;
        }
        if (undeadLair >= 20) {
            bonus += 140;
        }
        if (undeadLair >= 10) {
            bonus += 70;
        }
        if (undeadLair >= 1) {
            bonus += 35;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'AbyssOfDemons': function (s) {
        var abyssOfDemons = s[15];
        var bonus = 0;

        if (abyssOfDemons >= 100) {
            bonus += Math.floor(abyssOfDemons / 100) * 800;
        }
        if (abyssOfDemons >= 40) {
            bonus += 300;
        }
        if (abyssOfDemons >= 20) {
            bonus += 150;
        }
        if (abyssOfDemons >= 10) {
            bonus += 80;
        }
        if (abyssOfDemons >= 1) {
            bonus += 40;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'CursedLibrary': function (s) {
        var cursedLibrary = s[56];
        var bonus = 0;

        if (cursedLibrary >= 100) {
            bonus += Math.floor(cursedLibrary / 100) * 1000;
        }
        if (cursedLibrary >= 40) {
            bonus += 400;
        }
        if (cursedLibrary >= 20) {
            bonus += 200;
        }
        if (cursedLibrary >= 10) {
            bonus += 100;
        }
        if (cursedLibrary >= 1) {
            bonus += 50;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'ToxicSewers': function (s) {
        var toxicSewers = s[42];
        var bonus = 0;

        if (toxicSewers >= 100) {
            bonus += Math.floor(toxicSewers / 100) * 800;
        }
        if (toxicSewers >= 40) {
            bonus += 300;
        }
        if (toxicSewers >= 20) {
            bonus += 150;
        }
        if (toxicSewers >= 10) {
            bonus += 80;
        }
        if (toxicSewers >= 1) {
            bonus += 40;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'MadLab': function (s) {
        var madLab = s[30];
        var bonus = 0;

        if (madLab >= 100) {
            bonus += Math.floor(madLab / 100) * 1000;
        }
        if (madLab >= 40) {
            bonus += 400;
        }
        if (madLab >= 20) {
            bonus += 200;
        }
        if (madLab >= 10) {
            bonus += 100;
        }
        if (madLab >= 1) {
            bonus += 50;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'PuppetMastersTheatre': function (s) {
        var puppetMastersTheatre = s[41];
        var bonus = 0;

        if (puppetMastersTheatre >= 100) {
            bonus += Math.floor(puppetMastersTheatre / 100) * 800;
        }
        if (puppetMastersTheatre >= 40) {
            bonus += 300;
        }
        if (puppetMastersTheatre >= 20) {
            bonus += 150;
        }
        if (puppetMastersTheatre >= 10) {
            bonus += 80;
        }
        if (puppetMastersTheatre >= 1) {
            bonus += 40;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'ManorOfTheImmortals': function (s) {
        var manorOfTheImmortals = s[24];
        var bonus = 0;

        if (manorOfTheImmortals >= 100) {
            bonus += Math.floor(manorOfTheImmortals / 100) * 800;
        }
        if (manorOfTheImmortals >= 40) {
            bonus += 300;
        }
        if (manorOfTheImmortals >= 20) {
            bonus += 150;
        }
        if (manorOfTheImmortals >= 10) {
            bonus += 80;
        }
        if (manorOfTheImmortals >= 1) {
            bonus += 40;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'HauntedCemetery': function (s) {
        var hauntedCemetery = s[28];
        var bonus = 0;

        if (hauntedCemetery >= 100) {
            bonus += Math.floor(hauntedCemetery / 100) * 1200;
        }
        if (hauntedCemetery >= 40) {
            bonus += 500;
        }
        if (hauntedCemetery >= 20) {
            bonus += 250;
        }
        if (hauntedCemetery >= 10) {
            bonus += 120;
        }
        if (hauntedCemetery >= 1) {
            bonus += 60;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'CaveOfAThousandTreasures': function (s) {
        var caveOfAThousandTreasures = s[29];
        var bonus = 0;

        if (caveOfAThousandTreasures >= 100) {
            bonus += Math.floor(caveOfAThousandTreasures / 100) * 1200;
        }
        if (caveOfAThousandTreasures >= 40) {
            bonus += 500;
        }
        if (caveOfAThousandTreasures >= 20) {
            bonus += 250;
        }
        if (caveOfAThousandTreasures >= 10) {
            bonus += 120;
        }
        if (caveOfAThousandTreasures >= 1) {
            bonus += 60;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'CandylandHuntingGrounds': function (s) {
        var candylandHuntingGrounds = s[27];
        var bonus = 0;

        if (candylandHuntingGrounds >= 100) {
            bonus += Math.floor(candylandHuntingGrounds / 100) * 1200;
        }
        if (candylandHuntingGrounds >= 40) {
            bonus += 500;
        }
        if (candylandHuntingGrounds >= 20) {
            bonus += 250;
        }
        if (candylandHuntingGrounds >= 10) {
            bonus += 120;
        }
        if (candylandHuntingGrounds >= 1) {
            bonus += 60;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'ParasiteChambers': function (s) {
        var parasiteChambers = s[52];
        var bonus = 0;

        if (parasiteChambers >= 100) {
            bonus += Math.floor(parasiteChambers / 100) * 3000;
        }
        if (parasiteChambers >= 40) {
            bonus += 1200;
        }
        if (parasiteChambers >= 20) {
            bonus += 600;
        }
        if (parasiteChambers >= 10) {
            bonus += 300;
        }
        if (parasiteChambers >= 1) {
            bonus += 150;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'DeadwaterDocks': function (s) {
        var deadwaterDocks = s[35];
        var bonus = 0;

        if (deadwaterDocks >= 100) {
            bonus += Math.floor(deadwaterDocks / 100) * 2000;
        }
        if (deadwaterDocks >= 40) {
            bonus += 800;
        }
        if (deadwaterDocks >= 20) {
            bonus += 400;
        }
        if (deadwaterDocks >= 10) {
            bonus += 200;
        }
        if (deadwaterDocks >= 1) {
            bonus += 100;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'WoodlandLabyrinth': function (s) {
        var woodlandLabyrinth = s[37];
        var bonus = 0;

        if (woodlandLabyrinth >= 100) {
            bonus += Math.floor(woodlandLabyrinth / 100) * 2000;
        }
        if (woodlandLabyrinth >= 40) {
            bonus += 800;
        }
        if (woodlandLabyrinth >= 20) {
            bonus += 400;
        }
        if (woodlandLabyrinth >= 10) {
            bonus += 200;
        }
        if (woodlandLabyrinth >= 1) {
            bonus += 100;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'TheCrawlingDepths': function (s) {
        var theCrawlingDepths = s[36];
        var bonus = 0;

        if (theCrawlingDepths >= 100) {
            bonus += Math.floor(theCrawlingDepths / 100) * 2000;
        }
        if (theCrawlingDepths >= 40) {
            bonus += 800;
        }
        if (theCrawlingDepths >= 20) {
            bonus += 400;
        }
        if (theCrawlingDepths >= 10) {
            bonus += 200;
        }
        if (theCrawlingDepths >= 1) {
            bonus += 100;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'SulfurousWetlands': function (s) {
        var sulfurousWetlands = s[93];
        var bonus = 0;

        if (sulfurousWetlands >= 100) {
            bonus += Math.floor(sulfurousWetlands / 100) * 2000;
        }
        if (sulfurousWetlands >= 40) {
            bonus += 800;
        }
        if (sulfurousWetlands >= 20) {
            bonus += 400;
        }
        if (sulfurousWetlands >= 10) {
            bonus += 200;
        }
        if (sulfurousWetlands >= 1) {
            bonus += 100;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'DavyJonesLocker': function (s) {
        var davyJonesLocker = s[31];
        var bonus = 0;

        if (davyJonesLocker >= 100) {
            bonus += Math.floor(davyJonesLocker / 100) * 2000;
        }
        if (davyJonesLocker >= 40) {
            bonus += 800;
        }
        if (davyJonesLocker >= 20) {
            bonus += 400;
        }
        if (davyJonesLocker >= 10) {
            bonus += 200;
        }
        if (davyJonesLocker >= 1) {
            bonus += 100;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'MountainTemple': function (s) {
        var mountainTemple = s[44];
        var bonus = 0;

        if (mountainTemple >= 100) {
            bonus += Math.floor(mountainTemple / 100) * 3000;
        }
        if (mountainTemple >= 40) {
            bonus += 1200;
        }
        if (mountainTemple >= 20) {
            bonus += 600;
        }
        if (mountainTemple >= 10) {
            bonus += 300;
        }
        if (mountainTemple >= 1) {
            bonus += 150;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'LairOfDraconis': function (s) {
        var lairOfDraconis = s[26];
        var bonus = 0;

        if (lairOfDraconis >= 100) {
            bonus += Math.floor(lairOfDraconis / 100) * 3500;
        }
        if (lairOfDraconis >= 40) {
            bonus += 1400;
        }
        if (lairOfDraconis >= 20) {
            bonus += 700;
        }
        if (lairOfDraconis >= 10) {
            bonus += 350;
        }
        if (lairOfDraconis >= 1) {
            bonus += 175;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'TheThirdDimension': function (s) {
        var theThirdDimension = s[90];
        var bonus = 0;

        if (theThirdDimension >= 100) {
            bonus += Math.floor(theThirdDimension / 100) * 3000;
        }
        if (theThirdDimension >= 40) {
            bonus += 1200;
        }
        if (theThirdDimension >= 20) {
            bonus += 600;
        }
        if (theThirdDimension >= 10) {
            bonus += 300;
        }
        if (theThirdDimension >= 1) {
            bonus += 150;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'IceCave': function (s) {
        var iceCave = s[34];
        var bonus = 0;

        if (iceCave >= 100) {
            bonus += Math.floor(iceCave / 100) * 2500;
        }
        if (iceCave >= 40) {
            bonus += 1000;
        }
        if (iceCave >= 20) {
            bonus += 500;
        }
        if (iceCave >= 10) {
            bonus += 250;
        }
        if (iceCave >= 1) {
            bonus += 120;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'OceanTrench': function (s) {
        var oceanTrench = s[22];
        var bonus = 0;

        if (oceanTrench >= 100) {
            bonus += Math.floor(oceanTrench / 100) * 3500;
        }
        if (oceanTrench >= 40) {
            bonus += 1400;
        }
        if (oceanTrench >= 20) {
            bonus += 700;
        }
        if (oceanTrench >= 10) {
            bonus += 350;
        }
        if (oceanTrench >= 1) {
            bonus += 175;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'TombOfTheAncients': function (s) {
        var tombOfTheAncients = s[21];
        var bonus = 0;

        if (tombOfTheAncients >= 100) {
            bonus += Math.floor(tombOfTheAncients / 100) * 4000;
        }
        if (tombOfTheAncients >= 40) {
            bonus += 1600;
        }
        if (tombOfTheAncients >= 20) {
            bonus += 800;
        }
        if (tombOfTheAncients >= 10) {
            bonus += 400;
        }
        if (tombOfTheAncients >= 1) {
            bonus += 200;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'TheShatters': function (s) {
        var theShatters = s[39];
        var bonus = 0;

        if (theShatters >= 100) {
            bonus += Math.floor(theShatters / 100) * 10000;
        }
        if (theShatters >= 40) {
            bonus += 4000;
        }
        if (theShatters >= 20) {
            bonus += 2000;
        }
        if (theShatters >= 10) {
            bonus += 1000;
        }
        if (theShatters >= 1) {
            bonus += 500;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'TheNest': function (s) {
        var theNest = s[45];
        var bonus = 0;

        if (theNest >= 100) {
            bonus += Math.floor(theNest / 100) * 4000;
        }
        if (theNest >= 40) {
            bonus += 1600;
        }
        if (theNest >= 20) {
            bonus += 800;
        }
        if (theNest >= 10) {
            bonus += 400;
        }
        if (theNest >= 1) {
            bonus += 200;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'FungalCavern': function (s) {
        var fungalCavern = s[57];
        var bonus = 0;

        if (fungalCavern >= 100) {
            bonus += Math.floor(fungalCavern / 100) * 5000;
        }
        if (fungalCavern >= 40) {
            bonus += 2000;
        }
        if (fungalCavern >= 20) {
            bonus += 1000;
        }
        if (fungalCavern >= 10) {
            bonus += 500;
        }
        if (fungalCavern >= 1) {
            bonus += 250;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'CrystalCavern': function (s) {
        var crystalCavern = s[58];
        var bonus = 0;

        if (crystalCavern >= 100) {
            bonus += Math.floor(crystalCavern / 100) * 6000;
        }
        if (crystalCavern >= 40) {
            bonus += 2400;
        }
        if (crystalCavern >= 20) {
            bonus += 1200;
        }
        if (crystalCavern >= 10) {
            bonus += 600;
        }
        if (crystalCavern >= 1) {
            bonus += 300;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'LostHalls': function (s) {
        var lostHalls = s[47];
        var bonus = 0;

        if (lostHalls >= 100) {
            bonus += Math.floor(lostHalls / 100) * 6000;
        }
        if (lostHalls >= 40) {
            bonus += 2400;
        }
        if (lostHalls >= 20) {
            bonus += 1200;
        }
        if (lostHalls >= 10) {
            bonus += 600;
        }
        if (lostHalls >= 1) {
            bonus += 300;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'CultistHideout': function (s) {
        var cultistHideout = s[48];
        var bonus = 0;

        if (cultistHideout >= 100) {
            bonus += Math.floor(cultistHideout / 100) * 7000;
        }
        if (cultistHideout >= 40) {
            bonus += 3000;
        }
        if (cultistHideout >= 20) {
            bonus += 1500;
        }
        if (cultistHideout >= 10) {
            bonus += 700;
        }
        if (cultistHideout >= 1) {
            bonus += 350;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'TheVoid': function (s) {
        var theVoid = s[49];
        var bonus = 0;

        if (theVoid >= 100) {
            bonus += Math.floor(theVoid / 100) * 8000;
        }
        if (theVoid >= 40) {
            bonus += 3200;
        }
        if (theVoid >= 20) {
            bonus += 1600;
        }
        if (theVoid >= 10) {
            bonus += 800;
        }
        if (theVoid >= 1) {
            bonus += 400;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'KogboldSteamworks': function (s) {
        var kogboldSteamworks = s[94];
        var bonus = 0;

        if (kogboldSteamworks >= 100) {
            bonus += Math.floor(kogboldSteamworks / 100) * 8000;
        }
        if (kogboldSteamworks >= 40) {
            bonus += 3200;
        }
        if (kogboldSteamworks >= 20) {
            bonus += 1600;
        }
        if (kogboldSteamworks >= 10) {
            bonus += 800;
        }
        if (kogboldSteamworks >= 1) {
            bonus += 400;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'MoonlightVillage': function (s) {
        var moonlightVillage = s[95];
        var bonus = 0;

        if (moonlightVillage >= 100) {
            bonus += Math.floor(moonlightVillage / 100) * 6000;
        }
        if (moonlightVillage >= 40) {
            bonus += 2400;
        }
        if (moonlightVillage >= 20) {
            bonus += 1200;
        }
        if (moonlightVillage >= 10) {
            bonus += 600;
        }
        if (moonlightVillage >= 1) {
            bonus += 300;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'AdvancedKogboldSteamworks': function (s) {
        var advancedKogboldSteamworks = s[96];
        var bonus = 0;

        if (advancedKogboldSteamworks >= 100) {
            bonus += Math.floor(advancedKogboldSteamworks / 100) * 8000;
        }
        if (advancedKogboldSteamworks >= 40) {
            bonus += 3200;
        }
        if (advancedKogboldSteamworks >= 20) {
            bonus += 1600;
        }
        if (advancedKogboldSteamworks >= 10) {
            bonus += 800;
        }
        if (advancedKogboldSteamworks >= 1) {
            bonus += 400;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'AdvancedNest': function (s) {
        var advancedNest = s[97];
        var bonus = 0;

        if (advancedNest >= 100) {
            bonus += Math.floor(advancedNest / 100) * 4000;
        }
        if (advancedNest >= 40) {
            bonus += 1600;
        }
        if (advancedNest >= 20) {
            bonus += 800;
        }
        if (advancedNest >= 10) {
            bonus += 400;
        }
        if (advancedNest >= 1) {
            bonus += 200;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'TheTavern': function (s) {
        var theTavern = s[98];
        var bonus = 0;

        if (theTavern >= 100) {
            bonus += Math.floor(theTavern / 100) * 3000;
        }
        if (theTavern >= 40) {
            bonus += 1200;
        }
        if (theTavern >= 20) {
            bonus += 600;
        }
        if (theTavern >= 10) {
            bonus += 300;
        }
        if (theTavern >= 1) {
            bonus += 150;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'OryxsCastle': function (s) {
        var oryxsCastle = s[69];
        var bonus = 0;

        if (oryxsCastle >= 100) {
            bonus += Math.floor(oryxsCastle / 100) * 2000;
        }
        if (oryxsCastle >= 40) {
            bonus += 800;
        }
        if (oryxsCastle >= 20) {
            bonus += 400;
        }
        if (oryxsCastle >= 10) {
            bonus += 200;
        }
        if (oryxsCastle >= 1) {
            bonus += 100;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'LairOfShaitan': function (s) {
        var lairOfShaitan = s[51];
        var bonus = 0;

        if (lairOfShaitan >= 100) {
            bonus += Math.floor(lairOfShaitan / 100) * 2000;
        }
        if (lairOfShaitan >= 40) {
            bonus += 800;
        }
        if (lairOfShaitan >= 20) {
            bonus += 400;
        }
        if (lairOfShaitan >= 10) {
            bonus += 200;
        }
        if (lairOfShaitan >= 1) {
            bonus += 100;
        }
        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'PuppetMastersEncore': function (s) {
        var puppetMastersEncore = s[50];
        var bonus = 0;

        if (puppetMastersEncore >= 100) {
            bonus += Math.floor(puppetMastersEncore / 100) * 2000;
        }
        if (puppetMastersEncore >= 40) {
            bonus += 800;
        }
        if (puppetMastersEncore >= 20) {
            bonus += 400;
        }
        if (puppetMastersEncore >= 10) {
            bonus += 200;
        }
        if (puppetMastersEncore >= 1) {
            bonus += 100;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'CnidarianReef': function (s) {
        var cnidarianReef = s[54];
        var bonus = 0;

        if (cnidarianReef >= 100) {
            bonus += Math.floor(cnidarianReef / 100) * 2000;
        }
        if (cnidarianReef >= 40) {
            bonus += 800;
        }
        if (cnidarianReef >= 20) {
            bonus += 400;
        }
        if (cnidarianReef >= 10) {
            bonus += 200;
        }
        if (cnidarianReef >= 1) {
            bonus += 100;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'SecludedThicket': function (s) {
        var secludedThicket = s[55];
        var bonus = 0;

        if (secludedThicket >= 100) {
            bonus += Math.floor(secludedThicket / 100) * 2500;
        }
        if (secludedThicket >= 40) {
            bonus += 1000;
        }
        if (secludedThicket >= 20) {
            bonus += 500;
        }
        if (secludedThicket >= 10) {
            bonus += 250;
        }
        if (secludedThicket >= 1) {
            bonus += 125;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'HighTechTerror': function (s) {
        var highTechTerror = s[64];
        var bonus = 0;

        if (highTechTerror >= 100) {
            bonus += Math.floor(highTechTerror / 100) * 2500;
        }
        if (highTechTerror >= 40) {
            bonus += 1000;
        }
        if (highTechTerror >= 20) {
            bonus += 500;
        }
        if (highTechTerror >= 10) {
            bonus += 250;
        }
        if (highTechTerror >= 1) {
            bonus += 125;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'OryxsChamber': function (s) {
        var oryxsChamber = s[70];
        var bonus = 0;

        if (oryxsChamber >= 100) {
            bonus += Math.floor(oryxsChamber / 100) * 2500;
        }
        if (oryxsChamber >= 40) {
            bonus += 1000;
        }
        if (oryxsChamber >= 20) {
            bonus += 500;
        }
        if (oryxsChamber >= 10) {
            bonus += 250;
        }
        if (oryxsChamber >= 1) {
            bonus += 125;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'WineCellar': function (s) {
        var wineCellar = s[76];
        var bonus = 0;

        if (wineCellar >= 100) {
            bonus += Math.floor(wineCellar / 100) * 4000;
        }
        if (wineCellar >= 40) {
            bonus += 1600;
        }
        if (wineCellar >= 20) {
            bonus += 800;
        }
        if (wineCellar >= 10) {
            bonus += 400;
        }
        if (wineCellar >= 1) {
            bonus += 200;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'OryxsSanctuary': function (s) {
        var oryxsSanctuary = s[71];
        var bonus = 0;

        if (oryxsSanctuary >= 100) {
            bonus += Math.floor(oryxsSanctuary / 100) * 10000;
        }
        if (oryxsSanctuary >= 40) {
            bonus += 4000;
        }
        if (oryxsSanctuary >= 20) {
            bonus += 2000;
        }
        if (oryxsSanctuary >= 10) {
            bonus += 1000;
        }
        if (oryxsSanctuary >= 1) {
            bonus += 500;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'BelladonnasGarden': function (s) {
        var belladonnasGarden = s[40];
        var bonus = 0;

        if (belladonnasGarden >= 100) {
            bonus += Math.floor(belladonnasGarden / 100) * 3000;
        }
        if (belladonnasGarden >= 40) {
            bonus += 1200;
        }
        if (belladonnasGarden >= 20) {
            bonus += 600;
        }
        if (belladonnasGarden >= 10) {
            bonus += 300;
        }
        if (belladonnasGarden >= 1) {
            bonus += 150;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'TheMachine': function (s) {
        var theMachine = s[74];
        var bonus = 0;

        if (theMachine >= 100) {
            bonus += Math.floor(theMachine / 100) * 2000;
        }
        if (theMachine >= 40) {
            bonus += 800;
        }
        if (theMachine >= 20) {
            bonus += 400;
        }
        if (theMachine >= 10) {
            bonus += 200;
        }
        if (theMachine >= 1) {
            bonus += 100;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'RainbowRoad': function (s) {
        var rainbowRoad = s[72];
        var bonus = 0;

        if (rainbowRoad >= 100) {
            bonus += Math.floor(rainbowRoad / 100) * 100;
        }
        if (rainbowRoad >= 40) {
            bonus += 40;
        }
        if (rainbowRoad >= 20) {
            bonus += 20;
        }
        if (rainbowRoad >= 10) {
            bonus += 10;
        }
        if (rainbowRoad >= 1) {
            bonus += 5;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'MadGodMayhem': function (s) {
        var madGodMayhem = s[67];
        var bonus = 0;

        if (madGodMayhem >= 100) {
            bonus += Math.floor(madGodMayhem / 100) * 3000;
        }
        if (madGodMayhem >= 40) {
            bonus += 1200;
        }
        if (madGodMayhem >= 20) {
            bonus += 600;
        }
        if (madGodMayhem >= 10) {
            bonus += 300;
        }
        if (madGodMayhem >= 1) {
            bonus += 150;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'Malogia': function (s) {
        var malogia = s[68];
        var bonus = 0;

        if (malogia >= 100) {
            bonus += Math.floor(malogia / 100) * 2500;
        }
        if (malogia >= 40) {
            bonus += 1000;
        }
        if (malogia >= 20) {
            bonus += 500;
        }
        if (malogia >= 10) {
            bonus += 250;
        }
        if (malogia >= 1) {
            bonus += 125;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'Untaris': function (s) {
        var untaris = s[75];
        var bonus = 0;

        if (untaris >= 100) {
            bonus += Math.floor(untaris / 100) * 2500;
        }
        if (untaris >= 40) {
            bonus += 1000;
        }
        if (untaris >= 20) {
            bonus += 500;
        }
        if (untaris >= 10) {
            bonus += 250;
        }
        if (untaris >= 1) {
            bonus += 125;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'Forax': function (s) {
        var forax = s[61];
        var bonus = 0;

        if (forax >= 100) {
            bonus += Math.floor(forax / 100) * 2500;
        }
        if (forax >= 40) {
            bonus += 1000;
        }
        if (forax >= 20) {
            bonus += 500;
        }
        if (forax >= 10) {
            bonus += 250;
        }
        if (forax >= 1) {
            bonus += 125;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'Katalund': function (s) {
        var katalund = s[66];
        var bonus = 0;

        if (katalund >= 100) {
            bonus += Math.floor(katalund / 100) * 2500;
        }
        if (katalund >= 40) {
            bonus += 1000;
        }
        if (katalund >= 20) {
            bonus += 500;
        }
        if (katalund >= 10) {
            bonus += 250;
        }
        if (katalund >= 1) {
            bonus += 125;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'BattleForTheNexus': function (s) {
        var battleForTheNexus = s[38];
        var bonus = 0;

        if (battleForTheNexus >= 100) {
            bonus += Math.floor(battleForTheNexus / 100) * 3000;
        }
        if (battleForTheNexus >= 40) {
            bonus += 1200;
        }
        if (battleForTheNexus >= 20) {
            bonus += 600;
        }
        if (battleForTheNexus >= 10) {
            bonus += 300;
        }
        if (battleForTheNexus >= 1) {
            bonus += 150;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'IceTomb': function (s) {
        var iceTomb = s[65];
        var bonus = 0;

        if (iceTomb >= 100) {
            bonus += Math.floor(iceTomb / 100) * 3000;
        }
        if (iceTomb >= 40) {
            bonus += 1200;
        }
        if (iceTomb >= 20) {
            bonus += 600;
        }
        if (iceTomb >= 10) {
            bonus += 300;
        }
        if (iceTomb >= 1) {
            bonus += 150;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'SantasWorkshop': function (s) {
        var santasWorkshop = s[73];
        var bonus = 0;

        if (santasWorkshop >= 100) {
            bonus += Math.floor(santasWorkshop / 100) * 100;
        }
        if (santasWorkshop >= 40) {
            bonus += 40;
        }
        if (santasWorkshop >= 20) {
            bonus += 20;
        }
        if (santasWorkshop >= 10) {
            bonus += 10;
        }
        if (santasWorkshop >= 1) {
            bonus += 5;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'Beachzone': function (s) {
        var beachzone = s[91];
        var bonus = 0;

        if (beachzone >= 100) {
            bonus += Math.floor(beachzone / 100) * 100;
        }
        if (beachzone >= 40) {
            bonus += 40;
        }
        if (beachzone >= 20) {
            bonus += 20;
        }
        if (beachzone >= 10) {
            bonus += 10;
        }
        if (beachzone >= 1) {
            bonus += 5;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'HiddenInterregnum': function (s) {
        var hiddenInterregnum = s[92];
        var bonus = 0;

        if (hiddenInterregnum >= 100) {
            bonus += Math.floor(hiddenInterregnum / 100) * 100;
        }
        if (hiddenInterregnum >= 40) {
            bonus += 40;
        }
        if (hiddenInterregnum >= 20) {
            bonus += 20;
        }
        if (hiddenInterregnum >= 10) {
            bonus += 10;
        }
        if (hiddenInterregnum >= 1) {
            bonus += 5;
        }

        return bonus > 0 ? { mul: 0, add: bonus } : 0;
    },
    'Tunnel Rat': function (s) {
        for (var i in tunnelrat) if (!s[i]) return 0;
        return { mul: 0.075, add: 3000 };
    },
    'Explosive Journey': function (s) {
        for (var i in explosivejourney) if (!s[i]) return 0;
        return { mul: 0.075, add: 3000 };
    },
    'Travel of the Decade': function (s) {
        for (var i in travelofthedecade) if (!s[i]) return 0;
        return { mul: 0.1, add: 5000 };
    },
    'First Steps': function (s) {
        for (var i in firststeps) if (!s[i]) return 0;
        return { mul: 0.025, add: 100 };
    },
    'King of the Mountains': function (s) {
        for (var i in kingofthemountains) if (!s[i]) return 0;
        return { mul: 0.05, add: 1000 };
    },
    'Conqueror of the Realm': function (s) {
        for (var i in conqueroroftherealm) if (!s[i]) return 0;
        return { mul: 0.1, add: 4000 };
    },
    'Enemy of the Court': function (s) {
        for (var i in enemyofthecourt) if (!s[i]) return 0;
        return { mul: 0.075, add: 3000 };
    },
    'Epic Battles': function (s) {
        for (var i in epicbattles) if (!s[i]) return 0;
        return { mul: 0.075, add: 2000 };
    },
    'Far Out': function (s) {
        for (var i in farout) if (!s[i]) return 0;
        return { mul: 0.05, add: 2000 };
    },
    'Hero of the Nexus': function (s) {
        for (var i in heroofthenexus) if (!s[i]) return 0;
        return { mul: 0.125, add: 5000 };
    },
    'Season’s Beatins': function (s) {
        for (var i in seasonsbeatins) if (!s[i]) return 0;
        return { mul: 0.125, add: 5000 };
    },
    'Realm of the Mad God': function (s) {
        for (var i in realmofthemadgod) if (!s[i]) return 0;
        return { mul: 0.25, add: 10000 };
    }
}
var goals = {
    'Tunnel Rat': function (s) {
        var r = [];
        for (var i of tunnelrat) {
            if (!s[i]) r.push(getDisplayDugeon(i, shortpcstats, pcstats));
        }
        return [r.join(', '), 'dungeons'];
    },
    'Explosive Journey': function (s) {
        var r = [];
        for (var i of explosivejourney) {
            if (!s[i]) r.push(getDisplayDugeon(i, shortpcstats, pcstats));
        }
        return [r.join(', '), 'dungeons'];
    },
    'Travel of the Decade': function (s) {
        var r = [];
        for (var i of travelofthedecade) {
            if (!s[i]) r.push(getDisplayDugeon(i, shortpcstats, pcstats));
        }
        return [r.join(', '), 'dungeons'];
    },
    'First Steps': function (s) {
        var r = [];
        for (var i of firststeps) {
            if (!s[i]) r.push(getDisplayDugeon(i, shortpcstats, pcstats));
        }
        return [r.join(', '), 'dungeons'];
    },
    'King of the Mountains': function (s) {
        var r = [];
        for (var i of kingofthemountains) {
            if (!s[i]) r.push(getDisplayDugeon(i, shortpcstats, pcstats));
        }
        return [r.join(', '), 'dungeons'];
    },
    'Conqueror of the Realm': function (s) {
        var r = [];
        for (var i of conqueroroftherealm) {
            if (!s[i]) r.push(getDisplayDugeon(i, shortpcstats, pcstats));
        }
        return [r.join(', '), 'dungeons'];
    },
    'Enemy of the Court': function (s) {
        var r = [];
        for (var i of enemyofthecourt) {
            if (!s[i]) r.push(getDisplayDugeon(i, shortpcstats, pcstats));
        }
        return [r.join(', '), 'dungeons'];
    },
    'Epic Battles': function (s) {
        var r = [];
        for (var i of epicbattles) {
            if (!s[i]) r.push(getDisplayDugeon(i, shortpcstats, pcstats));
        }
        return [r.join(', '), 'dungeons'];
    },
    'Far Out': function (s) {
        var r = [];
        for (var i of farout) {
            if (!s[i]) r.push(getDisplayDugeon(i, shortpcstats, pcstats));
        }
        return [r.join(', '), 'dungeons'];
    },
    'Hero of the Nexus': function (s) {
        var r = [];
        for (var i of heroofthenexus) {
            if (!s[i]) r.push(getDisplayDugeon(i, shortpcstats, pcstats));
        }
        return [r.join(', '), 'dungeons'];
    },
    'Season’s Beatins': function (s) {
        var r = [];
        for (var i of seasonsbeatins) {
            if (!s[i]) r.push(getDisplayDugeon(i, shortpcstats, pcstats));
        }
        return [r.join(', '), 'dungeons'];
    },
    'Realm of the Mad God': function (s) {
        var r = [];
        for (var i of realmofthemadgod) {
            if (!s[i]) r.push(getDisplayDugeon(i, shortpcstats, pcstats));
        }
        return [r.join(', '), 'dungeons'];
    }
};

function getDisplayDugeon(num, shortpcstats, pcstats) {
    if (shortpcstats[num]) {
        return shortpcstats[num];
    } else if (pcstats[num]) {
        return pcstats[num];
    } else {
        return num;
    }
}

function readstats(pcstats) {
    function readInt32BE(str, idx) {
        var r = 0;
        for (var i = 0; i < 4; i++) {
            var t = str.charCodeAt(idx + 3 - i);
            r += t << (8 * i);
        }
        return r;
    }

    pcstats = pcstats || '';
    var b = atob(pcstats.replace(/-/g, '+').replace(/_/g, '/'));
    var i = 0;
    const end_of_unknown = 4;
    i = end_of_unknown;
    const end_of_flags = 20;
    let statsCount = 0;
    const statsFlagged = [];
    let totalFlagsRead = 0;
    while (i < end_of_flags) {
        const t = readInt32BE(b, i); i += 4;
        totalFlagsRead += 8 * 4;
        while (statsCount < totalFlagsRead) {
            if (t & (1 << (statsCount % (8 * 4)))) {
                statsFlagged.push(statsCount);
            }
            statsCount++
        }
    }
    function readNextStat() {
        let r = b.charCodeAt(i); i++;
        if (r < 0x40) {
            return r;
        }
        if (r >= 0x80 && r <= 0xBF) {
            r = r % 0x40;
            let bits_read = 6;
            while (i < b.length) {
                const f = b.charCodeAt(i); i++;
                r += ((f & 0x7F) << bits_read)
                if ((f & 0x80) === 0) {
                    return r;
                }
                bits_read += 7
                if (i >= b.length) {
                    console.error("Failed to properly read PCStats. Reached the end of the string while trying to read a number the last number read in PCString will be corrupted.");
                    return r;
                }
            }
        }
        else {
            console.error("Failed to properly read PCStats. Found hex (0x" + r.toString(16).padStart(2, '0') + ") at the begining of a number. Number was expected to be between 0x00 and 0x3F or between 0x80 and 0xBF. The rest of the PCString read will be corrupted.");
            return r;
        }
    }
    const stats = []
    while (i < b.length) {
        stats.push(readNextStat());
    }
    if (statsFlagged.length !== stats.length) {
        console.error("The falg vector is not consistent with the number of values read from PCStats. There are a different number of flags set (" + statsFlagged.length + ") than values in PCStats (" + stats.length + "). The values read from PCStats may be corrupted.")
    }

    const r = [];
    for (let j = 0; j < statsFlagged.length; j++) {
        r[statsFlagged[j]] = stats[j];
    }

    for (var i in pcstats) if (!r[i]) r[i] = 0;
    return r;
}

function printstats(c, d, dogoals, dostats, Mule) {
    var st = readstats(c.PCStats);
    var $c = $('<table class="pcstats">');
    var fame = +c.CurrentFame;

    function tline(name, val, cl) {
        $('<tr>')
            .append($('<td>').text(name))
            .append($('<td>').addClass(cl || 'pcstat').text(val))
            .appendTo($c);
    }
    function gline(t, b) {
        $('<tr>')
            .append($('<td colspan=2>')
                .addClass('goal')
                .append($('<span>').text(t))
                .append($('<span class="bonus">').text(b))).appendTo($c);
    }

    if (dogoals) {
        var p = '';
        for (var a in goals) {
            var x = goals[a](st);
            if (!x || x[0] <= 0) continue;
            var s = x[0] + ' for ';
            if (p !== x[1]) {
                p = x[1];
                s = '\u2022 ' + x[1] + ': ' + s
            }
            gline(s, a);
        }
    }
    if (!dostats) return $c;

    var date = new Date(setuptools.data.muledump.charsSeen[Mule.guid][c.id]).toLocaleString().match(/^(.*), (.*)$/);
    //tline('First Seen', date[1]);
    //tline('', date[2]);
    for (var i in st) {
        if (!st[i]) continue;
        var sname = pcstats[i] || '#' + i;
        tline(sname, st[i]);
    }
    if (st[20] > 59) {
        var v = st[20], r = [];
        var divs = { 'd': 24 * 60, 'h': 60, 'm': 1 }
        for (var s in divs) {
            if (r.length > 2) break;
            var t = Math.floor(v / divs[s]);
            if (t) r.push(t + s);
            v %= divs[s];
        }
        tline('Active', r.join(' '), 'info');
    }

    if (!fame) return $c;
    var additiveBonus = 0;
    var multiplicativeBonus = 1;
    var bonusIncrements = [];

    for (var bonus in bonuses) {
        var curBonusValue = bonuses[bonus](st, c, d, fame);
        if (curBonusValue === -1) {
            tline(bonus, 'Error');
            setuptools.app.muledump.warnData(Mule, 'bonuses', bonus);
            continue;
        }
        if (!curBonusValue) continue;

        var incr = 0;
        if (typeof curBonusValue === 'object') {
            additiveBonus += curBonusValue.add || 0;
            multiplicativeBonus *= curBonusValue.mul || 1;
            incr = Math.ceil(fame * curBonusValue.mul) + (curBonusValue.add || 0);
        } else {
            additiveBonus += curBonusValue;
            incr = curBonusValue;
        }

        bonusIncrements.push({
            bonus: bonus,
            incr: incr
        });

        tline(bonus, '+' + incr, 'bonus');
    }

    // Calculate the final fame
    var calcfame = 0;
    for (var i = 0; i < bonusIncrements.length; i++) {
        calcfame += bonusIncrements[i].incr;
    }
    fame += calcfame;

    // Log the total fame after applying all bonuses
    tline('Total Fame', fame, 'bonus');

    return $c;
}