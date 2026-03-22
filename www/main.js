$(document).ready(function () {
  // ... [Configuration Code remains the same] ...

  var siriWave = new SiriWave({
    container: document.getElementById("siri-container"),
    width: 800,
    height: 180,
    style: "ios9",
    amplitude: 1,
    speed: 0.3,
    frequency: 4,
    color: "#4895f0",
    cover: true,
    autostart: true,
  });

  $(".text").textillate({
    loop: true,
    sync: true,
    in: { effect: "bounceIn" },
    out: { effect: "bounceOut" },
  });

  $(".siri-message").textillate({
    loop: true,
    sync: true,
    in: { effect: "fadeIn", sync: true },
    out: { effect: "none", sync: true },
  });

  // Helper: Update text
  function setSiriMessage(text) {
    $(".siri-message").text(text);
    try {
      $(".siri-message").textillate("start");
    } catch (e) {}
  }

  // NEW: Stop Audio Function (JS -> Python)
  window.stopAudio = function () {
    console.log("Stop Button Clicked.");
    eel.stop_speech();
  };

  // NEW: Python -> JS Visibility Toggles
  eel.expose(showStopButton);
  function showStopButton() {
    $(".siri-stop-btn-container").fadeIn(); // Smooth fade in
  }

  eel.expose(hideStopButton);
  function hideStopButton() {
    $(".siri-stop-btn-container").fadeOut(); // Smooth fade out
  }

  /* =========================================
       EEL EXPOSED FUNCTIONS
       ========================================= */

  eel.expose(startSiriUI);
  function startSiriUI() {
    $("body").addClass("siriwave-active");

    // HIDE STOP BUTTON INITIALLY (Wait for speak command)
    $(".siri-stop-btn-container").hide();

    $("#MicBtn").addClass("listening-mode");
    eel.playAssistantSound();
    $("#Oval").attr("hidden", true);
    $("#SiriWave").removeAttr("hidden").attr("hidden", false);

    $("#MicBtn, #SendBtn, #chatbox")
      .prop("disabled", true)
      .css("pointer-events", "none");

    setSiriMessage("Prajñāvan is thinking...");
  }

  eel.expose(ShowHood);
  function ShowHood() {
    console.log("Returning to Idle Mode...");
    $("body").removeClass("siriwave-active");
    $("#MicBtn").removeClass("listening-mode");

    // Ensure Stop button is hidden when leaving
    $(".siri-stop-btn-container").hide();

    $("#Oval").removeAttr("hidden");
    $("#SiriWave").attr("hidden", true);

    setTimeout(function () {
      const chatInput = document.getElementById("chatbox");
      chatInput.value = "";
      $("#MicBtn, #SendBtn, #chatbox")
        .prop("disabled", false)
        .removeAttr("disabled")
        .css("pointer-events", "auto");

      attachEventListeners();
      updateInputButtons();
      $("#Oval").css("pointer-events", "auto");
      chatInput.focus();
    }, 200);
  }

  eel.expose(DisplayMessage);
  function DisplayMessage(msg) {
    setSiriMessage(msg);
  }

  eel.expose(senderText);
  function senderText(msg) {
    const chatBox = document.getElementById("chat-canvas-body");
    if (msg.trim() !== "") {
      $("#chat-canvas-body").append(
        `<div class="row justify-content-end mb-4">
                    <div class="width-size">
                        <div class="sender_message">${msg}</div>
                    </div>
                </div>`,
      );
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }

  eel.expose(receiverText);
  function receiverText(msg) {
    const chatBox = document.getElementById("chat-canvas-body");
    if (msg.trim() !== "") {
      let formattedMessage = msg;
      if (typeof marked !== "undefined") {
        formattedMessage = marked.parse(msg);
      }
      $("#chat-canvas-body").append(
        `<div class="row justify-content-start mb-4">
                    <div class="width-size">
                        <div class="receiver_message">${formattedMessage}</div>
                    </div>
                </div>`,
      );
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }

  eel.expose(onError);
  function onError(errorObj) {
    console.error("Backend Error:", errorObj);
    ShowHood();
    setSiriMessage("Error: " + errorObj.message);
  }

  eel.expose(updateAmplitude);
  function updateAmplitude(l) {
    siriWave.setAmplitude(l);
  }

  /* =========================================
       INPUT HANDLERS
       ========================================= */
  const $chatbox = $("#chatbox");

  function updateInputButtons() {
    const val = $chatbox.val() ? $chatbox.val().trim() : "";
    if (val.length > 0) {
      $("#MicBtn").hide().attr("hidden", true);
      $("#SendBtn").show().removeClass("d-none").attr("hidden", false);
    } else {
      $("#SendBtn").hide().attr("hidden", true);
      $("#MicBtn").show().removeClass("d-none").attr("hidden", false);
    }
  }

  function sendMessage() {
    const msg = $chatbox.val().trim();
    if (!msg) return;
    startSiriUI();
    $chatbox.val("");
    eel.allCommands(msg);
  }

  const micClickHandler = function () {
    startSiriUI();
    eel.allCommands(1);
  };

  const keydownHandler = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  function attachEventListeners() {
    $("#SendBtn").off("click").on("click", sendMessage);
    $("#MicBtn").off("click").on("click", micClickHandler);
    $chatbox
      .off("input paste keyup")
      .on("input paste keyup", updateInputButtons);
    $chatbox.off("keydown").on("keydown", keydownHandler);
  }

  document.addEventListener("keydown", function (e) {
    if (e.key.toLowerCase() === "j" && (e.ctrlKey || e.altKey)) {
      e.preventDefault();
      $("#MicBtn").click();
    }
  });

  // Sidebar Logic
  var myOffcanvas = document.getElementById("offcanvasScrolling");
  myOffcanvas.addEventListener("show.bs.offcanvas", function () {
    $("#MenuBtn").addClass("slide-right");
    $("#MenuBtn i").removeClass("bi-list").addClass("bi-x-lg");
  });
  myOffcanvas.addEventListener("hide.bs.offcanvas", function () {
    $("#MenuBtn").removeClass("slide-right");
    $("#MenuBtn i").removeClass("bi-x-lg").addClass("bi-list");
  });

  attachEventListeners();
  updateInputButtons();
});
