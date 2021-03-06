Pts.namespace(window);
let mousedown = false;

// at end of loading screen
setTimeout(function(){
  document.getElementById("loader").classList.add("disabled");
  document.getElementById("dimmer").classList.add("disabled");
  document.getElementById("dimmer").style.display = "none";

  // set defaults for user
  user.colour = "#FF0000";
  user.shape = "circle";
  user.instrument = "piano";
}, 2000);

function onVolumeButtonClick() {
  let className = document.getElementById("volume-button-icon").className;
  if (className === "volume up icon") {
    document.getElementById("volume-button-icon").className = "volume off icon";
  } else {
    document.getElementById("volume-button-icon").className = "volume up icon";
  }
}

let timeout = null;
function onShareButtonClick() {
  let url = window.location.href;
  copyToClipboard(url);

  document.getElementById("copy-message").style.display = "flex";

  if (timeout) {
    window.clearTimeout(timeout);
  }
  timeout = setTimeout(function(){
    document.getElementById("copy-message").style.display = "none";
  }, 3000);
}

function onOverlayShapeButtonClick(id) {
  document.getElementsByClassName("ui active shape button")[0].classList.remove("active");
  document.getElementById(id).classList.add("active");
  user.shape = id.split("-")[2];
}

function onOverlayColorButtonClick(id) {
  document.getElementsByClassName("ui active color button")[0].classList.remove("active");
  document.getElementById(id).classList.add("active");

  let hex = "#000000";
  switch(id.split("-")[2]){
      case 'red':
          hex = "#FF0000";
          break;
      case 'green':
          hex = "#00FF00";
          break;
      case 'blue':
          hex = "#0000FF";
          break;
  }
  user.colour = hex;
}

function onOverlaySoundButtonClick(id) {
  document.getElementsByClassName("ui active sound button")[0].classList.remove("active");
  document.getElementById(id).classList.add("active");
  user.instrument = id.split("-")[2];
}

// Close the initial greeting screen and send data to server
function closeStartScreen() {
  document.getElementById("start-screen").style.height = "0%";
  setClientVariables(user.name, user.instrument, user.shape, user.colour);
}

// taken from https://hackernoon.com/copying-text-to-clipboard-with-javascript-df4d4988697f
function copyToClipboard(str) {
  const el = document.createElement('textarea');  // Create a <textarea> element
  el.value = str;                                 // Set its value to the string that you want copied
  el.setAttribute('readonly', '');                // Make it readonly to be tamper-proof
  el.style.position = 'absolute';                 
  el.style.left = '-9999px';                      // Move outside the screen to make it invisible
  document.body.appendChild(el);                  // Append the <textarea> element to the HTML document
  const selected =            
    document.getSelection().rangeCount > 0        // Check if there is any content selected previously
      ? document.getSelection().getRangeAt(0)     // Store selection if found
      : false;                                    // Mark as false to know no selection existed before
  el.select();                                    // Select the <textarea> content
  document.execCommand('copy');                   // Copy - only works as a result of a user action (e.g. click events)
  document.body.removeChild(el);                  // Remove the <textarea> element
  if (selected) {                                 // If a selection existed before copying
    document.getSelection().removeAllRanges();    // Unselect everything on the HTML document
    document.getSelection().addRange(selected);   // Restore the original selection
  }
};

function recordNote() {
    let x = space.pointer.x;
    let y = space.pointer.y;
    let scaledX = Math.round(x / canvas.width * 10000.0) / 100.0;
    let scaledY = Math.round(y / canvas.height * 10000.0) / 100.0;

    let note = {
        'x': scaledX,
        'y': scaledY,
        't': Date.now()
    };

    addNoteToSocket(note);
    playNote(createToneFromClientNote(findClientFromId(clients, myClientId), note)); // Also draws note
}

function onMouseMove(e) {
    if (!mousedown) {
        return;
    }
    recordNote();
}

canvas.addEventListener('mousedown', onMouseDown, false);
canvas.addEventListener('mouseup', onMouseUp, false);
canvas.addEventListener('mousemove', throttle(onMouseMove, 500), false);

function onMouseDown(e) {
    mousedown = true;
}

function onMouseUp(e) {
    if (!mousedown) {
        return;
    }
    sendPattern();
    mousedown = false;
}

// limit the number of events per second
function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function () {
        var time = new Date().getTime();

        if ((time - previousCall) >= delay) {
            previousCall = time;
            callback.apply(null, arguments);
        }
    };
}