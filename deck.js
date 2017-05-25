
var suits = ["S","H","D","C"];
var ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

var Deck = function(isEmpty) {
	this.cards = [];

	if (!isEmpty) {
		//generate standard 52

		for (let i = 0; i<4; i++) {
			for (let j = 0; j<13; j++) {
				this.cards.push({
					suit: suits[i],
					rank: ranks[j]
				});
			}
		}
	}
}

Deck.prototype.pop = function(i) {
	return this.cards.pop();
}

Deck.prototype.addCard = function(c) {
	this.cards.unshift(c);
}

Deck.prototype.addCards = function(newCards, bottomFirst) {
	let ii = newCards.length-1;
	for (let i = ii; i >= 0; i--) {
		if (bottomFirst) {
			console.log('bottomFirst guessed at');
			this.cards.unshift(newCards[ii-i])
		} else {
			this.cards.unshift(newCards[i])	
		}
	}
}

Deck.prototype.shuffle = function() {
	// F-Y
	let deck = this.cards;
	let n = deck.length;
	for (let i = n-1; i > 0; i--) {
		let randomIndex = Math.floor(Math.random()*(i+1));
		let tmp = deck[i];
		deck[i] = deck[randomIndex];
		deck[randomIndex] = tmp;
	}
}

exports = Deck;