using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;

namespace ExplodingKittens.Core.ActionAggregate;

internal class ShuffleAction : ActionBase
{
    public ShuffleAction(IGame game, Guid playerId, IReadOnlyList<Card> cards, bool canBeNoped)
        : base(game, playerId, cards, canBeNoped) { }

    public override void Execute() { }
}