'use strict';

module.exports = function () {
    return {
        territories: [
            {
                id: 'south_africa',
                name: 'South Africa',
                continentId: 'africa',
                adjacentTerritoryIds: [
                    'madagascar',
                    'east_africa',
                    'congo'
                ]
            },
            {
                id: 'congo',
                name: 'Congo',
                continentId: 'africa',
                adjacentTerritoryIds: [
                    'south_africa',
                    'east_africa',
                    'north_africa'
                ]
            },
            {
                id: 'east_africa',
                name: 'East Africa',
                continentId: 'africa',
                adjacentTerritoryIds: [
                    'south_africa',
                    'congo',
                    'egypt',
                    'madagascar',
                    'north_africa',
                    'middle_east'
                ]
            },
            {
                id: 'egypt',
                name: 'Egypt',
                continentId: 'africa',
                adjacentTerritoryIds: [
                    'east_africa',
                    'north_africa',
                    'middle_east',
                    'southern_europe'
                ]
            },
            {
                id: 'madagascar',
                name: 'Madagascar',
                continentId: 'africa',
                adjacentTerritoryIds: [
                    'south_africa',
                    'east_africa'
                ]
            },
            {
                id: 'north_africa',
                name: 'North Africa',
                continentId: 'africa',
                adjacentTerritoryIds: [
                    'congo',
                    'east_africa',
                    'egypt',
                    'southern_europe',
                    'western_europe',
                    'brazil'
                ]
            },
            {
                id: 'afganistan',
                name: 'Afganistan',
                continentId: 'asia',
                adjacentTerritoryIds: [
                    'china',
                    'india',
                    'middle_east',
                    'ural',
                    'ukraine'
                ]
            },
            {
                id: 'china',
                name: 'China',
                continentId: 'asia',
                adjacentTerritoryIds: [
                    'afganistan',
                    'india',
                    'mongolia',
                    'siam',
                    'siberia',
                    'ural'
                ]
            },
            {
                id: 'india',
                name: 'India',
                continentId: 'asia',
                adjacentTerritoryIds: [
                    'afganistan',
                    'china',
                    'middle_east',
                    'siam'
                ]
            },
            {
                id: 'irkutsk',
                name: 'Irkutsk',
                continentId: 'asia',
                adjacentTerritoryIds: [
                    'kamchatka',
                    'mongolia',
                    'siberia',
                    'yakutsk'
                ]
            },
            {
                id: 'japan',
                name: 'Japan',
                continentId: 'asia',
                adjacentTerritoryIds: [
                    'kamchatka',
                    'mongolia'
                ]
            },
            {
                id: 'kamchatka',
                name: 'Kamchatka',
                continentId: 'asia',
                adjacentTerritoryIds: [
                    'irkutsk',
                    'japan',
                    'mongolia',
                    'yakutsk',
                    'alaska'
                ]
            },
            {
                id: 'middle_east',
                name: 'Middle East',
                continentId: 'asia',
                adjacentTerritoryIds: [
                    'east_africa',
                    'egypt',
                    'afganistan',
                    'india',
                    'southern_europe',
                    'ukraine'
                ]
            },
            {
                id: 'mongolia',
                name: 'Mongolia',
                continentId: 'asia',
                adjacentTerritoryIds: [
                    'china',
                    'irkutsk',
                    'japan',
                    'kamchatka',
                    'siberia'
                ]
            },
            {
                id: 'siam',
                name: 'Siam',
                continentId: 'asia',
                adjacentTerritoryIds: [
                    'china',
                    'india',
                    'indonesia'
                ]
            },
            {
                id: 'siberia',
                name: 'Siberia',
                continentId: 'asia',
                adjacentTerritoryIds: [
                    'china',
                    'irkutsk',
                    'mongolia',
                    'ural',
                    'yakutsk'
                ]
            },
            {
                id: 'eastern_australia',
                name: 'Eastern Australia',
                continentId: 'australia',
                adjacentTerritoryIds: [
                    'new_guinea',
                    'western_australia'
                ]
            },
            {
                id: 'indonesia',
                name: 'Indonesia',
                continentId: 'australia',
                adjacentTerritoryIds: [
                    'siam',
                    'new_guinea',
                    'western_australia'
                ]
            },
            {
                id: 'new_guinea',
                name: 'New Guinea',
                continentId: 'australia',
                adjacentTerritoryIds: [
                    'eastern_australia',
                    'indonesia',
                    'western_australia'
                ]
            },
            {
                id: 'western_australia',
                name: 'Western Australia',
                continentId: 'australia',
                adjacentTerritoryIds: [
                    'eastern_australia',
                    'indonesia',
                    'new_guinea'
                ]
            },
            {
                id: 'great_britain',
                name: 'Great Britain',
                continentId: 'europe',
                adjacentTerritoryIds: [
                    'iceland',
                    'northern_europe',
                    'scandinavia',
                    'western_europe'
                ]
            },
            {
                id: 'iceland',
                name: 'Iceland',
                continentId: 'europe',
                adjacentTerritoryIds: [
                    'great_britain',
                    'scandinavia',
                    'greenland'
                ]
            },
            {
                id: 'northern_europe',
                name: 'Northern Europe',
                continentId: 'europe',
                adjacentTerritoryIds: [
                    'great_britain',
                    'scandinavia',
                    'southern_europe',
                    'ukraine',
                    'western_europe'
                ]
            },
            {
                id: 'scandinavia',
                name: 'Scandinavia',
                continentId: 'europe',
                adjacentTerritoryIds: [
                    'great_britain',
                    'iceland',
                    'northern_europe',
                    'ukraine'
                ]
            },
            {
                id: 'southern_europe',
                name: 'Southern Europe',
                continentId: 'europe',
                adjacentTerritoryIds: [
                    'egypt',
                    'north_africa',
                    'middle_east',
                    'northern_europe',
                    'ukraine',
                    'western_europe'
                ]
            },
            {
                id: 'ukraine',
                name: 'Ukraine',
                continentId: 'europe',
                adjacentTerritoryIds: [
                    'afganistan',
                    'middle_east',
                    'ural',
                    'northern_europe',
                    'scandinavia',
                    'southern_europe'
                ]
            },
            {
                id: 'western_europe',
                name: 'Western Europe',
                continentId: 'europe',
                adjacentTerritoryIds: [
                    'north_africa',
                    'great_britain',
                    'northern_europe',
                    'southern_europe'
                ]
            },
            {
                id: 'alaska',
                name: 'Alaska',
                continentId: 'north_america',
                adjacentTerritoryIds: [
                    'kamchatka',
                    'alberta',
                    'northwest_territory'
                ]
            },
            {
                id: 'alberta',
                name: 'Alberta',
                continentId: 'north_america',
                adjacentTerritoryIds: [
                    'alaska',
                    'northwest_territory',
                    'ontario',
                    'western_united_states'
                ]
            },
            {
                id: 'central_america',
                name: 'Central America',
                continentId: 'north_america',
                adjacentTerritoryIds: [
                    'eastern_united_states',
                    'western_united_states',
                    'venezuela'
                ]
            },
            {
                id: 'eastern_united_states',
                name: 'Eastern United States',
                continentId: 'north_america',
                adjacentTerritoryIds: [
                    'central_america',
                    'ontario',
                    'quebec',
                    'western_united_states'
                ]
            },
            {
                id: 'greenland',
                name: 'Greenland',
                continentId: 'north_america',
                adjacentTerritoryIds: [
                    'iceland',
                    'northwest_territory',
                    'ontario',
                    'quebec'
                ]
            },
            {
                id: 'northwest_territory',
                name: 'Northwest Territory',
                continentId: 'north_america',
                adjacentTerritoryIds: [
                    'alaska',
                    'alberta',
                    'greenland',
                    'ontario'
                ]
            },
            {
                id: 'ontario',
                name: 'Ontario',
                continentId: 'north_america',
                adjacentTerritoryIds: [
                    'alberta',
                    'eastern_united_states',
                    'greenland',
                    'northwest_territory',
                    'quebec',
                    'western_united_states'
                ]
            },
            {
                id: 'quebec',
                name: 'Quebec',
                continentId: 'north_america',
                adjacentTerritoryIds: [
                    'eastern_united_states',
                    'greenland',
                    'ontario'
                ]
            },
            {
                id: 'western_united_states',
                name: 'Western United States',
                continentId: 'north_america',
                adjacentTerritoryIds: [
                    'alberta',
                    'central_america',
                    'eastern_united_states',
                    'ontario'
                ]
            },
            {
                id: 'argentina',
                name: 'Argentina',
                continentId: 'south_america',
                adjacentTerritoryIds: [
                    'brazil',
                    'peru'
                ]
            },
            {
                id: 'brazil',
                name: 'Brazil',
                continentId: 'south_america',
                adjacentTerritoryIds: [
                    'north_africa',
                    'argentina',
                    'peru',
                    'venezuela'
                ]
            },
            {
                id: 'peru',
                name: 'Peru',
                continentId: 'south_america',
                adjacentTerritoryIds: [
                    'argentina',
                    'brazil',
                    'venezuela'
                ]
            },
            {
                id: 'venezuela',
                name: 'Venezuela',
                continentId: 'south_america',
                adjacentTerritoryIds: [
                    'central_america',
                    'brazil',
                    'peru'
                ]
            },
            {
                id: 'ural',
                name: 'Ural',
                continentId: 'asia',
                adjacentTerritoryIds: [
                    'afganistan',
                    'china',
                    'siberia',
                    'ukraine'
                ]
            },
            {
                id: 'yakutsk',
                name: 'Yakutsk',
                continentId: 'asia',
                adjacentTerritoryIds: [
                    'irkutsk',
                    'kamchatka',
                    'siberia'
                ]
            }
        ],
        continents: [
            {
                id: 'africa',
                name: 'Africa',
                bonus: 3,
                territoryIds: [
                    'south_africa',
                    'congo',
                    'east_africa',
                    'egypt',
                    'madagascar',
                    'north_africa'
                ]
            },
            {
                id: 'asia',
                name: 'Asia',
                bonus: 7,
                territoryIds: [
                    'afganistan',
                    'china',
                    'india',
                    'irkutsk',
                    'japan',
                    'kamchatka',
                    'middle_east',
                    'mongolia',
                    'siam',
                    'siberia',
                    'ural',
                    'yakutsk'
                ]
            },
            {
                id: 'australia',
                name: 'Australia',
                bonus: 2,
                territoryIds: [
                    'eastern_australia',
                    'indonesia',
                    'new_guinea',
                    'western_australia'
                ]
            },
            {
                id: 'europe',
                name: 'Europe',
                bonus: 5,
                territoryIds: [
                    'great_britain',
                    'iceland',
                    'northern_europe',
                    'scandinavia',
                    'southern_europe',
                    'ukraine',
                    'western_europe'
                ]
            },
            {
                id: 'north_america',
                name: 'North America',
                bonus: 5,
                territoryIds: [
                    'alaska',
                    'alberta',
                    'central_america',
                    'eastern_united_states',
                    'greenland',
                    'northwest_territory',
                    'ontario',
                    'quebec',
                    'western_united_states'
                ]
            },
            {
                id: 'south_america',
                name: 'South America',
                bonus: 2,
                territoryIds: [
                    'argentina',
                    'brazil',
                    'peru',
                    'venezuela'
                ]
            }
        ]
    };
};
