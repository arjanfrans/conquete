'use strict';

const CARD_TYPES = {
    INFANTRY: 'infantry',
    CAVALRY: 'cavalry',
    ARTILLERY: 'artillery'
};

const JOKER_CARD = 'joker';

const PHASES = {
    SETUP_A: 'setup_a',
    SETUP_B: 'setup_b',
    BATTLE: 'battle',
    END: 'end'
};

const TURN_PHASE =   {
    PLACEMENT: 'placement',
    ATTACKING: 'attacking',
    FORTIFYING: 'fortifying'
};

module.exports = {
    CARD_TYPES,
    JOKER_CARD,
    PHASES,
    TURN_PHASES
};
