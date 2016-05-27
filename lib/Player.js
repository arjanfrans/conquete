'use strict';

function Player ({ id, startUnits = 0 }) {
    const cards = new Set();
    const territories = new Set();

    function getId () {
        return id;
    }

    function addCard (card) {
        cards.add(card);
    }

    function removeCard (card) {
        cards.delete(card);
    }

    function removeStartUnit () {
        startUnits -= 1;
    }

    function hasStartUnits () {
        return startUnits > 0;
    }

    function addTerritory (territory) {
        territories.add(territory);
    }

    function removeTerritory (territory) {
        territories.delete(territory);
    }

    function getTerritories () {
        return Array.from(territories.values());
    }

    function getCards () {
        return Array.from(cards.values());
    }

    function hasCards (cardsToCheck) {
        return cardsToCheck.every(card => {
            return cards.has(card);
        });
    }

    function isDead () {
        return territories.size === 0 && startUnits === 0;
    }

    function setStartUnits (value) {
        startUnits = value;
    }

    function getStartUnits () {
        return startUnits;
    }

    function toJSON (options) {
        options = options || {};

        const json = {
            id: id,
            dead: isDead(),
            startUnits: startUnits,
            territoryIds: getTerritories().map(territory => territory.getId()),
            cards: getCards(),
            cardsCount: cards.size
        };

        if (options.hide) {
            for (const hide of options.hide) {
                delete json[hide];
            }
        }

        return json;
    }

    return Object.freeze({
        getId,
        addCard,
        removeCard,
        getCards,
        setStartUnits,
        getStartUnits,
        hasStartUnits,
        removeStartUnit,
        hasCards,
        addTerritory,
        removeTerritory,
        getTerritories,
        isDead,
        toJSON
    });
}

module.exports = { create: Player };
