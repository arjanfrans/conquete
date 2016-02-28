'use strict';

class CardDeck {
    constructor () {
        this.cards = [];
    }

    push (card) {
        this.cards.push(card);
    }

    pop () {
        return this.cards.shift();
    }

    shuffle () {
        let counter = this.cards.length;

        while (counter > 0) {
            let index = Math.floor(Math.random() * counter);

            counter -= 1;

            let temp = this.cards[counter];

            this.cards[counter] = this.cards[index];
            this.cards[index] = temp;
        }
    }

    toString () {
        return JSON.stringify(this.cards.map(card => {
            return {
                territory: card.territory,
                type: card.type
            };
        }));
    }
}

module.exports = CardDeck;
