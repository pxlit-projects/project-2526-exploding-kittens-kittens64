using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;

namespace ExplodingKittens.Core.ActionAggregate;

internal class SeeTheFutureAction : ActionBase
{
    public SeeTheFutureAction(IGame game, Guid playerId, IReadOnlyList<Card> cards)
        : base(game, playerId, cards, true)
    {
    }

    protected override void Execute()
    {
        var player = Game.GetPlayerById(PlayerId);
        player.FutureCards = Game.DrawPile.PeekTopCards(3);
    }
}