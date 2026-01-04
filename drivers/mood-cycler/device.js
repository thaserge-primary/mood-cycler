'use strict';

const Homey = require('homey');

class MoodCyclerDevice extends Homey.Device {

  async onInit() {
    try {
      this.log('Mood Cycler device has been initialized');

      // Register capability listener for the button
      this.registerCapabilityListener('button', async () => {
        await this.cycleMood();
      });

      // Auto-sync moods on first init if no moods stored
      const moods = this.getStoreValue('moods');
      if (!moods || moods.length === 0) {
        this.log('No moods stored, running initial sync...');
        try {
          await this.syncMoods();
        } catch (error) {
          this.error('Initial sync failed:', error);
        }
      }
    } catch (error) {
      this.error('Failed to initialize device:', error);
    }
  }

  async onAdded() {
    try {
      this.log('Mood Cycler device has been added');

      // Sync moods immediately after adding the device
      await this.syncMoods();
      this.log('Initial mood sync completed');
    } catch (error) {
      this.error('Failed to sync moods on add:', error);
    }
  }

  async onDeleted() {
    this.log('Mood Cycler device has been deleted');
  }

  /**
   * Get the zone ID for this device using SDK method
   */
  getZoneId() {
    try {
      // Use SDK method to get device zone
      const zone = this.getZone();
      if (zone && zone.id) {
        return zone.id;
      }
    } catch (error) {
      this.error('Failed to get zone:', error);
    }

    this.error('No zone found for device');
    return null;
  }

  /**
   * Sync moods from Homey for this device's zone
   */
  async syncMoods() {
    const zoneId = this.getZoneId();

    if (!zoneId) {
      throw new Error(this.homey.__('errors.no_zone') || 'No zone configured for this device');
    }

    this.log(`Syncing moods for zone: ${zoneId}`);

    try {
      // Use built-in SDK manager to get moods
      const allMoods = await this.homey.moods.getMoods();

      // Filter moods for this zone
      // mood.zone is a string ID (not an object)
      const zoneMoods = Object.values(allMoods)
        .filter(mood => mood.zone === zoneId)
        .map(mood => ({
          id: mood.id,
          name: mood.name
        }));

      // Save to store
      await this.setStoreValue('moods', zoneMoods);
      await this.setStoreValue('lastSync', new Date().toISOString());

      // Reset index if it's out of bounds
      const currentIndex = this.getStoreValue('currentIndex') || 0;
      if (currentIndex >= zoneMoods.length) {
        await this.setStoreValue('currentIndex', 0);
      }

      this.log(`Synced ${zoneMoods.length} moods for zone ${zoneId}`);

      // Log mood names for debugging
      zoneMoods.forEach((mood, index) => {
        this.log(`  ${index + 1}. ${mood.name}`);
      });

      return zoneMoods;
    } catch (error) {
      this.error('Failed to sync moods:', error);
      throw new Error(this.homey.__('errors.sync_failed') || 'Failed to sync moods');
    }
  }

  /**
   * Cycle to the next mood in the list
   */
  async cycleMood() {
    const moods = this.getStoreValue('moods') || [];

    if (moods.length === 0) {
      this.log('No moods synced. Please run sync first.');
      throw new Error(this.homey.__('errors.no_moods') || 'No moods available. Please sync first.');
    }

    // Get current index
    let currentIndex = this.getStoreValue('currentIndex') || 0;

    // Calculate next index (circular)
    const nextIndex = (currentIndex + 1) % moods.length;
    const nextMood = moods[nextIndex];

    this.log(`Cycling mood: ${nextMood.name} (${nextIndex + 1}/${moods.length})`);

    try {
      // Activate the mood using built-in SDK manager
      await this.homey.moods.setMood({ id: nextMood.id });

      // Save new index
      await this.setStoreValue('currentIndex', nextIndex);

      this.log(`Activated mood: ${nextMood.name}`);

      return nextMood;
    } catch (error) {
      this.error('Failed to cycle mood:', error);
      throw new Error(this.homey.__('errors.cycle_failed') || 'Failed to cycle mood');
    }
  }

  /**
   * Get device status for settings page
   */
  getStatus() {
    return {
      zoneId: this.getZoneId(),
      moods: this.getStoreValue('moods') || [],
      currentIndex: this.getStoreValue('currentIndex') || 0,
      lastSync: this.getStoreValue('lastSync')
    };
  }

}

module.exports = MoodCyclerDevice;
