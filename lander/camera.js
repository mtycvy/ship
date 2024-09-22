/*
   Ajax3d - a 3d engine using the WHATWG HTML <canvas> tag.
   
   Copyright (C) 2007 Eben Upton
   
   This program is free software; you can redistribute it and/or
   modify it under the terms of version 2 of the GNU General Public 
   License as published by the Free Software Foundation.
   
   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.
   
   You should have received a copy of the GNU General Public License
   along with this program; if not, write to the Free Software
   Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/

import { 
   j3d_matrix_multiply,
   j3d_matrix_project,
   j3d_matrix_translate,
   j3d_matrix_rotate_x,
   j3d_matrix_rotate_y,
   j3d_matrix_scale
} from "../j3d/matrix";
import { lander_ship } from "./physics" 


var camry = 0;

var lander_camera_rx = 0.4;
var lander_camera_dist = 20;

function lander_camera_matrix(x, y, z, r_y)
{
   camry += (r_y-camry) * 0.3;
   
   var t1 = j3d_matrix_translate(-x, -y, -z);
   var ry = j3d_matrix_rotate_y(camry);
   var rx = j3d_matrix_rotate_x(lander_camera_rx);
   var t2 = j3d_matrix_translate(0, 0, lander_camera_dist);
   
   var p  = j3d_matrix_project(10, 10, 5, 25);
   
   var m = j3d_matrix_multiply(t1, ry);
   var n = j3d_matrix_multiply(m, rx);
   var o = j3d_matrix_multiply(n, t2);

   var p = j3d_matrix_multiply(o, p);

   var tf = j3d_matrix_translate(0.5, 0.25, 0);
   var s1 = j3d_matrix_scale(1024, 768, 1);

   var kl = j3d_matrix_multiply(p, tf);
   var kr = j3d_matrix_multiply(kl, s1);
                     
   return kr;
}

function lander_camera_eye()
{
   var t2 = j3d_matrix_translate(0, 0, -lander_camera_dist);
   var rx = j3d_matrix_rotate_x(-lander_camera_rx);
   var ry = j3d_matrix_rotate_y(-camry);
   var t1 = j3d_matrix_translate(lander_ship.p[0], lander_ship.p[1], lander_ship.p[2]);
   
   return j3d_matrix_multiply([[0, 0, 0, 1]], j3d_matrix_multiply(j3d_matrix_multiply(j3d_matrix_multiply(t2, rx), ry), t1))[0];
}

export {
   lander_camera_eye,
   lander_camera_matrix
}
