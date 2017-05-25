
var Deck = require('./deck.js');

var Game = function(id, opts) {
	this.id = id;
	this.state = "waiting";
	this.maxPlayers = 8;
	this.hostId = opts.pId || "system";
	this.playerCount = 0;
	this.players = [];
	
	this.currentTurnIndex = null;
	this.currentTurn = null;
	this.lastTurn = null;
	this.captureCount = -1;

	this.playerDecks = {};
	this.playerReserves = [];
	this.pile = null;
	this.penaltyDeck = null;
	this.rules = opts.rules || {};
}

// rules
// sandwich
// 69
// s69
Game.prototype.playCard = function(pId) {
	// pop card from deck

	var playerDeck = this.playerDecks[pId];

	var card = playerDeck.popCard();
	console.log(pId,"played card",card.suit,card.rank);

	this.pile.addCard(card);

	switch (card.rank) {
		case "A":
			this.captureCount = 4;
			this.switchTurn();
			break;
		case "K":
			this.captureCount = 3;
			this.switchTurn();
			break;
		case "Q":
			this.captureCount = 3;
			this.switchTurn();
			break;
		case "J":
			this.captureCount = 3;
			this.switchTurn();
			break;
		default:
			if (this.captureCount == -1) {
				this.switchTurn()
			} else {
				this.captureCount--
				if (this.captureCount == 0) {
					this.waitForCapture();
				}
			}
	}
}

Game.prototype.waitForCapture = function() {
	this.currentTurn = null; // don't allow play
}

Game.prototype.slap = function(pId) {
	var validSlap = false;
	var deck = this.pile;

	if (this.captureCount == 0 && this.lastTurn == pId) {
		// player is always allowed to slap their win
		validSlap = true;
	} else {
		// are top cards same rank?
		var top0 = deck.getTop(0).rank;
		var top1 = deck.getTop(1).rank;
		var top2 = deck.getTop(2).rank;

		if (top0 == top1) {
			validSlap = true;
		}
		if (this.rules.sandwich) {
			if (top0 == top2) {
				validSlap = true;
			}
		}
		if (this.rules.sixnine) {
			if ((top0 == "6" && top1 == "9") || (top0 == "9" && top1 == "6")) {
				validSlap = true;
			}
		}
		if (this.rules.sandwich69) {
			if ((top0 == "6" && top2 == "9") || (top0 == "9" && top2 == "6")) {
				validSlap = true;
			}
		}
	}

	if (validSlap) {
		// capture cards, set turn

		this.lastTurn = pId;
		this.currentTurn = pId;
		this.currentTurnIndex = -1; // index of pId
	} else {
		// penalize the slapper, if possible
		this.penalize(pId);
	}
}

Game.prototype.checkForWin = function(pId) {
	var playersWithCards = 0;

	for (let i = 0, ii = this.playerCount; i<ii; i++) {
		if (this.playerDecks[i].length > 0 || this.playerReserves[i].length > 0) {
			playersWithCards++;
		}
	}

	return playersWithCards == 1;
}

Game.prototype.penalize = function(pId) {
	var c = this.playerDecks[pId].popCard();

	// add to penalty deck
	this.penaltyDeck.addCard(c);
}

Game.prototype.switchTurn = function() {
	this.currentTurnIndex++;
	if (this.currentTurnIndex >= this.playerCount) {
		this.currentTurnIndex = 0;
	}

	this.lastTurn = this.currentTurn;
	this.currentTurn = this.players[currentTurnIndex];
}

Game.prototype.joinGame = function(pId) {
	if (this.playerCount >= this.maxPlayers) {
		return false;
	}

	this.playerCount++;

	this.players.push(pId);

	this.playerDecks[pId] = 
}

Game.prototype.leaveGame = function(pId) {

	// if host leaves, appoint new host

	// if no more players, return -1
	var hostLeft = false;
	if (this.playerCount == 0) {
		return -1;
	}
	if (hostLeft) {
		return this.hostId;
	} else {
		return 0;
	}
	return this.playerCount != 0;
}

Game.prototype.startGame = function(pId) {
	// initialize everything
	this.deck = new Deck(false);
	var pId;
	for (let i = 0, ii = this.playerCount; i < ii; i++) {
		pId = this.players[i];
		this.playerDecks = new Deck(true);
		this.playerReserves = new Deck(true);
	}
	this.deck.shuffle();
	// deal shuffled deck out
}



exports = Game;