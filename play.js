document.getElementById('restartButton').onclick = function()
{
	let positions = [];
	for (let x = 0; x < game.boardSize; x++)
		for (let y = 0; y < game.boardSize; y++)
			positions.push(new Position(x, y));

	let joker = new Piece(game);

	let piece_chance = [0, 0.09, 0.06, 0.10, 0.20, 0.01, 0.04];
	let bsqp = game.boardSize * game.boardSize + 1;

	function score()
	{
		let moves = [0, 0];
		let black = 0;
		let white = 0;

		for (let pos of positions) {
			let piece = game.board[pos.x][pos.y];
			if (!piece)
				continue;
			black += piece.isBlack;
			white += !piece.isBlack;
			if (piece.frozen)
				continue;
			for (let dest of piece.getDestinationTiles()) {
				let capturedPiece = game.board[dest.x][dest.y];
				++moves[+(capturedPiece && capturedPiece.frozen)];
			}
		}

		let penalty = moves[1] ? 0 : moves[0] ? 100 : 1e9;

		return moves[1] + (moves[0] / 64) - penalty + black * white;
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
		let recurse = false;

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
				if (capturedPiece && capturedPiece.frozen)
					score += 100;
				else if (dest.x == 2 && dest.y == 2)
					score -= 4;
				else if (dest.x > 0 && dest.x < 4 && dest.y > 0 && dest.y < 4)
					score += 16;

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
			return console.log("):");
		game.move(best.pos, best.dest);
		game.placeRandomPieces(1);

		setTimeout(main, 0);
	}

	restartButtonClick();
	return main();
};
