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
        var drawPile = _cardDeckFactory.CreateStandardDeckWithoutExplodingKittens(players.Length);

        // First shuffle
        drawPile.Shuffle();

        // Deal cards: 1 Defuse + 7 random cards = 8 total per player
        foreach (var player in players)
        {
            player.Hand.InsertCard(Card.Defuse);

            for (int i = 0; i < 7; i++)
            {
                player.Hand.InsertCard(drawPile.DrawTopCard());
            }
        }

        // Card removal for 3 or fewer players
        if (players.Length <= 3)
        {
            int removeCount = drawPile.CardCount / 3;
            for (int i = 0; i < removeCount; i++)
            {
                drawPile.DrawTopCard();
            }
        }

        // Add Exploding Kittens (Number of players - 1)
        int kittensToAdd = players.Length - 1;
        for (int i = 0; i < kittensToAdd; i++)
        {
            drawPile.InsertCard(Card.ExplodingKitten, 0);
        }

        // Second shuffle
        drawPile.Shuffle();

        // Youngest player starts
        var youngestPlayer = players
            .OrderByDescending(p => p.BirthDate)
            .First();

        return new Game(
            Guid.NewGuid(),
            players,
            drawPile,
            youngestPlayer.Id,
            _actionFactory
        );
    }
}