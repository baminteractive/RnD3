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

  gameNodes: function (root) {
    var gameNodes = [];

    root.forEach( function (game) {
      game.packageName = game.Publisher;
      game.className = game.Game;
      game.value = game.Global;
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
      return "translate(" + (d.x + (d.dx / 2)) + ", " + (d.y + 20) + ")";
    });
  },

  diameter: 960,

  svg: function() {

    var diameter = this.diameter,
      format = d3.format(',d'),
      color = d3.scale.category10();

    var bubble = d3.layout.pack()
      .sort(null)
      .size([diameter, diameter])
      .padding(1.5);

    this.svgObj = d3.select("body").append("svg")
      .remove()
      .attr('width', diameter)
      .attr('height', diameter)
      .attr('class', 'bubble');

    var node = this.svgObj.selectAll(".node")
        .data(bubble.nodes(this.gameNodes(this.get('model.games')))
        .filter(function(d) { return d.Game; }));

    node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    node.append("title")
        .text(function(d) { return d.Game + ": " + format(d.Global); });

    node.append("circle")
        .attr("r", function(d) { return d.r; })
        .style("fill", function(d) { return color(d.Platform); });

    node.append("text")
        .attr("dy", ".3em")
        .style("text-anchor", "middle")
        .text(function(d) { if(d.Game) {return d.Game.substring(0, d.r / 4);} });

    d3.select(window.frameElement).style("height", diameter + "px");

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

      _.each(centers, function(category){
        category.children = _.filter(data, function(n){
          return n[id] === category.name;
        });
      });

      map = d3.layout.treemap().size([this.diameter, this.diameter]).ratio(1/1);
      map.nodes({children: centers});

      this.labels(centers);

      var bubble = d3.layout.pack()
        .sort(null)
        .size([this.diameter, this.diameter])
        .padding(1.5);

      this.svgObj.selectAll(".node")
        .data(bubble.nodes({children: centers}))
        .attr("transform", function (d) {
          return "translate(" + (d.x) + ", " + (d.y) + ")";
        });

    }
  }
});
