var pcstatnames = {
    0: 'Shots',
    1: 'Damaging Shots',
    2: 'Ability Uses',
    3: 'Tiles Uncovered',
    4: 'Teleports',
    5: 'Potions Drunk',
    6: 'Monster Kills',
    7: 'Monster Assists',
    8: 'God Kills',
    9: 'God Assists',
    10: 'Cube Kills',
    11: 'Oryx Kills',
    12: 'Quests Completed',
    13: 'Pirate Caves',
    14: 'Undead Lairs',
    15: 'Abyss of Demons',
    16: 'Snake Pits',
    17: 'Spider Dens',
    18: 'Sprites',
    19: 'Level Up Assists',
    20: 'Minutes Active',
    21: 'Tombs',
    22: 'Trenches',
    23: 'Jungles',
    24: 'Manors',
    25: 'Forest Mazes',
    26: 'LODs',
    27: 'Candylands',
    28: 'Cemeteries',
    29: 'Cave of Treasure',
    30: 'Mad Labs',
    31: 'Lockers',
    //32,
    //33,
    34: 'Ice Caves',
    35: 'Docks',
    36: 'Depths',
    37: 'Labyrinths',
    38: 'Battle For Nexus',
    39: 'Shatters',
    40: 'Belladonna',
    41: 'Theatres',
    42: 'Sewers',
    43: 'Hives',
    44: 'Mountain Temples',
	45: 'Nests',
    46: 'Hard LODs',
    47: 'Lost Halls',
    48: 'Cultist Hideouts',
    49: 'Voids',
    50: 'Encores',
    51: 'Shaitans',
    52: 'Chambers',
    53: 'Magic Woods',
    54: 'Reefs',
    55: 'Thickets',
    56: 'Libraries',
    57: 'Fungal Caverns',
    58: 'Crystal Caverns',
    59: 'Ancient Ruins'
};

var shortdungeonnames = { // sorted by "tier"
    13: 'Pirate',
    23: 'Jungle',
    17: 'Spider',
    16: 'Snake',
    18: 'Sprite',
    24: 'Manor',
    14: 'UDL',
    15: 'Abyss',
    22: 'Trench',
    21: 'Tomb'
};

var bonuses = {
    'Ancestor': function(s, c, d) {
        return (parseInt(d.Account.Stats.TotalFame) === 0) ? {mul: 0.1, add: 20} : 0;
    },
    'Legacy Builder': function(s, c, d) {
        // 0.1
    },
    'Pacifist': function(s) {
        return s[1] ? 0 : 0.25;
    },
    'Thirsty': function(s) {
        return s[5] ? 0 : 0.25;
    },
    'Mundane': function(s) {
        return s[2] ? 0 : 0.25;
    },
    'Boots on the Ground': function(s) {
        return s[4] ? 0 : 0.25;
    },
    'Tunnel Rat': function(s) {
        for (var i in shortdungeonnames) if (!s[i]) return 0;
        return 0.1;
    },
    'Enemy of the Gods': function(s) {
        return (s[8] / (s[6] + s[8]) > 0.1) ? 0.1 : 0;
    },
    'Slayer of the Gods': function(s) {
        return (s[8] / (s[6] + s[8]) > 0.5) ? 0.1 : 0;
    },
    'Oryx Slayer': function(s) {
        return s[11] ? 0.1 : 0;
    },
    'Accurate': function(s) {
        return (s[1] / s[0] > 0.25) ? 0.1 : 0;
    },
    'Sharpshooter': function(s) {
        return (s[1] / s[0] > 0.5) ? 0.1 : 0;
    },
    'Sniper': function(s) {
        return (s[1] / s[0] > 0.75) ? 0.1 : 0;
    },
    'Explorer': function(s) {
        return (s[3] > 1e6) ? 0.05 : 0;
    },
    'Cartographer': function(s) {
        return (s[3] > 4e6) ? 0.05 : 0;
    },
    'Team Player': function(s) {
        return (s[19] > 100) ? 0.1 : 0;
    },
    'Leader of Men': function(s) {
        return (s[19] > 1000) ? 0.1 : 0;
    },
    'Doer of Deeds': function(s) {
        return (s[12] > 1000) ? 0.1 : 0;
    },
    'Friend of the Cubes': function(s) {
        return s[10] ? 0 : 0.1;
    },
    'Well Equipped': function(s, c) {
        //  sometimes we encounter bad account data and it breaks muledump
        if ( typeof c !== 'object' || typeof c.Equipment === 'undefined' ) return -1;
        var eq = c.Equipment.split(',');
        var b = 0;
        for (var i = 0; i < 4; i++) {
            var it = items[+eq[i]] || items[-1];
            b += it[5];
        }
        return b * 0.01;
    },
    'First Born': function(s, c, d, f) {
        if ( typeof d !== 'object' || typeof d.Account === 'undefined' ) return -1;
        return (d.Account.Stats.BestCharFame < f) ? 0.1: 0;
    },
}

var goals = {
    'Tunnel Rat': function(s) {
        var r = [];
        for (var i in shortdungeonnames) {
            if (!s[i]) r.push(shortdungeonnames[i]);
        }
        return [r.join(', '), 'dungeons'];
    },
    'Enemy of the Gods': function(s) {
        var x = s[6] / 9 - s[8];
        if (Math.ceil(x) === x) x += 1;
        return [Math.ceil(x), 'god kills'];
    },
    'Slayer of the Gods': function(s) {
        return [s[6] - s[8] + 1, 'god kills'];
    },
    'Oryx Slayer': function(s) {
        return s[11] ? 0 : [1, 'Oryx kill'];
    },
    'Accurate': function(s) {
        var x = (0.25 * s[0] - s[1]) / 0.75;
        if (Math.ceil(x) === x) x += 1;
        return [Math.ceil(x), 'shots'];
    },
    'Sharpshooter': function(s) {
        var x = (0.5 * s[0] - s[1]) / 0.5;
        if (Math.ceil(x) === x) x += 1;
        return [Math.ceil(x), 'shots'];
    },
    'Sniper': function(s) {
        var x = (0.75 * s[0] - s[1]) / 0.25;
        if (Math.ceil(x) === x) x += 1;
        return [Math.ceil(x), 'shots'];
    },
    'Explorer': function(s) {
        return [1e6 - s[3] + 1, 'tiles'];
    },
    'Cartographer': function(s) {
        return [4e6 - s[3] + 1, 'tiles'];
    },
    'Team Player': function(s) {
        return [100 - s[19] + 1, 'party levelups'];
    },
    'Leader of Men': function(s) {
        return [1000 - s[19] + 1, 'party levelups'];
    },
    'Doer of Deeds': function(s) {
        return [1000 - s[12] + 1, 'quests'];
    },
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
    var r = [];
    for (var i = 0; i < b.length; i += 5) {
        var f = b.charCodeAt(i);
        var val = readInt32BE(b, i + 1);
        r[f] = val;
    }

    for (var i in pcstatnames) if (!r[i]) r[i] = 0;
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
        var sname = pcstatnames[i] || '#' + i;
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
    if (st[0] && st[1]) {
        tline('Accuracy', Math.round(10000 * st[1] / st[0]) / 100 + '%', 'info');
    }
    if (st[8]) {
        tline('God kill ratio', Math.round(10000 * st[8] / (st[6] + st[8])) / 100 + '%', 'info');
    }

    if (!fame) return $c;
    for (var k in bonuses) {
        var b = bonuses[k](st, c, d, fame);
        if ( b === -1 ) {
            tline(k, 'Error');
            setuptools.app.muledump.warnData(Mule, 'bonuses', k);
            continue;
        }
        if (!b) continue;
        var incr = 0;
        if (typeof b === 'object') {
            incr += b.add;
            b = b.mul;
        }
        incr += Math.floor(fame * b);
        fame += incr;
        tline(k, '+' + incr, 'bonus');
    }
    tline('Total Fame', fame, 'bonus');

    return $c;
}
