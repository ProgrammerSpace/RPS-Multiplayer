var userId = 0;
var user1 = { name: "", userChoice: "", wins: 0, losses: 0, ties: 0 };
var user2 = { name: "", userChoice: "", wins: 0, losses: 0, ties: 0 };
var users = { user1, user2, userTurn: 0, userWon: -1 };

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

function updateDatabase() {
    console.log("updating database");
    database.ref().set(users);
}

window.onbeforeunload = resetDatabase;

function resetDatabase() {
    if (userId === 1) {
        database.ref("user1/name").set("");
        database.ref("user1/userChoice").set("");
        database.ref("user1/losses").set(0);
        database.ref("user1/wins").set(0);
        database.ref("user1/ties").set(0);
        database.ref("userTurn").set(0);
        database.ref("userWon").set(-1);
        database.ref("messages").set("");
        $(".user1").removeClass("border-success");
        $(".user2").removeClass("border-success");
    } else if (userId === 2) {
        database.ref("user2/name").set("");
        database.ref("user2/userChoice").set("");
        database.ref("user2/losses").set(0);
        database.ref("user2/wins").set(0);
        database.ref("user2/ties").set(0);
        database.ref("userTurn").set(0);
        database.ref("userWon").set(-1);
        database.ref("messages").set("");
        $(".user1").removeClass("border-success");
        $(".user2").removeClass("border-success");
    }
}

function deployPlayer() {
    var userName = $("#nameInput").val().trim();

    if (users.user1.name === "") {
        users.user1.name = userName;
        userId = 1;
        if (users.user2.name !== "") {
            users.userTurn = 1;
        }
    } else if (users.user2.name === "") {
        users.user2.name = userName;
        userId = 2;
        users.userTurn = 1;
    } else {
        console.log("Players slot full");
    }
    $(".user1namespace").html("<p>" + userName + "</p>");
    $("#nameInput").html("<p>Hi " + userName + ". You are player # " + userId + "</p>");
    $("#add-player").remove();
    updateDatabase();
}

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
        console.log("Calling whoWins");
        whoWins();
    }
}

function whoWins() {
    console.log("Control in whoWins");
    var user1Choice;
    var user2Choice;

    database.ref("user1/userChoice").on("value", function (snapshot) {
        user1Choice = snapshot.val();
    });

    database.ref("user2/userChoice").on("value", function (snapshot) {
        user2Choice = snapshot.val();
    });

    console.log(user1Choice);
    console.log(user2Choice);

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
        console.log("attempting to update database");
        console.log("user1: " + users.user1.wins + " " + users.user1.losses + " " + users.user1.ties);
        console.log("user2: " + users.user2.wins + " " + users.user2.losses + " " + users.user2.ties);
        updateDatabase();
    }
}

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

database.ref().on("value", function (snapshot) {
    if (snapshot.val() !== null) {
        users = snapshot.val();
        if (users.user1.name !== "") {
            $(".user1namespace").text(users.user1.name);
            $("#user1-score").text("Wins: " + users.user1.wins + " | Losses: " + users.user1.losses + " | Ties: " + users.user1.ties);
        }
        if (users.user2.name !== "") {
            $(".user2namespace").text(users.user2.name);
            $("#user2-score").text("Wins: " + users.user2.wins + " | Losses: " + users.user2.losses + " | Ties: " + users.user2.ties);
        }
        if (userId === 1) {
            switchControl(2, false);
        } else if (userId === 2) {
            switchControl(1, false);
        }
    }
}, errorHanlder);

database.ref("userTurn").on("value", function (snapshot) {
    users.userTurn = snapshot.val();
    if (users.userTurn === 1) {
        $(".user1").addClass("border-success");
        $(".user2").removeClass("border-success");
        if (userId === 2) {
            $(".result").text("Waiting for player 1 to pick!");
            switchControl(userId, false);
        } else if (userId === 1) {
            $(".result").text("It's your turn. Pick your choice.");
            switchControl(userId, true);
        }
    } else if (users.userTurn === 2) {
        $(".user2").addClass("border-success");
        $(".user1").removeClass("border-success");
        if (userId === 1) {
            $(".result").text("Waiting for player 2 to pick!");
            switchControl(userId, false);
        } else if (userId === 2) {
            $(".result").text("It's your turn. Pick your choice.");
            switchControl(userId, true);
        }
    }
}, errorHanlder);

database.ref("userWon").on("value", function (snapshot) {
    var winner = snapshot.val();
    if (winner !== null && winner !== "") {
        if (winner === 1) {
            $(".result").html("<p>" + users.user1.userChoice + " VS " + users.user2.userChoice + "<p>");
            $(".result").append(users.user1.name + " wins!!");
            $("#user1-score").text("Wins: " + users.user1.wins + " | Losses: " + users.user1.losses + " | Ties: " + users.user1.ties);
            $("#user2-score").text("Wins: " + users.user2.wins + " | Losses: " + users.user2.losses + " | Ties: " + users.user2.ties);
            setTimeout(function () {
                $(".result").text("");
                database.ref("userWon").set(-1);
            }, 3000);
        } else if (winner === 2) {
            $(".result").html("<p>" + users.user1.userChoice + " VS " + users.user2.userChoice + "<p>");
            $(".result").append(users.user2.name + " wins!!");
            $("#user1-score").text("Wins: " + users.user1.wins + " | Losses: " + users.user1.losses + " | Ties: " + users.user1.ties);
            $("#user2-score").text("Wins: " + users.user2.wins + " | Losses: " + users.user2.losses + " | Ties: " + users.user2.ties);
            setTimeout(function () {
                $(".result").text("");
                database.ref("userWon").set(-1);
            }, 3000);
        } else if (winner === 0) {
            $(".result").html("<p>" + users.user1.userChoice + " VS " + users.user2.userChoice + "<p>");
            $(".result").append("It's a tie!!");
            $("#user1-score").text("Wins: " + users.user1.wins + " | Losses: " + users.user1.losses + " | Ties: " + users.user1.ties);
            $("#user2-score").text("Wins: " + users.user2.wins + " | Losses: " + users.user2.losses + " | Ties: " + users.user2.ties);
            setTimeout(function () {
                $(".result").text("");
                database.ref("userWon").set(-1);
            }, 3000);
        } else {
            $(".result").text("");
        }
    }
}, errorHanlder);

function errorHanlder(errorObj) {
    console.log(errorObj);
}

$(document).ready(function () {

    $("#add-player").on("click", deployPlayer);
    $(".choice").on('click', getUserChoice);

});