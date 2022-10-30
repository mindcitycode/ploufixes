import {
    ANIM_BIG_EXPLOSION,
    ANIM_BIG_FRAGMENTS,
    ANIM_BULLET_IMPACTS,
    ANIM_HIT_SPARKS,
    ANIM_HIT_SPATTERS,
    ANIM_LASER_FLASH,
    ANIM_MUZZLE_FLASHES,
    ANIM_SMALL_EXPLOSION,
    ANIM_SMALL_FRAGMENTS,
    ANIM_SMOKE,
    ANIM_BULLETS_AND_PLASMA,
    ANIM_GRENADE,
    ANIM_RPG_ROUND,
    ANIM_CENTIPEDE_HEAD_R0, ANIM_CENTIPEDE_HEAD_R1, ANIM_CENTIPEDE_HEAD_R2, ANIM_CENTIPEDE_HEAD_R3, ANIM_CENTIPEDE_HEAD_R4, ANIM_CENTIPEDE_HEAD_R5, ANIM_CENTIPEDE_HEAD_R6, ANIM_CENTIPEDE_HEAD_R7,
    ANIM_CENTIPEDE_BODY_R0, ANIM_CENTIPEDE_BODY_R1, ANIM_CENTIPEDE_BODY_R2, ANIM_CENTIPEDE_BODY_R3, ANIM_CENTIPEDE_BODY_R4, ANIM_CENTIPEDE_BODY_R5, ANIM_CENTIPEDE_BODY_R6, ANIM_CENTIPEDE_BODY_R7,
    ANIM_CENTIPEDE_LEG, ANIM_CENTIPEDE_SPLASH,
    ANIM_HORNET_NEUTRAL_HOVER, ANIM_HORNET_FIRING_HOVER, ANIM_SCARAB_IDLE, ANIM_SCARAB_WALK, ANIM_SCARAB_FIRING, ANIM_SCARAB_MELEE, ANIM_SCARAB_DESTROYED,
    ANIM_SPIDER_IDLE, ANIM_SPIDER_WALK, ANIM_SPIDER_FIRING, ANIM_SPIDER_MELEE, ANIM_SPIDER_DESTROYED, ANIM_WASP,
    ANIM_ANTITANK_CLASS_IDLE, ANIM_ANTITANK_CLASS_WALK, ANIM_ANTITANK_CLASS_CRAWL, ANIM_ANTITANK_CLASS_FIRE, ANIM_ANTITANK_CLASS_HIT, ANIM_ANTITANK_CLASS_DEATH, ANIM_ANTITANK_CLASS_THROW,
    ANIM_ASSAULT_CLASS_IDLE, ANIM_ASSAULT_CLASS_WALK, ANIM_ASSAULT_CLASS_CRAWL, ANIM_ASSAULT_CLASS_FIRE, ANIM_ASSAULT_CLASS_HIT, ANIM_ASSAULT_CLASS_DEATH, ANIM_ASSAULT_CLASS_THROW,
    ANIM_GRENADIER_CLASS_IDLE, ANIM_GRENADIER_CLASS_WALK, ANIM_GRENADIER_CLASS_CRAWL, ANIM_GRENADIER_CLASS_FIRE, ANIM_GRENADIER_CLASS_HIT, ANIM_GRENADIER_CLASS_DEATH, ANIM_GRENADIER_CLASS_THROW,
    ANIM_MACHINEGUNNER_CLASS_IDLE, ANIM_MACHINEGUNNER_CLASS_WALK, ANIM_MACHINEGUNNER_CLASS_CRAWL, ANIM_MACHINEGUNNER_CLASS_FIRE, ANIM_MACHINEGUNNER_CLASS_HIT, ANIM_MACHINEGUNNER_CLASS_DEATH, ANIM_MACHINEGUNNER_CLASS_THROW,
    ANIM_RADIOOPERATOR_CLASS_IDLE, ANIM_RADIOOPERATOR_CLASS_WALK, ANIM_RADIOOPERATOR_CLASS_CRAWL, ANIM_RADIOOPERATOR_CLASS_FIRE, ANIM_RADIOOPERATOR_CLASS_HIT, ANIM_RADIOOPERATOR_CLASS_DEATH, ANIM_RADIOOPERATOR_CLASS_THROW,
    ANIM_SNIPER_CLASS_IDLE, ANIM_SNIPER_CLASS_WALK, ANIM_SNIPER_CLASS_CRAWL, ANIM_SNIPER_CLASS_FIRE, ANIM_SNIPER_CLASS_HIT, ANIM_SNIPER_CLASS_DEATH, ANIM_SNIPER_CLASS_THROW, ANIM_SQUADLEADER_IDLE,
    ANIM_SQUADLEADER_WALK, ANIM_SQUADLEADER_CRAWL, ANIM_SQUADLEADER_FIRE, ANIM_SQUADLEADER_HIT, ANIM_SQUADLEADER_DEATH, ANIM_SQUADLEADER_THROW,
} from "./generated-game-animations-definitions.js"
import { DIRECTION_UP, DIRECTION_RIGHT, DIRECTION_DOWN, DIRECTION_LEFT } from "./keyController.js"
import {
    ACTION_TYPE_CRAWL, ACTION_TYPE_DEATH, ACTION_TYPE_DESTROYED, ACTION_TYPE_FIRING, ACTION_TYPE_THROW, ACTION_TYPE_HIT,
    ACTION_TYPE_IDLE, ACTION_TYPE_MELEE, ACTION_TYPE_NEUTRAL, ACTION_TYPE_WALK
} from '../game/components/action.js'
import {
    CHARACTER_TYPE_ANTITANK, CHARACTER_TYPE_ASSAULT, CHARACTER_TYPE_BIG_EXPLOSION, CHARACTER_TYPE_CENTIPEDE_BODY, CHARACTER_TYPE_CENTIPEDE_HEAD, CHARACTER_TYPE_GRENADE, CHARACTER_TYPE_GRENADIER,
    CHARACTER_TYPE_HORNET, CHARACTER_TYPE_MACHINEGUNNER, CHARACTER_TYPE_PLASMA, CHARACTER_TYPE_RADIOOPERATOR, CHARACTER_TYPE_ROCKET, CHARACTER_TYPE_SCARAB, CHARACTER_TYPE_SNIPER, CHARACTER_TYPE_SPIDER,
    CHARACTER_TYPE_SQUADLEADER, CHARACTER_TYPE_WASP
} from '../game/components/character.js'
import { FLIPPED_HORIZONTALLY_FLAG } from "./tilemap.js"
import { rotationForDirections } from "../game/components/orientation.js"
import { Shape } from "./shape.js"


const NoSuchActionError = (characterType, action) => {
    return new Error(`no such action ${action} for characterType ${characterType}`)
}
const NoSuchCharacterTypeError = (characterType) => {
    return new Error(`no such characterType ${characterType}`)
}
const NoSuchDirectionError = (characterType, action, directions) => {
    return new Error(`no such directions ${directions} for action ${action} and characterType ${characterType}`)
}

export const getCharacterShape = (characterType, shape = Shape()) => {

    /*  CHARACTER_TYPE_CENTIPEDE_HEAD = 1
      CHARACTER_TYPE_CENTIPEDE_BODY = 211
      CHARACTER_TYPE_HORNET = 3
      CHARACTER_TYPE_SCARAB = 4
      CHARACTER_TYPE_SPIDER = 5
      CHARACTER_TYPE_WASP = 6
      */
    switch (characterType) {
        case CHARACTER_TYPE_ANTITANK:
        case CHARACTER_TYPE_ASSAULT:
        case CHARACTER_TYPE_GRENADIER:
        case CHARACTER_TYPE_MACHINEGUNNER:
        case CHARACTER_TYPE_RADIOOPERATOR:
        case CHARACTER_TYPE_SNIPER:
        case CHARACTER_TYPE_SQUADLEADER:
        case CHARACTER_TYPE_ROCKET: {
            shape.w = 16
            shape.h = 16
            shape.ax = 0.5
            shape.ay = 1
            break
        }
        case CHARACTER_TYPE_PLASMA:
        case CHARACTER_TYPE_GRENADE: {
            shape.w = 8
            shape.h = 8
            shape.ax = 0.5
            shape.ay = 1
            break
        }
        case CHARACTER_TYPE_BIG_EXPLOSION: {
            shape.w = 32
            shape.h = 32
            shape.ax = 0.5
            shape.ay = 1
            break;
        }
        default: {
            throw NoSuchCharacterTypeError(characterType)
        }
    }
    return shape
}

export const selectRotationRotation = (characterType, action, directions) => {
    switch (characterType) {
        case CHARACTER_TYPE_ROCKET:
        case CHARACTER_TYPE_GRENADE: {
            return rotationForDirections(directions)
        }
        default: {
            return 0
        }
    }
}
export const selectFlipRotation = (characterType, action, directions) => {
    switch (characterType) {
        case CHARACTER_TYPE_BIG_EXPLOSION:
        case CHARACTER_TYPE_PLASMA:
        case CHARACTER_TYPE_GRENADE:
        case CHARACTER_TYPE_ROCKET:
        case CHARACTER_TYPE_CENTIPEDE_HEAD:
        case CHARACTER_TYPE_CENTIPEDE_BODY: {
            return 0
        }
        case CHARACTER_TYPE_HORNET:
        case CHARACTER_TYPE_SCARAB:
        case CHARACTER_TYPE_SPIDER:
        case CHARACTER_TYPE_WASP:
        case CHARACTER_TYPE_ANTITANK:
        case CHARACTER_TYPE_ASSAULT:
        case CHARACTER_TYPE_GRENADIER:
        case CHARACTER_TYPE_MACHINEGUNNER:
        case CHARACTER_TYPE_RADIOOPERATOR:
        case CHARACTER_TYPE_SNIPER:
        case CHARACTER_TYPE_SQUADLEADER: {
            if (directions & DIRECTION_RIGHT) {
                return 0
            } else if (directions & DIRECTION_LEFT) {
                return FLIPPED_HORIZONTALLY_FLAG
            } else {
                return 0
            }
        }
        default: throw NoSuchCharacterTypeError(characterType);
    }
}

export const selectAnimation = (characterType, action, directions) => {

    switch (characterType) {
        case CHARACTER_TYPE_CENTIPEDE_HEAD: {
            switch (directions) {
                case (DIRECTION_UP | DIRECTION_RIGHT): return ANIM_CENTIPEDE_HEAD_R1;
                case (DIRECTION_DOWN | DIRECTION_RIGHT): return ANIM_CENTIPEDE_HEAD_R7;
                case (DIRECTION_DOWN | DIRECTION_LEFT): return ANIM_CENTIPEDE_HEAD_R5;
                case (DIRECTION_UP | DIRECTION_LEFT): return ANIM_CENTIPEDE_HEAD_R3;
                case (DIRECTION_UP): return ANIM_CENTIPEDE_HEAD_R2;
                case (DIRECTION_RIGHT): return ANIM_CENTIPEDE_HEAD_R0;
                case (DIRECTION_DOWN): return ANIM_CENTIPEDE_HEAD_R6;
                case (DIRECTION_LEFT): return ANIM_CENTIPEDE_HEAD_R4;
                default: throw (NoSuchDirectionError(characterType, action, directions));
            }
        }
        case CHARACTER_TYPE_CENTIPEDE_BODY: {
            switch (directions) {
                case (DIRECTION_UP | DIRECTION_RIGHT): return ANIM_CENTIPEDE_BODY_R1;
                case (DIRECTION_DOWN | DIRECTION_RIGHT): return ANIM_CENTIPEDE_BODY_R7;
                case (DIRECTION_DOWN | DIRECTION_LEFT): return ANIM_CENTIPEDE_BODY_R5;
                case (DIRECTION_UP | DIRECTION_LEFT): return ANIM_CENTIPEDE_BODY_R3;
                case (DIRECTION_UP): return ANIM_CENTIPEDE_BODY_R2;
                case (DIRECTION_RIGHT): return ANIM_CENTIPEDE_BODY_R0;
                case (DIRECTION_DOWN): return ANIM_CENTIPEDE_BODY_R6;
                case (DIRECTION_LEFT): return ANIM_CENTIPEDE_BODY_R4;
                default: throw (NoSuchDirectionError(characterType, action, directions));
            }
        }
        case CHARACTER_TYPE_HORNET: {
            switch (action) {
                case ACTION_TYPE_NEUTRAL: return ANIM_HORNET_NEUTRAL_HOVER;
                case ACTION_TYPE_FIRING: return ANIM_HORNET_FIRING_HOVER;
                default: throw (NoSuchActionError(characterType, action));
            }
        }
        case CHARACTER_TYPE_SCARAB: {
            switch (action) {
                case ACTION_TYPE_IDLE: return ANIM_SCARAB_IDLE;
                case ACTION_TYPE_WALK: return ANIM_SCARAB_WALK;
                case ACTION_TYPE_FIRING: return ANIM_SCARAB_FIRING;
                case ACTION_TYPE_MELEE: return ANIM_SCARAB_MELEE;
                case ACTION_TYPE_DESTROYED: return ANIM_SCARAB_DESTROYED;
                default: throw (NoSuchActionError(characterType, action));
            }
        }
        case CHARACTER_TYPE_SPIDER: {
            switch (action) {
                case ACTION_TYPE_IDLE: return ANIM_SPIDER_IDLE;
                case ACTION_TYPE_WALK: return ANIM_SPIDER_WALK;
                case ACTION_TYPE_FIRING: return ANIM_SPIDER_FIRING;
                case ACTION_TYPE_MELEE: return ANIM_SPIDER_MELEE;
                case ACTION_TYPE_DESTROYED: return ANIM_SPIDER_DESTROYED;
                default: throw (NoSuchActionError(characterType, action));
            }
        }
        case CHARACTER_TYPE_WASP: {
            return ANIM_WASP
        }
        case CHARACTER_TYPE_ANTITANK: {
            switch (action) {
                case ACTION_TYPE_IDLE: return ANIM_ANTITANK_CLASS_IDLE;
                case ACTION_TYPE_WALK: return ANIM_ANTITANK_CLASS_WALK;
                case ACTION_TYPE_CRAWL: return ANIM_ANTITANK_CLASS_CRAWL;
                case ACTION_TYPE_FIRING: return ANIM_ANTITANK_CLASS_FIRE;
                case ACTION_TYPE_THROW: return ANIM_ANTITANK_CLASS_THROW;
                case ACTION_TYPE_HIT: return ANIM_ANTITANK_CLASS_HIT;
                case ACTION_TYPE_DEATH: return ANIM_ANTITANK_CLASS_DEATH;
                default: throw (NoSuchActionError(characterType, action));
            }
        }
        case CHARACTER_TYPE_ASSAULT: {
            switch (action) {
                case ACTION_TYPE_IDLE: return ANIM_ASSAULT_CLASS_IDLE;
                case ACTION_TYPE_WALK: return ANIM_ASSAULT_CLASS_WALK;
                case ACTION_TYPE_CRAWL: return ANIM_ASSAULT_CLASS_CRAWL;
                case ACTION_TYPE_FIRING: return ANIM_ASSAULT_CLASS_FIRE;
                case ACTION_TYPE_THROW: return ANIM_ASSAULT_CLASS_THROW;
                case ACTION_TYPE_HIT: return ANIM_ASSAULT_CLASS_HIT;
                case ACTION_TYPE_DEATH: return ANIM_ASSAULT_CLASS_DEATH;
                default: throw (NoSuchActionError(characterType, action));
            }
        }
        case CHARACTER_TYPE_GRENADIER: {
            switch (action) {
                case ACTION_TYPE_IDLE: return ANIM_GRENADIER_CLASS_IDLE;
                case ACTION_TYPE_WALK: return ANIM_GRENADIER_CLASS_WALK;
                case ACTION_TYPE_CRAWL: return ANIM_GRENADIER_CLASS_CRAWL;
                case ACTION_TYPE_FIRING: return ANIM_GRENADIER_CLASS_FIRE;
                case ACTION_TYPE_THROW: return ANIM_GRENADIER_CLASS_THROW;
                case ACTION_TYPE_HIT: return ANIM_GRENADIER_CLASS_HIT;
                case ACTION_TYPE_DEATH: return ANIM_GRENADIER_CLASS_DEATH;
                default: throw (NoSuchActionError(characterType, action));
            }
        }
        case CHARACTER_TYPE_MACHINEGUNNER: {
            switch (action) {
                case ACTION_TYPE_IDLE: return ANIM_MACHINEGUNNER_CLASS_IDLE;
                case ACTION_TYPE_WALK: return ANIM_MACHINEGUNNER_CLASS_WALK;
                case ACTION_TYPE_CRAWL: return ANIM_MACHINEGUNNER_CLASS_CRAWL;
                case ACTION_TYPE_FIRING: return ANIM_MACHINEGUNNER_CLASS_FIRE;
                case ACTION_TYPE_THROW: return ANIM_MACHINEGUNNER_CLASS_THROW;
                case ACTION_TYPE_HIT: return ANIM_MACHINEGUNNER_CLASS_HIT;
                case ACTION_TYPE_DEATH: return ANIM_MACHINEGUNNER_CLASS_DEATH;
                default: throw (NoSuchActionError(characterType, action));
            }
        }
        case CHARACTER_TYPE_RADIOOPERATOR: {
            switch (action) {
                case ACTION_TYPE_IDLE: return ANIM_RADIOOPERATOR_CLASS_IDLE;
                case ACTION_TYPE_WALK: return ANIM_RADIOOPERATOR_CLASS_WALK;
                case ACTION_TYPE_CRAWL: return ANIM_RADIOOPERATOR_CLASS_CRAWL;
                case ACTION_TYPE_FIRING: return ANIM_RADIOOPERATOR_CLASS_FIRE;
                case ACTION_TYPE_THROW: return ANIM_RADIOOPERATOR_CLASS_THROW;
                case ACTION_TYPE_HIT: return ANIM_RADIOOPERATOR_CLASS_HIT;
                case ACTION_TYPE_DEATH: return ANIM_RADIOOPERATOR_CLASS_DEATH;
                default: throw (NoSuchActionError(characterType, action));
            }
        }
        case CHARACTER_TYPE_SNIPER: {
            switch (action) {
                case ACTION_TYPE_IDLE: return ANIM_SNIPER_CLASS_IDLE;
                case ACTION_TYPE_WALK: return ANIM_SNIPER_CLASS_WALK;
                case ACTION_TYPE_CRAWL: return ANIM_SNIPER_CLASS_CRAWL;
                case ACTION_TYPE_FIRING: return ANIM_SNIPER_CLASS_FIRE;
                case ACTION_TYPE_THROW: return ANIM_SNIPER_CLASS_THROW;
                case ACTION_TYPE_HIT: return ANIM_SNIPER_CLASS_HIT;
                case ACTION_TYPE_DEATH: return ANIM_SNIPER_CLASS_DEATH;
                default: throw (NoSuchActionError(characterType, action));
            }
        }
        case CHARACTER_TYPE_SQUADLEADER: {
            switch (action) {
                case ACTION_TYPE_IDLE: return ANIM_SQUADLEADER_IDLE;
                case ACTION_TYPE_WALK: return ANIM_SQUADLEADER_WALK;
                case ACTION_TYPE_CRAWL: return ANIM_SQUADLEADER_CRAWL;
                case ACTION_TYPE_FIRING: return ANIM_SQUADLEADER_FIRE;
                case ACTION_TYPE_THROW: return ANIM_SQUADLEADER_THROW;
                case ACTION_TYPE_HIT: return ANIM_SQUADLEADER_HIT;
                case ACTION_TYPE_DEATH: return ANIM_SQUADLEADER_DEATH;
                default: throw (NoSuchActionError(characterType, action));
            }
        }
        case CHARACTER_TYPE_PLASMA: {
            return ANIM_BULLETS_AND_PLASMA
        }
        case CHARACTER_TYPE_GRENADE: {
            return ANIM_GRENADE
        }
        case CHARACTER_TYPE_ROCKET: {
            return ANIM_RPG_ROUND
        }
        case CHARACTER_TYPE_BIG_EXPLOSION: {
            return ANIM_BIG_EXPLOSION
        }
        default: throw NoSuchCharacterTypeError(characterType);
    }

}