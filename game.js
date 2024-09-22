import {
    lander_input_init,
    lander_camera_matrix,
    lander_camera_eye,
    lander_ground_init_map, 
    lander_ground_draw,
    lander_physics_init,
    lander_physics_draw,
    lander_physics_tick,
    lander_hud_draw,
    lander_light,
    lander_ship,
    lander_sort
} from "./lander";


let main = null;
let main_ctx = null;

let map = null;
let map_ctx = null;

function time() {
    return new Date().getTime();
}

const draw = () => {
    const cam = lander_camera_matrix(lander_ship.p[0], lander_ship.p[1], lander_ship.p[2], -lander_ship.r[1]);
    main_ctx.fillStyle = "#000000";
    lander_sort.clear(main_ctx);
    lander_sort.begin();
    lander_light.eye = lander_camera_eye();
    lander_ground_draw(cam);
    lander_physics_draw(cam);

    lander_sort.draw(main_ctx);

    lander_hud_draw(main_ctx, map);
}

var avgtime = 0;
var last = time();

function frame() {
    for (var i = 0; i < avgtime / 25; i++)
        lander_physics_tick();

    draw();

    var now = time();

    avgtime = avgtime * 0.95 + (now - last) * 0.05;

    last = now;

    setTimeout(frame, 0);
}

const init = () => {
    lander_physics_init();
    lander_input_init();

    main = document.getElementById('main_canvas');
    main_ctx = main.getContext('2d');

    main_ctx.fillStyle = "#000000";
    main_ctx.fillRect(0, 0, 400, 400);

    map = document.getElementById('map_canvas');
    map_ctx = map.getContext('2d');

    lander_ground_init_map(map_ctx);

    setTimeout(frame, 0);
}

setInterval(()=> console.log('fps', 1000/avgtime), 1000)

export { init }