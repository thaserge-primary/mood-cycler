'use strict';

const Homey = require('homey');

class MoodCyclerDevice extends Homey.Device {

  async onInit() {
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
  }

  async onAdded() {
    this.log('Mood Cycler device has been added');

    // Sync moods immediately after adding the device
    try {
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
   * Get the zone ID for this device
   */
  getZoneId() {
    // First try from device data (set during pairing)
    const data = this.getData();
    if (data && data.zoneId) {
      return data.zoneId;
    }

    // Fallback to store value
    const storedZoneId = this.getStoreValue('zoneId');
    if (storedZoneId) {
      return storedZoneId;
    }

    this.error('No zone ID found for device');
    return null;
  }

  /**
   * Sync moods from Homey API for this device's zone
   */
  async syncMoods() {
    const zoneId = this.getZoneId();

    if (!zoneId) {
      throw new Error(this.homey.__('errors.no_zone') || 'No zone ID configured for this device');
    }

    this.log(`Syncing moods for zone: ${zoneId}`);

    try {
      // Get HomeyAPI instance from app
      const api = this.homey.app.homeyApi;

      // Get all moods
      const allMoods = await api.moods.getMoods();

      // Filter moods for this zone
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
      // Activate the mood
      await this.activateMood(nextMood.id);

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
   * Activate a mood with fallback to HomeyScript
   */
  async activateMood(moodId) {
    try {
      // Try direct activation via flow card action
      await this.homey.app.homeyApi.flow.runFlowCardAction({
        uri: `homey:mood:${moodId}`,
        id: `homey:mood:${moodId}:set`,
        args: {}
      });
      this.log(`Mood ${moodId} activated directly`);
    } catch (err) {
      // Check if it's a scope/permission error
      if (err.message && (err.message.includes('Missing Scopes') ||
          err.message.includes('missing_scopes') ||
          err.message.includes('scopes'))) {
        this.log('Direct activation failed, trying HomeyScript fallback...');
        await this.activateMoodViaScript(moodId);
      } else {
        throw err;
      }
    }
  }

  /**
   * Fallback: Activate mood via HomeyScript
   * Requires HomeyScript app installed and a script named 'mood-cycler-activate'
   */
  async activateMoodViaScript(moodId) {
    try {
      await this.homey.app.homeyApi.flow.runFlowCardAction({
        uri: 'homey:app:com.athom.homeyscript',
        id: 'homey:app:com.athom.homeyscript:run',
        args: {
          script: 'mood-cycler-activate',
          argument: moodId
        }
      });
      this.log(`Mood ${moodId} activated via HomeyScript`);
    } catch (error) {
      this.error('HomeyScript fallback failed:', error);
      throw new Error('Failed to activate mood. Please check that HomeyScript is installed and the mood-cycler-activate script exists. See README for setup instructions.');
    }
  }

  /**
   * Get device status for settings page
   */
  async getStatus() {
    return {
      zoneId: this.getZoneId(),
      moods: this.getStoreValue('moods') || [],
      currentIndex: this.getStoreValue('currentIndex') || 0,
      lastSync: this.getStoreValue('lastSync')
    };
  }

}

module.exports = MoodCyclerDevice;
