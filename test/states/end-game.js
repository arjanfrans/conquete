'use strict';

/* eslint-disable */

module.exports = {
    "turnCount": 143,
    "phase": "battle",
    "previousTurnEvent": {
        "name": "attack",
        "data": {
            "from": "india",
            "to": "china",
            "attacker": "1",
            "defender": "3",
            "units": 37,
            "message": "Attack initiated by player \"1\" with 37 units. From territory \"india\" to \"china\", owned by player \"3\"."
        }
    },
    "previousPlayerEvent": {
        "name": "requireDiceRoll",
        "playerId": "1",
        "data": {
            "type": "attacker",
            "maxDice": 3,
            "message": "You have to roll dice. You are the attacker and can roll a maximum of 3 dice.",
            "playerId": "1"
        }
    },
    "turn": {
        "movements": [],
        "phase": "attacking",
        "player": "1",
        "unitsPlaced": 50,
        "cardBonus": 20,
        "battle": {
            "from": "india",
            "to": "china",
            "players": [
                "1",
                "3"
            ],
            "attacker": {
                "player": "1",
                "initialUnits": 37,
                "units": 37,
                "dice": []
            },
            "defender": {
                "player": "3",
                "initialUnits": 1,
                "units": 1,
                "dice": []
            },
            "turn": "1",
            "winner": null
        },
        "wonBattle": true
    },
    cardManager: {
        "cards": [
            "joker_0",
            "joker_1",
            "infantry_south_africa",
            "cavalry_congo",
            "artillery_east_africa",
            "infantry_egypt",
            "cavalry_madagascar",
            "artillery_north_africa",
            "infantry_afganistan",
            "cavalry_china",
            "artillery_india",
            "infantry_irkutsk",
            "cavalry_japan",
            "artillery_kamchatka",
            "infantry_middle_east",
            "cavalry_mongolia",
            "artillery_siam",
            "infantry_siberia",
            "cavalry_eastern_australia",
            "artillery_indonesia",
            "infantry_new_guinea",
            "cavalry_western_australia",
            "artillery_great_britain",
            "infantry_iceland",
            "cavalry_northern_europe",
            "artillery_scandinavia",
            "infantry_southern_europe",
            "cavalry_ukraine",
            "artillery_western_europe",
            "infantry_alaska",
            "cavalry_alberta",
            "artillery_central_america",
            "infantry_eastern_united_states",
            "cavalry_greenland",
            "artillery_northwest_territory",
            "infantry_ontario",
            "cavalry_quebec",
            "artillery_western_united_states",
            "infantry_argentina",
            "cavalry_brazil",
            "artillery_peru",
            "infantry_venezuela",
            "cavalry_ural",
            "artillery_yakutsk"
        ],
        queueCards: [
            "artillery_siam",
            "artillery_northwest_territory",
            "infantry_south_africa",
            "infantry_new_guinea",
            "artillery_central_america",
            "cavalry_western_australia",
            "cavalry_eastern_australia",
            "infantry_iceland",
            "artillery_kamchatka",
            "infantry_afganistan",
            "artillery_great_britain",
            "cavalry_china",
            "cavalry_greenland",
            "cavalry_brazil",
            "cavalry_ukraine",
            "artillery_peru",
            "cavalry_ural",
            "artillery_east_africa",
            "infantry_irkutsk",
            "artillery_western_europe",
            "cavalry_mongolia",
            "cavalry_madagascar",
            "infantry_siberia",
            "artillery_yakutsk",
            "infantry_alaska",
            "infantry_argentina",
            "infantry_middle_east",
            "artillery_western_united_states",
            "infantry_ontario",
            "cavalry_alberta",
            "cavalry_japan",
            "cavalry_quebec",
            "cavalry_northern_europe",
            "joker_1",
            "artillery_india",
            "infantry_southern_europe",
            "artillery_north_africa",
            "joker_0",
            "infantry_egypt"
        ],
        "bonusOptions": [
            {
                "cards": [
                    "cavalry",
                    "artillery",
                    "infantry"
                ],
                "bonus": 10
            },
            {
                "cards": [
                    "artillery",
                    "artillery",
                    "artillery"
                ],
                "bonus": 8
            },
            {
                "cards": [
                    "cavalry",
                    "cavalry",
                    "cavalry"
                ],
                "bonus": 6
            },
            {
                "cards": [
                    "infantry",
                    "infantry",
                    "infantry"
                ],
                "bonus": 4
            }
        ],
        "cardTypes": [
            "infantry",
            "cavalry",
            "artillery"
        ],
        "jokerCard": "joker"
    },
    "players": [
        {
            "id": "1",
            "dead": false,
            "startUnits": 0,
            "territoryIds": [
                "south_africa",
                "congo",
                "east_africa",
                "egypt",
                "madagascar",
                "north_africa",
                "afganistan",
                "irkutsk",
                "japan",
                "kamchatka",
                "mongolia",
                "siam",
                "siberia",
                "eastern_australia",
                "indonesia",
                "new_guinea",
                "western_australia",
                "great_britain",
                "iceland",
                "northern_europe",
                "scandinavia",
                "southern_europe",
                "ukraine",
                "western_europe",
                "alaska",
                "alberta",
                "central_america",
                "eastern_united_states",
                "greenland",
                "northwest_territory",
                "ontario",
                "quebec",
                "western_united_states",
                "argentina",
                "brazil",
                "peru",
                "venezuela",
                "ural",
                "yakutsk",
                "middle_east",
                "india"
            ],
            "cards": [
                "infantry_eastern_united_states",
                "infantry_venezuela",
                "artillery_scandinavia"
            ],
            "cardsCount": 3
        },
        {
            "id": "2",
            "dead": true,
            "startUnits": 0,
            "territoryIds": [],
            "cards": [],
            "cardsCount": 0
        },
        {
            "id": "3",
            "dead": false,
            "startUnits": 0,
            "territoryIds": [
                "china"
            ],
            "cards": [
                "artillery_indonesia",
                "cavalry_congo"
            ],
            "cardsCount": 2
        }
    ],
    "playerQueue": [
        "3",
        "1"
    ],
    "board": {
        "territories": [
            {
                "id": "south_africa",
                "name": "South Africa",
                "owner": "1",
                "units": 1,
                "continentId": "africa",
                "adjacentTerritoryIds": [
                    "madagascar",
                    "east_africa",
                    "congo"
                ]
            },
            {
                "id": "congo",
                "name": "Congo",
                "owner": "1",
                "units": 1,
                "continentId": "africa",
                "adjacentTerritoryIds": [
                    "south_africa",
                    "east_africa",
                    "north_africa"
                ]
            },
            {
                "id": "east_africa",
                "name": "East Africa",
                "owner": "1",
                "units": 1,
                "continentId": "africa",
                "adjacentTerritoryIds": [
                    "south_africa",
                    "congo",
                    "egypt",
                    "madagascar",
                    "north_africa",
                    "middle_east"
                ]
            },
            {
                "id": "egypt",
                "name": "Egypt",
                "owner": "1",
                "units": 1,
                "continentId": "africa",
                "adjacentTerritoryIds": [
                    "east_africa",
                    "north_africa",
                    "middle_east",
                    "southern_europe"
                ]
            },
            {
                "id": "madagascar",
                "name": "Madagascar",
                "owner": "1",
                "units": 1,
                "continentId": "africa",
                "adjacentTerritoryIds": [
                    "south_africa",
                    "east_africa"
                ]
            },
            {
                "id": "north_africa",
                "name": "North Africa",
                "owner": "1",
                "units": 2,
                "continentId": "africa",
                "adjacentTerritoryIds": [
                    "congo",
                    "east_africa",
                    "egypt",
                    "southern_europe",
                    "western_europe",
                    "brazil"
                ]
            },
            {
                "id": "afganistan",
                "name": "Afganistan",
                "owner": "1",
                "units": 1,
                "continentId": "asia",
                "adjacentTerritoryIds": [
                    "china",
                    "india",
                    "middle_east",
                    "ural",
                    "ukraine"
                ]
            },
            {
                "id": "china",
                "name": "China",
                "owner": "3",
                "units": 1,
                "continentId": "asia",
                "adjacentTerritoryIds": [
                    "afganistan",
                    "india",
                    "mongolia",
                    "siam",
                    "siberia",
                    "ural"
                ]
            },
            {
                "id": "india",
                "name": "India",
                "owner": "1",
                "units": 38,
                "continentId": "asia",
                "adjacentTerritoryIds": [
                    "afganistan",
                    "china",
                    "middle_east",
                    "siam"
                ]
            },
            {
                "id": "irkutsk",
                "name": "Irkutsk",
                "owner": "1",
                "units": 1,
                "continentId": "asia",
                "adjacentTerritoryIds": [
                    "kamchatka",
                    "mongolia",
                    "siberia",
                    "yakutsk"
                ]
            },
            {
                "id": "japan",
                "name": "Japan",
                "owner": "1",
                "units": 1,
                "continentId": "asia",
                "adjacentTerritoryIds": [
                    "kamchatka",
                    "mongolia"
                ]
            },
            {
                "id": "kamchatka",
                "name": "Kamchatka",
                "owner": "1",
                "units": 1,
                "continentId": "asia",
                "adjacentTerritoryIds": [
                    "irkutsk",
                    "japan",
                    "mongolia",
                    "yakutsk",
                    "alaska"
                ]
            },
            {
                "id": "middle_east",
                "name": "Middle East",
                "owner": "1",
                "units": 1,
                "continentId": "asia",
                "adjacentTerritoryIds": [
                    "east_africa",
                    "egypt",
                    "afganistan",
                    "india",
                    "southern_europe",
                    "ukraine"
                ]
            },
            {
                "id": "mongolia",
                "name": "Mongolia",
                "owner": "1",
                "units": 2,
                "continentId": "asia",
                "adjacentTerritoryIds": [
                    "china",
                    "irkutsk",
                    "japan",
                    "kamchatka",
                    "siberia"
                ]
            },
            {
                "id": "siam",
                "name": "Siam",
                "owner": "1",
                "units": 1,
                "continentId": "asia",
                "adjacentTerritoryIds": [
                    "china",
                    "india",
                    "indonesia"
                ]
            },
            {
                "id": "siberia",
                "name": "Siberia",
                "owner": "1",
                "units": 20,
                "continentId": "asia",
                "adjacentTerritoryIds": [
                    "china",
                    "irkutsk",
                    "mongolia",
                    "ural",
                    "yakutsk"
                ]
            },
            {
                "id": "eastern_australia",
                "name": "Eastern Australia",
                "owner": "1",
                "units": 1,
                "continentId": "australia",
                "adjacentTerritoryIds": [
                    "new_guinea",
                    "western_australia"
                ]
            },
            {
                "id": "indonesia",
                "name": "Indonesia",
                "owner": "1",
                "units": 1,
                "continentId": "australia",
                "adjacentTerritoryIds": [
                    "siam",
                    "new_guinea",
                    "western_australia"
                ]
            },
            {
                "id": "new_guinea",
                "name": "New Guinea",
                "owner": "1",
                "units": 1,
                "continentId": "australia",
                "adjacentTerritoryIds": [
                    "eastern_australia",
                    "indonesia",
                    "western_australia"
                ]
            },
            {
                "id": "western_australia",
                "name": "Western Australia",
                "owner": "1",
                "units": 1,
                "continentId": "australia",
                "adjacentTerritoryIds": [
                    "eastern_australia",
                    "indonesia",
                    "new_guinea"
                ]
            },
            {
                "id": "great_britain",
                "name": "Great Britain",
                "owner": "1",
                "units": 1,
                "continentId": "europe",
                "adjacentTerritoryIds": [
                    "iceland",
                    "northern_europe",
                    "scandinavia",
                    "western_europe"
                ]
            },
            {
                "id": "iceland",
                "name": "Iceland",
                "owner": "1",
                "units": 1,
                "continentId": "europe",
                "adjacentTerritoryIds": [
                    "great_britain",
                    "scandinavia",
                    "greenland"
                ]
            },
            {
                "id": "northern_europe",
                "name": "Northern Europe",
                "owner": "1",
                "units": 1,
                "continentId": "europe",
                "adjacentTerritoryIds": [
                    "great_britain",
                    "scandinavia",
                    "southern_europe",
                    "ukraine",
                    "western_europe"
                ]
            },
            {
                "id": "scandinavia",
                "name": "Scandinavia",
                "owner": "1",
                "units": 5,
                "continentId": "europe",
                "adjacentTerritoryIds": [
                    "great_britain",
                    "iceland",
                    "northern_europe",
                    "ukraine"
                ]
            },
            {
                "id": "southern_europe",
                "name": "Southern Europe",
                "owner": "1",
                "units": 5,
                "continentId": "europe",
                "adjacentTerritoryIds": [
                    "egypt",
                    "north_africa",
                    "middle_east",
                    "northern_europe",
                    "ukraine",
                    "western_europe"
                ]
            },
            {
                "id": "ukraine",
                "name": "Ukraine",
                "owner": "1",
                "units": 1,
                "continentId": "europe",
                "adjacentTerritoryIds": [
                    "afganistan",
                    "middle_east",
                    "ural",
                    "northern_europe",
                    "scandinavia",
                    "southern_europe"
                ]
            },
            {
                "id": "western_europe",
                "name": "Western Europe",
                "owner": "1",
                "units": 1,
                "continentId": "europe",
                "adjacentTerritoryIds": [
                    "north_africa",
                    "great_britain",
                    "northern_europe",
                    "southern_europe"
                ]
            },
            {
                "id": "alaska",
                "name": "Alaska",
                "owner": "1",
                "units": 1,
                "continentId": "north_america",
                "adjacentTerritoryIds": [
                    "kamchatka",
                    "alberta",
                    "northwest_territory"
                ]
            },
            {
                "id": "alberta",
                "name": "Alberta",
                "owner": "1",
                "units": 2,
                "continentId": "north_america",
                "adjacentTerritoryIds": [
                    "alaska",
                    "northwest_territory",
                    "ontario",
                    "western_united_states"
                ]
            },
            {
                "id": "central_america",
                "name": "Central America",
                "owner": "1",
                "units": 7,
                "continentId": "north_america",
                "adjacentTerritoryIds": [
                    "eastern_united_states",
                    "western_united_states",
                    "venezuela"
                ]
            },
            {
                "id": "eastern_united_states",
                "name": "Eastern United States",
                "owner": "1",
                "units": 3,
                "continentId": "north_america",
                "adjacentTerritoryIds": [
                    "central_america",
                    "ontario",
                    "quebec",
                    "western_united_states"
                ]
            },
            {
                "id": "greenland",
                "name": "Greenland",
                "owner": "1",
                "units": 1,
                "continentId": "north_america",
                "adjacentTerritoryIds": [
                    "iceland",
                    "northwest_territory",
                    "ontario",
                    "quebec"
                ]
            },
            {
                "id": "northwest_territory",
                "name": "Northwest Territory",
                "owner": "1",
                "units": 1,
                "continentId": "north_america",
                "adjacentTerritoryIds": [
                    "alaska",
                    "alberta",
                    "greenland",
                    "ontario"
                ]
            },
            {
                "id": "ontario",
                "name": "Ontario",
                "owner": "1",
                "units": 1,
                "continentId": "north_america",
                "adjacentTerritoryIds": [
                    "alberta",
                    "eastern_united_states",
                    "greenland",
                    "northwest_territory",
                    "quebec",
                    "western_united_states"
                ]
            },
            {
                "id": "quebec",
                "name": "Quebec",
                "owner": "1",
                "units": 1,
                "continentId": "north_america",
                "adjacentTerritoryIds": [
                    "eastern_united_states",
                    "greenland",
                    "ontario"
                ]
            },
            {
                "id": "western_united_states",
                "name": "Western United States",
                "owner": "1",
                "units": 1,
                "continentId": "north_america",
                "adjacentTerritoryIds": [
                    "alberta",
                    "central_america",
                    "eastern_united_states",
                    "ontario"
                ]
            },
            {
                "id": "argentina",
                "name": "Argentina",
                "owner": "1",
                "units": 2,
                "continentId": "south_america",
                "adjacentTerritoryIds": [
                    "brazil",
                    "peru"
                ]
            },
            {
                "id": "brazil",
                "name": "Brazil",
                "owner": "1",
                "units": 1,
                "continentId": "south_america",
                "adjacentTerritoryIds": [
                    "north_africa",
                    "argentina",
                    "peru",
                    "venezuela"
                ]
            },
            {
                "id": "peru",
                "name": "Peru",
                "owner": "1",
                "units": 1,
                "continentId": "south_america",
                "adjacentTerritoryIds": [
                    "argentina",
                    "brazil",
                    "venezuela"
                ]
            },
            {
                "id": "venezuela",
                "name": "Venezuela",
                "owner": "1",
                "units": 12,
                "continentId": "south_america",
                "adjacentTerritoryIds": [
                    "central_america",
                    "brazil",
                    "peru"
                ]
            },
            {
                "id": "ural",
                "name": "Ural",
                "owner": "1",
                "units": 1,
                "continentId": "asia",
                "adjacentTerritoryIds": [
                    "afganistan",
                    "china",
                    "siberia",
                    "ukraine"
                ]
            },
            {
                "id": "yakutsk",
                "name": "Yakutsk",
                "owner": "1",
                "units": 1,
                "continentId": "asia",
                "adjacentTerritoryIds": [
                    "irkutsk",
                    "kamchatka",
                    "siberia"
                ]
            }
        ],
        "continents": [
            {
                "id": "africa",
                "name": "Africa",
                "owner": "1",
                "bonus": 3,
                "territoryIds": [
                    "south_africa",
                    "congo",
                    "east_africa",
                    "egypt",
                    "madagascar",
                    "north_africa"
                ],
                "adjacentContinentIds": [
                    "asia",
                    "europe",
                    "south_america"
                ]
            },
            {
                "id": "asia",
                "name": "Asia",
                "owner": null,
                "bonus": 7,
                "territoryIds": [
                    "afganistan",
                    "china",
                    "india",
                    "irkutsk",
                    "japan",
                    "kamchatka",
                    "middle_east",
                    "mongolia",
                    "siam",
                    "siberia",
                    "ural",
                    "yakutsk"
                ],
                "adjacentContinentIds": [
                    "europe",
                    "north_america",
                    "africa",
                    "australia"
                ]
            },
            {
                "id": "australia",
                "name": "Australia",
                "owner": "1",
                "bonus": 2,
                "territoryIds": [
                    "eastern_australia",
                    "indonesia",
                    "new_guinea",
                    "western_australia"
                ],
                "adjacentContinentIds": [
                    "asia"
                ]
            },
            {
                "id": "europe",
                "name": "Europe",
                "owner": "1",
                "bonus": 5,
                "territoryIds": [
                    "great_britain",
                    "iceland",
                    "northern_europe",
                    "scandinavia",
                    "southern_europe",
                    "ukraine",
                    "western_europe"
                ],
                "adjacentContinentIds": [
                    "north_america",
                    "africa",
                    "asia"
                ]
            },
            {
                "id": "north_america",
                "name": "North America",
                "owner": "1",
                "bonus": 5,
                "territoryIds": [
                    "alaska",
                    "alberta",
                    "central_america",
                    "eastern_united_states",
                    "greenland",
                    "northwest_territory",
                    "ontario",
                    "quebec",
                    "western_united_states"
                ],
                "adjacentContinentIds": [
                    "asia",
                    "south_america",
                    "europe"
                ]
            },
            {
                "id": "south_america",
                "name": "South America",
                "owner": "1",
                "bonus": 2,
                "territoryIds": [
                    "argentina",
                    "brazil",
                    "peru",
                    "venezuela"
                ],
                "adjacentContinentIds": [
                    "africa",
                    "north_america"
                ]
            }
        ]
    }
};
