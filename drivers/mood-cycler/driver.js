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
      // Use built-in SDK manager to get zones
      const zones = await this.homey.zones.getZones();

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
    } catch (error) {
      this.error('Failed to list devices for pairing:', error);
      return [];
    }
  }

}

module.exports = MoodCyclerDriver;
