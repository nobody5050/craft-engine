/**
 * @class
 * @hideconstructor
 * @classdesc API for user/designer's code to access the game.
 */
class CodeOrgAPI {
	/*
	 * Attempt completed callback.
	 * @callback onAttemptCompleteCallback
	 * @param {boolean} success - `true` if attempt was successful (level completed),
	 * `false` otherwise.
	 * @param {LevelModel} levelModel - Current level model
	 */

	/*
	 * User error callback.
	 * @callback onErrorCallback
	 * @param {Error} err - Error thrown by the user's code.
	 */

	/**
	 * Highlight callback - You probably don't want to use this callback,
	 * use @{link eventCallback event callbacks} instead.
	 * @callback highlightCallback
	 * @param {Object} [entity] - Target entity.
	 */

	/**
	 * Event callback.
	 * @callback eventCallback
	 * @param {Event} event - The fired event.
	 */

	constructor (controller) {
		this.controller = controller;
	}

	/*
	 * Called before a list of user commands is issued.
	 */
	startCommandCollection() {
		if (this.controller.DEBUG) {
			console.log("Collecting commands.");
		}
	}

	/*
	 * Called when an attempt should be started, and the entire set of
	 * command-queue API calls have been issued.
	 *
	 * @param {onAttemptCompleteCallback} onAttemptComplete
	 * @param {onErrorCallback} onError
	 * @param {CodeOrgAPI} [apiObject] - API object to pass to the user's script.
	 * @return {Promise.<boolean>} a promise for a success value when
	 *   attempt is complete.
	 */
	startAttempt(onAttemptComplete, onError, apiObject) {
		return new Promise(resolve => {
			this.controller.OnCompleteCallback =(...args) => {
				// Note: onAttemptComplete is unused in this repo, but it's
				// part of a public API - it'll be a breaking change to remove it.
				onAttemptComplete && onAttemptComplete(...args);
				resolve(args[0]);
			};
			this.controller.initiateDayNightCycle(this.controller.dayNightCycle, this.controller.dayNightCycle, "day");
			this.controller.setPlayerActionDelayByQueueLength();
			this.controller.queue.begin();
			this.controller.run(onError, apiObject || this);
			this.controller.attemptRunning = true;
			this.controller.resultReported = false;
		});
	}

	resetAttempt() {
		this.controller.reset();
		this.controller.queue.reset();
		this.controller.OnCompleteCallback = null;
		this.controller.attemptRunning = false;
	}

	/**
	 * Adds an event listener - This methods calls your function every signle
	 * time a event is fired, you might want to use {@link onEventTriggered}
	 * to listen to specific events.
	 * @param {highlightCallback} highlightCallback
	 * @param {Function} codeBlockCallback - For example: <pre><code>function (event) {
	 * 	if (event.type !== 'blockDestroyed') {
	 * 		return;
	 * 	}
	 *
	 * 	if (event.blockType !== 'logOak') {
	 * 		return;
	 * 	}
	 *
	 * 	// Do something with the event here
	 *  }</code></pre>
	 */
	registerEventCallback(highlightCallback, codeBlockCallback) {
		this.controller.events.push(codeBlockCallback);
	}

	/**
	 * Adds an event listener that is called only when the event fired is of
	 * type <code>eventType</code>, and the target target is of type <code>targetType</code>.
	 * @param {highlightCallback} highlightCallback
	 * @param {EventType} eventType
	 * @param {TargetType} targetType
	 * @param {Function} callback
	 */
	onEventTriggered(highlightCallback, targetType, eventType, callback) {
		this.registerEventCallback(highlightCallback,
			function (event) {
				if (event.eventType === eventType && event.targetType === targetType) {
					callback(event);
				}
			}
		);
	}

	// Helper functions for event
	isEventTriggered(event, eventType) {
		return(event.eventType === eventType);
	}

	/* Command list - TODO: Document this */

	/**
	 * @param {highlightCallback} highlightCallback
	 * @param {number} targetEntity - Target entity ID.
	 * @param {FacingDirection} direction - Direction to move the entity.
	 */
	moveDirection(highlightCallback, targetEntity, direction) {
		this.controller.addCommand(new MoveDirectionCommand(this.controller, highlightCallback, targetEntity, direction), targetEntity);
	}

	/**
	 * @param {highlightCallback} highlightCallback
	 * @param {number} targetEntity - Target entity ID.
	 * @param {Funtion} onFinish - TODO.
	 */
	moveForward(highlightCallback, targetEntity, onFinish) {
		this.controller.addCommand(new MoveForwardCommand(this.controller, highlightCallback, targetEntity, onFinish), targetEntity);
	}

	/**
	 * @param {highlightCallback} highlightCallback
	 * @param {number} targetEntity - Target entity ID.
	 */
	moveBackward(highlightCallback, targetEntity) {
		this.controller.addCommand(new MoveBackwardCommand(this.controller, highlightCallback, targetEntity), targetEntity);
	}

	/**
	 * @param {highlightCallback} highlightCallback
	 * @param {number} targetEntity - Target entity ID.
	 * @param {number} moveAwayFrom - Entity ID to move away from.
	 */
	moveAway(highlightCallback, targetEntity, moveAwayFrom) {
		const callbackCommand = new CallbackCommand(this.controller, highlightCallback, () => {
			this.controller.moveAway(callbackCommand, moveAwayFrom);
		}, targetEntity);
		this.controller.addCommand(callbackCommand);
	}

	/**
	 * @param {highlightCallback} highlightCallback
	 * @param {number} targetEntity - Target entity ID.
	 * @param {number} moveTowardTo - Entity ID to move towards.
	 */
	moveToward(highlightCallback, targetEntity, moveTowardTo) {
		const callbackCommand = new CallbackCommand(this.controller, highlightCallback, () => {
			this.controller.moveToward(callbackCommand, moveTowardTo);
		}, targetEntity);
		this.controller.addCommand(callbackCommand);
	}

	/**
	 * @param {highlightCallback} highlightCallback
	 * @param {number} targetEntity - Target entity ID.
	 */
	flashEntity(highlightCallback, targetEntity) {
		const callbackCommand = new CallbackCommand(this.controller, highlightCallback, () => {
			this.controller.flashEntity(callbackCommand);
		}, targetEntity);
		this.controller.addCommand(callbackCommand);
	}

	/**
	 * @param {highlightCallback} highlightCallback
	 * @param {number} targetEntity - Target entity ID.
	 */
	explodeEntity(highlightCallback, targetEntity) {
		const callbackCommand = new CallbackCommand(this.controller, highlightCallback, () => {
			this.controller.explodeEntity(callbackCommand);
		}, targetEntity);
		this.controller.addCommand(callbackCommand);
	}

	/**
	 * @param {highlightCallback} highlightCallback
	 * @param {number} targetEntity - Target entity ID.
	 */
	use(highlightCallback, targetEntity) {
		const callbackCommand = new CallbackCommand(this.controller, highlightCallback, () => {
			this.controller.use(callbackCommand, targetEntity);
		}, targetEntity);
		this.controller.addCommand(callbackCommand);
	}

	/**
	 * @param {highlightCallback} highlightCallback
	 * @param sound - TODO.
	 * @param {number} targetEntity - Target entity ID.
	 */
	playSound(highlightCallback, sound, targetEntity) {
		const callbackCommand = new CallbackCommand(this.controller, highlightCallback, () => {
			this.controller.playSound(callbackCommand, sound);
		}, targetEntity);
		this.controller.addCommand(callbackCommand);
	}

	/**
	 * @param {highlightCallback} highlightCallback
	 * @param {string} direction - Direction to turn to.
	 * @param {number} targetEntity - Target entity ID.
	 * @param {Function} onFinish - TODO.
	 */
	turn(highlightCallback, direction, targetEntity, onFinish) {
		const callbackCommand = new CallbackCommand(this.controller, highlightCallback, () => {
			this.controller.turn(callbackCommand, direction === "right" ? 1 : -1);
		}, targetEntity, onFinish);
		this.controller.addCommand(callbackCommand);
	}

	/**
	 * @param {highlightCallback} highlightCallback
	 * @param {number} targetEntity - Target entity ID.
	 */
	turnRandom(highlightCallback, targetEntity) {
		const callbackCommand = new CallbackCommand(this.controller, highlightCallback, () => {
			this.controller.turnRandom(callbackCommand);
		}, targetEntity);
		this.controller.addCommand(callbackCommand);
	}

	/**
	 * @param {highlightCallback} highlightCallback
	 * @param {number} targetEntity - Target entity ID.
	 * @param {Function} onFinish - TODO.
	 */
	turnRight(highlightCallback, targetEntity, onFinish) {
		this.turn(highlightCallback, "right", targetEntity, onFinish);
	}

	/**
	 * @param {highlightCallback} highlightCallback
	 * @param {number} targetEntity - Target entity ID.
	 * @param {Function} onFinish - TODO.
	 */
	turnLeft(highlightCallback, targetEntity, onFinish) {
		this.turn(highlightCallback, "left", targetEntity, onFinish);
	}

	/**
	 * @param {highlightCallback} highlightCallback
	 * @param {number} targetEntity - Target entity ID.
	 */
	destroyBlock(highlightCallback, targetEntity) {
		const callbackCommand = new CallbackCommand(this.controller, highlightCallback, () => {
			this.controller.destroyBlock(callbackCommand);
		}, targetEntity);
		this.controller.addCommand(callbackCommand);
	}

	/**
	 * @param {highlightCallback} highlightCallback
	 * @param {number} blockType - Block type to place.
	 * @param {number} targetEntity - Target entity ID.
	 */
	placeBlock(highlightCallback, blockType, targetEntity) {
		this.controller.addCommand(new PlaceBlockCommand(this.controller, highlightCallback, blockType, targetEntity), targetEntity);
	}

	/**
	 * @param {highlightCallback} highlightCallback
	 * @param {number} blockType - Block type to place.
	 * @param {number} targetEntity - Target entity ID.
	 * @param {FacingDirecion} - Direction to place the block.
	 */
	placeDirection(highlightCallback, blockType, targetEntity, direction) {
		this.controller.addCommand(new PlaceDirectionCommand(this.controller, highlightCallback, blockType, targetEntity, direction), targetEntity, direction);
	}

	/**
	 * @param {highlightCallback} highlightCallback
	 * @param {number} blockType - Block type to place.
	 * @param {number} targetEntity - Target entity ID.
	 */
	placeInFront(highlightCallback, blockType, targetEntity) {
		this.controller.addCommand(new PlaceInFrontCommand(this.controller, highlightCallback, blockType, targetEntity), targetEntity);
	}

	/**
	 * TODO.
	 * @param {highlightCallback} highlightCallback
	 * @param {number} targetEntity - Target entity ID.
	 */
	tillSoil(highlightCallback, targetEntity) {
		this.controller.addCommand(new PlaceInFrontCommand(this.controller, highlightCallback, "watering", targetEntity));
	}

	/**
	 * @param {highlightCallback} highlightCallback
	 * @param {number} blockType - Block type to place.
	 * @param {number} targetEntity - Target entity ID.
	 * @param {Function} codeBlock - Callback.
	 */
	ifBlockAhead(highlightCallback, blockType, targetEntity, codeBlock) {
		this.controller.addCommand(new IfBlockAheadCommand(this.controller, highlightCallback, blockType, targetEntity, codeBlock), targetEntity);
	}

	// -1 for infinite repeat
	repeat(highlightCallback, codeBlock, iteration, targetEntity) {
		this.controller.addCommand(new RepeatCommand(this.controller, highlightCallback, codeBlock, iteration, targetEntity));
	}

	// -1 for infinite repeat
	repeatRandom(highlightCallback, codeBlock, targetEntity) {
		var maxIteration = 10;
		var randomIteration = Math.floor(Math.random() * maxIteration) + 1;
		this.controller.addCommand(new RepeatCommand(this.controller, highlightCallback, codeBlock, randomIteration, targetEntity));
	}

	getScreenshot() {
		return this.controller.getScreenshot();
	}

	spawnEntity(highlightCallback, type, spawnDirection) {
		var callbackCommand = new CallbackCommand(this.controller, highlightCallback, () => {
			this.controller.spawnEntity(callbackCommand, type, spawnDirection);
		});
		this.controller.addCommand(callbackCommand);
	}
	spawnEntityAt(highlightCallback, type, spawnX, spawnY, spawnDirection) {
		var callbackCommand=new CallbackCommand(this.controller,highlightCallback, () => {
			this.controller.spawnEntityAt(callbackCommand,type,spawnX,spawnY, spawnDirection);
		});
		this.controller.addCommand(callbackCommand);
	}
	destroyEntity(highlightCallback, targetEntity) {
		var callbackCommand = new CallbackCommand(this.controller, highlightCallback, () => {
			this.controller.destroyEntity(callbackCommand, targetEntity);
		}, targetEntity);
		this.controller.addGlobalCommand(callbackCommand);
	}

	drop(highlightCallback, itemType, targetEntity) {
		var callbackCommand = new CallbackCommand(this.controller, highlightCallback, () => {
			this.controller.drop(callbackCommand, itemType);
		}, targetEntity);
		this.controller.addCommand(callbackCommand);
	}

	startDay(highlightCallback) {
		var callbackCommand = new CallbackCommand(this.controller, highlightCallback, () => {
			this.controller.startDay(callbackCommand);
		});
		this.controller.addGlobalCommand(callbackCommand);
	}

	startNight(highlightCallback) {
		var callbackCommand = new CallbackCommand(this.controller, highlightCallback, () => {
			this.controller.startNight(callbackCommand);
		});
		this.controller.addGlobalCommand(callbackCommand);
	}

	wait(highlightCallback, time, targetEntity) {
		var callbackCommand = new CallbackCommand(this.controller, highlightCallback, () => {
			this.controller.wait(callbackCommand, time);
		}, targetEntity);
		this.controller.addGlobalCommand(callbackCommand);
	}

	attack(highlightCallback, targetEntity) {
		var callbackCommand = new CallbackCommand(this.controller, highlightCallback, () => {
			this.controller.attack(callbackCommand);
		}, targetEntity);
		this.controller.addCommand(callbackCommand);
	}

	setDayNightCycle(firstDelay, delayInSecond,  startTime) {
		if (!this.controller.dayNightCycle) {
			this.controller.dayNightCycle = true;
			this.controller.initiateDayNightCycle(firstDelay, delayInSecond, startTime);
		}
	}

	addScore(highlightCallback, score, targetEntity) {
		var callbackCommand = new CallbackCommand(this.controller, highlightCallback, () => {
			this.controller.addScore(callbackCommand, score);
		}, targetEntity);
		this.controller.addGlobalCommand(callbackCommand);
	}

	arrowDown(direction) {
		this.controller.arrowDown(direction);
	}

	arrowUp(direction) {
		this.controller.arrowUp(direction);
	}

	clickDown() {
		this.controller.clickDown();
	}

	clickUp() {
		this.controller.clickUp();
	}
}

function getCodeOrgAPI(controller) {
	return new CodeOrgAPI(controller);
}
