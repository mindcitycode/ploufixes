// generated Fri, 28 Oct 2022 14:42:33 GMT 

import { ANIM_ANTITANK_CLASS_CRAWL, ANIM_ANTITANK_CLASS_FIRE, ANIM_ANTITANK_CLASS_HIT, ANIM_ANTITANK_CLASS_IDLE, ANIM_ANTITANK_CLASS_WALK, ANIM_CENTIPEDE_HEAD_R0, ANIM_SCARAB_DESTROYED, ANIM_SCARAB_FIRING, ANIM_SCARAB_MELEE, ANIM_SCARAB_WALK, ANIM_WASP } from "./generated-game-animations-definitions"
import { DIRECTION_LEFT, DIRECTION_RIGHT, DIRECTION_UP } from "./keyController"

const NoSuchActionError = (characterType, action) => {
    return new Error(`no such action ${action} for characterType ${characterType}`)
}
const NoSuchCharacterTypeError = (characterType) => {
    return new Error(`no such characterType ${characterType}`)
}
const NoSuchDirectionError = (directions) => {
    return new Error(`no such directions ${directions} for characterType ${characterType}`)
}

export const selectFlipRotation = (characterType, action, directions) => {
    switch (characterType) {
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
                default: throw (NoSuchDirectionError(characterType, action));
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
                default: throw (NoSuchDirectionError(characterType, action));
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
                case ACTION_TYPE_HIT: return ANIM_SQUADLEADER_HIT;
                case ACTION_TYPE_DEATH: return ANIM_SQUADLEADER_DEATH;
                default: throw (NoSuchActionError(characterType, action));
            }
        }
        default: throw NoSuchCharacterTypeError(characterType);
    }

}

/*
export const ANIM_BIG_EXPLOSION = 100;
export const ANIM_BIG_FRAGMENTS = 101;
export const ANIM_BULLET_IMPACTS = 102;
export const ANIM_HIT_SPARKS = 103;
export const ANIM_HIT_SPATTERS = 104;
export const ANIM_LASER_FLASH = 105;
export const ANIM_MUZZLE_FLASHES = 106;
export const ANIM_SMALL_EXPLOSION = 107;
export const ANIM_SMALL_FRAGMENTS = 108;
export const ANIM_SMOKE = 109;
export const ANIM_BULLETS_AND_PLASMA = 110;
export const ANIM_GRENADE = 111;
export const ANIM_RPG_ROUND = 112;
export const ANIM_CENTIPEDE_HEAD_R0 = 113;
export const ANIM_CENTIPEDE_HEAD_R1 = 114;
export const ANIM_CENTIPEDE_HEAD_R2 = 115;
export const ANIM_CENTIPEDE_HEAD_R3 = 116;
export const ANIM_CENTIPEDE_HEAD_R4 = 117;
export const ANIM_CENTIPEDE_HEAD_R5 = 118;
export const ANIM_CENTIPEDE_HEAD_R6 = 119;
export const ANIM_CENTIPEDE_HEAD_R7 = 120;
export const ANIM_CENTIPEDE_BODY_R0 = 121;
export const ANIM_CENTIPEDE_BODY_R1 = 122;
export const ANIM_CENTIPEDE_BODY_R2 = 123;
export const ANIM_CENTIPEDE_BODY_R3 = 124;
export const ANIM_CENTIPEDE_BODY_R4 = 125;
export const ANIM_CENTIPEDE_BODY_R5 = 126;
export const ANIM_CENTIPEDE_BODY_R6 = 127;
export const ANIM_CENTIPEDE_BODY_R7 = 128;
export const ANIM_CENTIPEDE_LEG = 129;
export const ANIM_CENTIPEDE_SPLASH = 130;
export const ANIM_HORNET_NEUTRAL_HOVER = 131;
export const ANIM_HORNET_FIRING_HOVER = 132;
export const ANIM_SCARAB_IDLE = 133;
export const ANIM_SCARAB_WALK = 134;
export const ANIM_SCARAB_FIRING = 135;
export const ANIM_SCARAB_MELEE = 136;
export const ANIM_SCARAB_DESTROYED = 137;
export const ANIM_SPIDER_IDLE = 138;
export const ANIM_SPIDER_WALK = 139;
export const ANIM_SPIDER_FIRING = 140;
export const ANIM_SPIDER_MELEE = 141;
export const ANIM_SPIDER_DESTROYED = 142;
export const ANIM_WASP = 143;
export const ANIM_ASSAULT_CLASS_IDLE = 144;
export const ANIM_ANTITANK_CLASS_WALK = 145;
export const ANIM_ANTITANK_CLASS_CRAWL = 146;
export const ANIM_ANTITANK_CLASS_FIRE = 147;
export const ANIM_ANTITANK_CLASS_HIT = 148;
export const ANIM_ANTITANK_CLASS_DEATH = 149;
export const ANIM_ANTITANK_CLASS_THROW = 150;
export const ANIM_ASSAULT_CLASS_IDLE = 151;
export const ANIM_ASSAULT_CLASS_WALK = 152;
export const ANIM_ASSAULT_CLASS_CRAWL = 153;
export const ANIM_ASSAULT_CLASS_FIRE = 154;
export const ANIM_ASSAULT_CLASS_HIT = 155;
export const ANIM_ASSAULT_CLASS_DEATH = 156;
export const ANIM_ASSAULT_CLASS_THROW = 157;
export const ANIM_GRENADIER_CLASS_IDLE = 158;
export const ANIM_GRENADIER_CLASS_WALK = 159;
export const ANIM_GRENADIER_CLASS_CRAWL = 160;
export const ANIM_GRENADIER_CLASS_FIRE = 161;
export const ANIM_GRENADIER_CLASS_HIT = 162;
export const ANIM_GRENADIER_CLASS_DEATH = 163;
export const ANIM_GRENADIER_CLASS_THROW = 164;
export const ANIM_MACHINEGUNNER_CLASS_IDLE = 165;
export const ANIM_MACHINEGUNNER_CLASS_WALK = 166;
export const ANIM_MACHINEGUNNER_CLASS_CRAWL = 167;
export const ANIM_MACHINEGUNNER_CLASS_FIRE = 168;
export const ANIM_MACHINEGUNNER_CLASS_HIT = 169;
export const ANIM_MACHINEGUNNER_CLASS_DEATH = 170;
export const ANIM_MACHINEGUNNER_CLASS_THROW = 171;
export const ANIM_RADIOOPERATOR_CLASS_IDLE = 172;
export const ANIM_RADIOOPERATOR_CLASS_WALK = 173;
export const ANIM_RADIOOPERATOR_CLASS_CRAWL = 174;
export const ANIM_RADIOOPERATOR_CLASS_FIRE = 175;
export const ANIM_RADIOOPERATOR_CLASS_HIT = 176;
export const ANIM_RADIOOPERATOR_CLASS_DEATH = 177;
export const ANIM_RADIOOPERATOR_CLASS_THROW = 178;
export const ANIM_SNIPER_CLASS_IDLE = 179;
export const ANIM_SNIPER_CLASS_WALK = 180;
export const ANIM_SNIPER_CLASS_CRAWL = 181;
export const ANIM_SNIPER_CLASS_FIRE = 182;
export const ANIM_SNIPER_CLASS_HIT = 183;
export const ANIM_SNIPER_CLASS_DEATH = 184;
export const ANIM_SNIPER_CLASS_THROW = 185;
export const ANIM_SQUADLEADER_IDLE = 186;
export const ANIM_SQUADLEADER_WALK = 187;
export const ANIM_SQUADLEADER_CRAWL = 188;
export const ANIM_SQUADLEADER_FIRE = 189;
export const ANIM_SQUADLEADER_HIT = 190;
export const ANIM_SQUADLEADER_DEATH = 191;
export const ANIM_SQUADLEADER_THROW = 192;
*/