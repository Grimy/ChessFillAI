function play()
{
	let positions = [];
	for (let x = 0; x < game.boardSize; x++)
		for (let y = 0; y < game.boardSize; y++)
			positions.push(new Position(x, y));

	let joker = new Piece(game);

	let piece_chance = [0, 0.09, 0.06, 0.10, 0.20, 0.01, 0.04];

	function score()
	{
		let moves = 0;

		for (let col of game.board)
			for (let piece of col)
				if (piece && !piece.frozen)
					moves += piece.getDestinationTiles().length;

		return moves ? moves : -12;
	}

	function randScore(recurse)
	{
		let empty = 0;
		let total = 0;

		for (let pos of positions) {
			if (game.board[pos.x][pos.y])
				continue;

			++empty;
			joker.position = pos;
			game.board[pos.x][pos.y] = joker;

			for (let isBlack of [false, true]) {
				joker.isBlack = isBlack;
				for (let type = 1; type <= 6; type++) {
					joker.pieceType = type;
					total += (recurse ? bestMove().score : score()) * piece_chance[type];
				}
			}

			game.board[pos.x][pos.y] = 0;
		}

		return total / empty;
	}

	function bestMove()
	{
		let best = { score: -1/0, pos: undefined, dest: undefined };
		let recurse = score() < 3;

		for (let pos of positions) {
			let piece = game.board[pos.x][pos.y];
			if (!piece || piece.frozen)
				continue;

			game.board[pos.x][pos.y] = 0;
			piece.frozen = true;

			for (let dest of piece.getDestinationTiles()) {

				let capturedPiece = game.board[dest.x][dest.y];
				game.board[dest.x][dest.y] = piece;
				piece.position = dest;

				let score = randScore(recurse);

				game.board[dest.x][dest.y] = capturedPiece;

				if (score > best.score)
					best = { score, pos, dest };
			}

			game.board[pos.x][pos.y] = piece;
			piece.frozen = false;
			piece.position = pos;
		}

		return best;
	}

	function main() {
		let best = bestMove();
		if (!best.pos)
			return "):";
		game.move(best.pos, best.dest);
		game.placeRandomPieces(1);

		setTimeout(play, 16);
	}

	return main();
}
