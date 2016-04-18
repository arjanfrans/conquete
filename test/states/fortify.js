'use strict';

/* eslint-disable */

module.exports = {
    "turnCount": 0,
    "phase": "battle",
    "previousTurnEvent": {
        "name": "turnPhaseChange",
        "data": {
            "playerId": "3",
            "phase": "fortifying",
            "message": "The turn phase has changed to \"fortifying\". Turn is to player \"3\"."
        }
    },
    "previousPlayerEvent": {
        "name": "requireForitfyAction",
        "playerId": "3",
        "data": {
            "message": "You are in the foritfy phase. Either move units or end your turn.",
            "playerId": "3"
        }
    },
    "turn": {
        "movements": [],
        "phase": "fortifying",
        "player": "3",
        "unitsPlaced": 4,
        "cardBonus": 0,
        "battle": null,
        "wonBattle": true
    },
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
    "cardQueue": [
        "infantry_middle_east",
        "cavalry_brazil",
        "cavalry_northern_europe",
        "infantry_irkutsk",
        "cavalry_china",
        "artillery_kamchatka",
        "infantry_iceland",
        "cavalry_western_australia",
        "cavalry_alberta",
        "cavalry_mongolia",
        "infantry_south_africa",
        "artillery_siam",
        "infantry_venezuela",
        "infantry_ontario",
        "joker_0",
        "cavalry_ural",
        "artillery_scandinavia",
        "infantry_siberia",
        "cavalry_greenland",
        "infantry_new_guinea",
        "artillery_indonesia",
        "infantry_alaska",
        "cavalry_eastern_australia",
        "artillery_peru",
        "artillery_central_america",
        "cavalry_japan",
        "joker_1",
        "infantry_eastern_united_states",
        "artillery_north_africa",
        "infantry_southern_europe",
        "artillery_western_united_states",
        "artillery_india",
        "cavalry_madagascar",
        "infantry_afganistan",
        "cavalry_congo",
        "infantry_egypt",
        "artillery_northwest_territory",
        "artillery_east_africa",
        "cavalry_quebec",
        "artillery_western_europe",
        "cavalry_ukraine",
        "artillery_great_britain",
        "artillery_yakutsk"
    ],
    "players": [
        {
            "id": "1",
            "dead": false,
            "startUnits": 0,
            "territoryIds": [
                "east_africa",
                "north_africa",
                "india",
                "kamchatka",
                "siam",
                "indonesia",
                "great_britain",
                "scandinavia",
                "western_europe",
                "central_america",
                "northwest_territory",
                "western_united_states",
                "peru",
                "yakutsk"
            ],
            "cards": [],
            "cardsCount": 0
        },
        {
            "id": "2",
            "dead": false,
            "startUnits": 0,
            "territoryIds": [
                "congo",
                "china",
                "japan",
                "mongolia",
                "eastern_australia",
                "western_australia",
                "northern_europe",
                "ukraine",
                "alberta",
                "greenland",
                "quebec",
                "brazil",
                "ural"
            ],
            "cards": [],
            "cardsCount": 0
        },
        {
            "id": "3",
            "dead": false,
            "startUnits": 0,
            "territoryIds": [
                "south_africa",
                "egypt",
                "afganistan",
                "irkutsk",
                "middle_east",
                "siberia",
                "new_guinea",
                "iceland",
                "southern_europe",
                "alaska",
                "eastern_united_states",
                "ontario",
                "argentina",
                "venezuela",
                "madagascar"
            ],
            "cards": [
                "infantry_argentina"
            ],
            "cardsCount": 1
        }
    ],
    "playerQueue": [
        "2",
        "1",
        "3"
    ],
    "board": {
        "territories": [
            {
                "id": "south_africa",
                "name": "South Africa",
                "owner": "3",
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
                "owner": "2",
                "units": 22,
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
                "units": 22,
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
                "owner": "3",
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
                "owner": "3",
                "units": 25,
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
                "units": 1,
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
                "owner": "3",
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
                "owner": "2",
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
                "units": 1,
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
                "owner": "3",
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
                "owner": "2",
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
                "owner": "3",
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
                "owner": "2",
                "units": 1,
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
                "owner": "3",
                "units": 1,
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
                "owner": "2",
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
                "owner": "3",
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
                "owner": "2",
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
                "owner": "3",
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
                "owner": "2",
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
                "units": 1,
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
                "owner": "3",
                "units": 1,
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
                "owner": "2",
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
                "owner": "3",
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
                "owner": "2",
                "units": 1,
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
                "units": 1,
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
                "owner": "3",
                "units": 1,
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
                "owner": "2",
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
                "owner": "3",
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
                "owner": "2",
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
                "owner": "3",
                "units": 1,
                "continentId": "south_america",
                "adjacentTerritoryIds": [
                    "brazil",
                    "peru"
                ]
            },
            {
                "id": "brazil",
                "name": "Brazil",
                "owner": "2",
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
                "owner": "3",
                "units": 1,
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
                "owner": "2",
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
                "owner": null,
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
                "owner": null,
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
                "owner": null,
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
                "owner": null,
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
                "owner": null,
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
