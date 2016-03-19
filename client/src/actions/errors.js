import { TYPES } from './';
import uuid from 'node-uuid';

const FLASH_TIMEOUT = 2000;

export function removeFlash(id) {
    return {
        type: TYPES.REMOVE_FLASH,
        id: id
    };
}

export function pushFlash(level, message) {
    const flash = {
        type: TYPES.PUSH_FLASH,
        id: uuid.v1(),
        level: level,
        message: message
    };

    setTimeout(() => removeFlash(flash.id), FLASH_TIMEOUT);
}

