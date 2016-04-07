'use strict';

const fs = require('fs');
const readline = require('readline');
const chalk = require('chalk');

const TERRITORIES = {
    '1': 'alaska',
    '2': 'northwest_territory',
    '3': 'greenland',
    '4': 'alberta',
    '5': 'ontario',
    '6': 'quebec',
    '7': 'western_united_states',
    '8': 'eastern_united_states',
    '9': 'central_america',

    '10': 'iceland',
    '11': 'scandinavia',
    '12': 'great_britain',
    '13': 'northern_europe',
    '14': 'western_europe',
    '15': 'southern_europe',
    '16': 'ukraine',

    '17': 'venezuela',
    '18': 'peru',
    '19': 'brazil',
    '20': 'argentina',

    '21': 'north_africa',
    '22': 'congo',
    '23': 'egypt',
    '24': 'east_africa',
    '25': 'south_africa',
    '26': 'madagascar',

    '27': 'ural',
    '28': 'afganistan',
    '29': 'middle_east',
    '30': 'siberia',
    '31': 'yakutsk',
    '32': 'kamchatka',
    '33': 'irkutsk',
    '34': 'mongolia',
    '35': 'china',
    '36': 'india',
    '37': 'japan',
    '38': 'siam',

    '39': 'indonesia',
    '40': 'new_guinea',
    '41': 'western_australia',
    '42': 'eastern_australia'
};

const map = fs.readFileSync(__dirname + '/map.txt', 'utf8');
const REGEX = /{(.*?)}/g;
const CONTINENT_COLORS = {
    'europe': 'blue',
    'asia': 'green',
    'australia': 'magenta',
    'north_america': 'yellow',
    'south_america': 'red',
    'africa': 'cyan'
};

function parseMap (territories, playerColors) {
    let territoryData = {};

    for (let territory of territories) {
        territoryData[territory.id] = territory;
    }

    let newMap = [];

    for (let line of map.split('\n')) {
        let params = line.match(REGEX);
        let replacements = [];

        if (params) {
            for (let param of params) {
                let paramKey = param.substring(1, param.length - 1);
                let split = paramKey.split('_');
                let id = split[0];
                let data = split[1];
                let territoryName = TERRITORIES[id];
                let territory = territoryData[territoryName];
                let replacement = null;

                let color = null;
                let bgColor = null;
                let underline = false;
                let fill = '';

                if (data === 'id') {
                    color = CONTINENT_COLORS[territory.continentId];
                    underline = true;
                    replacement = territory.id.toString().substring(0, 5);
                    fill = ' '.repeat(Math.abs(param.length - replacement.length));
                } else if (data === 'u') {
                    replacement = territory.units.toString();
                    fill = ' '.repeat(Math.abs(param.length - replacement.length));
                } else if (data === 'p') {
                    if (territory.owner === null) {
                        replacement = '-';
                    } else {
                        let playerColor = playerColors[territory.owner];

                        color = 'black';
                        bgColor = 'bg' + playerColor.charAt(0).toUpperCase() + playerColor.slice(1);
                        replacement = territory.owner.toString();
                    }

                    fill = ' '.repeat(Math.abs(param.length - replacement.length));
                }

                if (replacement) {
                    replacement = replacement.toString() + fill;

                    if (color) {
                        let ch = chalk[color];

                        if (bgColor) {
                            ch = ch[bgColor];
                        }

                        if (underline) {
                            ch = ch.underline;
                        }

                        replacement = ch.bold(replacement);
                    }

                    replacements.push({
                        original: param,
                        new: replacement
                    });
                }
            }

            for (let replacement of replacements) {
                line = line.replace(/\s\s*$/, ''); // remove trailing whitespace
                line = line.replace(replacement.original, replacement.new);
            }
        }

        newMap.push(line);
    }

    return newMap.join('\n');
}

module.exports = parseMap;
