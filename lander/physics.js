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

const lander_physics_g = [0, 0.003, 0, 0];
const lander_physics_a = [0, -0.01, 0, 0];

var lander_ship;
var lander_aliens = new Array();

function lander_physics_adjust(v)
{
   if (v[0] < lander_ship.p[0] - lander_ground_size / 2)
      v[0] += lander_ground_size;
   else
      if (v[0] > lander_ship.p[0] + lander_ground_size / 2)
         v[0] -= lander_ground_size;
   
   if (v[2] < lander_ship.p[2] - lander_ground_size / 2)
      v[2] += lander_ground_size;
   else
      if (v[2] > lander_ship.p[2] + lander_ground_size / 2)
         v[2] -= lander_ground_size;
}

function lander_physics_dot(_p, _v)
{
   var t = 0;
   
   var p = _p;
   var v = _v;   
   
   this.tick = function() 
   {
      t++;
      
      v = j3d_vector_add(v, lander_physics_g);
      p = j3d_vector_add(p, v);

      lander_physics_adjust(p);
      
      return t > 16 || p[1] >= lander_ground_height(p[0], p[2]);
   };

   this.draw = function(cam)
   {
      var vec1 = j3d_matrix_multiply([p], cam);
      var vec2 = j3d_matrix_dehomogenize(vec1);
            
      lander_sort.add_particle(vec2[0], j3d_util_rgbacolor(255, 255, 255, (17 - t) / 16), 1, 0, -0.04);
   };
}

const lander_bullet_kind_player = 0;
const lander_bullet_kind_enemy  = 1;

function lander_physics_bullet(_p, _v, _kind)
{
   var p = _p;
   var v = _v;   

   var kind = _kind;   
   
   this.tick = function() 
   {
      v = j3d_vector_add(v, lander_physics_g);
      p = j3d_vector_add(p, v);

      lander_physics_adjust(p);

      if (kind == lander_bullet_kind_player) {
         for (var i = 0; i < lander_aliens.length; i++)
            if (lander_aliens[i].check_bullet(p))
               return true;
      } else {
         if (lander_ship.check_bullet(p))
            return true;
      }
            
      return p[1] >= lander_ground_height(p[0], p[2]);
   };

   this.draw = function(cam)
   {
      if (p[0] > lander_ship.p[0] - lander_ground_range && p[0] < lander_ship.p[0] + lander_ground_range && p[2] > lander_ship.p[2] - lander_ground_range && p[2] < lander_ship.p[2] + lander_ground_range) {
         var vec1 = j3d_matrix_multiply([p], cam);
         var vec2 = j3d_matrix_dehomogenize(vec1);
               
         lander_sort.add_particle(vec2[0], j3d_util_rgbcolor(255, 255, 255), 2, 0, -0.04);
      }
   };
}

function lander_physics_debris(_p, _v)
{
   var p = _p;
   var v = _v;   
   var r = [Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, 0];
   var w = [Math.random() * 0.2 - 0.1, Math.random() * 0.2 - 0.1, Math.random() * 0.2 - 0.1, 0];

   function matrix(p, r)
   {
      var mat_rx = j3d_matrix_rotate_x(r[0]);
      var mat_ry = j3d_matrix_rotate_y(r[1]);
      var mat_rz = j3d_matrix_rotate_z(r[2]);
      var mat_tr = j3d_matrix_translate(p[0], p[1], p[2]);
      
      var mat1 = j3d_matrix_multiply(mat_rx, mat_ry);
      var mat2 = j3d_matrix_multiply(mat1, mat_rz);
      var mat3 = j3d_matrix_multiply(mat2, mat_tr);
      
      return mat3;
   }
   
   this.tick = function() 
   {
      v = j3d_vector_add(v, lander_physics_g);
      p = j3d_vector_add(p, v);
      r = j3d_vector_add(r, w);
      
      lander_physics_adjust(p);
      
      return v[1] > 0 && p[1] >= lander_ground_height(p[0], p[2]);
   };

   var model1 = null;
   var model2 = null;
   var model3 = null;

   this.draw = function(cam)
   {
      var mat = matrix(p, r);

      model1 = lander_clip.clip_model(lander_model_debris, mat, model1);
      lander_light.light_model(model1, mat);
      model2 = j3d_model_multiply(model1, j3d_matrix_multiply(mat, cam), model2);
      model3 = j3d_model_dehomogenize(model2, model3);

      lander_sort.add_model(model3, 0);
   };
}

const lander_alien_state_flying = 0;
const lander_alien_state_dead   = 1;

function lander_physics_alien1(_p, a)
{
   const speed = 0.02;

   const bullet_speed = 0.05;
      
   const width  = alien1_a;
   const height = alien1_c;
   
   const state_flying = lander_alien_state_flying;
   const state_dead   = lander_alien_state_dead;

   var t = 100;
   var c = 0;
   
   var p = _p;
   var v = [speed * Math.sin(a), 0, speed * Math.cos(a), 0];   
   var r = 0.0;

   var health = 1.0;
   
   var state = state_flying;

   this.p = p;
   
   this.alpha = 0.0;
   
   this.get_state = function()
   {
      return state;
   }
         
   function matrix(p, r)
   {
      var mat_ry = j3d_matrix_rotate_y(r);
      var mat_tr = j3d_matrix_translate(p[0], p[1], p[2]);
      
      var mat1 = j3d_matrix_multiply(mat_ry, mat_tr);
      
      return mat1;
   }

   this.tick = function() 
   {
      if (state == state_flying) {
         p = j3d_vector_add(p, v, p);
         r += 0.04;
   
         p[1] = lander_ground_height(p[0], p[2]) - 3;
               
         lander_physics_adjust(p);
   
         var s = j3d_vector_subtract(lander_ship.p, p);
         var h = s[1];
   
         s[1] = 0.0;

         var r = j3d_vector_magnitude(s);
                  
         if (r > 1 && r < 5 && h > -5 && t < 0) {
            var bullet_p = p;
            var bullet_v = j3d_vector_multiply(j3d_vector_normalize(s), bullet_speed);

            r /= bullet_speed;
                        
            bullet_v[1] = h / r - 0.5 * lander_physics_g[1] * r;
      
            lander_physics_objects.push(new lander_physics_bullet(bullet_p, bullet_v, lander_bullet_kind_enemy));
             
            if (c++ < 5)
               t = 6;
            else {
               t = 120;
               c = 0;
            }
         } else
            t--;
      }
      
      return false;
   };

   this.check_bullet = function(bullet_p)
   {
      if (state == state_flying &&
          bullet_p[0] > p[0] - width && 
          bullet_p[0] < p[0] + width &&
          bullet_p[1] > p[1] - height && 
          bullet_p[1] < p[1] + height &&
          bullet_p[2] > p[2] - width && 
          bullet_p[2] < p[2] + width) {
         health -= 0.2;
         
         if (health <= 0.0) {
            lander_physics_add_explosion(p);
            
//            state = state_dead;
            
            health = 1.0;
            alpha = 0.0;
            
            j3d_vector_add(p, [16, 0, 16, 0], p);            
         }
         
         return true;
      } else
         return false;
   };
   
   var model1 = null;
   var model2 = null;
   var model3 = null;
   
   this.draw = function(cam)
   {
      if (state != state_dead) {
         var range = lander_ground_range + alien1_a;
         
         if (p[0] > lander_ship.p[0] - range && p[0] < lander_ship.p[0] + range && p[2] > lander_ship.p[2] - range && p[2] < lander_ship.p[2] + range) {
            var mat = matrix(p, r);
      
            model1 = lander_clip.clip_model(lander_model_alien1, mat, model1);
            lander_light.light_model(model1, mat);
            model2 = j3d_model_multiply(model1, j3d_matrix_multiply(mat, cam), model2);
            model3 = j3d_model_dehomogenize(model2, model3);
      
            lander_sort.add_model(model3, 0);
         }
      }
   };
}

function lander_physics_ship(_p, _v)
{
   const width  = 0.5;
   const height = 0.2;
   
   const state_landed = 0;
   const state_flying = 1;
   const state_dead   = 2;
      
   var t = 0;
   
   var p = _p;
   var v = [0, 0, 0, 0];   
   var r = [0, Math.PI / 4, 0, 0];

   var fuel = 0.0;
   var health = 1.0;

   var state = state_landed;

   this.p = p;
   this.r = r;

   this.get_fuel = function()
   {
      return fuel;
   }

   this.get_health = function()
   {
      return health;
   }
   
   function matrix(p, r)
   {
      var mat_rx = j3d_matrix_rotate_x(r[0]);
      var mat_ry = j3d_matrix_rotate_y(r[1]);
      var mat_tr = j3d_matrix_translate(p[0], p[1], p[2]);
      
      var mat1 = j3d_matrix_multiply(mat_rx, mat_ry);
      var mat2 = j3d_matrix_multiply(mat1, mat_tr);
      
      return mat2;
   }
   
   this.tick = function() 
   {
      switch (state) {
      case state_landed:
      {
         fuel += 0.002;
         
         if (fuel > 1.0)
            fuel = 1.0;
            
         if (lander_input_lmb_pressed)
            state = state_flying;
            
         break;
      }   
      case state_flying:
      {
         r[0] += lander_input_dy / 32;
         r[1] += lander_input_dx / 32;
         
         if (r[0] < -Math.PI / 2)
            r[0] = -Math.PI / 2;
         if (r[0] > Math.PI / 2)
            r[0] = Math.PI / 2;
      
         var mat = matrix(p, r);
                  
         if (lander_input_lmb_pressed && fuel > 0.0) {
            var a = j3d_matrix_multiply([lander_physics_a], mat)[0];
            
            j3d_vector_add(v, a, v);
            
            var dot_p = j3d_matrix_multiply([[0.2 * Math.random() - 0.1, 0.2, 0.2 * Math.random() - 0.1, 1]], mat)[0];
            var dot_v = j3d_matrix_multiply([[0.01 * Math.random() - 0.005, 0.15 + 0.05 * Math.random(), 0.01 * Math.random() - 0.005, 0]], mat)[0];
      
            lander_physics_objects.push(new lander_physics_dot(dot_p, dot_v));
            
            fuel -= 0.0002;
            
            if (fuel < 0.0)
               fuel = 0.0;
         }

         if (lander_input_rmb_pressed && t < 0) {
            var bullet_p = j3d_matrix_multiply([[0.0, 0.0, 0.3, 1.0]], mat)[0];
            var bullet_v = j3d_matrix_multiply([[0.0, 0.0, 0.2, 0.0]], mat)[0];
      
            lander_physics_objects.push(new lander_physics_bullet(bullet_p, bullet_v, lander_bullet_kind_player));
            
            t = 2;
         } else
            t--;
                  
         j3d_vector_add(v, lander_physics_g, v);
         j3d_vector_multiply(v, 0.98, v);
         
         j3d_vector_add(p, v, p);
   
         var height = lander_ground_height(p[0], p[2]);
               
         if (p[1] > height) {
            var x = Math.floor(p[0]) & lander_ground_mask;
            var z = Math.floor(p[2]) & lander_ground_mask;
            
            if (x >= lander_ground_pad_x && x < lander_ground_pad_x + 4 && 
                z >= lander_ground_pad_z && z < lander_ground_pad_z + 4 && 
                r[0] > -0.3 && r[0] < 0.3 && 
                v[0] > -0.3 && v[0] < 0.3 && 
                v[1] > -0.1 && v[1] < 0.1 &&
                v[2] > -0.3 && v[2] < 0.3) {
               state = state_landed;
               
               p[1] = height;
               v = [0, 0, 0, 0];
               r[0] = 0;
            } else {
               state = state_dead;
               
               health = 0.0;
               
               lander_physics_add_explosion(p);
            }
         }
         break;
      }         
      case state_dead:
      {
         break;
      }
      }
      
      lander_input_dx = 0;
      lander_input_dy = 0;   
            
      return false;
   };
   
   this.check_bullet = function(bullet_p)
   {
      if (state != state_dead &&
          bullet_p[0] > p[0] - width && 
          bullet_p[0] < p[0] + width &&
          bullet_p[1] > p[1] - height && 
          bullet_p[1] < p[1] + height &&
          bullet_p[2] > p[2] - width && 
          bullet_p[2] < p[2] + width) {
         health -= 0.02;
         
         if (health <= 0.0) {
            lander_physics_add_explosion(p);
            
            state = state_dead;
         }
         
         return true;
      } else
         return false;
   };

   var model1 = null;
   var model2 = null;
      
   this.draw = function(cam)
   {
      if (state != state_dead) {
         var mat = matrix(p, r);
      
         lander_light.light_model(lander_model_ship, mat);
         model1 = j3d_model_multiply(lander_model_ship, j3d_matrix_multiply(mat, cam), model1);
         model2 = j3d_model_dehomogenize(model1, model2);

         lander_sort.add_model(model2, 1);
      }
   };
}

function lander_physics_add_explosion(p)
{
   for (var i = 0; i < 8; i++) {
      var debris = new lander_physics_debris(j3d_vector_copy(p), [0.1 * Math.random() - 0.05, -0.05 * Math.random() - 0.1, 0.1 * Math.random() - 0.05, 0.0]);
      
      lander_physics_objects.push(debris);
   }
}

var lander_physics_objects = [];

function lander_physics_init()
{
   lander_ship = new lander_physics_ship([lander_ground_pad_x + 2, lander_ground_height(lander_ground_pad_x + 2, lander_ground_pad_z + 2), lander_ground_pad_z + 2, 1]);
   lander_physics_objects.push(lander_ship);

   for (var i = 0; i < 4; i++) {
      var alien = new lander_physics_alien1([Math.random() * lander_ground_size, 0, Math.random() * lander_ground_size, 1], Math.random() * Math.PI * 2);
      
      lander_aliens.push(alien);
      lander_physics_objects.push(alien);
   }
}

function lander_physics_tick()
{
   for (var i = 0; i < lander_physics_objects.length; ) {
      var obj = lander_physics_objects[i];
      
      if (obj.tick())
         lander_physics_objects.splice(i, 1);
      else
         i++;
   }
}

function lander_physics_draw(cam)
{
   for (var i = 0; i < lander_physics_objects.length; i++) {
      var obj = lander_physics_objects[i];

      obj.draw(cam);
   }
}