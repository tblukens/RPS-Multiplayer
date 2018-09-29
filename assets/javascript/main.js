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
// reference to players in the database
var playersRef = database.ref("/players");
// reference player 1
var player1Ref = playersRef.child("/player1");
// reference player 2
var player1Ref = playersRef.child("/player2");

// reference for chat in the database
var chatRef = database.ref("/chat");
// reference for turn in database
var turnRef = database.ref("/turn");
// reference for a queue in database
var queueRef = database.ref("/queue");
// reference for game result
var resultsRef = database.ref("/result");



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
var player1Choice;
var player2Choice;
var names = {};
var playersName = null;
var player1Wins;
var player2Wins;
var player1Losses;
var player2Losses;
var turn = 1;
var freshGame = true;
var queuedPlayers = [];
var queueNumber = 1;

var choices = ['Rock', 'Paper', 'Scissors'];


// Game Object
var rpsGame = {

}


$(document).ready(function () {
    // Sloppy... change later. Hides greeting. Should probably just be html change
    $("#middle-section-greeting").hide();
    playersRef.on("value", function (snapshot) {
        // Check for existence of player 1 in the database
        if (snapshot.child("player1").exists()) {
            console.log("Player 1 exists");

            // Record player1 data
            player1 = snapshot.val().player1;
            player1Name = player1.name;

            // Update player1 display
            $("#playerOneName").text(player1Name);
            $("#playerOneStats").html("Wins: " + player1.wins + ", Losses: " + player1.losses + ", Ties: " + player1.ties);
        } else {
            console.log("Player 1 does NOT exist");

            player1 = null;
            player1Name = "";

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
            $("#playerTwoStats").html("Wins: " + player2.wins + ", Losses: " + player2.losses + ", Ties: " + player2.ties);


        } else {
            console.log("Player 2 does NOT exist");

            $("#set-name").show();
            player2 = null;
            player2Name = "";
        }
        if (snapshot.child("player2").exists() && snapshot.child("player1").exists() === false && playersName === null) {
            $("#set-name").show();
        } else if (snapshot.child("player2").exists() && snapshot.child("player1").exists() === false && playersName !== null) {
            $("#set-name").hide();
        }

        if (snapshot.child("player2").exists() && snapshot.child("player1").exists() && playersName !== null) {
            $("#set-name").hide();
        }
        // else if (snapshot.child("player2").exists() && snapshot.child("player1").exists() && playersName === null) {
        //     $("#exampleModalLongTitle2").text(player1Name+" vs "+player2Name)
        //     $("#set-name").hide();
        //     $("#please-wait").modal("show");
        // }
        if (player1 && player2) {
            // show player 1 turn
            $("#player1").addClass("yourTurn");
            // update panel showing player may select
            $("#middle-section").html("Waiting on " + player1Name + " to choose...");
            // $("#set-name").hide();
        }

        if (!player1 && !player2) {

            database.ref("/chat/").remove();
            database.ref("/turn/").remove();
            database.ref("/results/").remove();
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
            playersRef.child("/player1").set(player1);

            // Set player 1 first turn with fresh game
            database.ref().child("/turn").set(1);

            // Removes player if they close browser or refresh
            playersRef.child("/player1").onDisconnect().remove();

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
            playersRef.child("/player2").set(player2);

            playersRef.child("/player2").onDisconnect().remove();
        } else if (player1 !== null && player2 !== null) {
            console.log("Queued Player");
            $("#queueNumber").text(queueNumber)

            $("#queuedModal").modal('show');

            playersName = $('#your-name').val().trim();
            queued = {
                name: playersName,
            }

            // queueRef.child(playersName).push(queued);

            // queueRef.child(playersName).onDisconnect().remove();



            queuedPlayers.push(queued);

            queueRef.set(queuedPlayers);



        }
        $("#your-name").val("");
        $("#set-name").hide();
        return;
    });

    // Listener that detects user disconnection events
    playersRef.on("child_removed", function (snapshot) {
        console.log(snapshot)

        if (snapshot.key === "player1" && playersName === queuedPlayers[0].name) {

            // $("#playerOneName").text(player1Name);
            // $("#playerOneStats").html("Wins: " + player1.wins + ", Losses: " + player1.losses + ", Ties: " + player1.ties);


            console.log("Player 1 Has Left")
            player1 = {
                name: playersName,
                wins: 0,
                losses: 0,
                ties: 0,
                selection: ""
            }
            // Add player 1 to database
            playersRef.child("/player1").set(player1);

            // Set player 1 first turn with fresh game
            database.ref().child("/turn").set(1);

            // Removes player if they close browser or refresh
            playersRef.child("/player1").onDisconnect().remove();

            queuedPlayers.shift();
            console.log(queuedPlayers)
            queueRef.set(queuedPlayers);

        } else if (snapshot.key === "player2" && playersName === queuedPlayers[0].name) {
            console.log("Player 2 Has Left")

            console.log("Added player 2");
            player2 = {
                name: playersName,
                wins: 0,
                losses: 0,
                ties: 0,
                selection: ""
            }
            playersRef.child("/player2").set(player2);

            playersRef.child("/player2").onDisconnect().remove();

            queuedPlayers.shift();
            console.log(queuedPlayers)
            queueRef.set(queuedPlayers);
        }
        if (!player1 || !player2 && playersName === null) {
            queueRef.remove();
        }
        if (!queuedPlayers == 0) {
            queueRef.remove();
        }
        // $("#playerOneName").text("Player 1")
        // $("#player1").removeClass("yourTurn");
        // $("#playerTwoName").text("Player 2")
        // $("#player2").removeClass("yourTurn");
        freshGame = true;
        turn = 1;
        // turnRef.remove();
        resultsRef.remove();
        queueNumber--;

    });

    // Monitor Player1's selection
    $("#player1").on("click", ".choice", function (event) {
        event.preventDefault();

        // Make selections only when both players are in the game
        if (player1 && player2 && (playersName === player1.name) && (turn === 1)) {
            freshGame = false;
            console.log("!!! Fresh Game? " + freshGame + " !!!")

            // Record player1's choice
            var choice = $(this).data("name");
            console.log($(this).data("name"))

            // Record the player choice into the database
            player1Choice = choice;
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
            var choice = $(this).data("name");
            console.log($(this).data("name"))

            // Record the player choice into the database
            player2Choice = choice;
            database.ref().child("/players/player2/selection").set(choice);
            // Compare player1 and player 2 choices and record the outcome
            rpsCompare();
        }
    });

    // Attach a listener to the database /turn/ node to listen for any changes
    turnRef.on("value", function (snapshot) {
        // Check if it's player1's turn
        if (snapshot.val() === 1) {
            console.log("TURN 1");
            turn = 1;

            // Update the display if both players are in the game
            if (player1 !== null && player2 !== null) {
                $("#player1").addClass("yourTurn");
                $("#player2").removeClass("yourTurn");
                $("#middle-section").html("Waiting on " + player1Name + " to choose...");
            }
        } else if (snapshot.val() === 2) {
            console.log("TURN 2");
            turn = 2;

            // Update the display if both players are in the game
            if (player1 !== null && player2 !== null) {
                $("#player1").removeClass("yourTurn");
                $("#player2").addClass("yourTurn");
                $("#middle-section").html("Waiting on " + player2Name + " to choose...");
            }
        }
    });

    // rpsCompare is the main rock/paper/scissors logic to see which player wins
    function rpsCompare() {
        if (player1.selection === "Rock") {
            if (player2.selection === "Rock") {
                // Tie
                console.log("tie");

                database.ref().child("/result/").set("Tie game! Both chose " + player1.selection);
                database.ref().child("/players/player1/ties").set(player1.ties + 1);
                database.ref().child("/players/player2/ties").set(player2.ties + 1);
            } else if (player2.selection === "Paper") {
                // Player2 wins
                console.log("paper wins");

                database.ref().child("/result/").set(player1.name.toUpperCase() + " loses with " + player1.selection + "! " + player2.name.toUpperCase() + " wins with " + player2.selection + "!");
                database.ref().child("/players/player1/losses").set(player1.losses + 1);
                database.ref().child("/players/player2/wins").set(player2.wins + 1);
            } else { // scissors
                // Player1 wins
                console.log("rock wins");

                database.ref().child("/result/").set(player1.name.toUpperCase() + " wins with " + player1.selection + "! " + player2.name.toUpperCase() + " loses with " + player2.selection + "!");
                database.ref().child("/players/player1/wins").set(player1.wins + 1);
                database.ref().child("/players/player2/losses").set(player2.losses + 1);
            }

        } else if (player1.selection === "Paper") {
            if (player2.selection === "Rock") {
                // Player1 wins
                console.log("paper wins");

                database.ref().child("/result/").set(player1.name.toUpperCase() + " wins with " + player1.selection + "! " + player2.name.toUpperCase() + " loses with " + player2.selection + "!");
                database.ref().child("/players/player1/wins").set(player1.wins + 1);
                database.ref().child("/players/player2/losses").set(player2.losses + 1);
            } else if (player2.selection === "Paper") {
                // Tie
                console.log("tie");

                database.ref().child("/result/").set("Tie game! Both chose " + player1.selection);
                database.ref().child("/players/player1/ties").set(player1.ties + 1);
                database.ref().child("/players/player2/ties").set(player2.ties + 1);
            } else { // Scissors
                // Player2 wins
                console.log("scissors win");

                database.ref().child("/result/").set(player1.name.toUpperCase() + " loses with " + player1.selection + "! " + player2.name.toUpperCase() + " wins with " + player2.selection + "!");
                database.ref().child("/players/player1/losses").set(player1.losses + 1);
                database.ref().child("/players/player2/wins").set(player2.wins + 1);
            }

        } else if (player1.selection === "Scissors") {
            if (player2.selection === "Rock") {
                // Player2 wins
                console.log("rock wins");

                database.ref().child("/result/").set(player1.name.toUpperCase() + " loses with " + player1.selection + "! " + player2.name.toUpperCase() + " wins with " + player2.selection + "!");
                database.ref().child("/players/player1/losses").set(player1.losses + 1);
                database.ref().child("/players/player2/wins").set(player2.wins + 1);
            } else if (player2.selection === "Paper") {
                // Player1 wins
                console.log("scissors win");

                database.ref().child("/result/").set(player1.name.toUpperCase() + " wins with " + player1.selection + "! " + player2.name.toUpperCase() + " loses with " + player2.selection + "!");
                database.ref().child("/players/player1/wins").set(player1.wins + 1);
                database.ref().child("/players/player2/losses").set(player2.losses + 1);
            } else {
                // Tie
                console.log("tie");

                database.ref().child("/result/").set("Tie game! Both chose " + player1.selection);
                database.ref().child("/players/player1/ties").set(player1.ties + 1);
                database.ref().child("/players/player2/ties").set(player2.ties + 1);
            }

        }

        // Set the turn value to 1, as it is now player1's turn
        freshGame = true;
        console.log("!!! Fresh Game??? " + freshGame + " !!!")
        turn = 1;
        database.ref().child("/turn").set(1);
    }
    // Attach a listener to the database /outcome/ node to be notified of the game outcome
    resultsRef.on("value", function (snapshot) {
        $("#results").html(snapshot.val());
    });

    $("#chat-submit").on("click", function (event) {
        event.preventDefault();
        $(".chatP:odd").addClass("bg-dark")
        $(".chatP:even").addClass("bg-info")

        // First, make sure that the player exists and the message box is non-empty
        if ((playersName !== null) && ($("#chat-msg").val().trim() !== "")) {
            // Grab the message from the input box and subsequently reset the input box
            var msg = "<span class='playerName'>" + playersName.toUpperCase() + ":</span> " + $("#chat-msg").val().trim();
            $("#chat-msg").val("");

            // Get a key for the new chat entry
            var chatKey = database.ref().child("/chat/").push().key;

            // Save the new chat entry
            database.ref("/chat/" + chatKey).set(msg);
        }
    });

    $("#chat-msg").keypress(function (e) {
        if (e.which == 13) {
            $("#chat-submit").click();
        }
    })

    // Attach a listener to the database /chat/ node to listen for any new chat messages
    database.ref("/chat/").on("child_added", function (snapshot) {
        var chatMsg = snapshot.val();
        var chatEntry = $("<p>").html(chatMsg);
        chatEntry.addClass("m-0 chatP");

        $("#chat-display").append(chatEntry);
        $("#chat-display").scrollTop($("#chat-display")[0].scrollHeight);
    });

    queueRef.on("value", function (snapshot) {
        queuedPlayers = [];
        if (snapshot.val().length >= 1) {
            queueNumber = snapshot.val().length + 1;
        }
        console.log(queueNumber)
        snapshot.forEach(function (child) {
            console.log(child.val().name);
            var qName = child.val().name;
            queued = {
                name: qName,
            }

            queuedPlayers.push(queued)

        });
        $("#queuedPlayers").empty();
        queuedPlayers.forEach(function (element, i) {
            i = i + 1;
            var postQueue = $("<p>").text(i + ". " + element.name);
            $("#queuedPlayers").append(postQueue)

        });
        // queuedPlayers = snapshot[0].name;
        // console.log(snapshot)
        // var qP = $("<p>");
        // qP.text(queueNumber + ". " + snapshot.key);
        // queueNumber++;
        // $("#queuedPlayers").append(qP)
        // console.log(snapshot)
    })

    // queueRef.on("child_added", function (snapshot) {

    // });

    // queueRef.on("child_removed", function (snapshot) {

    //     console.log(snapshot);
    // })

    $(document).keypress(function () {
        $(".chatP:odd").addClass("bg-dark")
        $(".chatP:even").addClass("bg-info")
    });
    $(document).on("click", function () {
        $(".chatP:odd").addClass("bg-dark")
        $(".chatP:even").addClass("bg-info")
    })
    $(".chatP:odd").addClass("bg-dark");
    $(".chatP:even").addClass("bg-info");


});
