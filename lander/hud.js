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
import { j3d_util_rgbacolor } from "../j3d/util";
import { lander_ground_size } from "./ground";
import { lander_ship, lander_aliens } from "./physics"
import { lander_alien_state_dead, lander_alien_state_flying } from "./globals";



const lander_hud_dotsize = 3;
const lander_hud_dotedge = 64 - lander_hud_dotsize;

function lander_hud_dot(ctx, x, y)
{
   var scale = 64 / lander_ground_size;
   
   x = Math.floor(x * scale + 0.5 - lander_hud_dotsize / 2) & 63;
   y = Math.floor(y * scale + 0.5 - lander_hud_dotsize / 2);

   y = 64 - y - lander_hud_dotsize & 63;

   if (x > lander_hud_dotedge) {
      if (y > lander_hud_dotedge) {
         ctx.fillRect(400 - 64 - 2 + x, 2 + y, 64-x, 64-y);
         ctx.fillRect(400 - 64 - 2 + 0, 2 + y, x-lander_hud_dotedge, 64-y);
         ctx.fillRect(400 - 64 - 2 + x, 2 + 0, 64-x, y-lander_hud_dotedge);
         ctx.fillRect(400 - 64 - 2 + 0, 2 + 0, x-lander_hud_dotedge, y-lander_hud_dotedge);
      } else {
         ctx.fillRect(400 - 64 - 2 + x, 2 + y, 64-x, lander_hud_dotsize);
         ctx.fillRect(400 - 64 - 2 + 0, 2 + y, x-lander_hud_dotedge, lander_hud_dotsize);
      }
   } else {
      if (y > lander_hud_dotedge) {
         ctx.fillRect(400 - 64 - 2 + x, 2 + y, lander_hud_dotsize, 64-y);
         ctx.fillRect(400 - 64 - 2 + x, 2 + 0, lander_hud_dotsize, y-lander_hud_dotedge);
      } else {
         ctx.fillRect(400 - 64 - 2 + x, 2 + y, lander_hud_dotsize, lander_hud_dotsize);
      }
   }
}

var lander_hud_health = 1.0;

function lander_hud_draw(ctx, map)
{
   var fuel = lander_ship.get_fuel();
   var health = lander_ship.get_health();

   if (health < lander_hud_health)
      lander_hud_health = Math.max(health, lander_hud_health - 0.01);
   if (health > lander_hud_health)
      lander_hud_health = Math.min(health, lander_hud_health + 0.01);
      
   var bar_width;
   
   bar_width = 300 * fuel;
   
   ctx.fillStyle = "rgb(255, 0, 0)";
   ctx.fillRect(2, 2, bar_width, 1);
   ctx.fillStyle = "rgb(192, 0, 0)";
   ctx.fillRect(2, 3, bar_width, 4);
   ctx.fillStyle = "rgb(128, 0, 0)";
   ctx.fillRect(2, 7, bar_width, 1);
   ctx.fillStyle = "rgb(64, 0, 0)";
   ctx.fillRect(2 + bar_width, 2, 300 - bar_width, 6);

   bar_width = 300 * lander_hud_health;
   
   ctx.fillStyle = "rgb(0, 255, 0)";
   ctx.fillRect(2, 10, bar_width, 1);
   ctx.fillStyle = "rgb(0, 192, 0)";
   ctx.fillRect(2, 11, bar_width, 4);
   ctx.fillStyle = "rgb(0, 128, 0)";
   ctx.fillRect(2, 15, bar_width, 1);
   ctx.fillStyle = "rgb(0, 64, 0)";
   ctx.fillRect(2 + bar_width, 10, 300 - bar_width, 6);
  
   ctx.drawImage(map, 400 - 64 - 2, 2);
   
   ctx.fillStyle = "rgb(255, 255, 255)";
   lander_hud_dot(ctx, lander_ship.p[0], lander_ship.p[2]);
   
   for (var i = 0; i < lander_aliens.length; i++) {
      var alien = lander_aliens[i];
      
      if (alien.get_state() != lander_alien_state_dead) {
         if (alien.alpha < 1.0)
            alien.alpha = Math.min(alien.alpha + 0.05, 1.0);
      
         ctx.fillStyle = j3d_util_rgbacolor(255, 0, 0, alien.alpha);
   
         lander_hud_dot(ctx, alien.p[0], alien.p[2]);
      }
   }
}

export { lander_hud_draw }