var vertices = new Array();
var edges = new Array();
var canvas;
var context;
var radius = 10;
var edge_width = 2;
var edge_selected_color = "red";
var vertex_selected_color = "blue";
var edge_intersection_color = "pink";
var current_vertex;
var curr_idx = -1;
var previous_vertex;
var clicked_vertex = -1;
var debug = false;

function reset_everything() {
  vertices = new Array();
  edges = new Array();
  current_vertex = null;
  previous_vertex = null;
  clicked_vertex = -1;
  draw();
}

function init() {
  canvas = document.getElementById('graph_canvas');
  context = canvas.getContext('2d');
  canvas.addEventListener('mousedown', my_mouse_down, false);
  canvas.addEventListener('mouseup', my_mouse_up, false);
  canvas.addEventListener('mousemove', my_mouse_move, false);
  canvas.addEventListener('keydown', my_key_down, false);
  canvas.addEventListener('dblclick', my_dbl_click, false);
  draw();
  if(debug){
    alert("LOL I'M CHANGING STUFF RIGHT NOW LOL");
  }
}

function my_dbl_click(event) {
  if(document.options.mode[0].checked) {
    var x = event.offsetX;
    var y = event.offsetY;
    var clicked_index = get_clicked(x,y);
    if(debug) { 
      console.log("Removing vertex " + clicked_index + 1);
    }
    for(var i = 0; i < edges.length; i++) {
      var vertex = vertices[clicked_index];
      if(edges[i].v1 == vertex || edges[i].v2 == vertex) {
        edges.splice(i,1);
        i--;
      }
    }
    vertices.splice(clicked_index, 1);
    draw();
  }
}

function my_key_down(event) {
  if(debug) {
    console.log(event);
  }
}

function my_mouse_up(event) {
  clicked_vertex = -1;
  draw();
}

function my_mouse_move(event) {
  var x = event.offsetX;
  var y = event.offsetY;
  if(clicked_vertex != -1) {
    vertices[clicked_vertex].x = x;
    vertices[clicked_vertex].y = y;
    draw();
  }
}

function my_mouse_down(event) {
  if(debug) {
    console.log("you clicked");
  }
  var stuff = calculate_position(event);
  var x = event.offsetX;
  var y = event.offsetY;
  if(debug) {
    console.log(x + " " + y);
  }
  var clicked_index = get_clicked(x,y);
  clicked_vertex = clicked_index;
  if(clicked_vertex != -1) {
    curr_idx = clicked_vertex;
  }
  // vertex mode
  if(document.options.mode[0].checked) {
    previous_vertex = null;
    current_vertex = null;
    if(debug) {
      console.log("vertex mode selected");
    }
    if(clicked_index == -1) {
      if(debug) {
        console.log("makeing a new vertex");
      }
      var myvertex = new vertex(x,y);
      add_vertex(myvertex);
    } else {
      if(debug) {
        console.log("selecting vertex " + clicked_index);
      }
      //vertices[clicked_index].selected = !vertices[clicked_index].selected;
      //previous_vertex = current_vertex;
      //current_vertex= vertices[clicked_index];
    }
  }
  //edge mode
  if(document.options.mode[1].checked) {
    if(debug) {
      console.log("edge mode selected");
    }
    if(clicked_index == -1) { // user did not click on a vertex
      previous_vertex = null; current_vertex;
      current_vertex= null; vertices[clicked_index];
      d_min = 11;
      d_min_index = -1;
      for(var i = 0; i < edges.length; i++) {
        var x1 = edges[i].v1.x;
        var y1 = edges[i].v1.y;
        var x2 = edges[i].v2.x;
        var y2 = edges[i].v2.y;
        // make sure we're not above/below both points or left/right of 
        // both points, then calculate the distance to the line
        if(!((x > x1 && x > x2) || (x < x1 && x < x2) || (y > y1 && y > y2)
              || (y < y1 && y < y2)) ) {

          var d = Math.abs((x2-x1)*(y1-y) - (x1-x)*(y2-y1)) /
            Math.sqrt( Math.pow(x2-x1,2) + Math.pow(y2 - y1,2));
          if( d <= 5 && d < d_min ) {
            d_min = d;
            d_min_index = i;
          }
          if(debug) {
            console.log(d);
          }
        }
      }
      if(d_min_index != -1) {
        edges[d_min_index].selected = !edges[d_min_index].selected;
      }
    } else { // try and draw an edge
      previous_vertex = current_vertex;
      current_vertex= vertices[clicked_index];
      if(previous_vertex != null && current_vertex != null && 
          previous_vertex != current_vertex) {
        var exists_edge= false;
        for(var i = 0; i < edges.length; i++) {
          var v1 = edges[i].v1;
          var v2 = edges[i].v2
          if((v1 == previous_vertex || v2 == previous_vertex)
              && 
              (v1 == current_vertex || v2 == current_vertex)) {
            exists_edge = true;
            edges.splice(i,1);
            break;
          }
        }
        if(!exists_edge) {
          add_edge(new edge(previous_vertex, current_vertex));		
        }
        else {
          if(debug) {
            console.log("that edge already exists");
          }
        }
        previous_vertex = null;
        current_vertex = null;
      }
    }
  }
  draw();
}

function calculate_position(e) {
  var x = 0;
  var y = 0; 
  if(!e) var e = window.event;
  if(e.pageX || e.pageY) {
    x = e.pageX;
    y = e.pageY;
  }
  else if (e.clientX || e.clientY) {
    x = e.clientX + document.body.scrollLeft + canvas.scrollLeft;
    y = e.clientY + document.body.scrollTop + canvas.scrollTop;
  }
  return [x, y];
}

function draw() {
  context.clearRect(0,0,500,500);
  draw_vertices();
  draw_edges();
  write_stats();
}

function write_stats() {
  write_vertex_stats();
  write_edge_stats();
  write_graph();
}

function write_vertex_stats() {
  var num_v = document.getElementById("num_v"); 
  num_v.innerHTML = vertices.length;
  var thing = document.getElementById("selected_vertex");
  if(curr_idx != -1) {
    thing.innerHTML = curr_idx + 1; 
  }
}

function write_edge_stats() {
  var num_e = document.getElementById("num_e");
  num_e.innerHTML = edges.length;
}

function write_graph() {
  var graph_area = document.getElementById("graph_area");
  graph_area.innerHTML = "<pre>" + generate_graphviz() + "</pre>";
}

function get_clicked(x,y) {
  var answer = -1;
  for(var i = 0; i < vertices.length; i++) {
    var h = vertices[i].x;
    var k = vertices[i].y;
    if(Math.sqrt(Math.pow(x - h,2) + Math.pow(y - k,2)) <= radius) {
      return i;
    }
  }
  return answer;
}

function draw_vertices() {
  for(var i = 0; i < vertices.length; i++) {
    var x = vertices[i].x;
    var y = vertices[i].y;
    var color = vertices[i].color;
    if(i == clicked_vertex /*vertices[i].selected*/) {
      color = vertex_selected_color;
    }
    if(vertices[i] == current_vertex || vertices[i] == previous_vertex) {
      color = vertex_selected_color;
    }
    context.beginPath();
    context.fillStyle = color;
    context.arc(x, y, radius, 0, 2*Math.PI, true);
    context.fill();
    context.fillStyle = "white";
    context.fillText(i + 1 + "", x, y);
  }
}

function draw_edges() {
  var draw_lines = document.options.edge_style[0].checked;
  for(var i = 0; i < edges.length; i++) {
    var v1 = edges[i].v1;
    var v2 = edges[i].v2;
    var v1exists = true;
    var v2exists = true;
    for(var j = 0; j < vertices.length; j++) {
      if(vertices[j] == v1) {
        v1exists = true;
      }
      if(vertices[j] == v2) {
        v2exists = true;
      }
    }
    if(debug) {
      console.log(v1exists + " " + v2exists);
    }
    if(v1exists && v2exists) {
      var color = edges[i].color;
      if(document.options.edge_intersection.checked) { 
        if(get_intersections(edges[i]).length > 0) {
          color = edge_intersection_color; 
        }
      }
      if(edges[i].selected) {
        color = edge_selected_color;
      }
      if(draw_lines) {
        context.strokeStyle = color;
        context.lineWidth = edge_width;
        context.beginPath();
        context.moveTo(v1.x,v1.y);
        context.lineTo(v2.x,v2.y);
        context.stroke();
        context.fillStyle = "black";
        context.fillText(i + 1 + "", (v1.x + v2.x)/2, (v1.y + v2.y)/2);
      } else {
        var dx = v1.x - v2.x; var dy = v1.y - v2.y;
        var x4; var y4;
        var x3 = (v1.x + v2.x)/2;
        var y3 = (v1.y + v2.y)/2;
        if(dx == 0) {
          x4 = x3 - 40;
          y4 = y3;
        } else {
          var m = (v1.y - v2.y)/(v1.x - v2.x);
          x4 = (-40 * Math.sqrt(Math.pow(m,2) + Math.pow(m,4)) + x3 + Math.pow(m,2)*x3) /
            (1 + Math.pow(m,2));
          y4 = -1/m * (x4 - x3) + y3;
        }
        context.beginPath();
        context.moveTo(v1.x,v1.y);
        context.quadraticCurveTo(x4, y4, v2.x, v2.y);
        context.stroke();
        context.fillStyle = "black";
        context.fillText(i + 1 + "", (v1.x + v2.x)/2, (v1.y + v2.y)/2);
      }
    }
  }
}

function get_intersections(e) {
  var answer = new Array();
  for(var i = 0; i < edges.length; i++) {
    if(edges[i] != e) {
      var x1 = e.v1.x; var y1 = e.v1.y; 
      var x2 = e.v2.x; var y2 = e.v2.y;
      var x3 = edges[i].v1.x; var y3 = edges[i].v1.y;
      var x4 = edges[i].v2.x; var y4 = edges[i].v2.y;

      var m1 = (y1 - y2) / (x1 - x2);
      var m2 = (y3 - y4) / (x3 - x4);

      var x;

      if(Math.abs(x1 - x2) < 1e-12) {
        x = x1;
      }
      else {
        x = (-1 * m2*x3 + y3 + m1 * x1 - y1) / (m1 - m2);
      }

      var min1 = Math.min(x1,x2);
      var max1 = Math.max(x1,x2);
      var min2 = Math.min(x3,x4);
      var max2 = Math.max(x3,x4);

      if(document.options.edge_intersection_point.checked) {
        context.beginPath();
        context.fillStyle = "pink";
        context.arc(x, m1*(x - x1) + y1, radius, 0, 2*Math.PI, true);
        context.fill();
      }

      x = parseInt(x+1);
      if( min1 < x - 1 && x < max1 && min2 < x - 1 && x < max2 ) {
        answer.push(e);  
      }
    }
  }
  return answer;
}

function add_edge(edge) {
  edges.push(edge);	
}

function add_vertex(vertex) {
  vertices.push(vertex);
}

function vertex(x,y) {
  this.x = x;
  this.y = y;
  this.color = "orange";
  this.selected = false;
}

function edge(v1, v2) {
  this.v1 = v1;
  this.v2 = v2;
  this.color = "black";
  this.selected = false;
}

function get_vertex_name(v) {
  var name = -1;
  for(var i = 0; i < vertices.length; i++) {
    if(v == vertices[i]) {
      name = i+1;
      break;
    }
  }
  return name;
}

function generate_graphviz() {
  var graph = "graph G { \n";
  for(var i = 0; i < edges.length; i++) {
    var v1 = edges[i].v1;
    var v2 = edges[i].v2;
    graph += "\t" + get_vertex_name(v1) + " -- " + 
      get_vertex_name(v2) + "; \n";
  }
  graph += "}"
    return graph;
}

function complete_graph() {
  var n = parseInt(document.options.user_num.value);
  if(n < 1) {
    alert("Invalid entry");
  }
  reset_everything();
  var r = 200;
  for(var i = 0; i < n; i++) {
    var t = i*2*Math.PI / n; 
    var x = 250 + r*Math.cos(t);
    var y = 250 + r*Math.sin(t);
    vertices.push(new vertex(x,y));
  }
  for(var i = 0; i < n; i++) {
    for(var j = i + 1; j < n; j++) {
      edges.push(new edge(vertices[i], vertices[j]));
    }
  }
  draw();
}

