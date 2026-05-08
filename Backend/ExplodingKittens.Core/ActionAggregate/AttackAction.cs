using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;

namespace ExplodingKittens.Core.ActionAggregate;

internal class AttackAction : ActionBase
{
    public AttackAction(IGame game, Guid playerId, IReadOnlyList<Card> cards)
        : base(game, playerId, cards, true)
    {
    }

    protected override void Execute()
    {
        Game.PendingDraws = 0;
        Game.PendingDraws += 2;
        Game.AdvanceTurn();
    }
}