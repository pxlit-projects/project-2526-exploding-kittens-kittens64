using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;

namespace ExplodingKittens.Core.ActionAggregate;

internal class AttackAction : ActionBase
{
    public AttackAction(IGame game, Guid playerId, IReadOnlyList<Card> cards, bool canBeNoped)
        : base(game, playerId, cards, canBeNoped) { }

    public override void Execute() { }
}