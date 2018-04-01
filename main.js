global["compiledGame"] =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 25);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

(function() { module.exports = global["Cozy"]; }());

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Cozy = __webpack_require__(0);
const Behavior_1 = __webpack_require__(8);
const ControlStack_1 = __webpack_require__(3);
const Item_1 = __webpack_require__(9);
const MapMode_1 = __webpack_require__(20);
const Menu_1 = __webpack_require__(11);
const Scene_1 = __webpack_require__(6);
const Map_ts_1 = __webpack_require__(2);
let characters = {};
let loadSkip = [];
let player = null;
let map = null;
let mapkey = '';
let mapLookup = {};
let cameraSpeed = 750;
let cameraHalf;
let cameraFocus;
let cameraTarget = null;
let renderPlane;
let debugPlane;
let uiPlane;
let battleSystem;
let mainMenuClass;
exports.equipSlots = ["weapon", "shield", "armor", "accessory"];
exports.sfx = {};
exports.music = {};
exports.moneyName = "G";
function load(config) {
    console.log(`Loading project lotus core`);
    renderPlane = Cozy.addPlane(Cozy.RenderPlane, { className: 'render-plane', renderBackground: 'rgba(0,0,0,0)' });
    if (Cozy.getDebug())
        debugPlane = Cozy.addPlane(Cozy.RenderPlane, { className: 'render-plane', renderBackground: 'rgba(0,0,0,0)' });
    uiPlane = Cozy.addPlane(Cozy.UiPlane, { className: 'overlay' });
    if (config.sfx) {
        exports.sfx = Cozy.mapO(config.sfx, (args) => new Cozy.SFX(args));
    }
    if (config.music) {
        exports.music = Cozy.mapO(config.music, (args) => new Cozy.SFX(args));
    }
    if (config.battleSystem) {
        battleSystem = new config.battleSystem['System'](config.battleSystemConfig || {});
    }
    if (config.menuConfig) {
        if (config.menuConfig.sfx) {
            Menu_1.Menu.blip = exports.sfx[config.menuConfig.sfx.blip];
            Menu_1.Menu.choose = exports.sfx[config.menuConfig.sfx.choose];
            Menu_1.Menu.sfxBad = exports.sfx[config.menuConfig.sfx.sfxBad];
        }
    }
    if (config.hasOwnProperty('cameraSpeed')) {
        setCameraSpeed(config.cameraSpeed);
    }
    loadSkip = config.loadSkip || [];
    mainMenuClass = config.mainMenuClass || null;
    mapLookup = config.maps || {};
    Item_1.Item.load(config.items || {});
    cameraHalf = new PIXI.Point(Cozy.config('width') / 2, Cozy.config('height') / 2);
    cameraFocus = new PIXI.Point(0, 0);
    console.log(JSON.stringify(cameraHalf));
    let textures = {};
    Cozy.gameDir().glob("**/*.{png,jpg,gif}").forEach((f) => {
        if (f instanceof Cozy.File) {
            if (loadSkip.reduce((memo, ignore) => memo || f.path.indexOf(ignore) === 0, false))
                return;
            textures[f.relativePath(Cozy.gameDir())] = f;
        }
    });
    Menu_1.Menu.init();
    let promises = [Cozy.loadTextures(textures)];
    for (let s in exports.sfx) {
        promises.push(exports.sfx[s].loaded());
    }
    for (let m in exports.music) {
        promises.push(exports.music[m].loaded());
    }
    return promises;
}
exports.load = load;
function cleanup() {
    if (Cozy.Audio.currentMusic) {
        Cozy.Audio.currentMusic.stop();
    }
    map = null;
    player = null;
    Scene_1.Scene.cleanup();
    Behavior_1.Behavior._cleanup();
    ControlStack_1.ControlStack.cleanup();
    ControlStack_1.ControlStack.push(ControlStack_1.ControlMode.Map);
    Menu_1.Menu.menuStack = [];
    renderPlane.clear();
    uiPlane.clear();
}
exports.cleanup = cleanup;
function frame(dt) {
    if (map) {
        map.update(dt);
    }
    if (ControlStack_1.ControlStack.len < 1) {
        throw new Error("Control stack got emptied");
    }
    let controls = ControlStack_1.ControlStack.top();
    if (controls === ControlStack_1.ControlMode.Map && map && player) {
        MapMode_1.frameMapMode(dt);
    }
    else if (controls === ControlStack_1.ControlMode.Scene && Scene_1.Scene.currentScene) {
        Scene_1.Scene.update(dt);
    }
    else if (controls === ControlStack_1.ControlMode.Menu && Menu_1.Menu.currentMenu) {
        Menu_1.Menu.update(dt);
    }
    else {
        switch (controls) {
            case ControlStack_1.ControlMode.Map:
                console.warn("bad controls [map]: >>", map, player, ControlStack_1.ControlStack);
                break;
            case ControlStack_1.ControlMode.Scene:
                console.warn("bad controls [scene]: >>", Scene_1.Scene.currentScene, ControlStack_1.ControlStack);
                break;
            case ControlStack_1.ControlMode.Menu:
                console.warn("bad controls [menu]: >>", Menu_1.Menu.currentMenu, ControlStack_1.ControlStack);
                break;
        }
    }
    if (cameraTarget && cameraTarget.sprite) {
        centerCameraOn(cameraTarget.sprite.position);
    }
    if (map && map.layers.length > 0) {
        let offs = player && player.layer ? player.layer.spriteLayer.getOffset()
            : map.layers[0].spriteLayer.getOffset();
        let dx = (cameraFocus.x) - (-offs.x + cameraHalf.x), dy = (cameraFocus.y) - (-offs.y + cameraHalf.y), dd = Math.sqrt(dx * dx + dy * dy), maxDist = cameraSpeed * dt;
        if (dd > maxDist) {
            dx *= (maxDist / dd);
            dy *= (maxDist / dd);
        }
        for (let layer of map.layers) {
            layer.patchLayer.offset(offs.x - dx, offs.y - dy);
            layer.spriteLayer.offset(offs.x - dx, offs.y - dy);
        }
        if (map.debugLayer)
            map.debugLayer.offset(offs.x - dx, offs.y - dy);
        map.frame(dt);
    }
}
exports.frame = frame;
function centerCameraOn(pt, snap) {
    let cx = pt.x;
    let cy = pt.y;
    if (map && map.cameraBoxes) {
        let cameraBox = map.cameraBoxes.find((box) => box.contains(cx, cy));
        if (cameraBox) {
            if (cameraBox.width <= Cozy.config('width')) {
                cx = cameraBox.x + cameraBox.width / 2;
            }
            else {
                cx = Math.max(cameraBox.x + cameraHalf.x, cx);
                cx = Math.min(cameraBox.x + cameraBox.width - cameraHalf.x, cx);
            }
            if (cameraBox.height <= Cozy.config('height')) {
                cy = cameraBox.y + cameraBox.height / 2;
            }
            else {
                cy = Math.max(cameraBox.y + cameraHalf.y, cy);
                cy = Math.min(cameraBox.y + cameraBox.height - cameraHalf.y, cy);
            }
        }
    }
    cameraFocus.x = cx;
    cameraFocus.y = cy;
    if (snap) {
        for (let layer of map.layers) {
            layer.patchLayer.offset(-cx + cameraHalf.x, -cy + cameraHalf.y);
            layer.spriteLayer.offset(-cx + cameraHalf.x, -cy + cameraHalf.y);
        }
        if (map.debugLayer)
            map.debugLayer.offset(-cx + cameraHalf.x, -cy + cameraHalf.y);
    }
}
exports.centerCameraOn = centerCameraOn;
function cameraFollow(e) {
    cameraTarget = e;
}
exports.cameraFollow = cameraFollow;
function setCameraSpeed(sp) {
    cameraSpeed = sp;
}
exports.setCameraSpeed = setCameraSpeed;
function getPlayer() {
    return player;
}
exports.getPlayer = getPlayer;
function setPlayer(e) {
    player = e;
}
exports.setPlayer = setPlayer;
function setCharacters(ch) {
    characters = ch;
}
exports.setCharacters = setCharacters;
function getBattleSystem() { return battleSystem; }
exports.getBattleSystem = getBattleSystem;
function getCameraFocus() { return cameraFocus; }
exports.getCameraFocus = getCameraFocus;
function getCameraSpeed() { return cameraSpeed; }
exports.getCameraSpeed = getCameraSpeed;
function getCharacters() { return characters; }
exports.getCharacters = getCharacters;
function getCharacter(k) { return characters[k]; }
exports.getCharacter = getCharacter;
function getUiPlane() { return uiPlane; }
exports.getUiPlane = getUiPlane;
function getRenderPlane() { return renderPlane; }
exports.getRenderPlane = getRenderPlane;
function getDebugPlane() { return debugPlane; }
exports.getDebugPlane = getDebugPlane;
function getMap() { return map; }
exports.getMap = getMap;
function getMapkey() { return mapkey; }
exports.getMapkey = getMapkey;
function getMainMenuClass() { return mainMenuClass; }
exports.getMainMenuClass = getMainMenuClass;
function getEquipSlots() { return exports.equipSlots; }
exports.getEquipSlots = getEquipSlots;
function getSFX(k) { return exports.sfx[k]; }
exports.getSFX = getSFX;
function getMusic(k) { return exports.music[k]; }
exports.getMusic = getMusic;
function startMap(mapkey, x, y, layerName, options) {
    let opts = options || {};
    Scene_1.Scene.do(function* () {
        if (!opts.noFadeOut)
            yield* Scene_1.Scene.waitFadeOut(0.2);
        if (map) {
            map.finish();
            map.close();
        }
        let mapArgs = mapLookup[mapkey].slice(0);
        let mapType = mapArgs.shift();
        rawOpenMap(mapArgs, mapType);
        player.place((x + 0.5) * map.tileSize.x, (y + 0.5) * map.tileSize.y, map.getLayerByName(layerName || '#spritelayer'));
        if (opts.direction)
            player.dir = opts.direction;
        centerCameraOn(player.position, true);
        if (!opts.noFadeIn)
            yield* Scene_1.Scene.waitFadeIn(0.2);
        map.start();
    });
}
exports.startMap = startMap;
function rawOpenMap(args, type) {
    if (type === undefined) {
        type = Map_ts_1.GameMap;
    }
    map = new type(args);
    map.open();
    return map;
}
exports.rawOpenMap = rawOpenMap;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Cozy = __webpack_require__(0);
const Core_1 = __webpack_require__(1);
const Loader_1 = __webpack_require__(21);
class MapRect {
    constructor(tileSize) {
        this.active = true;
        this.tileSize = tileSize;
    }
    get tx() {
        return Math.floor(this.rect.x / this.tileSize.x);
    }
    get ty() {
        return Math.floor(this.rect.y / this.tileSize.y);
    }
    get tw() {
        return Math.floor(this.rect.width / this.tileSize.x);
    }
    get th() {
        return Math.floor(this.rect.height / this.tileSize.y);
    }
}
class MapEvent extends MapRect {
    constructor() {
        super(...arguments);
        this._solid = true;
    }
    get solid() {
        return this._solid;
    }
    set solid(v) {
        this._solid = v;
        this.obstructions.forEach((o) => {
            o.active = v;
        });
    }
}
exports.MapEvent = MapEvent;
class MapTrigger extends MapRect {
    constructor() {
        super(...arguments);
        this._solid = true;
    }
    get solid() {
        return this._solid;
    }
    set solid(v) {
        this._solid = v;
        this.obstructions.forEach((o) => {
            o.active = v;
        });
    }
}
exports.MapTrigger = MapTrigger;
class MapPatch {
    constructor(def) {
        this.name = def.name || '';
        this.spriteDef = def.sprite || {};
        this.sourceSpriteDef = def.sourceSpriteDef || '';
        this.position = def.position || new PIXI.Point(0, 0);
        this.sortWithEntities = def.sortWithEntities || false;
        this.uid = Cozy.uniqueID();
    }
    place(layer) {
        if (this.sprite) {
            if (this.sortWithEntities) {
                this.layer.spriteLayer.remove(this.sprite);
            }
            else {
                this.layer.patchLayer.remove(this.sprite);
            }
            delete this.layer.map.patchLookup[this.uid];
        }
        else {
            this.sprite = new Cozy.Sprite(this.spriteDef);
        }
        this.sprite.setPosition(this.position.x, this.position.y);
        this.layer = layer;
        if (this.sortWithEntities) {
            this.layer.spriteLayer.add(this.sprite);
        }
        else {
            this.layer.patchLayer.add(this.sprite);
        }
        if (!this.layer.patches['includes'](this)) {
            this.layer.patches.push(this);
        }
        this.layer.map.patchLookup[this.uid] = this;
    }
}
exports.MapPatch = MapPatch;
class MapZone {
    constructor(def) {
        this.name = def.name;
        this.shape = new Cozy.Shape(Cozy.ShapeType.Polygon, {
            closed: true,
            points: def.points,
            linecolor: 0xffffff,
            linealpha: 0.8,
            fillcolor: 0xffffff,
            fillalpha: 0.0
        });
        if (def.events) {
            let events = def.events;
            this.events = {};
            if (events.onEnter) {
                this.shape.fillalpha = 0.2;
                this.events.onEnter = events.onEnter;
            }
        }
        this.flags = {};
        Object.assign(this.flags, def.flags);
    }
}
exports.MapZone = MapZone;
class GameMap {
    constructor(args) {
        this.size = null;
        this.tileSize = null;
        this.filename = null;
        this.layers = [];
        this.debugLayer = null;
        this.tilesets = [];
        this.cameraBoxes = [];
        this.layerLookup = {};
        this.entityLookup = {};
        this.patchLookup = {};
        this.displayName = '';
        this.objectSources = null;
        if (typeof args === 'string') {
            Loader_1.loadMap(args, this);
        }
        else {
            this.size = new PIXI.Point(args.width || 0, args.height || 0);
            this.tileSize = new PIXI.Point(args.tileWidth || 16, args.tileHeight || 16);
        }
    }
    open() {
        let debugPlane = Core_1.getDebugPlane();
        if (debugPlane) {
            debugPlane.clear();
            this.debugLayer = debugPlane.addRenderLayer();
        }
        Core_1.getRenderPlane().clear();
        this.layers.forEach((mapLayer) => {
            let x = 0, y = 0;
            mapLayer.patchLayer = Core_1.getRenderPlane().addRenderLayer();
            mapLayer.spriteLayer = Core_1.getRenderPlane().addRenderLayer();
            mapLayer.tiles.forEach((tileIndex) => {
                mapLayer.setTile(x, y, tileIndex);
                x++;
                if (x >= this.size.x) {
                    x = 0;
                    y++;
                }
            });
            if (mapLayer.patches) {
                for (let patch of mapLayer.patches) {
                    patch.place(mapLayer);
                }
            }
            mapLayer.entities.forEach((entity) => {
                entity.place(entity.spawn.x, entity.spawn.y, mapLayer);
            });
            this.sortSprites(mapLayer);
        });
    }
    frame(dt) {
        if (GameMap.debugRender && this.debugLayer) {
            this.debugLayer.clear();
            for (let mapLayer of this.layers) {
                if (this.debugLayer) {
                    if (mapLayer.zones) {
                        for (let z of mapLayer.zones) {
                            this.debugLayer.add(z.shape);
                        }
                    }
                }
                if (mapLayer.obstructions) {
                    for (let o of mapLayer.obstructions) {
                        this.debugLayer.add(o.getShape());
                    }
                }
                for (let e of mapLayer.entities) {
                    this.debugLayer.add(e.getShape());
                }
            }
        }
    }
    close() {
        this.debugLayer = null;
    }
    start() { }
    finish() { }
    update(dt) {
        this.layers.forEach((layer) => {
            if (layer.dirty || layer.entities.length > 0) {
                layer.dirty = false;
                this.sortSprites(layer);
            }
            layer.entities.forEach((e) => e.update(dt));
        });
    }
    setSize(x, y) {
        this.size.x = x;
        this.size.y = y;
    }
    addLayer(lyr, index) {
        if (index === undefined) {
            this.layers.push(lyr);
        }
        else {
            this.layers.splice(index, 0, lyr);
        }
        this.layerLookup[lyr.name] = lyr;
        lyr.map = this;
    }
    addTileSet(firstIndex, ts) {
        ts.index = firstIndex;
        this.tilesets.push(ts);
    }
    lookupTileInfo(index) {
        if (index === 0)
            return null;
        for (var i = this.tilesets.length - 1; i >= 0; i--) {
            if (index >= this.tilesets[i].index)
                return {
                    texture: this.tilesets[i].texture,
                    frame: index - this.tilesets[i].index,
                    animations: this.tilesets[i].animations
                };
        }
        return null;
    }
    getLayerByName(name) {
        return this.layerLookup[name];
    }
    getAllTriggersByName(name) {
        return this.layers.map((lyr) => lyr.getTriggersByName(name)).reduce((a, b) => a.concat(b), []);
    }
    getAllEventsByName(name) {
        return this.layers.map((lyr) => lyr.getEventsByName(name)).reduce((a, b) => a.concat(b), []);
    }
    getAllObstructionsByName(name) {
        return this.layers.map((lyr) => lyr.getObstructionsByName(name)).reduce((a, b) => a.concat(b), []);
    }
    getAllEntitiesByName(name) {
        return this.layers.map((lyr) => lyr.getEntitiesByName(name)).reduce((a, b) => a.concat(b), []);
    }
    sortSprites(layer) {
        if (!layer) {
            this.layers.forEach((lyr) => this.sortSprites(lyr));
        }
        else {
            layer.spriteLayer.sortSprites((a, b) => {
                if (a.position.y === b.position.y) {
                    return 0;
                }
                else {
                    return a.position.y < b.position.y ? -1 : 1;
                }
            });
        }
    }
    layerUp(evt) {
        let e = evt.entity;
        let found = false;
        for (let i = 0; i < this.layers.length; i++) {
            if (!found) {
                if (this.layers[i] === e.layer)
                    found = true;
            }
            else {
                if (this.layers[i].walkable) {
                    e.place(e.position.x, e.position.y, this.layers[i]);
                    return;
                }
            }
        }
    }
    layerDown(evt) {
        let e = evt.entity;
        let found = false;
        for (let i = this.layers.length - 1; i >= 0; i--) {
            if (!found) {
                if (this.layers[i] === e.layer)
                    found = true;
            }
            else {
                if (this.layers[i].walkable) {
                    e.place(e.position.x, e.position.y, this.layers[i]);
                    return;
                }
            }
        }
    }
}
GameMap.persistent = { global: {} };
GameMap.debugRender = true;
exports.GameMap = GameMap;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const CONTROLSTACKDEBUG = false;
var ControlMode;
(function (ControlMode) {
    ControlMode[ControlMode["None"] = 0] = "None";
    ControlMode[ControlMode["Scene"] = 1] = "Scene";
    ControlMode[ControlMode["Menu"] = 2] = "Menu";
    ControlMode[ControlMode["Map"] = 3] = "Map";
    ControlMode[ControlMode["Battle"] = 4] = "Battle";
})(ControlMode = exports.ControlMode || (exports.ControlMode = {}));
;
let controlModeNames = ["none", "scene", "menu", "map", "battle"];
class ControlStack {
    static cleanup() {
        this.stack = [];
    }
    static dbg(...args) {
        if (!CONTROLSTACKDEBUG)
            return;
        let s = "";
        this.stack.forEach((mode) => {
            if (s !== '')
                s += ",";
            s += controlModeNames[mode];
        });
        console.trace.apply(console, ["CONTROLS>>", s].concat(args));
    }
    static push(mode) {
        this.dbg("<--", controlModeNames[mode]);
        this.stack.push(mode);
    }
    static pop() {
        let mode = this.stack.pop();
        this.dbg("-->", controlModeNames[mode]);
        return mode;
    }
    static top() {
        return this.stack[ControlStack.len - 1];
    }
    static get len() {
        return this.stack.length;
    }
}
ControlStack.stack = [];
exports.ControlStack = ControlStack;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Cozy = __webpack_require__(0);
const Core_1 = __webpack_require__(1);
const Behavior_1 = __webpack_require__(8);
const BOUNCE_GRAVITY = 850;
const BOUNCE_ENTROPY = 0.5;
const BOUNCE_THRESHOLD = 30;
class Entity {
    constructor(args) {
        this.pushCallback = null;
        if (typeof args.sprite === 'string') {
            this.spriteDef = JSON.parse(Cozy.gameDir().file(args.sprite).read());
        }
        else {
            this.spriteDef = Object.assign({}, args.sprite);
        }
        this.spriteDef.moveCallback = () => this.onSpriteMove();
        this.sourceSpriteDef = args.sourceSpriteDef;
        this.speed = args.speed || 100;
        this.triggersEvents = (args.triggersEvents !== undefined ? args.triggersEvents : false);
        this.respectsObstructions = (args.respectsObstructions !== undefined ? args.respectsObstructions === 'true' : true);
        this.radius = args.radius || this.spriteDef.radius || 8;
        this.name = args.name;
        this.behavior = args.behavior && Behavior_1.Behavior[args.behavior] ? Behavior_1.Behavior[args.behavior](this) : undefined;
        this.paused = false;
        this.bouncing = false;
        this.solid = !(args.solid === 'false' || args.solid === false);
        this._mapID = args.id;
        this._stationary = true;
        this.movedLastFrame = false;
        this.pushStrength = args.pushStrength || this.spriteDef.pushStrength || 0;
        this.pushWeight = args.pushWeight || this.spriteDef.pushWeight || Infinity;
        this.params = Object.assign({}, args);
        if (args.hasOwnProperty('spawn')) {
            this.spawn = args.spawn;
        }
    }
    get stationary() {
        return this._stationary;
    }
    get mapID() {
        return this._mapID;
    }
    get destroyed() {
        return this._destroyed;
    }
    get dir() {
        return this.sprite.direction;
    }
    set dir(x) {
        this.sprite.direction = x;
    }
    get position() {
        return this.sprite.position;
    }
    changeSprite(newDef) {
        this.spriteDef = newDef;
        if (this.sprite) {
            let x = this.sprite.position.x;
            let y = this.sprite.position.y;
            let lyr = this.layer;
            this.layer.spriteLayer.remove(this.sprite);
            this.sprite = null;
            this.place(x, y, lyr);
        }
    }
    emote(key) {
        if (!this.emoteSprite) {
            this.emoteSprite = new Cozy.Sprite("sprites/emotes.sprite");
            this.layer.spriteLayer.add(this.emoteSprite);
            this.emoteSprite.setPosition(this.sprite.position.x, this.sprite.position.y + 0.01);
        }
        this.emoteSprite.animation = key;
    }
    clearEmote() {
        if (this.emoteSprite) {
            this.layer.spriteLayer.remove(this.emoteSprite);
            this.emoteSprite = null;
        }
    }
    bounce(height) {
        this.bouncing = {
            y: 0,
            vy: Math.sqrt(2 * BOUNCE_GRAVITY * height)
        };
    }
    hop(height) {
        this.bounce(height);
    }
    place(x, y, lyr) {
        if (this.sprite) {
            this.layer.spriteLayer.remove(this.sprite);
            delete this.layer.map.entityLookup[this._mapID];
        }
        else {
            this.sprite = new Cozy.Sprite(this.spriteDef);
        }
        if (this.emoteSprite)
            this.layer.spriteLayer.remove(this.emoteSprite);
        this.sprite.setPosition(x, y);
        this.layer = lyr;
        this.layer.spriteLayer.add(this.sprite);
        if (this.emoteSprite) {
            this.layer.spriteLayer.add(this.emoteSprite);
            this.emoteSprite.setPosition(this.sprite.position.x, this.sprite.position.y + 0.1);
        }
        if (!this.layer.entities['includes'](this)) {
            this.layer.entities.push(this);
        }
        this.layer.map.entityLookup[this._mapID] = this;
    }
    adjust(dx, dy) {
        this.sprite.setPosition(this.sprite.position.x + dx, this.sprite.position.y + dy);
        if (this.emoteSprite) {
            this.emoteSprite.setPosition(this.sprite.position.x, this.sprite.position.y + 0.1);
        }
    }
    destroy() {
        this._destroyed = true;
        let index = this.layer.entities.indexOf(this);
        this.layer.entities.splice(index, 1);
        delete this.layer.map.entityLookup[this._mapID];
        this.sprite.layer.remove(this.sprite);
    }
    update(dt) {
        if (this._destroyed)
            return;
        if (this.movedLastFrame) {
            this._stationary = false;
        }
        else {
            this._stationary = true;
        }
        if (!this.paused) {
            if (this.bouncing) {
                this.bouncing.y += this.bouncing.vy * dt - (BOUNCE_GRAVITY * dt * dt) / 2;
                this.bouncing.vy -= BOUNCE_GRAVITY * dt;
                if (this.bouncing.y <= 0) {
                    this.bouncing.y *= -1;
                    this.bouncing.vy *= -BOUNCE_ENTROPY;
                    if (this.bouncing.vy < BOUNCE_THRESHOLD) {
                        this.bouncing = null;
                    }
                }
                if (this.bouncing) {
                    this.sprite.setOffset(0, -this.bouncing.y);
                    if (this.emoteSprite) {
                        this.emoteSprite.setPosition(this.sprite.position.x, this.sprite.position.y - this.bouncing.y + 0.1);
                    }
                }
                else {
                    this.sprite.setOffset(0, 0);
                }
            }
            if (this.behavior) {
                let result = this.behavior.next(dt);
                if (result.done) {
                    this.behavior = result.value;
                }
            }
        }
        this.movedLastFrame = false;
    }
    pause() {
        this.paused = true;
    }
    unpause() {
        this.paused = false;
    }
    move(dx, dy) {
        if (dy !== 0 || dx !== 0) {
            this.movedLastFrame = true;
            let newDirection = (Math.atan2(dy, dx) * (180 / Math.PI));
            this.sprite.direction = newDirection;
            this.sprite.animation = 'walk';
        }
        else {
            this.sprite.animation = 'stand';
        }
        this.slide(dx, dy);
    }
    getObstruction(from, projectedPosition) {
        if (this.stationary) {
            let entityX = this.position.x;
            let entityY = this.position.y;
            let entityR = this.radius;
            let diffx = from.sprite.position.x - entityX;
            let diffy = from.sprite.position.y - entityY;
            let edges;
            if (Math.abs(diffx) > Math.abs(diffy)) {
                if (diffx < 0) {
                    edges = [[{ x: entityX - entityR, y: entityY - entityR }, { x: entityX - entityR, y: entityY + entityR }]];
                }
                else {
                    edges = [[{ x: entityX + entityR, y: entityY - entityR }, { x: entityX + entityR, y: entityY + entityR }]];
                }
            }
            else {
                if (diffy < 0) {
                    edges = [[{ x: entityX - entityR, y: entityY - entityR }, { x: entityX + entityR, y: entityY - entityR }]];
                }
                else {
                    edges = [[{ x: entityX - entityR, y: entityY + entityR }, { x: entityX + entityR, y: entityY + entityR }]];
                }
            }
            for (let j = 0; j < edges.length; j++) {
                let closest = Cozy.closestPointOnLine(projectedPosition, edges[j][0], edges[j][1]);
                let d = Cozy.dist(projectedPosition, closest);
                if (d < from.radius) {
                    return {
                        dsort: Cozy.dist({ x: from.sprite.position.x, y: from.sprite.position.y }, closest),
                        d: d,
                        type: 'line',
                        a: edges[j][0],
                        b: edges[j][1],
                        entity: this
                    };
                }
            }
        }
        else {
            let d = Math.sqrt(Cozy.dist2(projectedPosition, this.position));
            if (d < from.radius + this.radius) {
                return {
                    dsort: d - this.radius,
                    d: d - this.radius,
                    type: 'circ',
                    x: this.sprite.position.x,
                    y: this.sprite.position.y,
                    r: this.radius,
                    entity: this
                };
            }
        }
        return null;
    }
    slide(dx, dy) {
        let tx = Math.floor(this.position.x / this.layer.map.tileSize.x), ty = Math.floor(this.position.y / this.layer.map.tileSize.y), zones = this.layer.getEventZonesByPoint(this.position);
        if (!this.respectsObstructions) {
            this.sprite.adjustPosition(dx, dy);
        }
        else {
            let ang;
            let dist = Math.sqrt(dx * dx + dy * dy);
            let travelled = 0;
            let iter = 0;
            let d;
            let obstructions = this.layer.getObstructions(), o = [];
            let entities = this.layer.entities;
            let closest;
            let i, j, e;
            let travelMultiplier;
            while (travelled < 0.999 && iter < 20) {
                iter++;
                travelMultiplier = 1.0;
                let projectedPosition = { x: this.sprite.position.x + dx * (1 - travelled), y: this.sprite.position.y + dy * (1 - travelled) };
                o = [];
                for (i = 0; i < obstructions.length; i++) {
                    if (this === Core_1.getPlayer() && !obstructions[i].active) {
                        continue;
                    }
                    closest = Cozy.closestPointOnLine(projectedPosition, obstructions[i].a, obstructions[i].b);
                    d = Cozy.dist(projectedPosition, closest);
                    if (d < this.radius) {
                        e = {
                            dsort: Cozy.dist({ x: this.sprite.position.x, y: this.sprite.position.y }, closest),
                            d: d,
                            type: 'line',
                            a: obstructions[i].a,
                            b: obstructions[i].b
                        };
                        Cozy.sortedInsert(o, e, (x) => x.dsort);
                    }
                }
                if (this.solid) {
                    for (i = 0; i < entities.length; i++) {
                        if (entities[i] === this)
                            continue;
                        d = Math.sqrt(Cozy.dist2(projectedPosition, entities[i].position));
                        if (d > (entities[i].radius + this.radius) * 1.5)
                            continue;
                        let obs = entities[i].getObstruction(this, projectedPosition);
                        if (obs && obs.d < this.radius) {
                            Cozy.sortedInsert(o, obs, (x) => x.dsort);
                        }
                    }
                }
                for (i = 0; i < o.length; i++) {
                    let currentObs = o[i];
                    let d, ang;
                    function calcAngleAndDistance() {
                        if (o[i].type === 'line') {
                            closest = Cozy.closestPointOnLine(projectedPosition, o[i].a, o[i].b);
                            d = Math.sqrt(Cozy.dist2(projectedPosition, closest));
                            ang = Math.atan2(projectedPosition.y - closest.y, projectedPosition.x - closest.x);
                        }
                        else if (o[i].type === 'circ') {
                            d = Math.sqrt(Cozy.dist2(projectedPosition, { x: o[i].x, y: o[i].y })) - o[i].r;
                            ang = Math.atan2(projectedPosition.y - o[i].y, projectedPosition.x - o[i].x);
                        }
                    }
                    if (o[i].entity) {
                        calcAngleAndDistance();
                        let pushfactor = 1.0 - Math.max(0, Math.min(1, o[i].entity.pushWeight / this.pushStrength));
                        travelMultiplier = Math.max(1.0 / pushfactor, travelMultiplier);
                        o[i].entity.push(-Math.cos(ang) * (this.radius - d) * pushfactor, -Math.sin(ang) * (this.radius - d) * pushfactor);
                        o[i] = o[i].entity.getObstruction(this, projectedPosition);
                        if (o[i] === null)
                            continue;
                    }
                    calcAngleAndDistance();
                    if (this.radius - d > 0) {
                        projectedPosition.x += Math.cos(ang) * (this.radius - d);
                        projectedPosition.y += Math.sin(ang) * (this.radius - d);
                    }
                }
                d = Math.sqrt(Cozy.dist2(this.sprite.position, projectedPosition));
                if (d === 0)
                    break;
                travelled += (d / dist) * travelMultiplier;
                this.sprite.setPosition(projectedPosition.x, projectedPosition.y);
            }
        }
        if (this.emoteSprite) {
            this.emoteSprite.setPosition(this.sprite.position.x, this.sprite.position.y + 0.1);
        }
        if (this.triggersEvents) {
            let newZones = this.layer.getEventZonesByPoint(this.position);
            for (let z of newZones) {
                if (z.events.onEnter && zones.indexOf(z) === -1) {
                    console.log("$", z.events.onEnter, ">", this.layer.map[z.events.onEnter]);
                    this.layer.map[z.events.onEnter]({ entity: this });
                }
            }
            for (let z of zones) {
                if (z.events.onExit && newZones.indexOf(z) === -1)
                    this.layer.map[z.events.onExit]({ entity: this });
            }
        }
    }
    push(dx, dy) {
        if (this.pushCallback) {
            let letSlide = this.pushCallback();
            if (!letSlide)
                return;
        }
        if (this.pushWeight === Infinity)
            return;
        this.slide(dx, dy);
    }
    onSpriteMove() {
        if (this.shape) {
            let r = this.radius;
            let x = this.position.x;
            let y = this.position.y;
            this.shape.points = [[x - r, y - r], [x + r, y - r], [x + r, y + r], [x - r, y + r]];
            this.shape.onChange();
        }
    }
    getShape() {
        let r = this.radius;
        let x = this.position.x;
        let y = this.position.y;
        if (!this._stationary) {
            return new Cozy.Shape(Cozy.ShapeType.Circle, {
                center: { x: x, y: y },
                radius: r,
                linecolor: 0x33aaaa,
                fillcolor: 0x33aaaa
            });
        }
        else {
            return new Cozy.Shape(Cozy.ShapeType.Polygon, {
                closed: true,
                points: [[x - r, y - r], [x + r, y - r], [x + r, y + r], [x - r, y + r]],
                linecolor: 0xaa33aa,
                fillcolor: 0xaa33aa
            });
        }
    }
}
exports.Entity = Entity;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(1));
__export(__webpack_require__(8));
__export(__webpack_require__(27));
__export(__webpack_require__(24));
__export(__webpack_require__(3));
__export(__webpack_require__(18));
__export(__webpack_require__(17));
__export(__webpack_require__(4));
__export(__webpack_require__(10));
__export(__webpack_require__(9));
__export(__webpack_require__(20));
__export(__webpack_require__(11));
__export(__webpack_require__(7));
__export(__webpack_require__(28));
__export(__webpack_require__(6));
__export(__webpack_require__(16));
__export(__webpack_require__(19));
__export(__webpack_require__(21));
__export(__webpack_require__(12));
__export(__webpack_require__(22));
__export(__webpack_require__(2));
__export(__webpack_require__(13));
__export(__webpack_require__(14));
__export(__webpack_require__(15));


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Cozy = __webpack_require__(0);
const Core_1 = __webpack_require__(1);
const ControlStack_1 = __webpack_require__(3);
const Textbox_1 = __webpack_require__(16);
var WaitType;
(function (WaitType) {
    WaitType[WaitType["Time"] = 0] = "Time";
    WaitType[WaitType["Button"] = 1] = "Button";
    WaitType[WaitType["FadeOut"] = 2] = "FadeOut";
    WaitType[WaitType["FadeIn"] = 3] = "FadeIn";
})(WaitType || (WaitType = {}));
;
class Wait {
    constructor(type, args) {
        this.type = type;
        this.args = args;
        this.promise = new Promise(function (resolver, rejecter) {
            this.resolve = resolver;
        }.bind(this));
    }
}
class Scene {
    static get currentScene() {
        return Scene.scenes[Scene.scenes.length - 1];
    }
    static cleanup() {
        this.scenes = [];
        this.fadeLayer = null;
    }
    static do(sceneFunc) {
        if (!this.fadeLayer) {
            this.fadeLayer = document.createElement('div');
            this.fadeLayer.style.height = "100%";
            this.fadeLayer.style.position = "absolute";
            this.fadeLayer.style.top = "0px";
            this.fadeLayer.style.left = "0px";
            this.fadeLayer.style.width = "100%";
            this.fadeLayer.style.height = "100%";
            this.fadeLayer.style.zIndex = "100";
            this.fadeLayer.style.opacity = '0';
            Core_1.getUiPlane().container.appendChild(this.fadeLayer);
        }
        var wrapper = function* () {
            if (Core_1.getPlayer() && Core_1.getPlayer().sprite) {
                Core_1.getPlayer().sprite.animation = "stand_" + Core_1.getPlayer().dir;
            }
            ControlStack_1.ControlStack.push(ControlStack_1.ControlMode.Scene);
            yield* sceneFunc();
            Core_1.cameraFollow(Core_1.getPlayer());
        };
        this.scenes.push([wrapper.call(this)]);
        this.currentScene[1] = this.currentScene[0].next(0);
    }
    static update(dt) {
        if (this.currentScene) {
            this.currentScene[1] = this.currentScene[0].next(dt);
            while (this.currentScene && this.currentScene[1].done) {
                if (this.scenes.length === 1) {
                    this.fadeLayer.style.opacity = '0';
                }
                ControlStack_1.ControlStack.pop();
                this.scenes.pop();
            }
        }
    }
    static *waitButton(b) {
        while (true) {
            if (Cozy.Input.pressed(b)) {
                return;
            }
            yield;
        }
    }
    static *waitEntityMove(entity, steps) {
        const steplen = steps.length;
        let step;
        let dt;
        let dx, dy;
        let tx, ty;
        for (let i = 0; i < steplen; i++) {
            step = steps[i];
            dx = Math.cos(PIXI.DEG_TO_RAD * step);
            dy = Math.sin(PIXI.DEG_TO_RAD * step);
            if (Math.abs(dx) < 1)
                dx = 0;
            if (Math.abs(dy) < 1)
                dy = 0;
            tx = entity.position.x + dx * Core_1.getMap().tileSize.x;
            ty = entity.position.y + dy * Core_1.getMap().tileSize.y;
            while (entity.position.x !== tx || entity.position.y !== ty) {
                let dt = yield;
                let px = entity.position.x, py = entity.position.y;
                entity.move(entity.speed * dx * dt, entity.speed * dy * dt);
                if (entity.position.x === px && entity.position.y === py) {
                    break;
                }
                if (dx > 0 && entity.position.x > tx)
                    entity.position.x = tx;
                if (dx < 0 && entity.position.x < tx)
                    entity.position.x = tx;
                if (dy > 0 && entity.position.y > ty)
                    entity.position.y = ty;
                if (dy < 0 && entity.position.y < ty)
                    entity.position.y = ty;
            }
        }
    }
    static *waitCameraMove(targetX, targetY, t) {
        Core_1.cameraFollow(null);
        let speed = Core_1.getCameraSpeed();
        let targetPt = new PIXI.Point(targetX, targetY);
        let d = Cozy.dist(targetPt, Core_1.getCameraFocus());
        Core_1.setCameraSpeed(d / t);
        Core_1.centerCameraOn(targetPt);
        yield* this.waitTime(t);
        Core_1.setCameraSpeed(speed);
    }
    static *waitFadeTo(color, duration) {
        this.fadeLayer.style.opacity = '0';
        this.fadeLayer.style.backgroundColor = color;
        var len = duration;
        var elapsed = 0;
        while (elapsed < duration) {
            elapsed += yield;
            this.fadeLayer.style.opacity = Math.min(1, elapsed / duration).toString();
        }
    }
    static *waitFadeFrom(color, duration) {
        this.fadeLayer.style.opacity = '1';
        this.fadeLayer.style.backgroundColor = color;
        var elapsed = 0;
        while (elapsed < duration) {
            elapsed += yield;
            this.fadeLayer.style.opacity = Math.max(0, 1 - (elapsed / duration)).toString();
        }
    }
    static *waitFadeOut(duration) {
        yield* this.waitFadeTo(window.getComputedStyle(document.body).backgroundColor, duration);
    }
    static *waitFadeIn(duration) {
        yield* this.waitFadeFrom(window.getComputedStyle(document.body).backgroundColor, duration);
    }
    static *waitTime(duration) {
        var elapsed = 0;
        while (elapsed < duration) {
            elapsed += yield;
        }
    }
    static *waitFrame(duration) {
        var elapsed = 0;
        while (elapsed < duration) {
            elapsed++;
            yield;
        }
    }
    static *waitTextbox(speaker, lines) {
        for (var i = 0; i < lines.length; i++) {
            if (i === 0) {
                if (speaker) {
                    Textbox_1.Textbox.show(`<span class="speaker">${speaker}:</span> ${lines[i]}`);
                }
                else {
                    Textbox_1.Textbox.show(lines[i]);
                }
            }
            else {
                Textbox_1.Textbox.box.appendText("\n" + lines[i]);
            }
            yield* Scene.waitButton("confirm");
            Cozy.Input.debounce("confirm");
        }
        Textbox_1.Textbox.hide();
    }
}
Scene.scenes = [];
Scene.promise = null;
Scene.waits = [];
exports.Scene = Scene;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Core_1 = __webpack_require__(1);
const Entity_1 = __webpack_require__(4);
const Inventory_1 = __webpack_require__(10);
class PartyMember {
    constructor(ch) {
        this.character = ch;
        this.entity = null;
    }
    makeEntity() {
        this.entity = new Entity_1.Entity({
            sprite: this.character.sprite,
            speed: 300,
            triggersEvents: true,
            respectsObstructions: 'true'
        });
        console.log("makeEntity =>", this.entity);
        return this.entity;
    }
}
exports.PartyMember = PartyMember;
class Party {
    static add(ch) {
        var pm = new PartyMember(ch);
        this.members.push(pm);
    }
    static each(f) {
        for (var i = 0; i < this.members.length; i++) {
            f(this.members[i].character);
        }
    }
    static characters() {
        return this.members.map((x) => x['character']);
    }
    static isInParty(ch) {
        return Party.characters().indexOf(ch) !== -1;
    }
    static serialize() {
        return {
            members: this.members.map((m) => Object.keys(Core_1.getCharacters()).find((k) => Core_1.getCharacters()[k] === m.character)),
            inventory: this.inventory.get().map((i) => i.key),
            money: this.money
        };
    }
}
Party.members = [];
Party.inventory = new Inventory_1.Inventory();
Party.money = 0;
exports.Party = Party;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Cozy = __webpack_require__(0);
const Core_1 = __webpack_require__(1);
const ControlStack_1 = __webpack_require__(3);
const Scene_1 = __webpack_require__(6);
var Behavior;
(function (Behavior) {
    let guardMutex = null;
    function _cleanup() {
        guardMutex = null;
    }
    Behavior._cleanup = _cleanup;
    function* stun(entity, time, returnBehavior = null) {
        let behavior = returnBehavior || entity.behavior;
        let counter = 0;
        entity.sprite.flash(3);
        while (counter < time) {
            let dt = yield;
            counter += dt;
        }
        entity.sprite.flash(0);
        return behavior;
    }
    Behavior.stun = stun;
    function* wander(entity) {
        var direction, dist = 0;
        while (true) {
            while (dist > 0) {
                var dt = yield;
                while (ControlStack_1.ControlStack.top() !== ControlStack_1.ControlMode.Map) {
                    dt = yield;
                }
                var x = entity.position.x, y = entity.position.y;
                switch (direction) {
                    case 0:
                        entity.move(0, -entity.speed * dt);
                        break;
                    case 1:
                        entity.move(entity.speed * dt, 0);
                        break;
                    case 2:
                        entity.move(0, entity.speed * dt);
                        break;
                    case 3:
                        entity.move(-entity.speed * dt, 0);
                        break;
                    case 4:
                        entity.move(0, 0);
                        break;
                }
                if (x - entity.position.x === 0 && y - entity.position.y === 0 && direction !== 4) {
                    if (Math.random() < 0.5) {
                        direction = 4;
                    }
                    else {
                        dist = 0;
                    }
                }
                else {
                    dist -= (entity.speed * dt);
                }
            }
            direction = Math.floor(Math.random() * 5);
            dist = (Math.random() * 3 + 1) * Core_1.getMap().tileSize.x;
        }
    }
    Behavior.wander = wander;
    function* path(entity, path) {
        console.log("PATH>", entity, path);
        let dt;
        let dx, dy;
        let tx, ty;
        let px, py;
        let step;
        let framedist, dist;
        dist = 0;
        for (let i = 0; i < path.length; i++) {
            step = path[i];
            if (step[1] === undefined || step[1] === 0) {
                entity.dir = step[0];
                continue;
            }
            dx = Math.cos(PIXI.DEG_TO_RAD * step[0]);
            dy = Math.sin(PIXI.DEG_TO_RAD * step[0]);
            while (dist < step[1]) {
                dt = yield;
                framedist = entity.speed * dt;
                if (dist + framedist > step[1]) {
                    framedist = step[1] - dist;
                }
                dist += framedist;
                entity.move(framedist * dx, framedist * dy);
                if (dx > 0 && entity.position.x > tx)
                    entity.position.x = tx;
                if (dx < 0 && entity.position.x < tx)
                    entity.position.x = tx;
                if (dy > 0 && entity.position.y > ty)
                    entity.position.y = ty;
                if (dy < 0 && entity.position.y < ty)
                    entity.position.y = ty;
            }
        }
    }
    Behavior.path = path;
    function* guard(entity, direction) {
        entity.dir = direction;
        entity.sprite.animation = 'stand';
        let origin = { x: entity.position.x, y: entity.position.y, d: entity.dir };
        let dist = 0, dx, dy;
        var visionDistance = entity.params.vision || 3;
        var visionEnd = new PIXI.Point(entity.position.x + Math.cos(entity.dir * PIXI.DEG_TO_RAD) * visionDistance * Core_1.getMap().tileSize.x, entity.position.y + Math.sin(entity.dir * PIXI.DEG_TO_RAD) * visionDistance * Core_1.getMap().tileSize.y);
        let movement = [];
        for (let i = 0; i < visionDistance; i++) {
            movement.push(direction);
        }
        while (true) {
            let dt = yield;
            if (Cozy.distToSegment(Core_1.getPlayer().position, entity.position, visionEnd) < Core_1.getPlayer().radius) {
                ControlStack_1.ControlStack.push(ControlStack_1.ControlMode.None);
                if (entity.params.notice && entity.params.notice in Core_1.getMap()) {
                    Core_1.getMap()[entity.params.notice]();
                }
                else {
                    Core_1.getPlayer().sprite.animation = 'stand';
                    let exclamation = entity.params.exclamation || '';
                    entity.emote("!");
                    Core_1.getSFX('alert').play();
                    while (guardMutex) {
                        dt = yield;
                    }
                    guardMutex = true;
                    entity.respectsObstructions = false;
                    entity.speed = 100;
                    while (Cozy.dist(Core_1.getPlayer().position, entity.position) - Core_1.getPlayer().radius - entity.radius > 0) {
                        dt = yield;
                        entity.dir = PIXI.RAD_TO_DEG * Math.atan2(Core_1.getPlayer().position.y - entity.position.y, Core_1.getPlayer().position.x - entity.position.x);
                        dx = Math.cos(PIXI.DEG_TO_RAD * entity.dir) * entity.speed * dt;
                        dy = Math.sin(PIXI.DEG_TO_RAD * entity.dir) * entity.speed * dt;
                        entity.move(dx, dy);
                    }
                    if (exclamation !== '') {
                        yield* Scene_1.Scene.waitTextbox(null, [exclamation]);
                    }
                    entity.clearEmote();
                    guardMutex = null;
                    ControlStack_1.ControlStack.pop();
                    if (!entity.destroyed) {
                        let dist = Cozy.dist(origin, entity.position);
                        let dir = Math.atan2(origin.y - entity.position.y, origin.x - entity.position.x) * PIXI.RAD_TO_DEG;
                        yield* Behavior.path(entity, [[dir, dist]]);
                        entity.sprite.animation = 'stand';
                        entity.dir = origin.d;
                    }
                }
            }
        }
    }
    Behavior.guard = guard;
    function* guard_right(entity) {
        yield* guard(entity, 0);
    }
    Behavior.guard_right = guard_right;
    function* guard_down(entity) {
        yield* guard(entity, 90);
    }
    Behavior.guard_down = guard_down;
    function* guard_left(entity) {
        yield* guard(entity, 180);
    }
    Behavior.guard_left = guard_left;
    function* guard_up(entity) {
        yield* guard(entity, 270);
    }
    Behavior.guard_up = guard_up;
    function* fight_wander(entity) {
        let direction = 4, dist = 0, dx, dy;
        let visionDistance = (entity.params.vision || 2) * Core_1.getMap().tileSize.x, visionDistance2 = visionDistance * visionDistance;
        while (true) {
            let dt = yield;
            while (ControlStack_1.ControlStack.top() !== ControlStack_1.ControlMode.Map) {
                dt = yield;
            }
            if (Cozy.dist2(Core_1.getPlayer().position, entity.position) <= visionDistance2) {
                let movement = [];
                ControlStack_1.ControlStack.push(ControlStack_1.ControlMode.None);
                if (entity.params.notice && entity.params.notice in Core_1.getMap()) {
                    Core_1.getMap()[entity.params.notice]();
                }
                else {
                    Core_1.getPlayer().sprite.animation = 'stand';
                    let exclamation = entity.params.exclamation || '';
                    entity.emote("!");
                    Core_1.getSFX('alert').play();
                    while (guardMutex) {
                        dt = yield;
                    }
                    guardMutex = true;
                    entity.respectsObstructions = false;
                    entity.speed = 100;
                    while (Cozy.dist(Core_1.getPlayer().position, entity.position) - Core_1.getPlayer().radius - entity.radius > 0) {
                        dt = yield;
                        entity.dir = PIXI.RAD_TO_DEG * Math.atan2(Core_1.getPlayer().position.y - entity.position.y, Core_1.getPlayer().position.x - entity.position.x);
                        dx = Math.cos(PIXI.DEG_TO_RAD * entity.dir) * entity.speed * dt;
                        dy = Math.sin(PIXI.DEG_TO_RAD * entity.dir) * entity.speed * dt;
                        entity.move(dx, dy);
                    }
                    if (exclamation !== '') {
                        yield* Scene_1.Scene.waitTextbox(null, [exclamation]);
                    }
                    entity.clearEmote();
                    guardMutex = null;
                    ControlStack_1.ControlStack.pop();
                }
            }
            else {
                let x = entity.position.x, y = entity.position.y;
                switch (direction) {
                    case 0:
                        entity.move(0, -entity.speed * dt);
                        break;
                    case 1:
                        entity.move(entity.speed * dt, 0);
                        break;
                    case 2:
                        entity.move(0, entity.speed * dt);
                        break;
                    case 3:
                        entity.move(-entity.speed * dt, 0);
                        break;
                    case 4:
                        entity.move(0, 0);
                        break;
                }
                if (x - entity.position.x === 0 && y - entity.position.y === 0 && direction !== 4) {
                    if (Math.random() < 0.5) {
                        direction = 4;
                    }
                    else {
                        dist = 0;
                    }
                }
                else {
                    dist -= (entity.speed * dt);
                }
                if (dist <= 0) {
                    direction = Math.floor(Math.random() * 5);
                    dist = (Math.random() * 3 + 1) * Core_1.getMap().tileSize.x;
                }
            }
        }
    }
    Behavior.fight_wander = fight_wander;
    function* guard_wander(entity) {
        let direction = 4, dist = 0;
        var visionDistance = entity.params.vision || 3;
        while (true) {
            let dt = yield;
            var visionEnd = new PIXI.Point(entity.position.x + Math.cos(entity.dir * PIXI.DEG_TO_RAD) * visionDistance * Core_1.getMap().tileSize.x, entity.position.y + Math.sin(entity.dir * PIXI.DEG_TO_RAD) * visionDistance * Core_1.getMap().tileSize.y);
            if (Cozy.distToSegment(Core_1.getPlayer().position, entity.position, visionEnd) < Core_1.getPlayer().radius) {
                let movement = [];
                for (let i = 0; i < visionDistance; i++) {
                    movement.push(entity.dir);
                }
                ControlStack_1.ControlStack.push(ControlStack_1.ControlMode.None);
                if (entity.params.notice && entity.params.notice in Core_1.getMap()) {
                    Core_1.getMap()[entity.params.notice]();
                }
                else {
                    Core_1.getPlayer().sprite.animation = 'stand';
                    let exclamation = entity.params.exclamation || '';
                    entity.emote("!");
                    Core_1.getSFX('alert').play();
                    while (guardMutex) {
                        dt = yield;
                    }
                    guardMutex = true;
                    entity.respectsObstructions = false;
                    entity.speed = 100;
                    yield* Scene_1.Scene.waitEntityMove(entity, movement);
                    if (exclamation !== '') {
                        yield* Scene_1.Scene.waitTextbox(null, [exclamation]);
                    }
                    entity.clearEmote();
                    guardMutex = null;
                    ControlStack_1.ControlStack.pop();
                }
            }
            else {
                let x = entity.position.x, y = entity.position.y;
                switch (direction) {
                    case 0:
                        entity.move(0, -entity.speed * dt);
                        break;
                    case 1:
                        entity.move(entity.speed * dt, 0);
                        break;
                    case 2:
                        entity.move(0, entity.speed * dt);
                        break;
                    case 3:
                        entity.move(-entity.speed * dt, 0);
                        break;
                    case 4:
                        entity.move(0, 0);
                        break;
                }
                if (x - entity.position.x === 0 && y - entity.position.y === 0 && direction !== 4) {
                    if (Math.random() < 0.5) {
                        direction = 4;
                    }
                    else {
                        dist = 0;
                    }
                }
                else {
                    dist -= (entity.speed * dt);
                }
                if (dist <= 0) {
                    direction = Math.floor(Math.random() * 5);
                    dist = (Math.random() * 3 + 1) * Core_1.getMap().tileSize.x;
                }
            }
        }
    }
    Behavior.guard_wander = guard_wander;
})(Behavior = exports.Behavior || (exports.Behavior = {}));


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Cozy = __webpack_require__(0);
const Party_1 = __webpack_require__(7);
const Effect_1 = __webpack_require__(17);
const Core_1 = __webpack_require__(1);
const Battle_1 = __webpack_require__(19);
class ItemDef {
    constructor(key, data) {
        this.key = key;
        this.sort = data.sort;
        this.icon = data.icon ? Cozy.gameDir().file(data.icon).url : '';
        this.iconFrame = data.icon_frame;
        this.name = data.name;
        this.description = data.description;
        this.canStack = !!data.canStack;
        this.price = data.price || 1;
        this.sellable = data.hasOwnProperty('sellable') ? data.sellable : true;
        this.equipSlot = data.slot;
        this.equipEffect = data.equip;
        this.useEffect = data.use;
    }
    get iconHTML() {
        var style = `background-image:url(${this.icon});`;
        style += this.iconFrame ? `background-position: -${this.iconFrame[0]}px -${this.iconFrame[1]}px` : '';
        return `<span class="item-icon" style="${style}"></span>`;
    }
}
exports.ItemDef = ItemDef;
class Item {
    constructor(def) {
        this.id_ = Cozy.uniqueID();
        this.location = null;
        this.def = def;
        this.overrides = null;
    }
    static load(items) {
        Object.keys(items).forEach((key) => {
            let def = items[key];
            Item.library[key] = new ItemDef(key, def);
        });
    }
    static make(key) {
        return new Item(Item.library[key]);
    }
    getAttr(key) {
        if (this.overrides && this.overrides.hasOwnProperty(key))
            return this.overrides[key];
        return this.def[key];
    }
    get id() { return this.id_; }
    get key() { return this.getAttr('key'); }
    get sort() { return this.getAttr('sort'); }
    get name() { return this.getAttr('name'); }
    get price() { return this.getAttr('price'); }
    get sellable() { return this.getAttr('sellable'); }
    get icon() { return this.getAttr('icon'); }
    get iconFrame() { return this.getAttr('iconFrame'); }
    get description() { return this.getAttr('description'); }
    get useEffect() { return this.getAttr('useEffect'); }
    get canStack() { return this.getAttr('canStack'); }
    get equipSlot() { return this.getAttr('equipSlot'); }
    get equipEffect() { return this.getAttr('equipEffect'); }
    get iconHTML() { return this.getAttr('iconHTML'); }
    override(key, value) {
        if (this.overrides === null)
            this.overrides = {};
        this.overrides[key] = value;
    }
    hasOverrides() {
        return this.overrides === null;
    }
    makeIcon(element) {
        element.style.backgroundImage = "url(" + this.icon + ")";
        if (this.def.iconFrame) {
            element.style.backgroundPosition = "-" + this.def.iconFrame[0] + "px -" + this.def.iconFrame[1] + "px";
        }
    }
    canUse(character, targets) {
        if (!this.def.useEffect)
            return false;
        let context = this.def.useEffect.hasOwnProperty('_context') ? this.def.useEffect._context : 'any';
        if (context === 'combat' && !Battle_1.Battle.active)
            return false;
        if (context === 'menu' && Battle_1.Battle.active)
            return false;
        for (var i = 0; i < targets.length; i++) {
            var target = targets[i];
            switch (this.def.useEffect._target) {
                case 'self':
                    return true;
                case 'ally':
                    if (Party_1.Party.isInParty(target))
                        return true;
                    break;
                case 'enemy':
                    if (Battle_1.Battle.isCombatant(target) && !Party_1.Party.isInParty(target))
                        return true;
                    break;
                default:
            }
        }
        return false;
    }
    canEquip(character, slot) {
        if (this.equipSlot !== slot)
            return false;
        if (this.location !== character && this.location !== Party_1.Party.inventory)
            return false;
        return true;
    }
    activate(character, opts = {}) {
        if (!this.def.useEffect)
            return;
        var result = {};
        Object.keys(this.def.useEffect).forEach((effect) => {
            let params = this.def.useEffect[effect];
            if (effect[0] === '_')
                return;
            var r = Effect_1.Effect.do(effect, opts.source || this, character, params);
            Object.keys(r).forEach((k) => {
                let v = r[k];
                if (k === 'success')
                    result[k] = result[k] || v;
                else
                    result[k] = result[k] ? result[k] + v : v;
            });
        });
        if (result.success) {
            if (!opts.silent && this.def.useEffect['_sound']) {
                Core_1.getSFX(this.def.useEffect['_sound']).play();
            }
            Party_1.Party.inventory.remove(this);
        }
        return result;
    }
}
Item.library = {};
exports.Item = Item;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Item_1 = __webpack_require__(9);
class Inventory {
    constructor() {
        this.items = [];
        this.counts = {};
    }
    get(filterFunc) {
        if (filterFunc && typeof filterFunc === 'string') {
            let key = filterFunc;
            return this.items.filter((i) => i.key === key);
        }
        else if (filterFunc) {
            return this.items.filter(filterFunc);
        }
        else {
            return Object['values'](this.items);
        }
    }
    stacked(filterFunc) {
        var list = [], row;
        var f = null;
        if (filterFunc && typeof filterFunc === 'string')
            f = ((i) => i.key === filterFunc);
        else if (filterFunc)
            f = filterFunc;
        this.items.forEach((item) => {
            if (f && !f(item))
                return;
            if (!row || !item.canStack || item.key !== row[0].key) {
                row = [];
                list.push(row);
            }
            row.push(item);
        });
        return list;
    }
    has(key) {
        return this.items.find((e) => e.key === key);
    }
    count(key) {
        if (key === undefined) {
            return this.items.length;
        }
        else {
            return this.counts[key];
        }
    }
    add(key, count) {
        var n = (count === undefined ? 1 : count);
        var items = [];
        for (let it = 0; it < n; it++) {
            let i = Item_1.Item.make(key);
            i.location = this;
            this.items.push(i);
            items.push(i);
        }
        this.counts[key] += n;
        this.items.sort((a, b) => {
            if (a.sort !== b.sort)
                return a.sort - b.sort;
            if (a.name !== b.name)
                return a.name < b.name ? -1 : 1;
            return a.id.localeCompare(b.id);
        });
        return items;
    }
    remove(items) {
        let its = items;
        if (items instanceof Item_1.Item)
            its = [its];
        its.forEach((item) => {
            let i = this.items.indexOf(item);
            if (i < 0) {
                throw new Error("Tried to remove an item not in this inventory.");
            }
            else {
                var item = this.items.splice(i, 1)[0];
                item.location = null;
            }
        });
    }
}
exports.Inventory = Inventory;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Cozy = __webpack_require__(0);
const ControlStack_1 = __webpack_require__(3);
var MenuDirection;
(function (MenuDirection) {
    MenuDirection[MenuDirection["VERTICAL"] = 0] = "VERTICAL";
    MenuDirection[MenuDirection["HORIZONTAL"] = 1] = "HORIZONTAL";
    MenuDirection[MenuDirection["GRID"] = 2] = "GRID";
})(MenuDirection = exports.MenuDirection || (exports.MenuDirection = {}));
;
class Menu extends Cozy.UiComponent {
    constructor(args) {
        super(args);
        this.cancelable = false;
        this.done = false;
        this.paused = true;
        this.scrollable = false;
        this.indicators = {};
        this.firstScrollFix = false;
        this.direction = args.direction === undefined ? MenuDirection.VERTICAL : args.direction;
        this.cancelable = !!args.cancelable;
        this.element.classList.add("menu");
        this.setupSelections(args.selectionContainer ? this.find(args.selectionContainer) : this.element);
    }
    static get currentMenu() {
        return Menu.menuStack[Menu.menuStack.length - 1] || null;
    }
    static init() {
        Cozy.Input.on('menu.down cancel.down', (info) => {
            if (!Menu.currentMenu || !Menu.currentMenu.cancelable || Menu.currentMenu.paused)
                return;
            Cozy.Input.debounce(info.button);
            Menu.currentMenu.cancel();
        }, this);
        Cozy.Input.on('up.down vertical-.down', (info) => {
            if (!Menu.currentMenu || Menu.currentMenu.paused)
                return;
            Cozy.Input.debounce(info.button, 0.2);
            if (Menu.currentMenu.direction === MenuDirection.HORIZONTAL) {
                Menu.currentMenu.secondaryAxisChange(-1);
            }
            else {
                if (Menu.currentMenu.moveSelection(-1, MenuDirection.VERTICAL) && Menu.blip)
                    Menu.blip.play();
            }
        }, this);
        Cozy.Input.on('down.down vertical+.down', (info) => {
            if (!Menu.currentMenu || Menu.currentMenu.paused)
                return;
            Cozy.Input.debounce(info.button, 0.2);
            if (Menu.currentMenu.direction === MenuDirection.HORIZONTAL) {
                Menu.currentMenu.secondaryAxisChange(+1);
            }
            else {
                if (Menu.currentMenu.moveSelection(+1, MenuDirection.VERTICAL) && Menu.blip)
                    Menu.blip.play();
            }
        }, this);
        Cozy.Input.on('left.down horizontal-.down', (info) => {
            if (!Menu.currentMenu || Menu.currentMenu.paused)
                return;
            Cozy.Input.debounce(info.button, 0.2);
            if (Menu.currentMenu.direction === MenuDirection.VERTICAL) {
                Menu.currentMenu.secondaryAxisChange(-1);
            }
            else {
                if (Menu.currentMenu.moveSelection(-1, MenuDirection.HORIZONTAL) && Menu.blip)
                    Menu.blip.play();
            }
        }, this);
        Cozy.Input.on('right.down horizontal+.down', (info) => {
            if (!Menu.currentMenu || Menu.currentMenu.paused)
                return;
            Cozy.Input.debounce(info.button, 0.2);
            if (Menu.currentMenu.direction === MenuDirection.VERTICAL) {
                Menu.currentMenu.secondaryAxisChange(+1);
            }
            else {
                if (Menu.currentMenu.moveSelection(+1, MenuDirection.HORIZONTAL) && Menu.blip)
                    Menu.blip.play();
            }
        }, this);
        Cozy.Input.on('confirm.down', (info) => {
            if (!Menu.currentMenu || Menu.currentMenu.paused)
                return;
            Cozy.Input.debounce(info.button);
            Menu.currentMenu.confirmSelection();
        }, this);
    }
    static push(m) {
        Cozy.Input.debounce("menu cancel up vertical- down vertical+ left horizontal- right horizontal confirm");
        if (Menu.menuStack.length > 0) {
            Menu.currentMenu.pause();
        }
        ControlStack_1.ControlStack.push(ControlStack_1.ControlMode.Menu);
        Menu.menuStack.push(m);
        m.start();
        return m;
    }
    static pop() {
        if (Menu.menuStack.length < 1) {
            throw new Error("Tried to pop with nothing in the menu stack.");
        }
        var m = Menu.menuStack.pop();
        m.stop();
        ControlStack_1.ControlStack.pop();
        if (Menu.menuStack.length > 0) {
            Menu.currentMenu.unpause();
        }
        return m;
    }
    static replace(m) {
        if (Menu.menuStack.length < 1) {
            throw new Error("Tried to replace with nothing in the menu stack.");
        }
        Menu.pop();
        Menu.push(m);
    }
    static update(dt) {
        if (Menu.currentMenu)
            Menu.currentMenu.update(dt);
    }
    setupSelections(parent) {
        if (this.selectionContainer) {
            this.selectionContainer.classList.remove('active');
            Object.keys(this.indicators).forEach((k) => {
                let e = this.indicators[k];
                if (e.parentElement) {
                    e.parentElement.removeChild(e);
                }
            });
            this.indicators = {};
        }
        this.selectionContainer = parent;
        this.selectionContainer.classList.add('active');
        this.selections = [];
        parent.getElementsByTagName('*').forEach((element) => {
            if (element.getAttribute('data-menu')) {
                this.selections.push(element);
            }
        });
        if (this.selectionContainer.classList.contains('scrollable')) {
            this.scrollable = true;
            this.indicators['up'] = document.createElement('div');
            this.indicators['up'].className = 'indicator up';
            this.selectionContainer.appendChild(this.indicators['up']);
            this.indicators['down'] = document.createElement('div');
            this.indicators['down'].className = 'indicator down';
            this.selectionContainer.appendChild(this.indicators['down']);
        }
        else {
            this.scrollable = false;
        }
        if (!this.paused) {
            if (this.selectionIndex >= this.selections.length) {
                this.setSelection(this.selections.length - 1);
            }
            else {
                this.setSelection(this.selectionIndex);
            }
        }
    }
    start() {
        this.done = false;
        this.paused = false;
        this.setSelection(0);
        if (this.selectionContainer) {
            this.selectionContainer.classList.add('active');
        }
    }
    unpause() {
        if (this.paused) {
            this.paused = false;
            this.setSelection(this.selectionIndex);
            if (this.selectionContainer) {
                this.selectionContainer.classList.add('active');
            }
        }
    }
    pause() {
        if (!this.paused) {
            this.paused = true;
            if (this.selectionContainer) {
                this.selectionContainer.classList.remove('active');
            }
        }
    }
    stop() {
        this.pause();
        this.done = true;
    }
    update(dt) {
        if (!this.firstScrollFix && this.selectionIndex !== undefined) {
            this.firstScrollFix = true;
            this.fixScroll();
        }
    }
    confirmSelection() {
        if (this.selections.length < 1)
            return;
        var currentMenuSelection = this.selections[this.selectionIndex].getAttribute('data-menu');
        if (currentMenuSelection === '@disabled') {
            if (Menu.sfxBad) {
                Menu.sfxBad.play();
            }
        }
        else if (this[currentMenuSelection]) {
            var playSound = this[currentMenuSelection](this.selections[this.selectionIndex]);
            if (playSound !== false && Menu.choose) {
                Menu.choose.play();
            }
        }
    }
    secondaryAxisChange(dir) {
        if (this.selections.length < 1)
            return;
        var currentMenuSelection = this.selections[this.selectionIndex].getAttribute('data-menu');
        if (this[currentMenuSelection + '_adjust']) {
            var playSound = this[currentMenuSelection + '_adjust'](dir);
            if (playSound !== false) {
                Menu.choose.play();
            }
        }
    }
    setSelection(index) {
        if (this.selections.length < 1)
            return;
        if (this.selectionIndex !== undefined && this.selections[this.selectionIndex] !== undefined) {
            this.selections[this.selectionIndex].classList.remove('active');
        }
        this.selectionIndex = Cozy.wrap(index, this.selections.length);
        this.selections[this.selectionIndex].classList.add('active');
        this.fixScroll();
        return true;
    }
    moveSelection(delta, direction) {
        return this.setSelection(this.selectionIndex + delta);
    }
    cancel() {
        Menu.pop();
    }
    fixScroll() {
        if (!this.scrollable)
            return;
        var selected = this.selections[this.selectionIndex];
        var container = this.selectionContainer;
        if (!selected || !container)
            return;
        var st = container.scrollTop;
        var selectedTop = selected.offsetTop;
        var selectedHeight = selected.clientHeight;
        var selectedBottom = selectedTop + selectedHeight;
        var containerHeight = container.clientHeight;
        var scrollHeight = container.scrollHeight;
        var threshold = (containerHeight / 3) || 0;
        if (selectedTop < st + threshold) {
            st = selectedTop - threshold;
            if (selectedBottom > st + containerHeight - threshold) {
                st = selectedTop + selectedHeight / 2 - containerHeight / 2;
            }
        }
        else if (selectedBottom > st + containerHeight - threshold) {
            st = selectedBottom - containerHeight + threshold;
            if (selectedTop < st + threshold) {
                st = selectedTop + selectedHeight / 2 - containerHeight / 2;
            }
        }
        st = Math.min(scrollHeight - containerHeight, Math.max(0, st));
        st > 0 ? container.classList.add('can-scroll-up') : container.classList.remove('can-scroll-up');
        st < scrollHeight - containerHeight ? container.classList.add('can-scroll-down') : container.classList.remove('can-scroll-down');
        this.selectionContainer.scrollTop = st;
        this.indicators['up'].style.top = this.selectionContainer.scrollTop + 'px';
        this.indicators['down'].style.bottom = -this.selectionContainer.scrollTop + 'px';
    }
}
Menu.menuStack = [];
Menu.blip = null;
Menu.choose = null;
Menu.sfxBad = null;
exports.Menu = Menu;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Cozy = __webpack_require__(0);
const Entity_1 = __webpack_require__(4);
const Map_1 = __webpack_require__(2);
const MapLayer_1 = __webpack_require__(13);
const MapObstruction_1 = __webpack_require__(14);
const LoaderTSX_1 = __webpack_require__(22);
function loadTMX(path, existingMap) {
    var map = existingMap || new Map_1.GameMap({});
    var parser = new DOMParser();
    var dataDirectory = path.substr(0, path.lastIndexOf('/') + 1);
    var data = parser.parseFromString(Cozy.gameDir().file(path).read(), "text/xml");
    var mapEl = data.getElementsByTagName('map')[0];
    map.filename = path;
    map.size = new PIXI.Point(parseInt(mapEl.getAttribute('width'), 10), parseInt(mapEl.getAttribute('height'), 10));
    map.tileSize = new PIXI.Point(parseInt(mapEl.getAttribute('tilewidth'), 10), parseInt(mapEl.getAttribute('tileheight'), 10));
    var propertyMap = {
        'Name': 'displayName'
    };
    for (let i in mapEl.children) {
        let el = mapEl.children[i];
        switch (el.tagName) {
            case "properties":
                for (let i in el.children) {
                    let propEl = el.children[i];
                    var key = propEl.getAttribute('name');
                    if (propertyMap[key]) {
                        map[propertyMap[key]] = propEl.getAttribute('value');
                    }
                    else {
                        console.warn(`Ignoring unrecognized property called '${key}'.`);
                    }
                }
                break;
            case "tileset":
                if (el.getAttribute('source')) {
                    var ts = LoaderTSX_1.loadTSX(dataDirectory, el.getAttribute('source'));
                    map.addTileSet(parseInt(el.getAttribute('firstgid'), 10), ts);
                }
                break;
            case "layer":
                var dataEl = el.getElementsByTagName('data')[0];
                var tileString = dataEl.innerHTML.replace(/\s/g, '');
                var layer = new MapLayer_1.MapLayer(el.getAttribute("name"));
                map.addLayer(layer);
                layer.map = map;
                layer.tiles = [];
                layer.tileLookup = [];
                tileString.split(',').forEach((x) => layer.tiles.push(parseInt(x, 10)));
                break;
            case "objectgroup":
                var layer = new MapLayer_1.MapLayer(el.getAttribute("name"));
                map.addLayer(layer);
                layer.map = map;
                layer.obstructions = [];
                layer.events = [];
                layer.triggers = [];
                layer.entities = [];
                for (let i in el.children) {
                    let objectEl = el.children[i];
                    var x = parseInt(objectEl.getAttribute('x'), 10), y = parseInt(objectEl.getAttribute('y'), 10);
                    switch (objectEl.getAttribute('type')) {
                        case "event":
                            var w = parseInt(objectEl.getAttribute('width'), 10), h = parseInt(objectEl.getAttribute('height'), 10), propertiesEl = objectEl.getElementsByTagName('properties')[0], ev = new Map_1.MapEvent(map.tileSize);
                            ev.name = objectEl.getAttribute('name');
                            ev.rect = new PIXI.Rectangle(x, y, w, h);
                            ev.properties = {};
                            if (propertiesEl) {
                                for (let i in propertiesEl.children) {
                                    let property = propertiesEl.children[i];
                                    ev.properties[property.getAttribute('name')] = property.getAttribute('value');
                                }
                            }
                            ev.obstructions = [];
                            if (ev.properties['obstructNPCs'] !== 'false') {
                                var o = new MapObstruction_1.MapObstruction({ x1: x, y1: y, x2: x + w, y2: y });
                                layer.obstructions.push(o);
                                ev.obstructions.push(o);
                                o = new MapObstruction_1.MapObstruction({ x1: x, y1: y, x2: x, y2: y + h });
                                layer.obstructions.push(o);
                                ev.obstructions.push(o);
                                o = new MapObstruction_1.MapObstruction({ x1: x, y1: y + h, x2: x + w, y2: y + h });
                                layer.obstructions.push(o);
                                ev.obstructions.push(o);
                                o = new MapObstruction_1.MapObstruction({ x1: x + w, y1: y, x2: x + w, y2: y + h });
                                layer.obstructions.push(o);
                                ev.obstructions.push(o);
                            }
                            ev.solid = false;
                            layer.events.push(ev);
                            break;
                        case "trigger":
                            var w = parseInt(objectEl.getAttribute('width'), 10), h = parseInt(objectEl.getAttribute('height'), 10), propertiesEl = objectEl.getElementsByTagName('properties')[0], tr = new Map_1.MapTrigger(map.tileSize);
                            tr.name = objectEl.getAttribute('name');
                            tr.rect = new PIXI.Rectangle(x, y, w, h);
                            tr.properties = {};
                            if (propertiesEl) {
                                for (let i in propertiesEl.children) {
                                    let property = propertiesEl.children[i];
                                    tr.properties[property.getAttribute('name')] = property.getAttribute('value');
                                }
                            }
                            if (tr.properties['solid']) {
                                tr.solid = (objectEl.getAttribute('solid') === 'true' || objectEl.getAttribute('solid') === '1');
                                delete (tr.properties['solid']);
                            }
                            tr.obstructions = [];
                            var o = new MapObstruction_1.MapObstruction({ x1: x, y1: y, x2: x + w, y2: y });
                            layer.obstructions.push(o);
                            tr.obstructions.push(o);
                            o = new MapObstruction_1.MapObstruction({ x1: x, y1: y, x2: x, y2: y + h });
                            layer.obstructions.push(o);
                            tr.obstructions.push(o);
                            o = new MapObstruction_1.MapObstruction({ x1: x, y1: y + h, x2: x + w, y2: y + h });
                            layer.obstructions.push(o);
                            tr.obstructions.push(o);
                            o = new MapObstruction_1.MapObstruction({ x1: x + w, y1: y, x2: x + w, y2: y + h });
                            layer.obstructions.push(o);
                            tr.obstructions.push(o);
                            layer.triggers.push(tr);
                            break;
                        case "entity":
                            var propertiesEl = objectEl.getElementsByTagName('properties')[0], args = {
                                id: objectEl.getAttribute('id'),
                                name: objectEl.getAttribute('name')
                            };
                            x += parseInt(objectEl.getAttribute('width'), 10) / 2;
                            y += parseInt(objectEl.getAttribute('height'), 10) / 2;
                            if (propertiesEl) {
                                for (let i in propertiesEl) {
                                    let property = propertiesEl.children[i];
                                    args[property.getAttribute('name')] = property.getAttribute('value');
                                }
                            }
                            var e = new Entity_1.Entity(args);
                            e.spawn = new PIXI.Point(x, y);
                            layer.entities.push(e);
                            break;
                        case 'camerabox':
                            var w = parseInt(objectEl.getAttribute('width')), h = parseInt(objectEl.getAttribute('height'));
                            map.cameraBoxes.push(new PIXI.Rectangle(x, y, w, h));
                            break;
                        default:
                            var name = objectEl.hasAttribute('name') ? objectEl.getAttribute('name') : null;
                            if (objectEl.hasAttribute('width') && objectEl.hasAttribute('height')) {
                                var w = parseInt(objectEl.getAttribute('width'), 10), h = parseInt(objectEl.getAttribute('height'), 10);
                                layer.obstructions.push(new MapObstruction_1.MapObstruction({ x1: x, y1: y, x2: x + w, y2: y, name: name }));
                                layer.obstructions.push(new MapObstruction_1.MapObstruction({ x1: x, y1: y, x2: x, y2: y + h, name: name }));
                                layer.obstructions.push(new MapObstruction_1.MapObstruction({ x1: x, y1: y + h, x2: x + w, y2: y + h, name: name }));
                                layer.obstructions.push(new MapObstruction_1.MapObstruction({ x1: x + w, y1: y, x2: x + w, y2: y + h, name: name }));
                            }
                            else {
                                for (let i in objectEl.children) {
                                    let defEl = objectEl.children[i];
                                    switch (defEl.tagName) {
                                        case 'polyline':
                                            var points = defEl.getAttribute('points').split(" ");
                                            var last_point = null;
                                            points.forEach((pt) => {
                                                var pts = pt.split(",");
                                                var point = new PIXI.Point(parseInt(pts[0], 10) + x, parseInt(pts[1], 10) + y);
                                                if (last_point !== null) {
                                                    layer.obstructions.push(new MapObstruction_1.MapObstruction({ x1: last_point.x, y1: last_point.y, x2: point.x, y2: point.y, name: name }));
                                                }
                                                last_point = point;
                                            });
                                            break;
                                    }
                                }
                            }
                    }
                }
                break;
            default:
                console.warn(`Ignoring unknown tag named '${el.tagName}'.`);
        }
    }
    map.cameraBoxes.push(new PIXI.Rectangle(0, 0, map.size.x * map.tileSize.x, map.size.y * map.tileSize.y));
    return map;
}
exports.loadTMX = loadTMX;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Cozy_1 = __webpack_require__(0);
const Entity_1 = __webpack_require__(4);
const Map_1 = __webpack_require__(2);
const MapObstruction_1 = __webpack_require__(14);
const Tileset_1 = __webpack_require__(15);
class MapLayer {
    constructor(name) {
        this.map = null;
        this.patchLayer = null;
        this.spriteLayer = null;
        this.dirty = false;
        this.tiles = [];
        this.tileLookup = [];
        this.events = [];
        this.triggers = [];
        this.entities = null;
        this.patches = null;
        this.zones = null;
        this.explicitObstructions = null;
        this.obstructions = null;
        this.obstructionsFrozen = false;
        this._name = '';
        this.walkable = true;
        this._name = name;
    }
    get name() { return this._name; }
    freezeObstructions() {
        this.obstructionsFrozen = true;
    }
    unfreezeObstructions() {
        this.obstructionsFrozen = false;
    }
    getTile(x, y) {
        return this.tiles[x + (this.map.size.x * y)];
    }
    setTile(x, y, t) {
        var i = x + (this.map.size.x * y);
        var tileInfo = this.map.lookupTileInfo(t);
        if (tileInfo && Cozy_1.getTexture(tileInfo.texture)) {
            if (!this.tileLookup[i]) {
                var spr = new Tileset_1.MapTile({
                    texture: tileInfo['texture'],
                    position: { x: x * this.map.tileSize.x, y: y * this.map.tileSize.y },
                    frameSize: this.map.tileSize,
                    animations: tileInfo.animations
                });
                spr.frame = tileInfo.frame;
                if (tileInfo.animations[tileInfo.frame]) {
                    spr.animation = tileInfo.frame;
                }
                this.patchLayer.add(spr);
                this.tileLookup[i] = spr;
            }
            else {
                this.tileLookup[i].frame = tileInfo.frame;
                if (tileInfo.animations[tileInfo.frame]) {
                    this.tileLookup[i].animation = tileInfo.frame;
                }
                else {
                    this.tileLookup[i].animation = null;
                }
            }
            this.dirty = true;
        }
        else {
            if (this.tileLookup[i]) {
                this.patchLayer.remove(this.tileLookup[i]);
                this.tileLookup[i] = null;
            }
        }
        this.tiles[i] = t;
    }
    rebuildObstructions() {
        this.obstructions = this.explicitObstructions ? this.explicitObstructions.slice(0) : [];
        if (!this.zones)
            return;
        let points = [];
        let lines = [];
        let shapes = [];
        let ID = 0;
        for (let zone of this.zones) {
            if (!zone.flags.hasOwnProperty('walkable')) {
                continue;
            }
            let shape = { id: ID++, poly: zone.shape, lines: [] };
            if (zone.flags.walkable) {
                let length = zone.shape.points.length;
                let ln = { id: ID++, a: zone.shape.points[length - 1], b: zone.shape.points[0], shape: shape, points: [] };
                let p1 = { id: ID++, pt: zone.shape.points[length - 1], line: ln };
                let p2 = { id: ID++, pt: zone.shape.points[0], line: ln };
                ln.points.push(p1);
                ln.points.push(p2);
                shape.lines.push(ln);
                lines.push(ln);
                points.push(p1);
                points.push(p2);
                for (let i = 1; i < zone.shape.points.length; i++) {
                    ln = { id: ID++, a: zone.shape.points[i - 1], b: zone.shape.points[i], shape: shape, points: [] };
                    p1 = { id: ID++, pt: zone.shape.points[i - 1], line: ln };
                    p2 = { id: ID++, pt: zone.shape.points[i], line: ln };
                    ln.points.push(p1);
                    ln.points.push(p2);
                    shape.lines.push(ln);
                    lines.push(ln);
                    points.push(p1);
                    points.push(p2);
                }
            }
            else {
            }
            shapes.push(shape);
        }
        points.sort((a, b) => {
            if (a.pt[0] === b.pt[0]) {
                return a.pt[1] - b.pt[1];
            }
            return a.pt[0] - b.pt[0];
        });
        let splitVertices = [];
        let activelines = [];
        let edgeCandidates = [];
        for (let i = 0; i < points.length; i++) {
            let pt = points[i];
            let lineindex = activelines.indexOf(pt.line);
            if (lineindex === -1) {
                activelines.push(pt.line);
            }
            else {
                activelines.splice(lineindex, 1);
                console.log(">>>PROC LINE>>>", JSON.stringify(pt.line.a), JSON.stringify(pt.line.b));
                if (!splitVertices[pt.line.id])
                    splitVertices[pt.line.id] = [];
                let vertices = splitVertices[pt.line.id];
                for (let ln = 0; ln < activelines.length; ln++) {
                    let line = activelines[ln];
                    let intersection = Cozy_1.lineIntersection(pt.line.a, pt.line.b, line.a, line.b);
                    console.log("  INTERSECT?", JSON.stringify([pt.line.a, pt.line.b]), JSON.stringify([line.a, line.b]), ":", JSON.stringify(intersection));
                    if (intersection.length > 0) {
                        for (let intersectionPoint of intersection) {
                            vertices.push(intersectionPoint);
                            if (!splitVertices[line.id])
                                splitVertices[line.id] = [];
                            splitVertices[line.id].push(intersectionPoint);
                        }
                    }
                }
                console.log("vertices>>", vertices);
                if (vertices.length === 0) {
                    this.obstructions.push(new MapObstruction_1.MapObstruction({
                        x1: pt.line.a[0],
                        y1: pt.line.a[1],
                        x2: pt.line.b[0],
                        y2: pt.line.b[1]
                    }));
                    console.log("added obstruction", JSON.stringify(pt.line.a), JSON.stringify(pt.line.b));
                }
                else {
                    vertices.push(pt.line.a);
                    vertices.push(pt.line.b);
                    vertices.sort((a, b) => {
                        return Cozy_1.distA2(a, pt.line.a) - Cozy_1.distA2(b, pt.line.a);
                    });
                    for (let v = 0; v < vertices.length - 1; v++) {
                        if (vertices[v][0] === vertices[v + 1][0] && vertices[v][1] === vertices[v + 1][1]) {
                            continue;
                        }
                        let edge = [vertices[v][0], vertices[v][1], vertices[v + 1][0], vertices[v + 1][1]];
                        let touches = false;
                        let midpoint = [(edge[0] + edge[2]) / 2, (edge[1] + edge[3]) / 2];
                        console.log(" VERTEX:", JSON.stringify(vertices[v]), JSON.stringify(vertices[v + 1]), '->', JSON.stringify(midpoint));
                        for (let sh = 0; sh < shapes.length; sh++) {
                            let shape = shapes[sh];
                            if (shape.id === pt.line.shape.id)
                                continue;
                            console.log("  TESTING", shape);
                            let onedge = shape.poly.isOnEdge(midpoint[0], midpoint[1]);
                            if (onedge) {
                                console.log("   ONEDGE");
                                if (edge[1] === edge[3] && (edge[2] < edge[0] !== onedge[1].x < onedge[0].x)) {
                                    touches = true;
                                    break;
                                }
                                else if (edge[0] > edge[2] !== onedge[0].x > onedge[1].x || edge[1] > edge[3] !== onedge[0].y > onedge[1].y) {
                                    touches = true;
                                    break;
                                }
                                console.log("   ... but same winding");
                            }
                            else if (shape.poly.contains(midpoint[0], midpoint[1])) {
                                console.log("   NOT ONEDGE, CONTAINS");
                                touches = true;
                                break;
                            }
                            else {
                                console.log("   NOPE");
                            }
                        }
                        if (!touches) {
                            this.obstructions.push(new MapObstruction_1.MapObstruction({
                                x1: edge[0],
                                y1: edge[1],
                                x2: edge[2],
                                y2: edge[3]
                            }));
                            console.log("   > added obstruction", JSON.stringify(edge));
                        }
                        else {
                            console.log("   > NO obstruction", JSON.stringify(edge));
                        }
                    }
                }
            }
        }
        console.log("OBSTRUCTIONS>>", this.obstructions);
    }
    getObstructions() {
        return this.obstructions;
    }
    getTriggerByPoint(x, y) {
        return (this.triggers.find(function (trigger) {
            return trigger.active && trigger.rect.contains(x, y) && this.map[trigger.name];
        }.bind(this)));
    }
    getEventZonesByPoint(pt) {
        return this.zones.filter(z => z.events && z.shape.contains(pt));
    }
    getTriggersByName(name) {
        return this.triggers.filter((x) => x.name === name);
    }
    getEventsByName(name) {
        return this.events.filter((x) => x.name === name);
    }
    getObstructionsByName(name) {
        if (!this.obstructions)
            return [];
        return this.obstructions.filter((x) => x.name === name);
    }
    getEntitiesByName(name) {
        return this.entities.filter((x) => x.name === name);
    }
    addPatch(def) {
        if (!this.patches)
            this.patches = [];
        let patch = def;
        if (!(def instanceof Map_1.MapPatch)) {
            patch = new Map_1.MapPatch(def);
        }
        this.patches.push(patch);
        return patch;
    }
    addZone(def) {
        if (!this.zones)
            this.zones = [];
        let zone = def;
        if (!(def instanceof Map_1.MapZone)) {
            zone = new Map_1.MapZone(def);
        }
        this.zones.push(zone);
        if (!this.obstructionsFrozen) {
            this.rebuildObstructions();
        }
        return zone;
    }
    addObstruction(def) {
        if (!this.explicitObstructions)
            this.explicitObstructions = [];
        let obs = def;
        if (!(def instanceof MapObstruction_1.MapObstruction)) {
            obs = new MapObstruction_1.MapObstruction(obs);
        }
        this.explicitObstructions.push(obs);
        if (!this.obstructionsFrozen) {
            this.rebuildObstructions();
        }
        return obs;
    }
    addEntity(def) {
        if (!this.entities)
            this.entities = [];
        let ent = def;
        if (!(def instanceof Entity_1.Entity)) {
            ent = new Entity_1.Entity(def);
        }
        this.entities.push(ent);
        return ent;
    }
}
exports.MapLayer = MapLayer;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Cozy_1 = __webpack_require__(0);
class MapObstruction {
    constructor(args) {
        this.a = new PIXI.ObservablePoint(this.onMove, this, args.x1, args.y1);
        this.b = new PIXI.ObservablePoint(this.onMove, this, args.x2, args.y2);
        this.name = args.name || null;
        this.active = args.hasOwnProperty('active') ? args.active : true;
    }
    onMove() {
        if (this.shape) {
            this.shape.points = [[this.a.x, this.a.y], [this.b.x, this.b.y]];
            this.shape.onChange();
        }
    }
    getShape() {
        if (!this.shape) {
            this.shape = new Cozy_1.Shape(Cozy_1.ShapeType.Polygon, {
                closed: false,
                points: [[this.a.x, this.a.y], [this.b.x, this.b.y]],
                linecolor: 0xaaaaaa
            });
        }
        return this.shape;
    }
}
exports.MapObstruction = MapObstruction;


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Cozy = __webpack_require__(0);
class MapTileset {
    constructor() {
        this.animations = {};
    }
}
exports.MapTileset = MapTileset;
class MapTile extends Cozy.Sprite {
}
exports.MapTile = MapTile;


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Cozy = __webpack_require__(0);
const Core_1 = __webpack_require__(1);
class Textbox extends Cozy.UiComponent {
    constructor(args) {
        super(Object.assign(args || {}, {
            className: 'textbox',
            html: `
                <div class="inner-text"></div>
            `
        }));
        this.skipWhitespace = true;
        this.paused = false;
        this.textSpeed = 100;
        this.textPos = 0;
        this.inner = this.find('.inner-text');
        this.cursors = [];
    }
    static show(text) {
        if (this.box) {
            this.hide();
        }
        this.box = new Textbox();
        this.box.setText(text);
        Core_1.getUiPlane().addChild(this.box);
    }
    static hide() {
        if (this.box) {
            this.box.remove();
        }
    }
    setText(text) {
        this.inner.innerHTML = '';
        this.appendText(text);
        this.inner.scrollTop = -2;
    }
    appendText(text) {
        var newElement = (document.createElement('div'));
        var children = [], ch, charspan;
        newElement.innerHTML = text;
        children.push.apply(children, newElement.childNodes);
        while (children.length > 0) {
            ch = children.shift();
            if (ch.nodeName === '#text') {
                ch.nodeValue.split('').forEach((c) => {
                    charspan = document.createElement('span');
                    charspan.innerText = c;
                    charspan.classList.add(c.match(/\S/) ? '__ch' : '__ws');
                    ch.parentNode.insertBefore(charspan, ch);
                });
                ch.remove();
            }
            else if (ch.nodeName.toLowerCase() === 'img' || ch.nodeName.toLowerCase() === 'span') {
                ch.classList.add('__ch');
            }
            else {
                children.push.apply(children, ch.childNodes);
            }
        }
        if (this.cursors.length < 1) {
            this.pushCursor(newElement);
        }
        while (newElement.firstChild) {
            this.inner.appendChild(newElement.firstChild);
        }
        this.paused = false;
    }
    update(dt) {
        if (this.paused)
            return;
        var currentPos = this.textPos;
        this.textPos += dt * this.textSpeed;
        var charsToAdvance = (this.textPos | 0) - (currentPos | 0);
        let cursor;
        while (charsToAdvance > 0) {
            cursor = this.topCursor();
            if (cursor.classList.contains('__ch')) {
                cursor.classList.remove('__ch');
                charsToAdvance--;
                cursor = this.advanceCursor();
            }
            else if (cursor.classList.contains('__ws')) {
                cursor.classList.remove('__ws');
                if (!this.skipWhitespace)
                    charsToAdvance--;
                cursor = this.advanceCursor();
            }
            else if (cursor.hasChildNodes()) {
                cursor = this.pushCursor(cursor);
            }
            if (!cursor) {
                this.paused = true;
                break;
            }
        }
        if (!cursor) {
            cursor = this.inner.childNodes[this.inner.childNodes.length - 1];
        }
        for (var i = this.cursors.length; i >= 0; i--) {
            if (cursor.previousSibling) {
                cursor.previousSibling.scrollIntoView(false);
                break;
            }
        }
        this.inner.scrollTop += 1;
        if (this.inner.scrollTop === 1)
            this.inner.scrollTop = -2;
    }
    pushCursor(parent) {
        let cursor = parent.childNodes[0];
        this.cursors.push(cursor);
        return cursor;
    }
    advanceCursor() {
        let c = this.cursors[this.cursors.length - 1];
        c = c.nextSibling;
        while (!c) {
            c = this.popCursor();
            if (c)
                c = c.nextSibling;
            if (!c)
                break;
        }
        this.cursors[this.cursors.length - 1] = c;
        return c;
    }
    topCursor() {
        return this.cursors[this.cursors.length - 1];
    }
    popCursor() {
        this.cursors.pop();
        return this.topCursor();
    }
}
exports.Textbox = Textbox;


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Dice_1 = __webpack_require__(18);
class Effect {
    static do(effect, source, target, params) {
        if (this[effect]) {
            return this[effect].apply(this, [source, target].concat(params));
        }
        else {
            console.warn("! Bad effect", effect);
            console.trace();
        }
    }
    static heal(source, target, amount) {
        if (target.hp < target.maxhp) {
            target.hp += amount;
            return { success: true, hpChange: amount };
        }
        return { success: false };
    }
    static strike(source, target, type, damageRoll) {
        let damage = target.modifiedDamage(Dice_1.Dice.roll(source, damageRoll), type);
        if (source.hasTrait('double_magic'))
            damage *= 2;
        target.hp -= damage;
        return { success: true, hpChange: -damage };
    }
    static doNothing(source, target, message) {
        return { success: true, message: message };
    }
    static flee() {
        return {};
    }
    static basicAttack(attacker, defender, element = "physical") {
        var result = {
            type: 'hit',
            hpChange: attacker.get('damage')
        };
        if (Effect.statCheck(defender.get('dodge'))) {
            result.type = 'miss';
        }
        else {
            if (Effect.statCheck(defender.get('block'))) {
                result.type = 'weak';
            }
            if (Effect.statCheck(attacker.get('critical'))) {
                result.type = (result.type === 'weak' ? 'hit' : 'crit');
            }
        }
        switch (result.type) {
            case 'miss':
                result.hpChange *= 0;
                break;
            case 'weak':
                result.hpChange *= Effect.curveRoll(0, 0.5);
                break;
            case 'hit':
                result.hpChange *= Effect.curveRoll(0.75, 1.25);
                break;
            case 'crit':
                result.hpChange *= Effect.curveRoll(2, 3);
                break;
        }
        result.hpChange = defender.modifiedDamage(result.hpChange, element);
        result.hpChange *= Math.min(1, Math.max(0, 1 - (defender.get('defense') / 100)));
        result.hpChange = -Math.round(Math.max(0, result.hpChange));
        defender.hp += result.hpChange;
        return result;
    }
    static statCheck(stat) {
        return Math.random() < (stat / 100);
    }
    static curveRoll(min, max) {
        let curve = (a, b, c) => {
            let m = Math.max(a, b, c);
            return (m === a ? Math.max(b, c) : (m === b ? Math.max(a, c) : Math.max(a, b)));
        };
        let r = curve(Math.random(), Math.random(), Math.random());
        return min + (max - min + 1) * r;
    }
}
exports.Effect = Effect;


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var dbg = function (...args) { };
var rollDie = (dieSize) => Math.floor(Math.random() * dieSize) + 1;
var rollDice = (numDice, dieSize) => {
    var rolls = [];
    for (let i = 0; i < numDice; i++) {
        rolls.push(rollDie(dieSize));
    }
    return rolls;
};
class Dice {
    static roll(actor, s) {
        var roll = new Dice(s);
        return roll.resolve(actor);
    }
    constructor(s) {
        this.tokens = this.tokenize(s);
        this.tree = this.parse();
    }
    tokenize(s) {
        var tokens = [];
        var i = 0;
        function getWord(idx, matcher) {
            var w = '';
            while (idx < s.length && s[idx].match(matcher)) {
                w = w + s[idx++];
            }
            return w;
        }
        function next() {
            if (i >= s.length)
                return null;
            var ch = s[i];
            var t = {};
            t.value = ch;
            if (ch === '(') {
                t.type = 'LPAREN';
            }
            else if (ch === ')') {
                t.type = 'RPAREN';
            }
            else if (ch === ',') {
                t.type = 'COMMA';
            }
            else if (ch === '*' || ch === '/') {
                t.type = 'MUL';
            }
            else if (ch === '+' || ch === '-') {
                t.type = 'ADD';
            }
            else if (ch === '$') {
                t.type = 'VAR';
                t.value += getWord(i + 1, /\w/);
            }
            else if (ch.match(/\d/)) {
                t.type = 'NUM';
                t.value = getWord(i, /\d/);
            }
            else if (ch.match(/[a-zA-Z]/)) {
                t.value = getWord(i, /[a-zA-Z_]+/);
                if (t.value === 'd' || t.value === 'D')
                    t.type = 'D';
                else
                    t.type = 'IDENT';
            }
            if (!t.type) {
                throw new Error("Parse error on die roll '" + s + "' at '" + s.slice(i) + "'");
            }
            i += t.value.length;
            i += getWord(i, /\s/).length;
            return t;
        }
        ;
        var token;
        while (token = next()) {
            tokens.push(token);
        }
        return tokens;
    }
    parse() {
        dbg("parse:", this.tokens);
        this.parseIndex = 0;
        var ex = this.parseExpr();
        if (this.parseIndex < this.tokens.length) {
            throw new Error("Parse error, expected end of expression at " + this.peek().value);
        }
        dbg("expr -> ", ex);
        return ex;
    }
    parseExpr() {
        var expr = this.parseMUL();
        var t = this.peek();
        while (t.type === 'ADD') {
            this.consume();
            var rhs = this.parseMUL();
            expr = { type: t.value === '+' ? "add" : 'subtract', lhs: expr, rhs: rhs };
            t = this.peek();
            dbg("add ->", expr);
        }
        return expr;
    }
    parseMUL() {
        var expr = this.parseD();
        var t = this.peek();
        while (t.type === 'MUL') {
            this.consume();
            var rhs = this.parseD();
            expr = { type: t.value === '*' ? "multiply" : 'divide', lhs: expr, rhs: rhs };
            t = this.peek();
            dbg("mul ->", expr);
        }
        return expr;
    }
    parseD() {
        var expr = this.parsePrime();
        var t = this.peek();
        if (t.type === 'D') {
            this.consume();
            var rhs = this.parsePrime();
            expr = { type: "roll", lhs: expr, rhs: rhs };
            dbg("d ->", expr);
        }
        return expr;
    }
    parsePrime() {
        var t = this.peek();
        if (t.type === 'NUM') {
            this.consume();
            dbg("(num) ->", t.value);
            return { type: "number", value: parseInt(t.value, 10) };
        }
        else if (t.type === 'VAR') {
            this.consume();
            dbg("(var) ->");
            return { type: "variable", value: t.value.slice(1) };
        }
        else if (t.type === 'LPAREN') {
            this.consume();
            var expr = this.parseExpr();
            if (this.peek().type !== 'RPAREN') {
                throw new Error("Unbalanced parens, expected ).");
            }
            this.consume();
            dbg('subexpr ->', expr);
            return expr;
        }
        else if (t.type === 'IDENT') {
            this.consume();
            var params = [];
            if (this.peek().type != 'LPAREN')
                throw new Error("Identifier must be followed by an expression list.");
            this.consume();
            while (true) {
                params.push(this.parseExpr());
                if (this.peek().type === 'RPAREN') {
                    this.consume();
                    break;
                }
                else if (this.peek().type === 'COMMA') {
                    this.consume();
                }
                else {
                    throw new Error("Unfinished function call (next token is " + this.peek().type + ")");
                }
            }
            dbg(t.value, '->', params);
            return { type: "func", name: t.value, value: params };
        }
        else {
            throw new Error("Expected identifier, number, var, or paren.");
        }
    }
    peek() {
        return this.tokens[this.parseIndex] || {};
    }
    consume() {
        dbg(" >> CONSUME", this.tokens[this.parseIndex]);
        this.parseIndex++;
    }
    resolve(actor) {
        this.indent = 0;
        return this.resolveNode(actor, this.tree);
    }
    resolveNode(actor, node) {
        var result = 0;
        switch (node.type) {
            case 'number':
                result = node.value;
                break;
            case 'variable':
                result = actor.get(node.value);
                break;
            case 'add':
                result = this.resolveNode(actor, node.lhs) + this.resolveNode(actor, node.rhs);
                break;
            case 'subtract':
                result = this.resolveNode(actor, node.lhs) - this.resolveNode(actor, node.rhs);
                break;
            case 'multiply':
                result = this.resolveNode(actor, node.lhs) * this.resolveNode(actor, node.rhs);
                break;
            case 'divide':
                result = this.resolveNode(actor, node.lhs) / this.resolveNode(actor, node.rhs);
                break;
            case 'roll':
                result = this.func_roll(actor, [node.lhs, node.rhs]);
                break;
            case 'func':
                dbg("FUNC: ", node.name, node.value);
                var func = this['func_' + node.name];
                if (func === undefined)
                    throw new Error("Called unrecognized function " + node.name + "()");
                result = func.call(this, actor, node.value);
                break;
            default:
                throw new Error("Unrecognized node in AST: " + node.type);
        }
        return result;
    }
    func_roll(actor, args) {
        var rolls = rollDice(this.resolveNode(actor, args[0]), this.resolveNode(actor, args[1]));
        var result = rolls.reduce((accum, num) => accum + num);
        dbg(rolls, "->", result);
        return result;
    }
    func_best(actor, args) {
        if (args[1].type !== 'roll')
            throw new Error("Parameter 2 to best() must be a roll.");
        var best = this.resolveNode(actor, args[0]);
        var rolls = rollDice(this.resolveNode(actor, args[1].lhs), this.resolveNode(actor, args[1].rhs));
        rolls.sort();
        var result = rolls.slice(-best).reduce((accum, num) => accum + num);
        dbg(rolls, "->", result);
        return result;
    }
    func_worst(actor, args) {
        if (args[1].type !== 'roll')
            throw new Error("Parameter 2 to best() must be a roll.");
        var worst = this.resolveNode(actor, args[0]);
        var rolls = rollDice(this.resolveNode(actor, args[1].lhs), this.resolveNode(actor, args[1].rhs));
        rolls.sort();
        var result = rolls.slice(0, worst).reduce((accum, num) => accum + num);
        dbg(rolls, "->", result);
        return result;
    }
}
exports.Dice = Dice;


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Core_1 = __webpack_require__(1);
const Scene_1 = __webpack_require__(6);
var AttackResult;
(function (AttackResult) {
    AttackResult[AttackResult["Miss"] = 0] = "Miss";
    AttackResult[AttackResult["Weak"] = 1] = "Weak";
    AttackResult[AttackResult["Normal"] = 2] = "Normal";
    AttackResult[AttackResult["Critical"] = 3] = "Critical";
})(AttackResult = exports.AttackResult || (exports.AttackResult = {}));
;
class Battle {
    static start(args) {
        return new Promise((resolve, reject) => {
            Scene_1.Scene.do(function* () {
                let result = yield* Battle.waitBattle(args);
                resolve(result);
            });
        });
    }
    static *waitBattle(args) {
        Battle.active = true;
        let result = yield* Core_1.getBattleSystem().start(args);
        Battle.active = false;
        return result;
    }
    static isCombatant(ch) {
        if (!Battle.active)
            return false;
        return Core_1.getBattleSystem().isCombatant(ch);
    }
}
Battle.active = false;
exports.Battle = Battle;


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Cozy = __webpack_require__(0);
const Core_1 = __webpack_require__(1);
const Menu_1 = __webpack_require__(11);
function frameMapMode(dt) {
    let dx = 0, dy = 0;
    let movex = Cozy.Input.axis('horizontal') || 0, movey = Cozy.Input.axis('vertical') || 0;
    if (Cozy.Input.pressed('up'))
        movey -= 1;
    if (Cozy.Input.pressed('down'))
        movey += 1;
    if (Cozy.Input.pressed('left'))
        movex -= 1;
    if (Cozy.Input.pressed('right'))
        movex += 1;
    let move = Cozy.dist({ x: 0, y: 0 }, { x: movex, y: movey });
    if (Math.abs(move) < Cozy.Input.deadzone) {
        movex = 0;
        movey = 0;
    }
    else if (move > 1) {
        movex *= (1 / move);
        movey *= (1 / move);
    }
    let player = Core_1.getPlayer();
    dx = movex * player.speed * dt;
    dy = movey * player.speed * dt;
    player.move(dx, dy);
    if (Cozy.Input.pressed('confirm')) {
        Cozy.Input.debounce('confirm');
        let tx = player.position.x;
        let ty = player.position.y;
        if (player.dir >= 315 || player.dir < 45)
            tx += Core_1.getMap().tileSize.x;
        if (player.dir >= 45 && player.dir < 135)
            ty += Core_1.getMap().tileSize.y;
        if (player.dir >= 135 && player.dir < 225)
            tx -= Core_1.getMap().tileSize.x;
        if (player.dir >= 225 && player.dir < 315)
            ty -= Core_1.getMap().tileSize.y;
        let trigger = player.layer.getTriggerByPoint(tx, ty);
        if (trigger) {
            player.layer.map[trigger.name]({
                entity: player,
                trigger: trigger,
                x: tx, y: ty,
                tx: Math.floor(tx / Core_1.getMap().tileSize.x), ty: Math.floor(ty / Core_1.getMap().tileSize.y)
            });
        }
        player.layer.entities.forEach(function (entity) {
            if (player.layer.map[entity.name] && Math.sqrt(Cozy.dist2({ x: tx, y: ty }, entity.position)) < entity.radius) {
                player.layer.map[entity.name]({
                    entity: player,
                    target: entity,
                    x: tx, y: ty,
                    tx: Math.floor(tx / Core_1.getMap().tileSize.x), ty: Math.floor(ty / Core_1.getMap().tileSize.y)
                });
            }
        });
    }
    if (Cozy.Input.pressed('menu') && Core_1.getMainMenuClass()) {
        Cozy.Input.debounce('menu');
        Cozy.Input.debounce('cancel');
        let menu = new (Core_1.getMainMenuClass())();
        Core_1.getUiPlane().addChild(menu);
        Menu_1.Menu.push(menu);
    }
}
exports.frameMapMode = frameMapMode;


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const Cozy = __webpack_require__(0);
const LoaderTMX_1 = __webpack_require__(12);
__export(__webpack_require__(12));
const LoaderLotus_1 = __webpack_require__(23);
__export(__webpack_require__(23));
exports.mapLoadFuncs = {
    '.data': LoaderLotus_1.loadLotusMap,
    '.tmx': LoaderTMX_1.loadTMX
};
function loadMap(path, existingMap) {
    let loaderFunc = exports.mapLoadFuncs[Cozy.gameDir().file(path).extension];
    if (!loaderFunc) {
        throw new Error("Could not figure out how to load map " + path + ".");
    }
    return loaderFunc(path, existingMap);
}
exports.loadMap = loadMap;


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Cozy = __webpack_require__(0);
const Tileset_1 = __webpack_require__(15);
let TSXcache = {};
function loadTSX(path, file) {
    let fullpath = path + file;
    if (!TSXcache[path]) {
        let ts = new Tileset_1.MapTileset();
        let parser = new DOMParser();
        let data = parser.parseFromString(Cozy.gameDir().file(fullpath).read(), "text/xml");
        ts.texture = path + data.getElementsByTagName('image')[0].getAttribute('source');
        let tiles = data.getElementsByTagName('tile');
        for (let i in tiles) {
            let tile = tiles[i];
            let animations = tile.getElementsByTagName('animation');
            for (let i in animations) {
                let animData = animations[i];
                let animation = [];
                let frames = animData.getElementsByTagName('frame');
                for (let i in frames) {
                    let frameData = frames[i];
                    animation.push([
                        parseInt(frameData.getAttribute('tileid'), 10),
                        parseInt(frameData.getAttribute('duration'), 10) / 1000
                    ]);
                }
                ts.animations[tile.getAttribute("id")] = [{
                        loop: true,
                        frames: animation
                    }];
            }
        }
        TSXcache[fullpath] = ts;
    }
    return TSXcache[fullpath];
}
exports.loadTSX = loadTSX;


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Cozy = __webpack_require__(0);
const Entity_1 = __webpack_require__(4);
const Map_1 = __webpack_require__(2);
const MapLayer_1 = __webpack_require__(13);
let objectLibraryCache = {};
function getObjectLibrary(file) {
    if (!objectLibraryCache[file.path]) {
        let data = JSON.parse(file.read());
        let dir = file.dir;
        for (let k in data) {
            let o = data[k];
            o.texture = dir.file(o.texture).relativePath(Cozy.gameDir());
        }
        objectLibraryCache[file.path] = data;
    }
    return objectLibraryCache[file.path];
}
function loadLotusMap(path, existingMap) {
    let map = existingMap || new Map_1.GameMap({});
    let mapFile = Cozy.gameDir().file(path);
    let mapDir = mapFile.dir;
    let data = JSON.parse(mapFile.read());
    map.filename = path;
    map.tileSize = new PIXI.Point(80, 80);
    map.size = new PIXI.Point(data.dimensions.mapWidth / map.tileSize.x, data.dimensions.mapHeight / map.tileSize.y);
    let objectLibrary = {};
    map.objectSources = {};
    if (data.objects) {
        for (let f of data.objects) {
            let lib = getObjectLibrary(mapDir.file(f));
            Object.assign(objectLibrary, lib);
            for (let k in lib) {
                map.objectSources[k] = f;
            }
        }
    }
    else {
        console.warn("Map has no object libraries to load.");
    }
    for (let layerData of data.layers) {
        let layer = new MapLayer_1.MapLayer(layerData.name);
        layer.freezeObstructions();
        if (layerData.hasOwnProperty('walkable')) {
            layer.walkable = layerData.walkable;
        }
        layer.entities = [];
        if (layerData.zones) {
            for (let o of layerData.zones) {
                let args = {
                    name: o.name || '',
                    points: o.points || [],
                    flags: o.flags || {}
                };
                if (o.events)
                    args.events = o.events;
                console.log("  args>", args);
                let z = layer.addZone(args);
                console.log("  ZONE>", z);
                if (o.events)
                    console.log("      >>>", o.events);
            }
        }
        if (layerData.obstructions) {
            for (let o of layerData.obstructions) {
                layer.addObstruction(o);
            }
        }
        if (layerData.patches) {
            for (let o of layerData.patches) {
                if (!objectLibrary[o.def]) {
                    console.warn('Skipping unrecognized patch', o.def);
                    continue;
                }
                let args = {
                    name: o.name || '',
                    sprite: objectLibrary[o.def],
                    sourceSpriteDef: o.def,
                    position: new PIXI.Point(o.x, o.y),
                    sortWithEntities: o.sortWithEntities || false
                };
                let p = layer.addPatch(args);
                console.log(" PATCH>", p);
            }
        }
        if (layerData.entities) {
            for (let o of layerData.entities) {
                if (!objectLibrary[o.def]) {
                    console.warn('Skipping unrecognized entity', o.def);
                    continue;
                }
                let args = {
                    name: o.name || '',
                    sprite: objectLibrary[o.def],
                    sourceSpriteDef: o.def,
                    spawn: new PIXI.Point(o.x, o.y)
                };
                let e = new Entity_1.Entity(args);
                layer.entities.push(e);
                console.log("ENTITY>", e);
            }
        }
        layer.unfreezeObstructions();
        layer.rebuildObstructions();
        map.addLayer(layer);
    }
    map.cameraBoxes.push(new PIXI.Rectangle(0, 0, map.size.x * map.tileSize.x, map.size.y * map.tileSize.y));
    return map;
}
exports.loadLotusMap = loadLotusMap;


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Cozy = __webpack_require__(0);
const Core_1 = __webpack_require__(1);
const Party_1 = __webpack_require__(7);
class Character {
    constructor(args) {
        this.name = '';
        this._xp = 0;
        this._level = 0;
        this.baseAttribute = {};
        this.effectiveAttribute = {};
        this.traits = [];
        this.effectiveTraits = [];
        this.equipped = {};
        this.name = args.name;
        this.sprite = args.sprite;
        this.levels = args.levels || [];
        this.treasure = Object.assign({}, args.treasure);
        Character.attributes.forEach((attribute) => this.baseAttribute[attribute] = 0);
        if (args.hasOwnProperty('attributes')) {
            this.adjust(args.attributes);
        }
        if (args.levels && this.levels[0] !== null) {
            this.levels.unshift(null);
        }
        this.maxhp = args.hasOwnProperty('maxhp') ? args.maxhp : args.hp;
        this.xp = args.xp || 0;
        this.portrait = args.portrait || '';
        this.title = args.title || '';
        this.traits = args.traits ? args.traits.slice(0) : [];
        this.recalcAttributes();
        if (args.equipped) {
            Object.keys(args.equipped).forEach((slotKey) => {
                let itemKey = args.equipped[slotKey];
                let itm = Party_1.Party.inventory.has(itemKey);
                this.equipItem(itm, slotKey);
            });
        }
        this.hp = args.hasOwnProperty('hp') ? args.hp : this.maxhp;
    }
    serialize() {
        let data = {};
        Object.keys(this).forEach((k) => {
            if (typeof this[k] === 'function')
                return;
            let data_k = k.replace(/^_/, '');
            switch (k) {
                case "equipped":
                    data[data_k] = Cozy.mapO(this[k], (vv, kk) => vv.key);
                    break;
                case "baseAttribute":
                    data["attributes"] = this[k];
                    break;
                case "effectiveAttribute":
                    break;
                default:
                    data[data_k] = this[k];
            }
        });
        return data;
    }
    adjust(stats) {
        Object.keys(stats).forEach((k) => {
            let v = stats[k];
            if (Character.attributes.indexOf(k) !== -1) {
                this.baseAttribute[k] += v;
            }
            else {
                throw new Error("Tried to adjust bad attribute '" + k + "'");
            }
        });
        this.recalcAttributes();
    }
    get(attribute) {
        if (Character.attributes.indexOf(attribute) !== -1) {
            return this.effectiveAttribute[attribute];
        }
        throw new Error("Tried to get bad attribute '" + attribute + "'");
    }
    getBase(attribute) {
        if (Character.attributes.indexOf(attribute) !== -1) {
            return this.baseAttribute[attribute];
        }
        throw new Error("Tried to get bad base attribute '" + attribute + "'");
    }
    recalcAttributes() {
        Character.attributes.forEach((attribute) => {
            this.effectiveAttribute[attribute] = this.baseAttribute[attribute];
        });
        this.effectiveTraits = this.traits.slice(0);
        Object.keys(this.equipped).forEach((slot) => {
            let item = this.equipped[slot];
            if (!item)
                return;
            if (item.equipEffect && item.equipEffect.attributes) {
                Object.keys(item.equipEffect.attributes).forEach((k) => {
                    let v = item.equipEffect.attributes[k];
                    if (Character.attributes.indexOf(k) !== -1) {
                        this.effectiveAttribute[k] += v;
                    }
                    else {
                        throw new Error("Tried to adjust bad attribute '" + k + "'");
                    }
                });
                Object.keys(item.equipEffect.traits).forEach((t) => {
                    this.effectiveTraits.push(t);
                });
            }
        });
    }
    levelUp(level) {
        this._level = level;
        let lv = this.levels[this._level];
        Character.attributes.forEach((attribute) => this.baseAttribute[attribute] = lv[attribute] || this.baseAttribute[attribute]);
        if (lv.hp) {
            let gain = lv.hp - this.maxhp;
            this.maxhp = lv.hp;
            this.hp += gain;
        }
        this.recalcAttributes();
    }
    equipItem(item, slot) {
        if (item.equipSlot !== slot)
            return false;
        let current = this.equipped[slot];
        if (current) {
            current.location = Party_1.Party.inventory;
        }
        if (item === null) {
            this.equipped[slot] = null;
        }
        else {
            this.equipped[slot] = item;
            item.location = this;
        }
        this.recalcAttributes();
        return true;
    }
    tryOn(items) {
        let stats = {};
        Character.attributes.forEach((attribute) => {
            stats[attribute] = this.baseAttribute[attribute];
        });
        Core_1.getEquipSlots().forEach((slot) => {
            let item = this.equipped[slot];
            if (items.hasOwnProperty(slot)) {
                item = items[slot];
            }
            if (!item || !item.equipEffect)
                return;
            Object.keys(item.equipEffect.attributes).forEach((k) => {
                let v = item.equipEffect.attributes[k];
                if (Character.attributes.indexOf(k) !== -1) {
                    stats[k] += v;
                }
                else {
                    throw new Error("Tried to adjust bad attribute '" + k + "'");
                }
            });
        });
        return stats;
    }
    hasTrait(key) {
        if (key.indexOf("*") === -1) {
            return (this.effectiveTraits.indexOf(key) !== -1);
        }
    }
    modifiedDamage(amount, type) {
        let damage = amount;
        if (this.hasTrait('vulnerable:' + type)) {
            damage *= 2;
        }
        if (this.hasTrait('resist:' + type)) {
            damage *= 0.5;
        }
        if (this.hasTrait('immune:' + type)) {
            damage = 0;
        }
        if (this.hasTrait('absorb:' + type)) {
            damage = -damage;
        }
        return Math.round(damage);
    }
    get xp() { return this._xp; }
    get xpnext() { return this.levels[this.level + 1] ? this.levels[this.level + 1].xp : null; }
    get level() { return this._level; }
    get hp() { return this._hp; }
    set xp(n) {
        this._xp = n;
        while (this.levels[this.level + 1] && this._xp >= this.levels[this.level + 1].xp) {
            this.levelUp(this.level + 1);
        }
    }
    set hp(n) {
        this._hp = Math.min(this.maxhp, Math.max(0, n));
    }
}
Character.attributes = ["damage", "critical", "dodge", "block", "defense"];
Character.attributeAbbr = ["DMG", "CRT", "DOD", "BLK", "DEF"];
exports.Character = Character;


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(26);


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Cozy = __webpack_require__(0);
const RPG = __webpack_require__(5);
const Menu = __webpack_require__(29);
window['RPG'] = RPG;
exports.frame = RPG.frame;
function load() {
    return RPG.load({
        mainMenuClass: Menu.Main,
        battleSystem: RPG.BattleSystem.SoloFrontView,
        battleSystemConfig: {
            fightMusic: 'battle',
            victoryMusic: 'victory',
            monsters: Cozy.gameDir().file('src/monsters.json').read('json'),
            gameOver: this.gameOverSequence
        },
        loadSkip: ["src_image/"],
        items: Cozy.gameDir().file('src/items.json').read('json'),
        sfx: {
            'hit': "audio/sfx/smash.wav",
            'restore': "audio/sfx/Healing Full.wav",
            'thud': "audio/sfx/thud.wav",
            'chnk': "audio/sfx/chnk.ogg",
            'negative': "audio/sfx/ALERT_Error.wav",
            'alert': "audio/sfx/sfx_alarm_loop6.wav",
            'menu_move': 'audio/sfx/MENU_Pick.wav',
            'menu_choose': 'audio/sfx/MENU B_Select.wav',
            'menu_bad': 'audio/sfx/MENU B_Back.wav',
            'menu_newgame': 'audio/sfx/MENU A_Select.wav',
            'dragon_roar': 'audio/sfx/dinosaur_roar.wav',
            'battle_playerhit': 'audio/sfx/sword-slash3.mp3',
            'battle_playerweakhit': 'audio/sfx/sword-clash1.mp3',
            'battle_playermiss': 'audio/sfx/sword-gesture2.mp3',
            'effect_fire': 'audio/sfx/magic-flame1.mp3',
            'effect_ice': 'audio/sfx/magic-ice2.mp3',
            'effect_lightning': 'audio/sfx/magic-electron2.mp3',
            'effect_force': 'audio/sfx/qigong1.mp3',
            'effect_heal': 'audio/sfx/magic-cure1.mp3'
        },
        music: {
            'village': { tracks: ["audio/music/1-01 Town of Wishes.ogg"] },
            'overworld': { tracks: ["audio/music/Death Is Just Another Path.ogg"] },
            'forest': { tracks: ["audio/music/2-05 Mellow Darkness.ogg"] },
            'castle': { tracks: ["audio/music/1-12 The Ritual.ogg"] },
            'cave': { tracks: ["audio/music/1-10 Brazen.ogg"] },
            'boss': { tracks: ["audio/music/3-11 Royalty of Sin.ogg"] },
            'battle': { tracks: ["audio/music/1-02 Resonant Hopes Ignited Wills.ogg"] },
            'victory': { tracks: ["audio/music/2-12 Victory Theme.ogg"] },
            'lose': { tracks: ["audio/music/old city theme.ogg"] },
            'endcredits': { tracks: ["audio/music/Snowfall (Looped ver.).ogg"] }
        },
        maps: {
            'overworld': [Map_Overworld],
            'village': [Map_Town],
            'forest': [Map_Forest],
            'castle': [Map_Castle],
            'cave': [Map_Cave],
            'boss': [Map_Boss],
            'debug': [Map_Debug]
        },
        menuConfig: {
            sfx: {
                blip: 'menu_move',
                choose: 'menu_choose',
                sfxBad: 'menu_bad'
            }
        }
    });
}
exports.load = load;
function start() {
    bootSequence();
}
exports.start = start;
function bootSequence() {
    RPG.cleanup();
    RPG.music['overworld'].start();
    var bootMenu = new Menu.Boot();
    RPG.uiPlane.addChild(bootMenu);
    RPG.Menu.push(bootMenu);
    Cozy.unpause();
}
exports.bootSequence = bootSequence;
function startGame(game) {
    Cozy.pause();
    game.applyToState();
    RPG.Behavior._cleanup();
    Cozy.unpause();
    if (!game.data.map) {
        this.newGameSequence();
    }
}
exports.startGame = startGame;
function newGameSequence() {
    let lyr = RPG.renderPlane.addRenderLayer();
    let sprite = new Cozy.Sprite(RPG.characters['hero'].sprite);
    lyr.add(sprite);
    sprite.setPosition(160, 120);
    sprite.direction = 90;
    RPG.Scene.do(function* () {
        yield* RPG.Scene.waitFadeIn(1.0);
        yield* RPG.Scene.waitTextbox(null, [
            "My name is 'Hero'.",
            "With a name like that, great expectations follow you everywhere.",
            "I've been wandering for most of my life, trying to figure out how to fulfill those expectations.",
            "Or how to escape them."
        ]);
        yield* RPG.Scene.waitTextbox(null, [
            "For now I've come to this place: a small village named Carp's Bend. Maybe I'll find what I'm looking for here."
        ]);
        RPG.startMap('village', 8, 2, undefined, { direction: 90 });
    }.bind(this));
}
exports.newGameSequence = newGameSequence;
function gameOverSequence() {
    RPG.ControlStack.cleanup();
    RPG.ControlStack.push(RPG.ControlMode.Map);
    RPG.Scene.cleanup();
    RPG.uiPlane.clear();
    let gameOverMenu = new Menu.GameOver();
    RPG.uiPlane.addChild(gameOverMenu);
    RPG.Scene.do(function* () {
        console.log("GAME OVER");
        RPG.music['lose'].start(2.0);
        yield* RPG.Scene.waitFadeIn(2.0);
        RPG.Menu.push(gameOverMenu);
        while (!gameOverMenu.done) {
            yield;
        }
    });
}
exports.gameOverSequence = gameOverSequence;
function gameWinSequence() {
    RPG.Scene.do(function* () {
        yield* RPG.Scene.waitFadeOut(1.0);
        RPG.map.finish();
        RPG.map = null;
        RPG.renderPlane.clear();
        RPG.player = null;
        const lyr = RPG.renderPlane.addRenderLayer();
        const sprite = new Cozy.Sprite(RPG.characters['hero'].sprite);
        lyr.add(sprite);
        sprite.setPosition(160, 120);
        sprite.direction = 90;
        yield* RPG.Scene.waitFadeIn(1.0);
        yield* RPG.Scene.waitTextbox(null, [
            "With the dragon destroyed, I decide that I will not return to Carp's Bend.",
            "I do not know what they will think of me, or if they will understand what I've done for them."
        ]);
        yield* RPG.Scene.waitTextbox(null, [
            "During this journey, however, I have realized, finally, what it is that I have been searching for.",
            "I don't need recognition.",
            "I don't need lavish feasts or celebrations.",
            "I don't even need gold, or gems."
        ]);
        yield* RPG.Scene.waitTextbox(null, [
            "I just need to know that I've done the right thing."
        ]);
        yield* RPG.Scene.waitTextbox(null, [
            "Also it was kind of a terrible town.",
            "Good riddance."
        ]);
        Cozy.Audio.currentMusic.stop(1.0);
        yield* RPG.Scene.waitFadeOut(1.0);
        yield* this.waitOnCredits();
        this.bootSequence();
    }.bind(this));
}
exports.gameWinSequence = gameWinSequence;
function* waitOnCredits() {
    RPG.renderPlane.clear();
    let y = 0;
    const creditScroll = new CreditsComponent();
    RPG.uiPlane.addChild(creditScroll);
    RPG.music['endcredits'].start();
    yield* RPG.Scene.waitFadeIn(1.0);
    let hold = 0;
    const len = creditScroll.getScrollLength();
    while (creditScroll.scrolled < len) {
        let dt = yield;
        creditScroll.scroll(0.16);
        if (Cozy.Input.pressed('confirm')) {
            hold += dt;
            creditScroll.setHoldLevel(hold / 2);
        }
        else if (hold > 0) {
            hold -= dt * 3;
            if (hold < 0)
                hold = 0;
            creditScroll.setHoldLevel(hold / 2);
        }
        if (hold > 2)
            break;
    }
    RPG.music['endcredits'].stop(2);
    yield* RPG.Scene.waitFadeOut(2.0);
    creditScroll.remove();
}
exports.waitOnCredits = waitOnCredits;
function newGameData() {
    return new RPG.SavedGame(null, {
        characters: {
            hero: {
                name: "Hero",
                title: "Fighter",
                portrait: "ui/portrait-hero.png",
                sprite: "sprites/hero.sprite",
                hp: 100,
                levels: [
                    { xp: 0, damage: 10, critical: 1, dodge: 3, block: 2, defense: 5, hp: 100 },
                    { xp: 100, damage: 12, critical: 1, dodge: 4, block: 3, defense: 6, hp: 120 },
                    { xp: 225, damage: 15, critical: 2, dodge: 5, block: 3, defense: 8, hp: 140 },
                    { xp: 380, damage: 17, critical: 2, dodge: 6, block: 4, defense: 10, hp: 160 },
                    { xp: 570, damage: 20, critical: 3, dodge: 7, block: 4, defense: 12, hp: 180 },
                    { xp: 820, damage: 22, critical: 3, dodge: 8, block: 5, defense: 13, hp: 200 },
                    { xp: 1120, damage: 25, critical: 4, dodge: 9, block: 5, defense: 15, hp: 220 },
                    { xp: 1500, damage: 27, critical: 4, dodge: 10, block: 6, defense: 17, hp: 240 },
                    { xp: 2000, damage: 30, critical: 5, dodge: 11, block: 6, defense: 19, hp: 260 },
                    { xp: 2500, damage: 32, critical: 5, dodge: 12, block: 7, defense: 20, hp: 280 },
                    { xp: 3300, damage: 35, critical: 6, dodge: 14, block: 7, defense: 22, hp: 300 },
                    { xp: 4200, damage: 37, critical: 6, dodge: 15, block: 8, defense: 24, hp: 320 },
                    { xp: 5400, damage: 40, critical: 7, dodge: 16, block: 8, defense: 26, hp: 340 },
                    { xp: 6800, damage: 42, critical: 7, dodge: 17, block: 9, defense: 27, hp: 360 },
                    { xp: 8600, damage: 45, critical: 8, dodge: 18, block: 9, defense: 29, hp: 380 },
                    { xp: 11000, damage: 47, critical: 8, dodge: 19, block: 10, defense: 31, hp: 400 },
                    { xp: 14000, damage: 50, critical: 9, dodge: 20, block: 11, defense: 33, hp: 420 },
                    { xp: 17000, damage: 52, critical: 9, dodge: 21, block: 12, defense: 34, hp: 440 },
                    { xp: 22000, damage: 55, critical: 10, dodge: 22, block: 13, defense: 36, hp: 460 },
                    { xp: 27000, damage: 57, critical: 10, dodge: 23, block: 14, defense: 38, hp: 480 },
                    { xp: 34000, damage: 60, critical: 10, dodge: 25, block: 15, defense: 40, hp: 500 }
                ],
                equipped: {
                    weapon: 'oak_sword',
                    armor: 'quilt_armor'
                }
            }
        },
        party: {
            members: ['hero'],
            inventory: ['tonic', 'tonic', 'oak_sword', 'quilt_armor'],
            money: 0
        }
    });
}
exports.newGameData = newGameData;


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Cozy = __webpack_require__(0);
class BouncyComponent extends Cozy.UiComponent {
    constructor() {
        super({
            className: 'bouncy',
            html: ''
        });
    }
    show(s, className = '') {
        s.split('').forEach((ch, i) => {
            let digit = document.createElement('span');
            digit.className = 'digit';
            digit.innerText = ch;
            if (className !== '')
                digit.classList.add(className);
            this.element.appendChild(digit);
            window.setTimeout(() => {
                digit.classList.add('bouncing');
            }, i * 30);
            window.setTimeout(() => {
                digit.classList.remove('bouncing');
                this.element.removeChild(digit);
            }, i * 30 + 1500);
        });
    }
}
exports.BouncyComponent = BouncyComponent;


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Cozy = __webpack_require__(0);
const Core_1 = __webpack_require__(1);
const Character_1 = __webpack_require__(24);
const Inventory_1 = __webpack_require__(10);
const Map_1 = __webpack_require__(2);
const Party_1 = __webpack_require__(7);
class SavedGame {
    static get directory() {
        if (!SavedGame._directory)
            SavedGame._directory = Cozy.userDataDir().subdir("saves", true);
        return SavedGame._directory;
    }
    static set directory(dir) {
        SavedGame._directory = dir;
    }
    static count() {
        return SavedGame.getList().length;
    }
    static getList() {
        var files = [];
        SavedGame.directory.read().forEach((f) => {
            files.push(f);
        });
        files.sort((a, b) => {
            return a.stat().mtime > b.stat().mtime ? -1 : 1;
        });
        return files.map((f) => new SavedGame(f, f.read('json')));
    }
    static fromFile(f) {
        return new SavedGame(f, f.read('json'));
    }
    static fromState() {
        Core_1.getUiPlane().hide();
        let resolve = null;
        let p = new Promise((_res, _rej) => resolve = _res);
        window.requestAnimationFrame(() => {
            Cozy.captureScreenshot(64)
                .then((image) => {
                Core_1.getUiPlane().show();
                var next = 1;
                SavedGame.directory.read().forEach((f) => {
                    var m = f.name.match(/save-(\d+)/);
                    var i = parseInt(m[1], 10);
                    if (i >= next)
                        next = i + 1;
                });
                var file = SavedGame.directory.file("save-" + next.toString() + ".json");
                var data = {
                    image: image.toDataURL(),
                    name: Core_1.getMap().displayName,
                    map: Core_1.getMapkey(),
                    mapPersistent: Map_1.GameMap.persistent,
                    party: Party_1.Party.serialize(),
                    characters: Cozy.mapO(Core_1.getCharacters(), (ch) => ch.serialize()),
                    playerLocation: {
                        x: (Core_1.getPlayer().position.x / Core_1.getMap().tileSize.x) | 0,
                        y: (Core_1.getPlayer().position.y / Core_1.getMap().tileSize.y) | 0,
                        lyr: Core_1.getPlayer().layer.name
                    }
                };
                resolve(new SavedGame(file, data));
            });
        });
        return p;
    }
    constructor(file, data) {
        this.file = file;
        this.data = data;
    }
    applyToState() {
        Party_1.Party.inventory = new Inventory_1.Inventory();
        Party_1.Party.members = [];
        this.data.party.inventory.forEach((k) => Party_1.Party.inventory.add(k));
        Core_1.setCharacters(Cozy.mapO(this.data.characters, (def) => new Character_1.Character(def)));
        this.data.party.members.forEach((k) => Party_1.Party.add(Core_1.getCharacters()[k]));
        Party_1.Party.money = parseInt(this.data.party.money, 10) || 0;
        Core_1.setPlayer(Party_1.Party.members[0].makeEntity());
        console.log(">>", Core_1.getPlayer());
        Map_1.GameMap.persistent = this.data.mapPersistent || { global: {} };
        if (this.data.map)
            Core_1.startMap(this.data.map, this.data.playerLocation.x, this.data.playerLocation.y, this.data.playerLocation.lyr);
    }
    writeToDisk() {
        this.file.write(this.data, 'json');
    }
}
exports.SavedGame = SavedGame;


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const Cozy = __webpack_require__(0);
const RPG = __webpack_require__(5);
__export(__webpack_require__(30));
__export(__webpack_require__(31));
__export(__webpack_require__(32));
function quitGame() {
    RPG.Scene.do(function* () {
        yield* RPG.Scene.waitFadeTo("black", 1.0);
        Cozy.quit();
    }.bind(this));
}
exports.quitGame = quitGame;


/***/ }),
/* 30 */
/***/ (function(module, exports) {

var SimpleQuest;
(function (SimpleQuest) {
    let Menu;
    (function (Menu) {
        class GameOver extends RPG.Menu {
            constructor() {
                super({
                    className: 'menu gameover-menu',
                    html: `
                        <h1>Game Over</h1>
                        <ul class="main selections">
                            <li data-menu="mainmenu">Back to Main Menu</li>
                        </ul>
                    `
                });
                this.closing = false;
                this.setupSelections(this.find('.selections'));
            }
            mainmenu() {
                if (this.closing)
                    return false;
                this.closing = true;
                RPG.Scene.do(function* () {
                    yield* RPG.Scene.waitFadeTo("black", 1.0);
                    RPG.Menu.pop();
                    this.remove();
                    SimpleQuest.bootSequence();
                    yield 1;
                }.bind(this));
            }
        }
        Menu.GameOver = GameOver;
    })(Menu = SimpleQuest.Menu || (SimpleQuest.Menu = {}));
})(SimpleQuest || (SimpleQuest = {}));


/***/ }),
/* 31 */
/***/ (function(module, exports) {

var SimpleQuest;
(function (SimpleQuest) {
    let Menu;
    (function (Menu) {
        class Main extends RPG.Menu {
            constructor() {
                super({
                    className: 'menu main-menu',
                    cancelable: true,
                    html: `
                        <div class="main-area">
                        </div>

                        <div class="right-column">
                            <ul class="selections">
                                <li data-menu="resume">Resume</li>
                                <li data-menu="items">Items</li>
                                <li data-menu="equip">Equip</li>
                                <li data-menu="save">Save</li>
                                <li data-menu="exit">Exit</li>
                            </ul>

                            <div class="overview">
                                <div class="money-container"><span class="money"></span></div>
                            </div>
                        </div>
                    `
                });
                this.statusPanel = null;
                var moneyField = this.find('span.money');
                moneyField.innerHTML = RPG.Party.money.toString() + RPG.moneyName;
                this.submenus = {
                    items: Menu.Main_ItemsSubmenu,
                    equip: Menu.Main_EquipSubmenu,
                    save: Menu.Main_SaveSubmenu,
                    exit: Menu.Main_ExitSubmenu
                };
                this.statusPanel = new Menu.Main_StatusPanel();
                this.addChild(this.statusPanel, '.main-area');
                this.setupSelections(this.find('.selections'));
            }
            pause() {
                super.pause();
                this.statusPanel.remove();
            }
            unpause() {
                super.unpause();
                this.addChild(this.statusPanel, '.main-area');
                this.statusPanel.updateFields();
            }
            stop() {
                super.stop();
                this.remove();
            }
            showSubmenu(key) {
                if (this.submenus[key]) {
                    RPG.Menu.push(new this.submenus[key]());
                    this.addChild(RPG.Menu.currentMenu, '.main-area');
                }
                else {
                    console.warn("! Tried to show bad submenu", key);
                    console.trace();
                }
            }
            resume() { RPG.Menu.pop(); }
            items() { this.showSubmenu('items'); }
            equip() { this.showSubmenu('equip'); }
            save() { this.showSubmenu('save'); }
            exit() { this.showSubmenu('exit'); }
        }
        Menu.Main = Main;
    })(Menu = SimpleQuest.Menu || (SimpleQuest.Menu = {}));
})(SimpleQuest || (SimpleQuest = {}));


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const RPG = __webpack_require__(5);
const ItemComponent = __webpack_require__(33);
class ShopMenu extends RPG.Menu {
    constructor(args) {
        super({
            className: 'menu shop-menu',
            cancelable: true,
            direction: RPG.MenuDirection.HORIZONTAL,
            html: `
                <div class="main-area">
                    <div class="shop-name">${args.shopName}</div>
                    <ul class="info selections">
                        <li data-menu="buy">Buy</li>
                        <li class="sell" data-menu="sell">Sell</li>
                        <li data-menu="resume">Leave</li>
                        <li class="money">${RPG.Party.money}${RPG.moneyName}</li>
                    </ul>
                    <div class="items-container"></div>
                    <div class="description"></div>
                </div>
            `
        });
        this.priceMultiplier = args.priceMultiplier || 1;
        this.products = args.products.map((i) => RPG.Item.library[i]);
        this.setupSelections(this.find('.info.selections'));
    }
    unpause() {
        super.unpause();
        this.updateDescription('');
        if (RPG.Party.inventory.count() < 1) {
            this.find('.selections .sell').setAttribute('data-menu', '@disabled');
        }
        else {
            this.find('.selections .sell').setAttribute('data-menu', 'sell');
        }
    }
    buy() {
        var m = new BuyMenu({
            parent: this,
            products: this.products,
            priceMultiplier: this.priceMultiplier
        });
        this.addChild(m, '.items-container');
        RPG.Menu.push(m);
    }
    sell() {
        var m = new SellMenu({
            parent: this,
        });
        this.addChild(m, '.items-container');
        RPG.Menu.push(m);
    }
    updateMoney() {
        this.find('.money').innerHTML = `${RPG.Party.money}${RPG.moneyName}`;
    }
    updateDescription(desc) {
        this.find('.description').innerHTML = desc;
    }
    resume() { RPG.Menu.pop().remove(); }
}
exports.ShopMenu = ShopMenu;
class BuyMenu extends RPG.Menu {
    constructor(args) {
        super({
            className: 'menu buy-menu items selections scrollable',
            cancelable: true
        });
        this.products = args.products;
        this.priceMultiplier = args.priceMultiplier;
        this.products.forEach((itemDef) => {
            let price = Math.ceil(itemDef.price * this.priceMultiplier);
            let el = this.addChild(new ItemComponent({
                icon: itemDef.iconHTML,
                name: itemDef.name,
                price: price
            }));
            el.element.setAttribute('data-item', itemDef.key);
            el.element.setAttribute('data-price', price.toString());
            el.element.setAttribute('data-menu', price <= RPG.Party.money ? 'choose' : '@disabled');
        });
        this.setupSelections(this.element);
    }
    updateEnabled() {
        _.each(this.findAll('li.item'), (el) => {
            var item = RPG.Item.library[el.getAttribute('data-item')];
            el.setAttribute('data-menu', item.price * this.priceMultiplier <= RPG.Party.money ? 'choose' : '@disabled');
        });
    }
    setSelection(index) {
        super.setSelection(index);
        if (this.selections.length < 1)
            return false;
        this.parent.updateDescription(this.products[this.selectionIndex].description);
        return true;
    }
    choose(el) {
        var itemKey = el.getAttribute('data-item');
        var price = parseInt(el.getAttribute('data-price'), 10);
        if (price <= RPG.Party.money) {
            RPG.Party.money -= price;
            RPG.Party.inventory.add(itemKey);
        }
        this.updateEnabled();
        this.parent.updateMoney();
    }
    stop() {
        super.stop();
        this.remove();
    }
}
class SellMenu extends RPG.Menu {
    constructor(args) {
        super({
            className: 'menu sell-menu items selections scrollable',
            cancelable: true
        });
        this.rebuildList();
    }
    rebuildList() {
        this.items = RPG.Party.inventory.stacked((item) => item.sellable);
        this.element.innerHTML = '';
        this.items.forEach((stack) => {
            var price = Math.ceil(stack[0].price * 0.2);
            var el = this.addChild(new ItemComponent({
                icon: stack[0].iconHTML,
                name: stack[0].name,
                price: price
            }));
            var sellable = _.findIndex(stack, (item) => item.location === RPG.Party.inventory) !== -1;
            el.element.setAttribute('data-item', stack[0].key);
            el.element.setAttribute('data-price', price.toString());
            el.element.setAttribute('data-menu', sellable ? 'choose' : '@disabled');
        });
        this.setupSelections(this.element);
    }
    setSelection(index) {
        super.setSelection(index);
        if (this.selections.length < 1)
            return false;
        this.parent.updateDescription(this.items[this.selectionIndex][0].description);
        return true;
    }
    pause() {
        super.pause();
        this.element.style.display = 'none';
    }
    unpause() {
        super.unpause();
        this.rebuildList();
        this.parent.updateMoney();
        if (RPG.Party.inventory.count() < 1) {
            RPG.Menu.pop().remove();
            return;
        }
        this.element.style.display = '';
    }
    choose(el) {
        var m = new ConfirmSellMenu({
            stack: this.items[this.selectionIndex]
        });
        this.addChild(m, this.element.parentNode);
        RPG.Menu.push(m);
    }
}
class ConfirmSellMenu extends RPG.Menu {
    constructor(args) {
        super({
            className: 'menu confirm-sell-menu',
            cancelable: true,
            direction: RPG.MenuDirection.VERTICAL,
            selectionContainer: '.selections',
            html: `
                <div class="item-container"></div>
                <div class="sell-info">
                    <div class="owned-container">
                        <span class="label">Owned</span> <span class="count"></span>
                    </div>
                    <div class="equipped-container">
                        <span class="label">Equipped</span> <span class="count"></span>
                    </div>

                    <ul class="sell-container selections">
                        <li data-menu="confirm"><span class="label">Number to sell...</span> <span class="count"></span></li>
                    </ul>
                    <div class="total-container">
                        <span class="label">Total</span> <span class="total"></span>
                    </div>
                </div>
            `
        });
        this.stack = args.stack;
        this.price = this.stack[0].price * 0.2;
        this.itemComponent = new ItemComponent({
            icon: this.stack[0].iconHTML,
            name: this.stack[0].name,
            price: this.price
        });
        this.addChild(this.itemComponent, this.find('.item-container'));
        this.owned = this.stack.length;
        if (!this.stack[0].equipSlot) {
            this.find('.equipped-container').style.display = 'none';
            this.equipped = 0;
        }
        else {
            this.equipped = _.reduce(this.stack, (n, item) => n += (item.location === RPG.Party.inventory ? 0 : 1), 0);
        }
        this.count = 1;
    }
    get count() { return this.count_; }
    set count(x) {
        this.count_ = x;
        var countSpan = this.find('.sell-container .count');
        countSpan.innerText = x.toString();
        countSpan.classList.toggle('floor', this.count_ === 0);
        countSpan.classList.toggle('ceil', this.count_ === this.owned - this.equipped);
        var totalSpan = this.find('.total-container .total');
        totalSpan.innerText = (this.price * this.count_).toString() + RPG.moneyName;
    }
    get owned() { return this.owned_; }
    set owned(x) {
        this.owned_ = x;
        this.find('.owned-container .count').innerText = x.toString();
    }
    get equipped() { return this.equipped_; }
    set equipped(x) {
        this.equipped_ = x;
        this.find('.equipped-container .count').innerText = x.toString();
    }
    stop() {
        super.stop();
        this.remove();
    }
    confirm_adjust(d) {
        this.count = Math.max(0, Math.min(this.owned - this.equipped, this.count + d));
    }
    confirm() {
        RPG.Party.money += this.price * this.count;
        var toSell = [];
        _.times(this.count, (i) => {
            if (toSell.length >= this.count)
                return;
            if (this.stack[i].location === RPG.Party.inventory) {
                toSell.push(this.stack[i]);
            }
        });
        RPG.Party.inventory.remove(toSell);
        RPG.Menu.pop();
    }
}


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Cozy = __webpack_require__(0);
const RPG = __webpack_require__(5);
class ItemComponent extends Cozy.UiComponent {
    constructor(args) {
        super({
            tag: 'li',
            className: 'item',
            html: `
                <span class="item-icon">${args.icon}</span>
                <span class="name">${args.name}</span>
                <span class="count">${args.count}</span>
                <span class="price">${args.price}${RPG.moneyName}</span>
            `
        });
        if (!args.count)
            this.find('.count').remove();
        if (!args.price)
            this.find('.price').remove();
    }
    setPrice(n) {
        this.find('.price').innerText = n.toString() + RPG.moneyName;
    }
    setCount(n) {
        this.find('.count').innerText = n.toString();
    }
}
exports.ItemComponent = ItemComponent;


/***/ })
/******/ ]);