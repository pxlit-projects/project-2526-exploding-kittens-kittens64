using ExplodingKittens.Core.ActionAggregate.Contracts;
using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;

namespace ExplodingKittens.Core.ActionAggregate;

internal class ActionFactory : IActionFactory
{
    public IAction Create(IGame game, Guid playerId, IReadOnlyList<Card> cards, Guid? targetPlayerId, Card? targetCard, int? drawPileIndex = null)
    {
        if (cards == null || cards.Count == 0)
            throw new InvalidOperationException("At least one card must be provided.");

        if (cards.Any(c => c == Card.ExplodingKitten))
            throw new InvalidOperationException("An exploding kitten card cannot be used to create an action.");

        if (cards.Any(c => c == Card.Nope))
            throw new InvalidOperationException("A 'Nope' card cannot be used to create an action.");

        bool hasActionCards = cards.Any(IsActionCard);
        bool hasCatCards = cards.Any(IsCatCard);

        if (hasActionCards && hasCatCards)
            throw new InvalidOperationException("Action cards and cat cards cannot be mixed.");

        if (cards.Count == 1)
        {
            var card = cards[0];

            if (card == Card.Defuse)
            {
                if (targetCard != Card.ExplodingKitten)
                    throw new InvalidOperationException("To create a 'Defuse' action, the target card must be an exploding kitten.");
                if (drawPileIndex == null)
                    throw new InvalidOperationException("To create a 'Defuse' action, a draw pile index must be specified.");
                return new DefuseAction(game, playerId, cards, true, targetCard, targetPlayerId, drawPileIndex);
            }

            if (card == Card.Favor)
            {
                if (targetPlayerId == null)
                    throw new InvalidOperationException("A target player must be specified for a 'Favor' action.");
                return new FavorAction(game, playerId, cards, true, targetCard, targetPlayerId, drawPileIndex);
            }

            return card switch
            {
                Card.Attack => new AttackAction(game, playerId, cards, true),
                Card.Skip => new SkipAction(game, playerId, cards, true),
                Card.Shuffle => new ShuffleAction(game, playerId, cards, true),
                Card.SeeTheFuture => new SeeTheFutureAction(game, playerId, cards, true),
                _ => throw new InvalidOperationException("Invalid card type.")
            };
        }

        // --- Multi-Card Combinations (User Story 8) ---
        if (!cards.All(c => c == cards[0]))
            throw new InvalidOperationException("Different cat cards are not allowed.");

        if (targetPlayerId == null)
            throw new InvalidOperationException("When multiple cat cards are played, a target player must be specified.");

        if (cards.Count == 2)
        {
            // 2-of-a-kind: Steal a random card
            return new StealRandomCardAction(game, playerId, cards, true, targetCard, targetPlayerId, drawPileIndex);
        }

        if (cards.Count == 3)
        {
            // 3-of-a-kind: Steal a specific card (requires targetCard to be set)
            if (targetCard == null)
                throw new InvalidOperationException("When three cat cards are played, a target card must be specified.");

            return new StealSpecificCardAction(game, playerId, cards, true, targetCard, targetPlayerId, drawPileIndex);
        }

        throw new InvalidOperationException("Invalid card combination.");
    }

    private bool IsActionCard(Card card) => card is Card.Attack or Card.Skip or Card.Favor or Card.Shuffle or Card.SeeTheFuture or Card.Defuse;

    private bool IsCatCard(Card card) => card is Card.BeardCat or Card.Cattermelon or Card.HairyPotatoCat or Card.RainbowRalphingCat or Card.TacoCat;
}