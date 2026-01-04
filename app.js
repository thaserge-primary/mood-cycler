'use strict';

const Homey = require('homey');

class MoodCyclerApp extends Homey.App {

  async onInit() {
    this.log('Mood Cycler app has been initialized');

    // Register flow action cards
    this._registerFlowCards();
  }

  _registerFlowCards() {
    // Sync moods action
    const syncMoodsAction = this.homey.flow.getActionCard('sync-moods');
    syncMoodsAction.registerRunListener(async (args) => {
      await args.device.syncMoods();
      return true;
    });

    // Cycle mood action
    const cycleMoodAction = this.homey.flow.getActionCard('cycle-mood');
    cycleMoodAction.registerRunListener(async (args) => {
      await args.device.cycleMood();
      return true;
    });

    this.log('Flow cards registered');
  }

}

module.exports = MoodCyclerApp;
