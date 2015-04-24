import Ember from 'ember';

export default Ember.Controller.extend({

  title: function() {
    return this.get('model.title');
  }.property('title'),

  test: function() {
    return this.get('model.games');
  }.property('games')

});
