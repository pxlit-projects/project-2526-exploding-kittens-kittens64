using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;

namespace ExplodingKittens.Core.ActionAggregate;

internal class FavorAction : ActionBase
{
    public FavorAction(IGame game, Guid playerId, IReadOnlyList<Card> cards, bool canBeNoped, Card? targetCard, Guid? targetPlayerId, int? drawPileIndex)
        : base(game, playerId, cards, canBeNoped, targetCard, targetPlayerId, drawPileIndex) { }

    public override void Execute() { }
}