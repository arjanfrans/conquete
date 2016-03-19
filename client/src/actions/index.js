import * as game from './game';
import * as lobby from './lobby';
import * as errors from './errors';

export const TYPES = {
    ADD_CLIENT: 'add_client',
    ADD_ROOM: 'add_room',
    PUSH_FLASH: 'fush_flash',
    REMOVE_FLASH: 'remove_flash'
};

export default {
    game,
    lobby,
    errors
};
