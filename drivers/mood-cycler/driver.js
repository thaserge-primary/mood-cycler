'use strict';

const Homey = require('homey');

class MoodCyclerDriver extends Homey.Driver {

  async onInit() {
    try {
      this.log('Mood Cycler driver has been initialized');
    } catch (error) {
      this.error('Failed to initialize driver:', error);
    }
  }

  async onPairListDevices() {
    try {
      // Return a single virtual device
      // Homey will ask the user which room to add it to
      // The device will get its zone automatically after being added
      const devices = [{
        name: 'Mood Cycler',
        data: {
          id: `mood-cycler-${Date.now()}`
        },
        store: {
          moods: [],
          currentIndex: 0,
          lastSync: null
        }
      }];

      this.log('Mood Cycler device available for pairing');
      return devices;
    } catch (error) {
      this.error('Failed to list devices for pairing:', error);
      return [];
    }
  }

}

module.exports = MoodCyclerDriver;
