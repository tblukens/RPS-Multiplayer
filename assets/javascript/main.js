// Initialize Firebase
var config = {
    apiKey: "AIzaSyD4qhqYo35nMzxqqp1zTXwl8AuIc0VWeG4",
    authDomain: "rock-paper-scissors-7daf9.firebaseapp.com",
    databaseURL: "https://rock-paper-scissors-7daf9.firebaseio.com",
    projectId: "rock-paper-scissors-7daf9",
    storageBucket: "rock-paper-scissors-7daf9.appspot.com",
    messagingSenderId: "1072452692006"
};
firebase.initializeApp(config);

// reference the firebase database
var database = firebase.database();

// variable user to keep track of connected users
var connectionsRef = database.ref("/connections");
// reference to the firebase built in user presence tracking
var connectedRef = database.ref(".info/connected");
// reference to create players in the database
var playersRef = database.ref("/players");
// reference for chat in the database
var chatRef = database.ref("/chat");
// reference for turn in database
var turnRef = database.ref("/turn");
// reference for a queue in database
var queueRef = database.ref("/queue");



// using connectedRef to save or remove user from /connections in firebase
connectedRef.on("value", function (snap) {
    // If they are connected..
    if (snap.val()) {
        // Add user to the connections list.
        var con = connectionsRef.push(true);
        // Remove user from the connection list when they disconnect.
        con.onDisconnect().remove();
    }
});

var player1 = null;
var player2 = null;
var names = {};
var playersName = null;
var player1Wins;
var player2Wins;
var player1Losses;
var player2Losses;
var turn = 1;

var choices = ['Rock', 'Paper', 'Scissors'];


// Game Object
var rpsGame = {

}


$(document).ready(function () {
    // Sloppy... change later. Hides greeting. Should probably just be html change
    $("#middle-section-greeting").hide();
    database.ref("/players/").on("value", function (snapshot) {
        // Check for existence of player 1 in the database
        if (snapshot.child("player1").exists()) {
            console.log("Player 1 exists");

            // Record player1 data
            player1 = snapshot.val().player1;
            player1Name = player1.name;

            // Update player1 display
            $("#playerOneName").text(player1Name);
            $("#playerOneStats").html("Win: " + player1.wins + ", Loss: " + player1.losses + ", Tie: " + player1.ties);
        } else {
            console.log("Player 1 does NOT exist");

            player1 = null;
            player1Name = "";

            // if (snapshot.child("player2").exists()) {

            //     $("#set-name").show();
            // }

            console.log(snapshot.child("player2").exists())

        }

        // Check for existence of player 2 in the database
        if (snapshot.child("player2").exists()) {
            console.log("Player 2 exists");

            // Record player2 data
            player2 = snapshot.val().player2;
            player2Name = player2.name;

            // Update player1 display
            $("#playerTwoName").text(player2Name);
            $("#playerTwoStats").html("Win: " + player2.wins + ", Loss: " + player2.losses + ", Tie: " + player2.ties);


        } else {
            console.log("Player 2 does NOT exist");

            $("#set-name").show();
            player2 = null;
            player2Name = "";
        }
        if (snapshot.child("player2").exists() && snapshot.child("player1").exists() === false) {
            $("#set-name").show();
        }
        if (snapshot.child("player2").exists() && snapshot.child("player1").exists() && playersName !== null) {
            $("#set-name").hide();
        }

    });
    // click function for setting user
    $('#submit').on('click', function (e) {
        e.preventDefault();
        if (player1 === null) {
            console.log("Player 1 added");

            // Get users name from input
            playersName = $('#your-name').val().trim();
            // set player information
            player1 = {
                name: playersName,
                wins: 0,
                losses: 0,
                ties: 0,
                selection: ""
            }
            // Add player 1 to database
            database.ref().child("/players/player1").set(player1);

            // Removes player if they close browser or refresh
            database.ref("/players/player1").onDisconnect().remove();

            // Set the turn value to 1, as player1 goes first
            database.ref().child("/turn").set(1);

        } else if (player1 !== null && player2 === null) {
            console.log("Added player 2");

            playersName = $('#your-name').val().trim();
            player2 = {
                name: playersName,
                wins: 0,
                losses: 0,
                ties: 0,
                selection: ""
            }
            database.ref().child("/players/player2").set(player2);

            database.ref("/players/player2").onDisconnect().remove();
        } else if (player1 !== null && player2 !== null) {

        }
        $("#your-name").val("");
        $("#set-name").hide();
        return;
    });

    // Listener that detects user disconnection events
    database.ref("/players/").on("child_removed", function (snapshot) {
        console.log(snapshot)
        if (snapshot.key === "player1") {
            console.log("Player 1 Has Left")
            $("#playerOneName").text("Player 1");
            $("#set-name").show();
        } else if (snapshot.key === "player2") {
            console.log("Player 2 Has Left")
            $("#playerTwoName").text("Player 2");
            $("#set-name").show();
        }
        $("#set-name").show();
    });

    // Monitor Player1's selection
    $("#player1").on("click", ".choice", function (event) {
        event.preventDefault();

        // Make selections only when both players are in the game
        if (player1 && player2 && (playersName === player1.name) && (turn === 1)) {
            // Record player1's choice
            var choice = $(this).text().trim();
            console.log($(this).text().trim())

            // Record the player choice into the database
            // player1Choice = choice;
            database.ref().child("/players/player1/selection").set(choice);

            // Set the turn value to 2, as it is now player2's turn
            turn = 2;
            database.ref().child("/turn").set(2);
        }
    });

    // Monitor Player2's selection
    $("#player2").on("click", ".choice", function (event) {
        event.preventDefault();

        // Make selections only when both players are in the game
        if (player1 && player2 && (playersName === player2.name) && (turn === 2)) {
            // Record player2's choice
            var choice = $(this).text().trim();

            // Record the player choice into the database
            // player2Choice = choice;
            database.ref().child("/players/player2/selection").set(choice);
        }
    });

    // Attach a listener to the database /turn/ node to listen for any changes
database.ref("/turn/").on("value", function(snapshot) {
	// Check if it's player1's turn
	if (snapshot.val() === 1) {
		console.log("TURN 1");
		turn = 1;

		// Update the display if both players are in the game
		if (player1 && player2) {
			$("#playerPanel1").addClass("yourTurn");
			$("#playerPanel2").removeClass("yourTurn");
			$("#middle-section").html("Waiting on " + player1Name + " to choose...");
		}
	} else if (snapshot.val() === 2) {
		console.log("TURN 2");
		turn = 2;

		// Update the display if both players are in the game
		if (player1 && player2) {
			$("#playerPanel1").removeClass("yourTurn");
			$("#playerPanel2").addClass("yourTurn");
			$("#middle-section").html("Waiting on " + player2Name + " to choose...");
		}
	}
});
});