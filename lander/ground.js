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

const lander_ground_size = 32;
const lander_ground_mask = lander_ground_size - 1;
const lander_ground_model_size = 12;
const lander_ground_vscale = 8;

const lander_ground_pad_x = 14;
const lander_ground_pad_z = 14;

const lander_ground_range = (lander_ground_model_size - 1) / 2;

function lander_ground_make_pad_alt(alt, x, z)
{
   var avg = 0;
   
   for (var ox = 0; ox <= 4; ox++)
      for (var oz = 0; oz <= 4; oz++)
         avg += alt[x + ox][z + oz];
      
   avg /= 25;
 
   if (avg < 0.3)
      avg = 0.3;
     
   for (var ox = 0; ox <= 4; ox++)
      for (var oz = 0; oz <= 4; oz++)
         alt[x + ox][z + oz] = avg;
}
               
function lander_ground_make_pad_mat(mat, x, z)
{
   for (var ox = 0; ox < 4; ox++)
      for (var oz = 0; oz < 4; oz++) {
         var grey = (Math.random() + 3.0) / 8.0;
      
         mat[x + ox][z + oz] = {static: lander_light.light_face([0.0, -1.0, 0.0, 0.0], null, {ambient: [0, 0, 0], diffuse: [grey, grey, grey], specular: [0, 0, 0], phong: 0.0})};
      }
}

function lander_ground_make(size)
{
   /*
      build altitude
   */
   
   var alt = j3d_util_make2darray(size, size);

   alt[0][0] = 0.0;
   
   for (var len = size; len > 1; len /= 2) {
      for (var x = 0; x < size; x += len) {
         for (var y = 0; y < size; y += len) {
            var v0 = alt[x][y];
            var v1 = alt[(x + len) % size][y];
            var v2 = alt[x][(y + len) % size];
            var v3 = alt[(x + len) % size][(y + len) % size];
   
            alt[x + len / 2][y] = (v0 + v1) / 2 + (Math.random() - 0.5) * len / lander_ground_vscale;
            alt[x][y + len / 2] = (v0 + v2) / 2 + (Math.random() - 0.5) * len / lander_ground_vscale;
            alt[x + len / 2][y + len / 2] = (v0 + v1 + v2 + v3) / 4 + (Math.random() - 0.5) * len / lander_ground_vscale;
         }
      }
   }

   /* 
      clip to sea level
   */

   for (var x = 0; x < size; x++)
      for (var y = 0; y < size; y++) {
         if (alt[x][y] < 0)
            alt[x][y] = 0;
      }
   
   lander_ground_make_pad_alt(alt, lander_ground_pad_x, lander_ground_pad_z);
   
   /*
      build normals and centers
   */

   var nor = j3d_util_make2darray(size, size);
   var cen = j3d_util_make2darray(size, size);

   for (var i = 0; i < size; i++) 
      for (var j = 0; j < size; j++) {
         var a0 = alt[i][j];
         var a1 = alt[(i + 1) % size][j];
         var a2 = alt[i][(j + 1) % size];
         var a3 = alt[(i + 1) % size][(j + 1) % size];

         nor[i][j] = j3d_vector_normalize(j3d_vector_cross([1, a0 - a1, 0, 0], [0, a0 - a2, 1, 0]));
         cen[i][j] = -(a0 + a1 + a2 + a3) / 4;
      }

   /*
      choose colors
   */

   lander_light.transform(j3d_matrix_identity());

   var mat = j3d_util_make2darray(size, size);
   var tre = j3d_util_make2darray(size, size);

   for (var x = 0; x < size; x++)
      for (var z = 0; z < size; z++) {               
            var a0 = alt[x][z];
            var a1 = alt[(x + 1) % size][z];
            var a2 = alt[x][(z + 1) % size];
            var a3 = alt[(x + 1) % size][(z + 1) % size];
         
            if (a0 <= 0 && a1 <= 0 && a2 <= 0 && a3 <= 0) {
               var r = (Math.random() + 1.0) / 16.0;
               var g = (Math.random() + 1.0) / 16.0;
               var b = (Math.random() + 1.0) / 2.0;
            
               mat[x][z] = {ambient: [0, 0, 0], diffuse: [r, g, b], specular: [0.8, 0.8, 0.8], phong: 4.0};
               tre[x][z] = null;
            } else {
               var tone = Math.random();
               
               var r = tone;
               var g = 1.0 - tone / 4.0;
               var b = 0.0;

               mat[x][z] = {static: lander_light.light_face(nor[x][z], null, {ambient: [0, 0, 0], diffuse: [r, g, b], specular: [0, 0, 0], phong: 0.0})};
               tre[x][z] = Math.random() > 0.95 ? Math.random() * Math.PI * 2 : null;
            }
      }

   lander_ground_make_pad_mat(mat, lander_ground_pad_x, lander_ground_pad_z);
      
   return {altitude : alt, materials : mat, normals : nor, centers : cen, trees : tre};
}

function lander_ground_make_model(size)
{
   var model = {vertices: [new Array((size + 1) * (size + 1))],
                normals: [[0, -1, 0, 0]],
                centers: new Array(size * size),
                faces: new Array(size * size)};

   for (var x = 0; x < size + 1; x++)
      for (var z = 0; z < size + 1; z++) 
         model.vertices[0][x + z * (size + 1)] = [x, 0, z, 1];

   for (var x = 0; x < size; x++)
      for (var z = 0; z < size; z++) {
         model.centers[x + z * size] = [x + 0.5, 0, z + 0.5, 1];

         model.faces[x + z * size] = {indices: new Array(4)};

         model.faces[x + z * size].indices[0] = x + z * (size + 1);
         model.faces[x + z * size].indices[1] = x + (z + 1) * (size + 1);
         model.faces[x + z * size].indices[2] = (x + 1) + (z + 1) * (size + 1);
         model.faces[x + z * size].indices[3] = (x + 1) + z * (size + 1);
         
         model.faces[x + z * size].normal = 0;
         model.faces[x + z * size].center = x + z * size;

         var clip = 0;

         if (x == size - 1)
            clip |= 1;
         if (z == size - 1)
            clip |= 2;
         if (x == 0)
            clip |= 4;
         if (z == 0)
            clip |= 8;

         model.faces[x + z * size].clip = clip;
         model.faces[x + z * size].cull = false;
      }

   return model;
}

var lander_ground_model = lander_ground_make_model(lander_ground_model_size);

var lander_ground_prev_x = 1000000;
var lander_ground_prev_z = 1000000;

function lander_ground_setup_model(x, z)
{
   x = Math.floor(x - lander_ground_model_size / 2 + 0.5);
   z = Math.floor(z - lander_ground_model_size / 2 + 0.5);
 
   if (x != lander_ground_prev_x || z != lander_ground_prev_z) {
      lander_ground_prev_x = x;
      lander_ground_prev_z = z;
     
      var vertices = lander_ground_model.vertices[0];
      
      for (var i = 0; i < lander_ground_model_size + 1; i++) {
         var altitude = lander_ground.altitude[x + i & lander_ground_mask];
            
         for (var j = 0; j < lander_ground_model_size + 1; j++)
            vertices[i + j * (lander_ground_model_size + 1)][1] = - altitude[z + j & lander_ground_mask];
      }
 
      var centers = lander_ground_model.centers;
      var faces = lander_ground_model.faces;
        
      for (var i = 0; i < lander_ground_model_size; i++) {
         var ground_centers = lander_ground.centers[x + i & lander_ground_mask];
         var ground_materials = lander_ground.materials[x + i & lander_ground_mask];

         for (var j = 0; j < lander_ground_model_size; j++) {
            centers[i + j * lander_ground_model_size][1] = ground_centers[z + j & lander_ground_mask];
            
            faces[i + j * lander_ground_model_size].material = ground_materials[z + j & lander_ground_mask];
         }
      }
   }
}

function lander_ground_setup_clip(x, z)
{
   lander_clip.planes[0][3] = -(x + lander_ground_range);
   lander_clip.planes[1][3] = -(z + lander_ground_range);
   lander_clip.planes[2][3] = (x - lander_ground_range);
   lander_clip.planes[3][3] = (z - lander_ground_range);
}

function lander_ground_init_map()
{
   var scale = 64 / lander_ground_size;
   
   for (var x = 0; x < lander_ground_size; x++)
      for (var z = 0; z < lander_ground_size; z++) {
         var static = lander_ground.materials[x][z].static;
         
         if (static == null)
            static = "rgb(0, 0, 128)";
         
         map_ctx.fillStyle = static;
         map_ctx.fillRect(x * scale, (lander_ground_size - 1 - z) * scale, scale, scale);
      }
}

function lander_ground_matrix(x, z)
{
   x = Math.floor(x - lander_ground_range);
   z = Math.floor(z - lander_ground_range);
   
   return j3d_matrix_translate(x, 0, z);
}

function lander_ground_height(x, z)
{
   var xt = Math.floor(x);
   var zt = Math.floor(z);
   
   var xf = x - xt;
   var zf = z - zt;
   
   var a0 = - lander_ground.altitude[xt & lander_ground_mask][zt & lander_ground_mask];
   var a1 = - lander_ground.altitude[xt + 1 & lander_ground_mask][zt & lander_ground_mask];
   var a2 = - lander_ground.altitude[xt & lander_ground_mask][zt + 1 & lander_ground_mask];
   var a3 = - lander_ground.altitude[xt + 1 & lander_ground_mask][zt + 1 & lander_ground_mask];
   
   return (a0 * (1 - xf) + a1 * xf) * (1 - zf) + (a2 * (1 - xf) + a3 * xf) * zf;
}

var lander_ground_model1 = null;
var lander_ground_model2 = null;
var lander_ground_model3 = null;
   
function lander_ground_draw(cam)
{
   lander_ground_setup_model(lander_ship.p[0], lander_ship.p[2]);
   lander_ground_setup_clip(lander_ship.p[0], lander_ship.p[2]);
   
   var mat = lander_ground_matrix(lander_ship.p[0], lander_ship.p[2]);
   
   lander_ground_model1 = lander_clip.clip_model(lander_ground_model, mat, lander_ground_model1);
   lander_light.light_model(lander_ground_model1, mat);
   lander_ground_model2 = j3d_model_multiply(lander_ground_model1, j3d_matrix_multiply(mat, cam), lander_ground_model2);
   lander_ground_model3 = j3d_model_dehomogenize(lander_ground_model2, lander_ground_model3);
   
   lander_sort.add_model(lander_ground_model3, 0);
}
