/* global d3:true, _:true */

import Ember from 'ember';

export default Ember.Controller.extend({

  title: function() {
    return this.get('model.title');
  }.property('title'),

  activeToggle: 'Platform',

  svgObj: null,
  nodeData: null,
  nodes: null,
  force: d3.layout.force(),

  gameNodes: function (root) {
    var gameNodes = [];
    var diameter = this.diameter;
    root.forEach( function (game) {
      game.packageName = game.Publisher;
      game.className = game.Game;
      game.value = game.Global;
      game.nx = diameter / 2;
      game.ny = diameter / 2;
      gameNodes.push(game);
    });

    this.set('nodeData', gameNodes);

    return {children: gameNodes};
  },

  labels: function (centers) {
    this.svgObj.selectAll(".label").remove();

    this.svgObj.selectAll(".label")
    .data(centers).enter().append("text")
    .attr("class", "label")
    .text(function (d) { return d.name; })
    .attr("transform", function (d) {
      return "translate(" + (d.x + (d.dx / 3)) + ", " + (d.y + 20) + ")";
    });
  },

  diameter: 960,

  svg: function() {

    var diameter = this.diameter,
      color = d3.scale.category10();

    var bubble = d3.layout.pack()
      .sort(null)
      .size([diameter, diameter])
      .padding(1.5);

    var nodes = bubble.nodes(this.gameNodes(this.get('model.games')))
        .filter(function(d) { return d.Game; });

    // this.force
    //   .size([this.diameter, this.diameter])
    //   .gravity(0)
    //   .friction(0)
    //   .on('tick', tick)
    //   .start();

    this.svgObj = d3.select("body").append("svg")
      .remove()
      .attr('width', diameter)
      .attr('height', diameter)
      .attr('class', 'bubble');

    var node = this.svgObj.selectAll(".node")
        .data(nodes);

    node.enter().append("g")
        .attr("class", "node")
        // .attr("cx", function(d) { return d.x; })
        // .attr("cy", function(d) { return d.y; });
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    node.append("title")
        .text(function(d) { return d.Game + ": " + d.Global; });

    node.append("circle")
        .attr("r", function(d) { return d.r; })
        .style("fill", function(d) { return color(d.Platform); });

    node.append("text")
        .attr("dy", ".3em")
        .style("text-anchor", "middle")
        .text(function(d) { if(d.Game) {return d.Game.substring(0, d.r / 4);} });

    d3.select(window.frameElement).style("height", diameter + "px");

    var self = this;
    function tick(e) {
      var nodeData = self.get('nodeData');
      // Push different nodes in different directions for clustering.
      var k = 8 * e.alpha;
      nodeData.forEach(function(o) {
        var xdif = k * 0.3 * (o.nx - o.x);
        var ydif = k * 0.3 * (o.ny - o.y);
        o.y += ydif;
        o.x += xdif;
      });

      node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    }

    this.force.nodes(node.data()).start();

    return this.svgObj.node();
  }.property('none'),

  actions: {
    toggleProperty: function (id) {
      this.set('activeToggle', id);

      var centers, map,
        data = this.get('nodeData');

      centers = _.uniq(_.pluck(data, id)).map(function (d) {
        return {name: d, value: 1};
      });

      map = d3.layout.treemap().size([this.diameter, this.diameter]).ratio(1/1);
      map.nodes({children: centers});

      _.each(data, function(item){
        var category = _.find(centers, {name:item[id]});
        item.nx = category.x + category.dx / 2;
        item.ny = category.y + category.dy / 2;
      });

      this.set('nodeData', data);

      this.force.alpha(0.1).start();

      this.labels(centers);
    }
  }
});
