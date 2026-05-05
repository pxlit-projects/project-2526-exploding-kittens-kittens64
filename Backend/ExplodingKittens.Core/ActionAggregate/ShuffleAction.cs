using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;

namespace ExplodingKittens.Core.ActionAggregate;

internal class ShuffleAction : ActionBase
{
    public ShuffleAction(IGame game, Guid playerId, IReadOnlyList<Card> cards)
        : base(game, playerId, cards, true)
    {
    }

    protected override void Execute()
    {
        Game.DrawPile.Shuffle();
    }
}