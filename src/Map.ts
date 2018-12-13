import * as Cozy from 'Cozy';
import * as RPG from 'rpg';

import { ShopMenu } from './menus/Shop';

export class GameMap extends RPG.GameMap {
    public music:Cozy.Music;
    public battleScene:string;

    persisted(k):any {
        return RPG.GameMap.persistent[this.filename][k];
    }

    persist(k:string, v?:any):void {
        if (v === undefined) v = true;
        RPG.GameMap.persistent[this.filename][k] = v;
    }

    open() {
        super.open();

        if (!RPG.GameMap.persistent[this.filename]) {
            RPG.GameMap.persistent[this.filename] = {
                openedChests: [],
                completedFights: [],
                onetimeFights: []
            };
        }

        if (RPG.GameMap.persistent[this.filename].smashedPots) {
            // _.each(RPG.GameMap.persistent[this.filename].smashedPots, function(coords) {
            for (let coords of RPG.GameMap.persistent[this.filename].smashedPots) {
                var tx = coords[0], ty = coords[1];
                // _.each(this.layers, function(lyr:RPG.GameMap.MapLayer, i) {
                for (let lyr of this.layers) {
                    var t = lyr.getTile(tx, ty);
                    if (t == 53) {
                        lyr.setTile(tx, ty, t + 3);
                    }

                    var tr = lyr.getTriggerByPoint((tx + 0.5) * this.tileSize.x, (ty + 0.5) * this.tileSize.y);
                    if (tr && tr.name === 'smash_pot') {
                        tr.solid = false;
                        tr.active = false;
                    }
                }
                // }.bind(this));
            }
            // }.bind(this));
        }
        
        // _.each(RPG.GameMap.persistent[this.filename].openedChests, function(coords) {
        for (let coords of RPG.GameMap.persistent[this.filename].openedChests) {
            var tx = coords[0], ty = coords[1];
            // _.each(this.layers, function(lyr:RPG.GameMap.MapLayer, i) {
            for (let lyr of this.layers) {
                var t = lyr.getTile(tx, ty);
                if (t == 37) {
                    lyr.setTile(tx, ty, t + 3);
                }
            }
            // }.bind(this));
        }
        // }.bind(this));

        RPG.GameMap.persistent[this.filename].completedFights = RPG.GameMap.persistent[this.filename].completedFights || [];
        // _.each(RPG.GameMap.persistent[this.filename].completedFights, (mapID:string) => {
        for (let mapID of RPG.GameMap.persistent[this.filename].completedFights) {
            let e = this.entityLookup[mapID];
            if (e) e.destroy();
        }
        // });
        RPG.GameMap.persistent[this.filename].onetimeFights = RPG.GameMap.persistent[this.filename].onetimeFights || [];
        // _.each(RPG.GameMap.persistent[this.filename].onetimeFights, (mapID:string) => {
        for (let mapID of RPG.GameMap.persistent[this.filename].onetimeFights) {
            let e = this.entityLookup[mapID];
            if (e) e.destroy();
        }
        // });

        if (this.music && this.music !== Cozy.Audio.currentMusic) {
            Cozy.Audio.currentMusic.stop();
            this.music.start();
        }
    }

    finish() {
        super.finish();
        RPG.GameMap.persistent[this.filename].completedFights = [];
    }

    doFight(args) {
        RPG.Scene.do(function*() {
            yield *this.waitFight(args.target);
        }.bind(this));
    }

    *waitFight(entity, options?:any) {
        var opts = options ? options : {};

        var scene = this.battleScene || 'ui/battle/scene_placeholder.png';

        let result = yield *RPG.Battle.waitBattle({
            enemy: entity.params.monster,
            scene: scene,
            noFlee: (entity.params.noFlee === 'true')
        });

        if (result.playerEscaped) {
            entity.behavior = RPG.Behavior.stun(entity, 2, entity.behavior);
        } else if (!opts.leaveEntity) {
            if (entity.params.onetimeFight === 'true') {
                RPG.GameMap.persistent[this.filename].onetimeFights.push(entity.mapID);
            } else {
                RPG.GameMap.persistent[this.filename].completedFights.push(entity.mapID);
            }
            entity.destroy();
        }
    }

    entityFacePlayerAndPause(e:RPG.Entity) {
        e.pause();
        e.sprite.animation = 'stand';
        e.sprite.direction = RPG.getPlayer().dir - 180;
    }

    doDoor(name) {
        var doors = this.getAllTriggersByName(name);

        if (doors.length < 1) {
            throw new Error(`Couldn't find '${name}' trigger.`);
        }

        // _.each(doors, (door) => {
        for (let door of doors) {
            var tx = door.tx,
                ty = door.ty,
                x, y;

            for (y = 0; y < door.th; y++) {
                for (x = 0; x < door.tw; x++) {
                    RPG.getSFX('thud').play();
                    this.layers[1].setTile(tx + x, ty + y, this.layers[1].getTile(tx + x, ty + y) + 1);
                }
            }

            door.solid = false;
        }
        // });
    }

    doKeyDoor(name, keyName, message?) {
        RPG.Scene.do(function*() {
            yield *this.waitKeyDoor(name, keyName, message);
        }.bind(this));
    }

    *waitKeyDoor(name, keyName, message?) {
        if (!keyName) {
            this.doDoor(name);
        }

        if (RPG.GameMap.persistent[this.filename][name + "__opened"]) return;

        var key = RPG.Party.inventory.has(keyName);
        if (key) {
            RPG.GameMap.persistent[this.filename][name + "__opened"] = true;
            yield* this.waitCenteredTextbox(`Used ${key.iconHTML}${key.name}.`);
            this.doDoor(name)
        } else {
            yield* RPG.Scene.waitTextbox(null, [message || "This door is locked, and you don't have the key."]);
        }
    }

    doSwitchDoor(switchName, message?) {
        if (RPG.GameMap.persistent[this.filename][switchName + '__switched']) return;

        RPG.Scene.do(function*() {
            yield* RPG.Scene.waitTextbox(null, [message || "There is no obvious way to open this door."]);
        }.bind(this));
    }

    doSwitch(switchName, doorName?, message?) {
        if (RPG.GameMap.persistent[this.filename][switchName + '__switched']) return;

        RPG.GameMap.persistent[this.filename][switchName + '__switched'] = true;

        var triggers = this.getAllTriggersByName(switchName);

        RPG.Scene.do(function*() {
            yield *this.waitLevers(triggers.map((tr) => [tr.tx,tr.ty]));
            if (doorName) {
                this.doDoor(doorName);
            }
            yield* RPG.Scene.waitTextbox(null, [message || "Something opened in the distance."]);
        }.bind(this))
    }

    fixDoor(name) {
        var doors = this.getAllTriggersByName(name);

        if (doors.length < 1) {
            throw new Error(`Couldn't find '${name}' trigger.`);
        }

        // _.each(doors, (door) => {
        for (let door of doors) {
            var x, y;

            for (y = 0; y < door.th; y++) {
                for (x = 0; x < door.tw; x++) {
                    this.layers[1].setTile(door.tx + x, door.ty + y, this.layers[1].getTile(door.tx + x, door.ty + y) + 3);
                }
            }

            door.solid = false;
        }
        // });
    }

    fixSwitch(name) {
        if (RPG.GameMap.persistent[this.filename][name + '__switched']) {
            var triggers = this.getAllTriggersByName(name);
            // _.each(triggers, (trigger) => {
            for (let trigger of triggers) {
                this.layers[1].setTile(trigger.tx, trigger.ty, this.layers[1].getTile(trigger.tx, trigger.ty) + 2);
            }
            // });
        }
    }

    fixKeyDoor(name) {
        if (RPG.GameMap.persistent[this.filename][name + "__opened"]) {
            this.fixDoor(name);
        }
    }

    fixSwitchDoor(switchName, doorName) {
        if (RPG.GameMap.persistent[this.filename][switchName + '__switched']) {
            this.fixSwitch(switchName);
            this.fixDoor(doorName);
        }
    }

    *waitChoice(topic, choices:string[]|{[key:string]: string}) {
        // var choicesHTML = _.reduce(choices, (str, ch, index) => str + `<li data-menu="choose" data-index="${index}">${ch}</li>`, '');
        let choicesHTML = '';
        for (let index in choices) {
            let ch = choices[index];
            choicesHTML += `<li data-menu="choose" data-index="${index}">${ch}</li>`;
        }

        var m = new RPG.Menu({
            className: '__ch inline-choice menu selections scrollable',
            tagName: 'ul',
            html: choicesHTML
        });

        var returnValue = null;
        m['choose'] = (e) => {
            returnValue = e.getAttribute('data-index');
            RPG.Menu.pop();
        };

        RPG.Textbox.show(topic);
        RPG.Textbox.box.addChild(m, '.inner-text');
        RPG.Menu.push(m);
        while (!m.done) {
            yield;
        }
        RPG.Textbox.hide();

        return returnValue;
    }

    *waitLevers(tiles:any) {
        // _.each(tiles, (tile) => {
        for (let tile of tiles) {
            this.layers[1].setTile(tile[0], tile[1], this.layers[1].getTile(tile[0], tile[1]) + 1);
        }
        // });
        RPG.getSFX('chnk').play();
        yield* RPG.Scene.waitTime(0.5);

        // _.each(tiles, (tile) => {
        for (let tile of tiles) {
            this.layers[1].setTile(tile[0], tile[1], this.layers[1].getTile(tile[0], tile[1]) + 1);
        }
        // });
        RPG.getSFX('chnk').play();
        yield* RPG.Scene.waitTime(0.5);
    }

    *waitCenteredTextbox(text:string) {
        RPG.Textbox.show(`<div class="__c"><div class="__c_i">${text}</div></div>`);
        yield* RPG.Scene.waitButton("confirm");
        Cozy.Input.debounce("confirm");
        RPG.Textbox.hide();
    }

    *waitShop(args) {
        Cozy.Input.debounce('menu');
        Cozy.Input.debounce('cancel');
        var m = new ShopMenu(args);
        RPG.getUiPlane().addChild(m);
        RPG.Menu.push(m);
        while (!m.done) {
            yield;
        }
        m.remove();
    }

    open_door(args) {
        var t = this.layers[1].getTile(args.tx, args.ty);
        if (t == 5) {
            RPG.getSFX('thud').play();
            this.layers[1].setTile(args.tx, args.ty, 6);
        }
    }

    smash_pot(args) {
        var smashed = RPG.GameMap.persistent[this.filename].smashedPots;
        if (!smashed) {
            smashed = RPG.GameMap.persistent[this.filename].smashedPots = [];

            RPG.GameMap.persistent[this.filename].potCount = 0;
            // _.each(this.layers, function(lyr) {
            for (let lyr of this.layers) {
                // _.each(lyr.triggers, function(t) {
                for (let t of lyr.triggers) {
                    if (t.name === 'smash_pot') {
                        RPG.GameMap.persistent[this.filename].potCount++;
                    }
                }
                // }.bind(this));
            }
            // }.bind(this));
        }

        if (!smashed.find(function(o) { return o[0] === args.tx && o[1] === args.ty; })) {
            // _.each(this.layers, function(lyr) {
            for (let lyr of this.layers) {
                var t = lyr.getTile(args.tx, args.ty);
                if (t == 53) {
                    lyr.setTile(args.tx, args.ty, t + 1);
                }
            }
            // }.bind(this));

            smashed.push([args.tx, args.ty]);
            args.trigger.solid = false;
            args.trigger.active = false;
            RPG.getSFX('hit').play();

            if (smashed.length === RPG.GameMap.persistent[this.filename].potCount) {
                RPG.Scene.do(function*() {
                    yield* RPG.Scene.waitTextbox(null, ["You've broken all the pots."]);
                    yield* RPG.Scene.waitTextbox(null, ["Are you proud of yourself now?"]);
                }.bind(this));
            }
        }
    }

    teleport(args) {
        var pos = args.event.properties.to.split(','),
            x = parseInt(pos[0], 10),
            y = parseInt(pos[1], 10),
            z = pos.length > 2 ? this.getLayerByName(pos[2]) : RPG.getPlayer().layer;

        RPG.Scene.do(function*() {
            yield* RPG.Scene.waitFadeTo("black", 0.2);

            RPG.getPlayer().place((x + 0.5) * this.tileSize.x, (y + 0.5) * this.tileSize.y, z);
            RPG.centerCameraOn(RPG.getPlayer().position, true);

            yield* RPG.Scene.waitFadeFrom("black", 0.2);
        }.bind(this));

    }

    trigger_well(args) {
        RPG.Scene.do(function*() {
            RPG.getSFX('restore').play();
            RPG.Party.each(function(ch:RPG.Character) {
                ch.hp = ch.maxhp;
            });
            yield* this.waitCenteredTextbox("HP restored!");
        }.bind(this));
    }

    open_chest(args) {
        var opened = RPG.GameMap.persistent[this.filename].openedChests;
        if (!opened) {
            opened = RPG.GameMap.persistent[this.filename].openedChests = [];
        }

        if (!opened.find(function(o) { return o[0] === args.tx && o[1] === args.ty; })) {
            // _.each(this.layers, function(lyr) {
            for (let lyr of this.layers) {
                var t = lyr.getTile(args.tx, args.ty);
                if (t == 37) {
                    lyr.setTile(args.tx, args.ty, t + 1);
                }
            }
            // }.bind(this));

            opened.push([args.tx, args.ty]);

            if (args.trigger.properties.contents) {
                RPG.Scene.do(function*() {
                    var itemkey = args.trigger.properties.contents;
                    var count = parseInt(args.trigger.properties.count, 10) || 1;

                    if (itemkey === '#money') {
                        RPG.Party.money += count;
                        yield* this.waitCenteredTextbox(`Found ${count} ${RPG.getMoneyName()}!`);
                    } else {
                        var items = RPG.Party.inventory.add(itemkey, count);

                        if (count > 1) {
                            yield* this.waitCenteredTextbox(`Found ${items[0].iconHTML}${items[0].name} x${count}!`);
                        } else {
                            yield* this.waitCenteredTextbox(`Found ${items[0].iconHTML}${items[0].name}!`);
                        }
                    }
                }.bind(this));
            } else {
                RPG.Scene.do(function*() {
                    yield* this.waitCenteredTextbox(`The chest was empty!\n<span style="font-size:60%">How disappointing.</span>`);
                }.bind(this));
            }
        } else {
            RPG.Scene.do(function*() {
                yield* this.waitCenteredTextbox("The chest is empty.");
            }.bind(this));
        }
    }

    layerswitch_to_upper(args) {
        RPG.getPlayer().place(RPG.getPlayer().position.x, RPG.getPlayer().position.y, this.getLayerByName("#spritelayer-upper"));
    }

    layerswitch_to_lower(args) {
        RPG.getPlayer().place(RPG.getPlayer().position.x, RPG.getPlayer().position.y, this.getLayerByName("#spritelayer"));
    }
}
