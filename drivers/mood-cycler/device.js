'use strict';

const Homey = require('homey');

class MoodCyclerDevice extends Homey.Device {

  async onInit() {
    this.log('Mood Cycler device has been initialized');

    // Register capability listener for the button
    this.registerCapabilityListener('button', async () => {
      await this.cycleMood();
    });
  }

  async onAdded() {
    this.log('Mood Cycler device has been added');
    // No auto-sync - user must run sync via Flow
  }

  async onDeleted() {
    this.log('Mood Cycler device has been deleted');
  }

  /**
   * Sync moods from Homey for this device's zone
   * Called via Flow action "sync-moods"
   */
  async syncMoods() {
    // this.getZone() returns string zoneId directly
    const zoneId = this.getZone();

    if (!zoneId) {
      throw new Error('Device not assigned to a zone');
    }

    this.log(`Syncing moods for zone: ${zoneId}`);

    // Use built-in SDK manager to get moods
    const allMoods = await this.homey.moods.getMoods();

    // Filter moods for this zone (mood.zone is a string zoneId)
    const zoneMoods = Object.values(allMoods)
      .filter(mood => mood.zone === zoneId)
      .map(mood => ({
        id: mood.id,
        name: mood.name
      }));

    // Save to store
    await this.setStoreValue('moods', zoneMoods);
    await this.setStoreValue('currentIndex', 0);
    await this.setStoreValue('lastSync', new Date().toISOString());

    this.log(`Synced ${zoneMoods.length} moods for zone ${zoneId}`);

    // Log mood names for debugging
    zoneMoods.forEach((mood, index) => {
      this.log(`  ${index + 1}. ${mood.name}`);
    });

    return zoneMoods;
  }

  /**
   * Cycle to the next mood in the list
   * Called via Flow action "cycle-mood" or button press
   */
  async cycleMood() {
    const moods = this.getStoreValue('moods');

    if (!moods || moods.length === 0) {
      throw new Error('No moods synced. Run sync first.');
    }

    // Get current index
    let currentIndex = this.getStoreValue('currentIndex') || 0;

    // Calculate next index (circular)
    const nextIndex = (currentIndex + 1) % moods.length;
    const nextMood = moods[nextIndex];

    this.log(`Cycling mood: ${nextMood.name} (${nextIndex + 1}/${moods.length})`);

    // Activate the mood using built-in SDK manager
    await this.homey.moods.setMood({ id: nextMood.id });

    // Save new index
    await this.setStoreValue('currentIndex', nextIndex);

    this.log(`Activated mood: ${nextMood.name}`);

    return nextMood;
  }

  /**
   * Get device status for settings page
   */
  getStatus() {
    return {
      zoneId: this.getZone(),
      moods: this.getStoreValue('moods') || [],
      currentIndex: this.getStoreValue('currentIndex') || 0,
      lastSync: this.getStoreValue('lastSync')
    };
  }

}

module.exports = MoodCyclerDevice;
