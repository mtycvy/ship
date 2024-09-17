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

var lander_input_lmb_pressed;
var lander_input_rmb_pressed;
            
var lander_input_dx;
var lander_input_dy;

var lander_input_prev_x;
var lander_input_prev_y;

var lander_input_prev_valid;
      
function lander_input_init()
{
   lander_input_lmb_pressed = false;
   lander_input_rmb_pressed = false;
            
   lander_input_dx = 0;
   lander_input_dy = 0;
   
   lander_input_prev_valid = false;

   var canvas = document.getElementById('main_canvas');
      
   canvas.addEventListener('mousedown', lander_input_mouse_down, false);   
   canvas.addEventListener('mouseup', lander_input_mouse_up, false);
   canvas.addEventListener('mousemove', lander_input_mouse_move, false);  
   canvas.addEventListener('mouseout', lander_input_mouse_out, false);   
   
   canvas.oncontextmenu = function() { return false; };
}

function lander_input_mouse_down(e) 
{
   switch (e.which) {
   case 1:
      lander_input_lmb_pressed = true;
      break;
   case 3:
      lander_input_rmb_pressed = true;
      break;
   }
}

function lander_input_mouse_up(e) 
{
   switch (e.which) {
   case 1:
      lander_input_lmb_pressed = false;
      break;
   case 3:
      lander_input_rmb_pressed = false;
      break;
   }
}      

function lander_input_mouse_out(e)
{
   lander_input_prev_valid = false;
}

function lander_input_mouse_move(e) 
{
   var x = e.layerX;
   var y = e.layerY;
   
   if (lander_input_prev_valid) {
      lander_input_dx += x - lander_input_prev_x;
      lander_input_dy += y - lander_input_prev_y;
   }
   
   lander_input_prev_x = x;
   lander_input_prev_y = y;
   lander_input_prev_valid = true;
}

