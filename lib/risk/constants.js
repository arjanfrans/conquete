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

const TURN_PHASES =  {
    PLACEMENT: 'placement',
    ATTACKING: 'attacking',
    FORTIFYING: 'fortifying'
};

const GAME_EVENTS = {
    GAME_START: 'game_start',
    TURN_CHANGE: 'turn_change',
    PHASE_CHANGE: 'phase_change',
    TURN_PHASE_CHANGE: 'turn_phase_change',
    ATTACK: 'attack',
    TERRITORY_CLAIMED: 'territory_claimed',
    DEPLOY_UNITS: 'deploy_units',
    REDEEM_CARDS: 'redeem_cards',
    PLAYER_DEFEATED: 'player_defeated',
    ATTACK_DICE_ROLL: 'attack_dice_roll',
    DEFEND_DICE_ROLL: 'defend_dice_roll',
    BATTLE_END: 'battle_end',
    MOVE_UNITS: 'move_units',
    GAME_END: 'game_end'
};

const PLAYER_EVENTS = {
    NEW_CARD: 'new_card',
    REQUIRE_TERRITORY_CLAIM: 'require_territory_claim',
    REQUIRE_ONE_UNIT_DEPLOY: 'require_unit_deploy',
    REQUIRE_PLACEMENT_ACTION: 'require_placement_action',
    REQUIRE_ATTACK_ACTION: 'require_attack_action',
    REQUIRE_FORTIFY_ACTION: 'require_fortify_action',
    REQUIRE_DICE_ROLL: 'require_dice_roll',
    QUEUED_MOVE: 'queued_move',
};


module.exports = {
    CARD_TYPES,
    JOKER_CARD,
    PHASES,
    TURN_PHASES,
    GAME_EVENTS,
    PLAYER_EVENTS
};
