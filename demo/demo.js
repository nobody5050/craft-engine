var defaults = {
  assetPacks: {
    beforeLoad: ['allAssetsMinusPlayer', 'playerAlex', 'playerAgent'],
    afterLoad: [],
  },
  gridDimensions: [10, 10],
  fluffPlane: ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
  playerName: 'Alex',
  playerStartPosition: [],
};

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  var results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var levelParam = getParameterByName('level');
var testLevelToLoad = levels[levelParam] || levels['default'];
testLevelToLoad = Object.assign({}, defaults, testLevelToLoad);

// Initialize test instance of game, exposed to window for debugging.
var gameController = new GameController({
  Phaser: window.Phaser,
  containerId: 'phaser-game',
  assetRoot: 'assets/',
  audioPlayer: new Sounds(),
  debug: true,
  earlyLoadAssetPacks: testLevelToLoad.earlyLoadAssetPacks,
  earlyLoadNiceToHaveAssetPacks: testLevelToLoad.earlyLoadNiceToHaveAssetPacks,
  afterAssetsLoaded: () => {
    gameController.codeOrgAPI.startAttempt();
  },
});

gameController.loadLevel(testLevelToLoad);

var levelselect = document.getElementById('level-load');
var speedslider = document.getElementById('speed-slider');
var speeddisplay = document.getElementById('speed-display');

Object.keys(levels).forEach(key => {
  var option = document.createElement('option');
  option.text = key;
  option.selected = key === levelParam;
  levelselect.appendChild(option);
});

document.addEventListener('input', function (event) {
  if (event.target.id == 'level-load') {
    location.search = `level=${levelselect.options[levelselect.selectedIndex].value}`;
  } else if (event.target.id == 'speed-slider') {
    speeddisplay.innerHTML = `Speed:${speedslider.value}x`;
    gameController.game.time.slowMotion = 1.5 / Number.parseFloat(speedslider.value, 10);
  }
}, false);

document.getElementById('reset-button').addEventListener("click", function () {
  gameController.codeOrgAPI.resetAttempt();
  gameController.codeOrgAPI.startAttempt();
});

if (!gameController.levelData.isAgentLevel) {
  document.getElementById('entity-select').style.display = "none";
}

window.addEventListener('keydown', function (event) {
  if (event.target !== document.body) {
    event.preventDefault();
  }
  event.stopImmediatePropagation();

  var target = document.querySelector('input[name=target]:checked').value;
  var instance = target === 'Player' ? gameController.player : gameController.agent;

  if (instance.queue.getLength() > 0) {
    return;
  }

  switch (event.keyCode) {
    case 8:
    case 46:
      gameController.codeOrgAPI.destroyBlock(null, target);
      break;
    case 13:
    case 32:
      gameController.codeOrgAPI.placeInFront(null, document.getElementById('block-type').value, target);
      break;
    case 16:
      document.querySelector('input[name=target]:not(:checked)').checked = true;
      break;
    case 38:
    case 87:
      gameController.codeOrgAPI.moveDirection(null, target, 0);
      break;
    case 40:
    case 83:
      gameController.codeOrgAPI.moveDirection(null, target, 2);
      break;
    case 37:
    case 65:
      gameController.codeOrgAPI.moveDirection(null, target, 3);
      break;
    case 39:
    case 68:
      gameController.codeOrgAPI.moveDirection(null, target, 1);
      break;
  }
}, true);

window.gameController = gameController;
