'use strict';

const Homey = require('homey');

class MoodCyclerDriver extends Homey.Driver {

  async onInit() {
    this.log('Mood Cycler driver has been initialized');
  }

  async onPair(session) {
    session.setHandler('list_devices', async () => {
      // Return a single virtual device
      // Homey will ask the user which room to add it to
      // The device gets its zone automatically after being added
      return [{
        name: 'Mood Cycler',
        data: {
          id: 'mood-cycler'
        },
        store: {
          moods: [],
          currentIndex: 0,
          lastSync: null
        }
      }];
    });
  }

}

module.exports = MoodCyclerDriver;
