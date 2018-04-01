module RPG {
    export function frameMapMode(dt) {
        // handle movement
        var dx = 0, dy = 0;
        var movex = Cozy.Input.axis('horizontal') || 0,
            movey = Cozy.Input.axis('vertical') || 0;

        if (Cozy.Input.pressed('up')) movey -= 1;
        if (Cozy.Input.pressed('down')) movey += 1;
        if (Cozy.Input.pressed('left')) movex -= 1;
        if (Cozy.Input.pressed('right')) movex += 1;

        var move = Trig.dist({x:0,y:0}, {x:movex, y:movey});
        if (Math.abs(move) < Cozy.Input.deadzone) {
            movex = 0;
            movey = 0;
        } else if (move > 1 ) {
            movex *= (1 / move);
            movey *= (1 / move);
        }

        dx = movex * player.speed * dt;
        dy = movey * player.speed * dt;

        player.move(dx, dy);

        // handle other input
        if (Cozy.Input.pressed('confirm')) {
            Cozy.Input.debounce('confirm');
            var tx = player.position.x;
            var ty = player.position.y;
            if (player.dir >= 315 || player.dir <  45) tx += map.tileSize.x;
            if (player.dir >=  45 && player.dir < 135) ty += map.tileSize.y;
            if (player.dir >= 135 && player.dir < 225) tx -= map.tileSize.x;
            if (player.dir >= 225 && player.dir < 315) ty -= map.tileSize.y;

            var trigger = player.layer.getTriggerByPoint(tx, ty);
            if (trigger) {
                player.layer.map[trigger.name]({
                    entity: player,
                    trigger: trigger,
                    x: tx, y: ty,
                    tx: Math.floor(tx / map.tileSize.x), ty: Math.floor(ty / map.tileSize.y)
                });
            }

            _.each(player.layer.entities, function(entity) {
                if (player.layer.map[entity.name] && Math.sqrt(Trig.dist2({x:tx, y:ty}, entity.position)) < entity.radius) {
                    player.layer.map[entity.name]({
                        entity: player,
                        target: entity,
                        x: tx, y: ty,
                        tx: Math.floor(tx / map.tileSize.x), ty: Math.floor(ty / map.tileSize.y)
                    });
                }
            });
        }

        if (Cozy.Input.pressed('menu') && RPG.mainMenuClass) {
            Cozy.Input.debounce('menu');
            Cozy.Input.debounce('cancel');
            // TODO instantiate this once and show/hide it rather than re-creating
            var menu = new RPG.mainMenuClass();
            RPG.uiPlane.addChild(menu);
            Menu.push(menu);
        }
    }
}
