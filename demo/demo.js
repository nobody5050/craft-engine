var previous = false;
var playing = false;

var levelselect = document.getElementById('level-load');
var speedslider = document.getElementById('speed-slider');
var speeddisplay = document.getElementById('speed-display');
var phasergame = document.getElementById('phaser-game');
var codemirroreditor = document.getElementById('codemirror-editor');
var game = document.getElementById('game');
var body = document.body;
var playbutton = document.getElementById('play-button');

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

codemirror.setSize(body.clientWidth - Number.parseInt(getComputedStyle(body).fontSize) * 2 - game.offsetWidth, game.offsetHeight + 400);

function getParameterByName(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp(`[\\?&]${name}=([^&#]*)`);
  var results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function requestLock() {
  gameController.game.input.mouse.requestPointerLock();
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
    speeddisplay.innerHTML = `Speed: ${speedslider.value}x`;
    gameController.game.time.slowMotion = 1.5 / Number.parseFloat(speedslider.value, 10);
  }
}, false);

document.getElementById('stop-button').addEventListener('click', function () {
  gameController.codeOrgAPI.resetAttempt();
  previous = false;
  playing = false;
});

playbutton.addEventListener('click', function () {
  if (previous) {
    gameController.codeOrgAPI.resetAttempt();
  }
  previous = true;
  playing = true;
  playbutton.blur();
  phasergame.focus();
  eval(codemirror.getValue());
  gameController.codeOrgAPI.startAttempt();
});

document.addEventListener('keydown', function (event) {
  if (!playing) {
    return;
  }

  var target = 'Player';
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
  }
}, false);

window.gameController = gameController;
