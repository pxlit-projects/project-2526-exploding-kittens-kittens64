using ExplodingKittens.Core.ActionAggregate.Contracts;
using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.CardAggregate.Contracts;
using ExplodingKittens.Core.GameAggregate.Contracts;
using ExplodingKittens.Core.TableAggregate.Contracts;
using ExplodingKittens.Core.PlayerAggregate;

namespace ExplodingKittens.Core.GameAggregate;

internal class GameFactory : IGameFactory
{
    private readonly ICardDeckFactory _cardDeckFactory;
    private readonly IActionFactory _actionFactory;

    public GameFactory(ICardDeckFactory cardDeckFactory, IActionFactory actionFactory)
    {
        _cardDeckFactory = cardDeckFactory;
        _actionFactory = actionFactory;
    }

    public IGame CreateNewForTable(ITable table)
    {
        var players = table.SeatedPlayers.ToArray();
        var gameId = Guid.NewGuid();

        var drawPile = _cardDeckFactory.CreateStandardDeckWithoutExplodingKittens(players.Length);

        drawPile.Shuffle();

        foreach (var player in players)
        {
            player.Hand.InsertCard(Card.Defuse);

            for (int i = 0; i < 7; i++)
            {
                player.Hand.InsertCard(drawPile.DrawTopCard());
            }
        }

        if (players.Length <= 3)
        {
            int removeCount = drawPile.CardCount / 3;

            for (int i = 0; i < removeCount; i++)
            {
                drawPile.DrawTopCard();
            }
        }

        int kittens = players.Length - 1;

        for (int i = 0; i < kittens; i++)
        {
            drawPile.InsertCard(Card.ExplodingKitten, 0);
        }

        drawPile.Shuffle();

        var youngestPlayer = players
            .OrderByDescending(p => p.BirthDate)
            .First();

        var startingPlayerId = youngestPlayer.Id;

        return new Game(
            gameId,
            players,
            drawPile,
            youngestPlayer.Id,
            _actionFactory
        );
    }
}