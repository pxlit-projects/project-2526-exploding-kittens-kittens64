using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;

namespace ExplodingKittens.Core.ActionAggregate;

internal class SeeTheFutureAction : ActionBase
{
    public SeeTheFutureAction(IGame game, Guid playerId, IReadOnlyList<Card> cards, bool canBeNoped)
        : base(game, playerId, cards, canBeNoped) { }

    public override void Execute() { }
}