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
var player1Wins;
var player2Wins;
var player1Losses;
var player2Losses;

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

            player2 = null;
            player2Name = "";
        }
    });
    // click function for setting user
    $('#submit').on('click', function (e) {
        e.preventDefault();
        if (player1 === null) {
            console.log("Player 1 added");

            // Get users name from input
            var playersName = $('#your-name').val().trim();
            // set player information
            player1 = {
                name: playersName,
                wins: 0,
                losses: 0,
                selection: ""
            }
            // Add player 1 to database
            database.ref().child("/players/player1").set(player1);

            // Removes player if they close browser or refresh
            database.ref("/players/player1").onDisconnect().remove();

        } else if (player1 !== null && player2 === null) {
            console.log("Added player 2");

            playersName = $('#your-name').val().trim();
            player2 = {
                name: playersName,
                wins: 0,
                losses: 0,
                selection: ""
            }
            database.ref().child("/players/player2").set(player2);

            database.ref("/players/player2").onDisconnect().remove();
        } else if (player1 !== null && player2 !== null) {

            $("#middle-section-name").hide();
            $("#middle-section-greeting").html("<h3>Sorry you will need to wait for current players to finish before playing. Please refresh the page when one of the players leaves.</h3>")
        }

        $("#middle-section-name").hide();

        $("#middle-section-greeting").show();
        return;
    });
});