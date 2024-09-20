import { j3d_clip } from "../j3d/clip";
import { j3d_sort } from "../j3d/sort";
import { j3d_light } from "../j3d/light";
import { j3d_vector_normalize } from "../j3d/vector";

const lander_clip = new j3d_clip([[1, 0, 0, 0],
                                  [0, 0, 1, 0],
                                  [-1, 0, 0, 0],
                                  [0, 0, -1, 0]]);
const lander_sort = new j3d_sort(64, 200, 2);
const lander_light = new j3d_light(j3d_vector_normalize([1.0, -1.0, 0.0, 0.0]));
const lander_alien_state_flying = 0;
const lander_alien_state_dead   = 1;

export { lander_clip, lander_sort, lander_light, lander_alien_state_dead, lander_alien_state_flying }