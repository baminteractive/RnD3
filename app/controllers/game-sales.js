/* global d3:true */

import Ember from 'ember';

export default Ember.Controller.extend({

  title: function() {
    return this.get('model.title');
  }.property('title'),

  svg: function() {
    var gamesArray = this.get('model.games');

    var diameter = 960,
      format = d3.format(',d'),
      color = d3.scale.category20c();

    var bubble = d3.layout.pack()
      .sort(null)
      .size([diameter, diameter])
      .padding(1.5);

      function classes(root) {
        var gameNodes = [];

        root.forEach( function (game) {
          game.packageName = game.Publisher;
          game.className = game.Game;
          game.value = game.Global;
          gameNodes.push(game);
        });

        return {children: gameNodes};
      }

    var svg = d3.select("body").append("svg")
      .remove()
      .attr('width', diameter)
      .attr('height', diameter)
      .attr('class', 'bubble');

    var node = svg.selectAll(".node")
        .data(bubble.nodes(classes(gamesArray))
        .filter(function(d) { return d.Game; }))
      .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    node.append("title")
        .text(function(d) { return d.Game + ": " + format(d.Global); });

    node.append("circle")
        .attr("r", function(d) { return d.r; })
        .style("fill", function(d) { return color(d.Publisher); });

    node.append("text")
        .attr("dy", ".3em")
        .style("text-anchor", "middle")
        .text(function(d) { if(d.Game) {return d.Game.substring(0, d.r / 4);} });

    d3.select(window.frameElement).style("height", diameter + "px");

    return svg.node();
  }.property('svg')

});
