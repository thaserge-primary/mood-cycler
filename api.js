'use strict';

module.exports = {

  async getDevices({ homey }) {
    const driver = homey.drivers.getDriver('mood-cycler');
    const devices = driver.getDevices();

    const result = {};
    for (const device of devices) {
      result[device.getData().id] = {
        name: device.getName(),
        store: {
          moods: device.getStoreValue('moods') || [],
          currentIndex: device.getStoreValue('currentIndex') || 0,
          lastSync: device.getStoreValue('lastSync')
        },
        settings: device.getSettings()
      };
    }

    return result;
  }

};
