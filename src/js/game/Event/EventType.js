/**
 * Enum for event types.
 * @namespace
 * @property {number} WhenTouched - Fired when an entity is touched.
 * @property {number} WhenUsed - Fired when an entity is "used".
 * @property {number} WhenSpawned - Fired when an entity spawns.
 * @property {number} WhenAttacked - Fired when an entity is under attack.
 * @property {number} WhenNight - Fired when the night starts.
 * @property {number} WhenDay - Fired when the day starts.
 * @property {number} WhenNightGlobal - TODO.
 * @property {number} WhenDayGlobal - TODO.
 * @property {number} WhenRun - Fired when an entity runs.
 */
const EventType = Object.freeze({
	WhenTouched: 0,
	WhenUsed: 1,
	WhenSpawned: 2,
	WhenAttacked: 3,
	WhenNight: 4,
	WhenDay: 5,
	WhenNightGlobal: 6,
	WhenDayGlobal: 7,
	WhenRun: 8
});
