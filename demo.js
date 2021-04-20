var previous = false;
var playing = false;

var levelselect = document.getElementById('level-load');
var speedslider = document.getElementById('speed-slider');
var speeddisplay = document.getElementById('speed-display');
var phasergame = document.getElementById('phaser-game');
var codemirroreditor = document.getElementById('codemirror-editor');

var defaults = {
  assetPacks: {
    beforeLoad: ['allAssetsMinusPlayer', 'playerAlex', 'playerAgent'],
    afterLoad: [],
  },
  gridDimensions: [10, 10],
  fluffPlane: new Array(100).fill(''),
  playerName: 'Alex',
  playerStartPosition: [],
};

var codemirror = CodeMirror.fromTextArea(codemirroreditor, {
  lineNumbers: true,
  mode: 'javascript'
});

codemirror.setSize(640, document.getElementById('game').offsetHeight + 400);

function getParameterByName(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp(`[\\?&]${name}=([^&#]*)`);
  var results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
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
  afterAssetsLoaded: function () {},
});

gameController.loadLevel(testLevelToLoad);
if (!gameController.levelData.isAgentLevel) {
  document.getElementById('entity-select').style.display = "none";
}

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

document.getElementById('stop-button').addEventListener('click', function () {
  gameController.codeOrgAPI.resetAttempt();
  previous = false;
  playing = false;
});

document.getElementById('play-button').addEventListener('click', function () {
  if (previous) {
    gameController.codeOrgAPI.resetAttempt();
  }
  previous = true;
  playing = true;
  eval(codemirror.getValue());
  gameController.codeOrgAPI.startAttempt();
});

if (!gameController.levelData.isAgentLevel) {
  document.getElementById('entity-select').style.display = "none";
}

document.addEventListener('keydown', function (event) {
  if (!playing) {
    return;
  }

  var target = document.querySelector('input[name=target]:checked').value;
  var instance = target === 'Player' ? gameController.player : gameController.agent;

  if (instance.queue.getLength() > 0) {
    return;
  }

  switch (event.key) {
    case "Backspace":
      gameController.codeOrgAPI.destroyBlock(null, target);
      break;
    case " ":
      gameController.codeOrgAPI.placeInFront(null, document.getElementById('block-type').value, target);
      break;
    case "Shift":
      document.querySelector('input[name=target]:not(:checked)').checked = true;
      break;
    case "w":
      gameController.codeOrgAPI.moveDirection(null, target, FacingDirection.North);
      break;
    case "a":
      gameController.codeOrgAPI.moveDirection(null, target, FacingDirection.East);
      break;
    case "s":
      gameController.codeOrgAPI.moveDirection(null, target, FacingDirection.South);
      break;
    case "d":
      gameController.codeOrgAPI.moveDirection(null, target, FacingDirection.West);
      break;
  }
}, false);

window.gameController = gameController;
