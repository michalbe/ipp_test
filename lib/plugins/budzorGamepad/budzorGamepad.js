/*
	gamepad.js, See README for copyright and usage instructions.
*/
ig.module( 
	'plugins.budzorGamepad.budzorGamepad' 
)
.requires(

)
.defines(function() {
  // var mappings = [[ gamepad.dpadUp, ig.KEY.UP_ARROW ],
  //                     [ gamepad.dpadDown, ig.KEY.DOWN_ARROW ],
  //                     [ gamepad.dpadLeft, ig.KEY.LEFT_ARROW ],
  //                     [ gamepad.dpadRight, ig.KEY.RIGHT_ARROW ],
  //                     [ gamepad.faceButton0, ig.KEY.X ],
  //                     [ gamepad.faceButton1, ig.KEY.C ],
  //                     [ gamepad.faceButton2, ig.KEY.Z ],
  //                     [ gamepad.faceButton3, ig.KEY.V ]];
                      
  var gamepadSupport = ig.gamepadSupport = {
    TYPICAL_BUTTON_COUNT: 16,
    TYPICAL_AXIS_COUNT: 4,
    ticking: false,
    gamepads: [],
    prevRawGamepadTypes: [],
    prevTimestamps: [],
    init: function() {
      var gamepadSupportAvailable = !! navigator.webkitGetGamepads || !! navigator.webkitGamepads || (navigator.userAgent.indexOf('Firefox/') != -1);
      if (!gamepadSupportAvailable) {
        tester.showNotSupported();
      } else {
        window.addEventListener('MozGamepadConnected', gamepadSupport.onGamepadConnect, false);
        window.addEventListener('MozGamepadDisconnected', gamepadSupport.onGamepadDisconnect, false);
        if ( !! navigator.webkitGamepads || !! navigator.webkitGetGamepads) {
          gamepadSupport.startPolling();
        }
      }
    },
    onGamepadConnect: function(event) {
      gamepadSupport.gamepads.push(event.gamepad);
      tester.updateGamepads(gamepadSupport.gamepads);
      gamepadSupport.startPolling();
    },
    onGamepadDisconnect: function(event) {
      for (var i in gamepadSupport.gamepads) {
        if (gamepadSupport.gamepads[i].index == event.gamepad.index) {
          gamepadSupport.gamepads.splice(i, 1);
          break;
        }
      }
      if (gamepadSupport.gamepads.length == 0) {
        gamepadSupport.stopPolling();
      }
      tester.updateGamepads(gamepadSupport.gamepads);
    },
    startPolling: function() {
      if (!gamepadSupport.ticking) {
        gamepadSupport.ticking = true;
        gamepadSupport.tick();
      }
    },
    stopPolling: function() {
      gamepadSupport.ticking = false;
    },
    tick: function() {
      gamepadSupport.pollStatus();
      gamepadSupport.scheduleNextTick();
    },
    scheduleNextTick: function() {
      if (gamepadSupport.ticking) {
        if (window.requestAnimationFrame) {
          window.requestAnimationFrame(gamepadSupport.tick);
        } else if (window.mozRequestAnimationFrame) {
          window.mozRequestAnimationFrame(gamepadSupport.tick);
        } else if (window.webkitRequestAnimationFrame) {
          window.webkitRequestAnimationFrame(gamepadSupport.tick);
        }
      }
    },
    pollStatus: function() {
      gamepadSupport.pollGamepads();
      for (var i in gamepadSupport.gamepads) {
        var gamepad = gamepadSupport.gamepads[i];
        if (gamepad.timestamp && (gamepad.timestamp == gamepadSupport.prevTimestamps[i])) {
          continue;
        }
        gamepadSupport.prevTimestamps[i] = gamepad.timestamp;
        gamepadSupport.updateDisplay(i);
      }
    },
    pollGamepads: function() {
      var rawGamepads = (navigator.webkitGetGamepads && navigator.webkitGetGamepads()) || navigator.webkitGamepads;
      if (rawGamepads) {
        gamepadSupport.gamepads = [];
        var gamepadsChanged = false;
        for (var i = 0; i < rawGamepads.length; i++) {
          if (typeof rawGamepads[i] != gamepadSupport.prevRawGamepadTypes[i]) {
            gamepadsChanged = true;
            gamepadSupport.prevRawGamepadTypes[i] = typeof rawGamepads[i];
          }
          if (rawGamepads[i]) {
            gamepadSupport.gamepads.push(rawGamepads[i]);
          }
        }
        if (gamepadsChanged) {
          console.log(gamepadSupport.gamepads);
        }
      }
    },
    
    states: {
      up: 0,
      down: 0,
      left: 0,
      right: 0,
      x: 0,
      triangle:0,
      square: 0,
      circle: 0
    },
    
    changeStatus: function(gamepad, keyCode, buttonNumber, buttonSign) {
      if (this.states[buttonSign] !== gamepad.buttons[buttonNumber]) {
        this.states[buttonSign] = gamepad.buttons[buttonNumber];
        if (gamepad.buttons[buttonNumber] === 1) {
          var evObj = document.createEvent('Event');
          evObj.initEvent( 'keydown', true, false );;
          evObj.keyCode = keyCode;
          window.dispatchEvent(evObj);
        } else {
          var evObj = document.createEvent('Event');
          evObj.initEvent( 'keyup', true, false );;
          evObj.keyCode = keyCode;
          window.dispatchEvent(evObj);
        }
      }
    },
    
    buttons: [
      [ig.KEY.X, 'x', 0],
      [ig.KEY.V, 'triangle', 3],
      [ig.KEY.Z, 'circle', 1],
      [ig.KEY.C, 'square', 2],
      
      [ig.KEY.DOWN_ARROW, 'down', 13],
      [ig.KEY.LEFT_ARROW, 'left', 14],
      [ig.KEY.RIGHT_ARROW, 'right', 15],
      [ig.KEY.UP_ARROW, 'up', 12]
    ],
    
    updateDisplay: function(gamepadId) {
      var gamepad = gamepadSupport.gamepads[gamepadId];
      if (gamepad.buttons) {
        this.buttons.forEach(function(buttonDesc) {
          this.changeStatus(gamepad, buttonDesc[0], buttonDesc[2], buttonDesc[1]);
        }, this);
      }
        
    }
  };

});