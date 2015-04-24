import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return Ember.$.getJSON('http://localhost:4200/data/game-sales.json');
  }
});
