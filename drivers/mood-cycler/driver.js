'use strict';

const Homey = require('homey');

class MoodCyclerDriver extends Homey.Driver {

  async onInit() {
    this.log('Mood Cycler driver has been initialized');
  }

  async onPairListDevices() {
    // Get HomeyAPI instance from app
    const api = this.homey.app.homeyApi;

  

    const devices = Object.values(zones).map(zone => ({
      name: `Mood Cycler - ${zone.name}`,
      data: {
        id: `mood-cycler-${zone.id}`,
        zoneId: zone.id
      },
      store: {
        moods: [],
        currentIndex: 0,
        lastSync: null
      },
      settings: {
        zoneName: zone.name
      }
    }));

    this.log(`Found ${devices.length} zones for pairing`);
    return devices;
  }

}

module.exports = MoodCyclerDriver;
