// Global variables
var userId = 0, gameOn = false;
var user1 = { name: "", userChoice: "", wins: 0, losses: 0, ties: 0 };
var user2 = { name: "", userChoice: "", wins: 0, losses: 0, ties: 0 };
var users = { user1, user2, userTurn: 0, userWon: -1, winningImage: "" };
var r = false, p = false, s = false;

// Initialize firebase
var config = {
    apiKey: "AIzaSyAGVetKXqXYxfGO0Xrjk1ep4Eeat2hmPT8",
    authDomain: "rockpaperscissor-de31e.firebaseapp.com",
    databaseURL: "https://rockpaperscissor-de31e.firebaseio.com",
    projectId: "rockpaperscissor-de31e",
    storageBucket: "rockpaperscissor-de31e.appspot.com",
    messagingSenderId: "186553559111"
};

firebase.initializeApp(config);

var database = firebase.database();

// Update database
function updateDatabase() {
    database.ref().set(users);
}

// When a user leaves game
window.onbeforeunload = resetDatabase;

// Reset database
function resetDatabase() {
    if (userId === 1) {
        database.ref("user1/name").set("");
        database.ref("user1/userChoice").set("");
        database.ref("user1/losses").set(0);
        database.ref("user1/wins").set(0);
        database.ref("user1/ties").set(0);
        database.ref("user2/losses").set(0);
        database.ref("user2/wins").set(0);
        database.ref("user2/ties").set(0);
        database.ref("userTurn").set(0);
        database.ref("userWon").set(-1);
        database.ref("messages").set("");
        database.ref("winningImage").set("");
        $(".user1").removeClass("border-warning");
        $(".user2").removeClass("border-warning");
    } else if (userId === 2) {
        database.ref("user2/name").set("");
        database.ref("user2/userChoice").set("");
        database.ref("user2/losses").set(0);
        database.ref("user2/wins").set(0);
        database.ref("user2/ties").set(0);
        database.ref("user1/losses").set(0);
        database.ref("user1/wins").set(0);
        database.ref("user1/ties").set(0);
        database.ref("userTurn").set(0);
        database.ref("userWon").set(-1);
        database.ref("messages").set("");
        database.ref("winningImage").set("");
        $(".user1").removeClass("border-warning");
        $(".user2").removeClass("border-warning");
    }
}

// Initialize game with respect to player
function deployPlayer() {
    var userName = $("#nameInput").val().trim();
    if (users.user1.name === "") {
        users.user1.name = userName;
        userId = 1;
        gameOn = true;
        if (users.user2.name !== "") {
            users.userTurn = 1;
        }
        $("#msg-input").removeAttr("disabled");
        $("#add-msg").removeAttr("disabled");
        $("#end-game").removeAttr("disabled");
        $(".user1namespace").html("<p>" + userName + "</p>");
        $(".welcome").html("<p>Hi " + userName + ". You are player " + userId + "</p>");
    } else if (users.user2.name === "") {
        users.user2.name = userName;
        userId = 2;
        gameOn = true;
        users.userTurn = 1;
        $("#msg-input").removeAttr("disabled");
        $("#add-msg").removeAttr("disabled");
        $("#end-game").removeAttr("disabled");
        $(".user1namespace").html("<p>" + userName + "</p>");
        $(".welcome").html("<p>Hi " + userName + ". You are player " + userId + "</p>");
    } else {
        alert("Players slot full");
    }
    $("#nameInput").remove();
    $("#add-player").remove();
    updateDatabase();
}

// Get user's choice, Store in databse, Switch control for next user to play
function getUserChoice() {
    if ($(this).attr("id").includes("user1")) {
        users.user1.userChoice = $(this).text();
        users.userTurn = 2;
        updateDatabase();
        switchControl(userId, false);
    } else if ($(this).attr("id").includes("user2")) {
        users.user2.userChoice = $(this).text();
        users.userTurn = 1;
        updateDatabase();
        switchControl(userId, false);
        whoWins();
    }
}

// Set image as per result
function setImage(user1Choice, user2Choice) {
    if (user1Choice == "Rock" || user2Choice == "Rock") {
        r = true;
    }
    if (user1Choice == "Scissors" || user2Choice == "Scissors") {
        s = true;
    }
    if (user1Choice == "Paper" || user2Choice == "Paper") {
        p = true;
    }

    if (r && p) {
        database.ref("winningImage").set("paper.jpg");
        r = false;
        p = false;
        s = false;
    } else if (r && s) {
        database.ref("winningImage").set("stone.jpg");
        r = false;
        p = false;
        s = false;
    }
    else if (p && s) {
        database.ref("winningImage").set("scissors.jpg");
        r = false;
        p = false;
        s = false;
    } else {
        database.ref("winningImage").set("rps.png");
        r = false;
        p = false;
        s = false;
    }
}

// Find winner
function whoWins() {
    var user1Choice;
    var user2Choice;

    database.ref("user1/userChoice").on("value", function (snapshot) {
        user1Choice = snapshot.val();
    });

    database.ref("user2/userChoice").on("value", function (snapshot) {
        user2Choice = snapshot.val();
    });

    setImage(user1Choice, user2Choice);

    if (user1Choice != "" && user2Choice != "") {
        if ((user1Choice === "Rock" && user2Choice === "Scissors") ||
            (user1Choice === "Scissors" && user2Choice === "Paper") ||
            (user1Choice === "Paper" && user2Choice === "Rock")) {
            users.user1.wins++;
            users.user2.losses++;
            users.userWon = 1;
        } else if (user1Choice === user2Choice) {
            users.user1.ties++;
            users.user2.ties++;
            users.userWon = 0;
        } else {
            users.user1.losses++;
            users.user2.wins++;
            users.userWon = 2;
        }
        updateDatabase();
    }
}

// Store message in database
function updateMessage() {
    event.preventDefault();
    var userNameTag = "user" + userId;
    var message = $("#msg-input").val().trim();
    if (message != "") {
        database.ref("messages").push({
            userNameTag: userNameTag,
            message: message,
            time: firebase.database.ServerValue.TIMESTAMP
        });
    }
    $("#msg-input").val("");
    updateScroll();
}

// Make the chat box scroll stick to bottom
function updateScroll() {

    // Scroll to bottom of div with javascript
    // var element = document.getElementById("msgBox");
    // element.scrollTop = element.scrollHeight;

    $('#msgBox').scrollTop($('#msgBox')[0].scrollHeight);

}

// To switch control between users
function switchControl(player, enable) {
    if (!enable) {
        if (player === 1) {
            $("#user1-rock").attr("disabled", "true");
            $("#user1-paper").attr("disabled", "true");
            $("#user1-scissors").attr("disabled", "true");
        } else if (player === 2) {
            $("#user2-rock").attr("disabled", "true");
            $("#user2-paper").attr("disabled", "true");
            $("#user2-scissors").attr("disabled", "true");
        }
    } else {
        if (player === 1) {
            $("#user1-rock").removeAttr("disabled");
            $("#user1-paper").removeAttr("disabled");
            $("#user1-scissors").removeAttr("disabled");
        } else if (player === 2) {
            $("#user2-rock").removeAttr("disabled");
            $("#user2-paper").removeAttr("disabled");
            $("#user2-scissors").removeAttr("disabled");
        }
    }
}

// When user value changes
database.ref().on("value", function (snapshot) {
    if (snapshot.val() !== null) {
        users = snapshot.val();
        if (users.user1.name !== "") {
            $(".user1namespace").text(users.user1.name);
            $("#user1-score").text("Wins: " + users.user1.wins + " | Losses: " + users.user1.losses + " | Ties: " + users.user1.ties);
        } else {
            $(".user1namespace").text("Waiting for player 1");
            $("#user1-score").text("");
            $(".user1").removeClass("border-warning");
            $(".user2").removeClass("border-warning");
        }
        if (users.user2.name !== "") {
            $(".user2namespace").text(users.user2.name);
            $("#user2-score").text("Wins: " + users.user2.wins + " | Losses: " + users.user2.losses + " | Ties: " + users.user2.ties);
        } else {
            $(".user2namespace").text("Waiting for player 2");
            $("#user2-score").text("");
            $(".user2").removeClass("border-warning");
            $(".user1").removeClass("border-warning");
        }
        if (userId === 1) {
            switchControl(2, false);
        } else if (userId === 2) {
            switchControl(1, false);
        }
    }
}, errorHanlder);

// Control switch between users
database.ref("userTurn").on("value", function (snapshot) {
    users.userTurn = snapshot.val();
    if (users.userTurn === 1) {
        $(".user1").addClass("border-warning");
        $(".user2").removeClass("border-warning");
        if (userId === 2) {
            $(".result").text("Waiting for player 1 to pick!");
            switchControl(userId, false);
        } else if (userId === 1) {
            $(".result").text("It's your turn. Pick your choice.");
            switchControl(userId, true);
        }
    } else if (users.userTurn === 2) {
        $(".user2").addClass("border-warning");
        $(".user1").removeClass("border-warning");
        if (userId === 1) {
            $(".result").text("Waiting for player 2 to pick!");
            switchControl(userId, false);
        } else if (userId === 2) {
            $(".result").text("It's your turn. Pick your choice.");
            switchControl(userId, true);
        }
    }
}, errorHanlder);

// Display result
database.ref("userWon").on("value", function (snapshot) {
    var winner = snapshot.val();

    database.ref("winningImage").on("value", function (snapshot) {
        resImg = snapshot.val();
    });

    let winningImg = $("<img>");
    winningImg.attr("width", "150");
    winningImg.attr("height", "125");
    winningImg.attr("src", "assets/images/" + resImg);

    if (winner !== null && winner !== "") {
        if (winner === 1) {
            $(".result").html("<p>" + users.user1.userChoice + " VS " + users.user2.userChoice + "</p><p>" + users.user1.name + " wins!!</p>");
            $(".result").append(winningImg);
            $("#user1-score").text("Wins: " + users.user1.wins + " | Losses: " + users.user1.losses + " | Ties: " + users.user1.ties);
            $("#user2-score").text("Wins: " + users.user2.wins + " | Losses: " + users.user2.losses + " | Ties: " + users.user2.ties);
            setTimeout(function () {
                $(".result").text("");
                database.ref("userWon").set(-1);
            }, 5000);
        } else if (winner === 2) {
            $(".result").html("<p>" + users.user1.userChoice + " VS " + users.user2.userChoice + "</p><p>" + users.user2.name + " wins!!</p>");
            $(".result").append(winningImg);
            $("#user1-score").text("Wins: " + users.user1.wins + " | Losses: " + users.user1.losses + " | Ties: " + users.user1.ties);
            $("#user2-score").text("Wins: " + users.user2.wins + " | Losses: " + users.user2.losses + " | Ties: " + users.user2.ties);
            setTimeout(function () {
                $(".result").text("");
                database.ref("userWon").set(-1);
            }, 5000);
        } else if (winner === 0) {
            $(".result").html("<p>" + users.user1.userChoice + " VS " + users.user2.userChoice + "</p><p>It's a tie!!</p>");
            $(".result").append(winningImg);
            $("#user1-score").text("Wins: " + users.user1.wins + " | Losses: " + users.user1.losses + " | Ties: " + users.user1.ties);
            $("#user2-score").text("Wins: " + users.user2.wins + " | Losses: " + users.user2.losses + " | Ties: " + users.user2.ties);
            setTimeout(function () {
                $(".result").text("");
                database.ref("userWon").set(-1);
            }, 5000);
        } else {
            $(".result").text("");
        }
    }
}, errorHanlder);

// Add message to chat box
database.ref("messages").on("child_added", function (snapshot) {
    var newMsg = snapshot.val();
    var msg = $("<div>");
    var usrName;
    let n = snapshot.val().userNameTag;
    if (n === "user1") {
        usrName = users.user1.name;
    } else if (n === "user2") {
        usrName = users.user2.name;
    }
    var msgTxt = $("<p>");
    msgTxt.html("<b><i>" + usrName + ": </b></i>" + newMsg.message);

    msg.append(msgTxt);
    if (gameOn) {
        $(".message").append(msg);
    }

}, errorHanlder);

// Error handler
function errorHanlder(errorObj) {
    console.log(errorObj);
}

// Main routine
$(document).ready(function () {
    $("#add-player").on("click", deployPlayer);
    $(".choice").on('click', getUserChoice);
    $("#add-msg").on("click", updateMessage);
    $("#end-game").on("click", function () {
        resetDatabase();
        var objWindow = window.open(location.href, "_self");
        objWindow.close();
    });
});