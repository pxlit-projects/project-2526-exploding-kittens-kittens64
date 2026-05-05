using ExplodingKittens.Core.ActionAggregate.Contracts;
using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;

namespace ExplodingKittens.Core.ActionAggregate;

internal class ActionFactory : IActionFactory
{
    public IAction Create(IGame game, Guid playerId, IReadOnlyList<Card> cards, Guid? targetPlayerId, Card? targetCard,
        int? drawPileIndex = null)
    {
        if (cards == null || cards.Count == 0)
            throw new InvalidOperationException("At least one card must be played.");

        if (cards.Count == 1)
        {
            var card = cards[0];
            return card switch
            {
                Card.Attack => new AttackAction(game, playerId, cards),
                Card.Defuse => ValidateAndCreateDefuse(game, playerId, cards, targetCard, drawPileIndex),
                Card.Favor => new FavorAction(game, playerId, cards, targetPlayerId ?? throw new InvalidOperationException("Target player is required for Favor.")),
                Card.SeeTheFuture => new SeeTheFutureAction(game, playerId, cards),
                Card.Shuffle => new ShuffleAction(game, playerId, cards),
                Card.Skip => new SkipAction(game, playerId, cards),
                _ => throw new InvalidOperationException($"Card {card} cannot be played as a single card action.")
            };
        }

        // Handle combinations (must be identical cards)
        if (cards.Distinct().Count() > 1)
        {
            throw new InvalidOperationException("Invalid card combination played.");
        }

        if (cards.Count == 2)
        {
            return new StealRandomCardAction(game, playerId, cards, targetPlayerId ?? throw new InvalidOperationException("Target player is required for Steal (Pair)."));
        }

        if (cards.Count == 3)
        {
            return new StealSpecificCardAction(game, playerId, cards, targetCard ?? throw new InvalidOperationException("Target card is required for Steal (Three of a kind)."), targetPlayerId ?? throw new InvalidOperationException("Target player is required for Steal (Three of a kind)."));
        }

        throw new InvalidOperationException("Invalid card combination played.");
    }

    private static IAction ValidateAndCreateDefuse(IGame game, Guid playerId, IReadOnlyList<Card> cards, Card? targetCard, int? drawPileIndex)
    {
        if (targetCard != Card.ExplodingKitten)
        {
            throw new InvalidOperationException("To create a 'Defuse' action, the target card must be an exploding kitten");
        }

        if (!drawPileIndex.HasValue)
        {
            throw new InvalidOperationException("To create a 'Defuse' action, a draw pile index must be specified");
        }

        return new DefuseAction(game, playerId, cards, drawPileIndex.Value);
    }
}