import * as Cozy from 'Cozy';
import * as RPG from 'rpg';

import * as Menu from './menus/all';
import { CreditsComponent } from './CreditsComponent';

import { Map_Boss } from '../map/boss';
import { Map_Castle } from '../map/castle';
import { Map_Cave } from '../map/cave';
import { Map_Debug } from '../map/debugmap';
import { Map_Forest } from '../map/forest';
import { Map_Town } from '../map/town';
import { Map_Overworld } from '../map/overworld';

window['RPG'] = RPG;

export var frame = RPG.frame;
export function load() {
    return RPG.load({
        mainMenuClass:          Menu.Main,
        battleSystem:           RPG.Battle.systems.SoloFrontView,
        battleSystemConfig: {
            fightMusic:             'battle',
            // fightSound:             'battle_start',
            victoryMusic:           'victory',
            monsters:               Cozy.gameDir().file('src/monsters.json').read('json'),
            gameOver:               this.gameOverSequence
        },
        loadSkip:               [ "src_image/" ],
        items:                  Cozy.gameDir().file('src/items.json').read('json'),
        sfx: {
            'hit':                  "audio/sfx/smash.wav",
            'restore':              "audio/sfx/Healing Full.wav",
            'thud':                 "audio/sfx/thud.wav",
            'chnk':                 "audio/sfx/chnk.ogg",
            'negative':             "audio/sfx/ALERT_Error.wav",
            'alert':                "audio/sfx/sfx_alarm_loop6.wav",

            'menu_move':            'audio/sfx/MENU_Pick.wav',
            'menu_choose':          'audio/sfx/MENU B_Select.wav',
            'menu_bad':             'audio/sfx/MENU B_Back.wav',
            'menu_newgame':         'audio/sfx/MENU A_Select.wav',

            'dragon_roar':          'audio/sfx/dinosaur_roar.wav',

            'battle_playerhit':     'audio/sfx/sword-slash3.mp3',
            'battle_playerweakhit': 'audio/sfx/sword-clash1.mp3',
            'battle_playermiss':    'audio/sfx/sword-gesture2.mp3',

            'effect_fire':          'audio/sfx/magic-flame1.mp3',
            'effect_ice':           'audio/sfx/magic-ice2.mp3',
            'effect_lightning':     'audio/sfx/magic-electron2.mp3',
            'effect_force':         'audio/sfx/qigong1.mp3',
            'effect_heal':          'audio/sfx/magic-cure1.mp3'
        },
        music: {
            'village':              "audio/music/1-01 Town of Wishes.ogg",
            'overworld':            "audio/music/Death Is Just Another Path.ogg",
            'forest':               "audio/music/2-05 Mellow Darkness.ogg",
            'castle':               "audio/music/1-12 The Ritual.ogg",
            'cave':                 "audio/music/1-10 Brazen.ogg",
            'boss':                 "audio/music/3-11 Royalty of Sin.ogg",
            'battle':               "audio/music/1-02 Resonant Hopes Ignited Wills.ogg",
            'victory':              "audio/music/2-12 Victory Theme.ogg",
            'lose':                 "audio/music/old city theme.ogg",
            'endcredits':           "audio/music/Snowfall (Looped ver.).ogg"
        },
        maps: {
            'overworld':            [ Map_Overworld ],
            'village':              [ Map_Town ],
            'forest':               [ Map_Forest ],
            'castle':               [ Map_Castle ],
            'cave':                 [ Map_Cave ],
            'boss':                 [ Map_Boss ],
            'debug':                [ Map_Debug ]
        },
        menuConfig: {
            sfx: {
                blip:       'menu_move',
                choose:     'menu_choose',
                sfxBad:     'menu_bad'
            }
        }
    });
}

export function start() {
    RPG.GameMap.debugRender = false;
    bootSequence();
}

export function bootSequence() {
    RPG.cleanup();
    RPG.getMusic('overworld').start();

    var bootMenu = new Menu.Boot();
    RPG.getUiPlane().addChild(bootMenu);
    RPG.Menu.push(bootMenu);

    Cozy.unpause();
}

export function startGame(game:RPG.SavedGame) {
    Cozy.pause();
    game.applyToState();
    RPG.Behavior._cleanup();

    Cozy.unpause();

    if (!game.data.map) {
        this.newGameSequence();
    }
}

export function newGameSequence() {
    let lyr = RPG.getRenderPlane().addRenderLayer();
    let sprite = new Cozy.Sprite(RPG.getCharacter('hero').sprite);
    lyr.add(sprite);
    sprite.setPosition(160, 120)
    sprite.direction = 90;

    RPG.Scene.do(function*() {
        yield *RPG.Scene.waitFadeIn(1.0);
        yield *RPG.Scene.waitTextbox(null, [
            "My name is 'Hero'.",
            "With a name like that, great expectations follow you everywhere.",
            "I've been wandering for most of my life, trying to figure out how to fulfill those expectations.",
            "Or how to escape them."
        ]);
        yield *RPG.Scene.waitTextbox(null, [
            "For now I've come to this place: a small village named Carp's Bend. Maybe I'll find what I'm looking for here."
        ]);
        RPG.startMap('village', 8, 2, undefined, { direction: 90 });
    }.bind(this));
}

export function gameOverSequence() {
    RPG.ControlStack.cleanup();
    RPG.ControlStack.push(RPG.ControlMode.Map);
    RPG.Scene.cleanup();
    RPG.getUiPlane().clear();

    let gameOverMenu = new Menu.GameOver();
    RPG.getUiPlane().addChild(gameOverMenu);
    RPG.Scene.do(function*() {
        console.log("GAME OVER");
        RPG.getMusic('lose').start(2.0);
        yield *RPG.Scene.waitFadeIn(2.0);
        RPG.Menu.push(gameOverMenu);
        while (!gameOverMenu.done) {
            yield;
        }
    });
}

export function gameWinSequence() {
    RPG.Scene.do(function*() {
        yield *RPG.Scene.waitFadeOut(1.0);

        RPG.getMap().finish();
        RPG.clearMap();
        RPG.getRenderPlane().clear();
        RPG.setPlayer(null);

        const lyr = RPG.getRenderPlane().addRenderLayer();
        const sprite = new Cozy.Sprite(RPG.getCharacter('hero').sprite);
        lyr.add(sprite);
        sprite.setPosition(160, 120)
        sprite.direction = 90;

        yield *RPG.Scene.waitFadeIn(1.0);
        yield *RPG.Scene.waitTextbox(null, [
            "With the dragon destroyed, I decide that I will not return to Carp's Bend.",
            "I do not know what they will think of me, or if they will understand what I've done for them."
        ]);
        yield *RPG.Scene.waitTextbox(null, [
            "During this journey, however, I have realized, finally, what it is that I have been searching for.",
            "I don't need recognition.",
            "I don't need lavish feasts or celebrations.",
            "I don't even need gold, or gems."
        ]);
        yield *RPG.Scene.waitTextbox(null, [
            "I just need to know that I've done the right thing."
        ]);
        yield *RPG.Scene.waitTextbox(null, [
            "Also it was kind of a terrible town.",
            "Good riddance."
        ]);

        Cozy.Audio.currentMusic.stop(1.0);
        yield *RPG.Scene.waitFadeOut(1.0);
        yield *this.waitOnCredits();

        this.bootSequence();
    }.bind(this));
}

export function *waitOnCredits() {
    RPG.getRenderPlane().clear();

    let y = 0;
    const creditScroll = new CreditsComponent();
    RPG.getUiPlane().addChild(creditScroll);

    RPG.getMusic('endcredits').start();
    yield *RPG.Scene.waitFadeIn(1.0);

    let hold = 0;
    const len = creditScroll.getScrollLength();

    while (creditScroll.scrolled < len) {
        let dt = yield;
        creditScroll.scroll(0.16); // roughly dt * 10, assuming 60 fps, but

        if (Cozy.Input.pressed('confirm')) {
            hold += dt;
            creditScroll.setHoldLevel(hold / 2);
        } else if (hold > 0) {
            hold -= dt * 3;
            if (hold < 0) hold = 0;
            creditScroll.setHoldLevel(hold / 2);
        }
        if (hold > 2) break;
    }

    RPG.getMusic('endcredits').stop(2);
    yield *RPG.Scene.waitFadeOut(2.0);
    creditScroll.remove();
}

export function newGameData() {
    return new RPG.SavedGame(null, {
        characters: {
            hero: {
                name: "Hero",
                title: "Fighter",
                portrait: "ui/portrait-hero.png",
                sprite: "sprites/hero.sprite",
                hp: 100,
                levels: [
                    { xp:    0, damage:10, critical: 1, dodge: 3, block: 2, defense: 5, hp: 100 },
                    { xp:  100, damage:12, critical: 1, dodge: 4, block: 3, defense: 6, hp: 120 },
                    { xp:  225, damage:15, critical: 2, dodge: 5, block: 3, defense: 8, hp: 140 },
                    { xp:  380, damage:17, critical: 2, dodge: 6, block: 4, defense:10, hp: 160 },
                    { xp:  570, damage:20, critical: 3, dodge: 7, block: 4, defense:12, hp: 180 },
                    { xp:  820, damage:22, critical: 3, dodge: 8, block: 5, defense:13, hp: 200 },
                    { xp: 1120, damage:25, critical: 4, dodge: 9, block: 5, defense:15, hp: 220 },
                    { xp: 1500, damage:27, critical: 4, dodge:10, block: 6, defense:17, hp: 240 },
                    { xp: 2000, damage:30, critical: 5, dodge:11, block: 6, defense:19, hp: 260 },
                    { xp: 2500, damage:32, critical: 5, dodge:12, block: 7, defense:20, hp: 280 },
                    { xp: 3300, damage:35, critical: 6, dodge:14, block: 7, defense:22, hp: 300 },
                    { xp: 4200, damage:37, critical: 6, dodge:15, block: 8, defense:24, hp: 320 },
                    { xp: 5400, damage:40, critical: 7, dodge:16, block: 8, defense:26, hp: 340 },
                    { xp: 6800, damage:42, critical: 7, dodge:17, block: 9, defense:27, hp: 360 },
                    { xp: 8600, damage:45, critical: 8, dodge:18, block: 9, defense:29, hp: 380 },
                    { xp:11000, damage:47, critical: 8, dodge:19, block:10, defense:31, hp: 400 },
                    { xp:14000, damage:50, critical: 9, dodge:20, block:11, defense:33, hp: 420 },
                    { xp:17000, damage:52, critical: 9, dodge:21, block:12, defense:34, hp: 440 },
                    { xp:22000, damage:55, critical:10, dodge:22, block:13, defense:36, hp: 460 },
                    { xp:27000, damage:57, critical:10, dodge:23, block:14, defense:38, hp: 480 },
                    { xp:34000, damage:60, critical:10, dodge:25, block:15, defense:40, hp: 500 }
                ],
                equipped: {
                    weapon: 'oak_sword',
                    armor:  'quilt_armor'
                }
            }
        },
        party: {
            members: ['hero'],
            inventory: ['tonic','tonic','oak_sword','quilt_armor'],
            money: 0
        }
    });
}
