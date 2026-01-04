'use strict';

const Homey = require('homey');
const { HomeyAPI } = require('homey-api');

class MoodCyclerApp extends Homey.App {

  async onInit() {
    this.log('Mood Cycler app is initializing...');

    // Create HomeyAPI instance for accessing moods, zones, etc.
    // Requires permission: homey:manager:api
    this.homeyApi = await HomeyAPI.createAppAPI({
      homey: this.homey,
    });

    this.log('HomeyAPI instance created');

    // Register flow action cards
    this._registerFlowCards();

    this.log('Mood Cycler app has been initialized');
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
