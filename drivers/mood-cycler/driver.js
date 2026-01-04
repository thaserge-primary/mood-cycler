'use strict';

const Homey = require('homey');

class MoodCyclerDriver extends Homey.Driver {

  async onInit() {
    this.log('Mood Cycler driver has been initialized');
  }

  async onPairListDevices() {
    // Get all zones to allow user to create a Mood Cycler for any room
    const api = await this.homey.api.getApi();
    const zones = await api.zones.getZones();

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
