/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

var socket = io({ transports: ["websocket"] });

function disconnected(message) {
  $("#connection-status").removeClass("connected");
  $("#connection-status").text("Disconnected");
}

function disconnectedFromBackendService(message) {
  $("#connection-status").removeClass("connected");
  $("#connection-status").text("Counting Service is Unreachable");
}

socket.on("disconnect", function (reason) {
  console.log("Disconnected:", reason);
  disconnected();
});
socket.on("connect_error", function (error) {
  console.log("Connect Error:", error);
  disconnected();
});
socket.on("connect_timeout", function (timeout) {
  console.log("Connect Timeout:", timeout);
  disconnected();
});
socket.on("error", function (error) {
  console.log("Socket Error:", error);
  disconnected();
});
socket.on("reconnect_error", function (error) {
  console.log("Reconnect Error:", error);
  disconnected();
});
socket.on("reconnect_failed", function () {
  console.log("Reconnect Failed");
  disconnected();
});
socket.on("reconnect_attempt", function () {
  console.log("Attempting Reconnect...");
  disconnected();
});
socket.on("reconnecting", function (attempt) {
  console.log("Reconnecting... Attempt #" + attempt);
  disconnected();
});

// Listen for messages
socket.on("message", function (message) {
  function showCount(record) {
    var count = message.count,
      formattedCount = (new Number(count)).toLocaleString()

    $("#count").text(formattedCount)
    $("#hostname").text(message.hostname)
    $("#dashboard-hostname").text(message.dashboard_hostname)
  }

  if (message.count < 0) {
    // Negative count means the backend counting service cannot be discovered
    disconnectedFromBackendService()
  } else {
    didConnect()
  }
  showCount(message);
});

function didConnect() {
  $("#connection-status").addClass("connected");
  $("#connection-status").text("Connected");
}

socket.on("connect", function () {
  didConnect()

  // Broadcast a message
  function broadcastMessage() {
    if (!socket.connected) return;
    socket.emit("send", { "message": "get count" }, function (result) {
      setTimeout(broadcastMessage, 1000) // Increased to 1s to reduce load
    });
  }
  broadcastMessage();
});
