
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req,res) {
	res.sendFile(__dirname + '/index.html');
});
app.get('/index.html', function(req,res) {
	res.sendFile(__dirname + 'index.html');
});


var games = {};
var users = {};

function createGame(socket,pId) {
	let g = new Game("game_"+Date.now(), {});

	games[g.id] = g;
	joinGame(socket,pId,g.id);
}
function joinGame(socket,pId,gId) {
	let result = games[g.id].joinGame(pId);

	if (!result) {
		users[pId].game = gId;
		socket.join(gId);
		socket.emit('joinedGame',{id:gId});
	} else {
		socket.emit('joinGameFailed',{id:gId,reason:result});
	}
}
function leaveGame(socket,pId) {
	let user = users[pId];

	let gId = user.game;
	if (gId) {
		games[gId].leaveGame(pId);
		socket.leave(gId);
		user.game = null;
	} else {
		console.log('player trying to leave when game is null',pId);
	}
}

var MAX_NAME_LENGTH = 12;
var nameFilters = [
	'admin',
	'steam',
	'google'
];
function filterName(name) {
	// dont allow nasty crap

	if (name.length > MAX_NAME_LENGTH) {
		name = name.substring(0,MAX_NAME_LENGTH);
	}

	for (let i = 0, ii = nameFilters.length; i<ii; i++) {
		if ((new RegExp(nameFilters[i])).test(name)) {
			name = "BadName";
		}
		break;
	}
	return name;
}

io.on('connection', function(socket) {
	let id = socket.id;
	console.log('user connect',id);

	users[id] = {
		id: id,
		name: 'unnamed_user',
		game: null
	};

	socket.on('setNick', function(data) {
		let name = filterName(data.name);
		users[id].name = name;

		socket.emit('setNick', name);
	});

	socket.on('joinQuickPlay', function() {
		// find an available game
		console.log(id,'clicked quick play');
		let keys = Object.keys(games)

		let chosenGame = null;
		// TODO: databasify this so we can ip_hash servers / not do a linear search
		for (let i = 0, ii = keys.length; i < ii; i++) {
			let game = games[i];

			if (game == null) {
				// something asynchronous happened
				continue;
			}

			if (game.status == "waiting" && (game.playerCount < game.maxPlayers)) {
				chosenGame = game;
				break;
			}
		}
		if (chosenGame == null) {
			console.log('no available game session for id, creating new session',id);
			createGame(socket,id)
		} else {
			joinGame(socket,id,chosenGame.id);
		}
	});

	// debug function.
	socket.on('gameList', function() {
		// send list of available games
		let gameIds = Object.keys(games);
		let gameList = []
		let g;
		for (let i = 0, ii = gameIds.length; i<ii; i++) {
			g = games[gameIds[i]];
			gameList.push({id:g.id, name:g.name, playerCount: g.playerCount, maxPlayers: g.maxPlayers});
		}

		socket.emit('gameList', gameList);
	});

	//socket.on('message type', function(msg) {})
	//socket.emit('message type', data)
	//socket.broadcast.emit('message type', data)
	//io.emit('message type', data)

	socket.on('disconnect', function() {
		//
		let u = users[socket.id];

		if (u.game) {
			// inform game of disc
			games[u.game].leaveGame(u.id);
		}

		delete users[u.id];
	});
});

var debugAnnouncer = setInterval(function() {
	let keys = Object.keys(games);
	console.log('list time',Date.now());
	for (let i = 0, ii = keys.length; i < ii; i++) {
		console.log('game '+i,games[keys[i]]);
	}
	keys = Object.keys(users);
	for (let i = 0, ii = keys.length; i < ii; i++) {
		console.log('user '+i,games[keys[i]]);
	}
}, 60000);


http.listen(10080, function() {
	console.log('listening on 10080');
});
