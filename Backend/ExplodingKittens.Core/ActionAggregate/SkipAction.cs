using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;

namespace ExplodingKittens.Core.ActionAggregate;

internal class SkipAction : ActionBase
{
    public SkipAction(IGame game, Guid playerId, IReadOnlyList<Card> cards)
        : base(game, playerId, cards, true)
    {
    }

    protected override void Execute()
    {
        Game.PendingDraws--;
        if (Game.PendingDraws < 0) Game.PendingDraws = 0;
        if (Game.PendingDraws == 0)
        {
            Game.AdvanceTurn();
        }
    }
}
