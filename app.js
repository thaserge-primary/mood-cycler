'use strict';

const Homey = require('homey');

class MoodCyclerApp extends Homey.App {
  async onInit() {
    this.log('Mood Cycler app initialized');
  }
}

module.exports = MoodCyclerApp;
