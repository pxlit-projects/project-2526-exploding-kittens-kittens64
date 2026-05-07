using ExplodingKittens.Core.ActionAggregate.Contracts;
using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;

namespace ExplodingKittens.Core.ActionAggregate;

internal class ActionFactory : IActionFactory
{
    public IAction Create(IGame game, Guid playerId, IReadOnlyList<Card> cards, Guid? targetPlayerId, Card? targetCard, int? drawPileIndex = null)
    {
        if (cards == null || cards.Count == 0)
            throw new InvalidOperationException("At least one card has to be played");

        if (cards.Any(c => c == Card.ExplodingKitten))
            throw new InvalidOperationException("an exploding kitten cant be used right now");

        if (cards.Any(c => c == Card.Nope))
            throw new InvalidOperationException("A Nope card cant be used for this action");

        bool hasActionCards = cards.Any(IsActionCard);
        bool hasCatCards = cards.Any(IsCatCard);

        if (hasActionCards && hasCatCards)
            throw new InvalidOperationException("Action cards and cat cards cannot be mixed");

        if (cards.Count == 1)
        {
            var card = cards[0];

            if (card == Card.Defuse)
            {
                if (targetCard != Card.ExplodingKitten)
                    throw new InvalidOperationException("To use a Defuse action, the target card must be an exploding kitten");
                if (drawPileIndex == null)
                    throw new InvalidOperationException("to use a Defuse action, a draw pile must be given");
                return new DefuseAction(game, playerId, cards, true, targetCard, targetPlayerId, drawPileIndex);
            }

            if (card == Card.Favor)
            {
                if (targetPlayerId == null)
                    throw new InvalidOperationException("A target player must be given for a Favor action");
                return new FavorAction(game, playerId, cards, true, targetCard, targetPlayerId, drawPileIndex);
            }

            return card switch
            {
                Card.Attack => new AttackAction(game, playerId, cards, true),
                Card.Skip => new SkipAction(game, playerId, cards, true),
                Card.Shuffle => new ShuffleAction(game, playerId, cards, true),
                Card.SeeTheFuture => new SeeTheFutureAction(game, playerId, cards, true),
                _ => throw new InvalidOperationException("invalid card type")
            };
        }

        if (!cards.All(c => c == cards[0]))
            throw new InvalidOperationException("Different cat cards are not allowed");

        if (targetPlayerId == null)
            throw new InvalidOperationException("When multiple cat cards are played, a target player have to be given");

        if (cards.Count == 2)
            return new StealRandomCardAction(game, playerId, cards, true, targetCard, targetPlayerId, drawPileIndex);

        if (cards.Count == 3)
        {
            if (targetCard == null)
                throw new InvalidOperationException("When three cat cards are played, a target card have to be be given");
            return new StealSpecificCardAction(game, playerId, cards, true, targetCard, targetPlayerId, drawPileIndex);
        }

        throw new InvalidOperationException("Invalid card combination");
    }

    private bool IsActionCard(Card card) => card is Card.Attack or Card.Skip or Card.Favor or Card.Shuffle or Card.SeeTheFuture or Card.Defuse;

    private bool IsCatCard(Card card) => card is Card.BeardCat or Card.Cattermelon or Card.HairyPotatoCat or Card.RainbowRalphingCat or Card.TacoCat;
}