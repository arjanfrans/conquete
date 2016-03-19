import Types from './Types';
import uuid from 'node-uuid';

const FLASH_TIMEOUT = 2000;

export function removeFlash(id) {
    return {
        type: Types.REMOVE_FLASH,
        id: id
    };
}

export function pushFlash(level, message) {
    const flash = {
        type: Types.PUSH_FLASH,
        id: uuid.v1(),
        level: level,
        message: message
    };

    return flash;
}

