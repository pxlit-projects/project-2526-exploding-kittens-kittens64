using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;

namespace ExplodingKittens.Core.ActionAggregate;

internal class DefuseAction : ActionBase
{
    public DefuseAction(IGame game, Guid playerId, IReadOnlyList<Card> cards, int drawPileIndex)
        : base(game, playerId, cards, false, Card.ExplodingKitten, null, drawPileIndex)
    {
    }

    protected override void Execute()
    {
        if (TargetCard == Card.ExplodingKitten && DrawPileIndex.HasValue)
        {
            Game.DrawPile.InsertCard(Card.ExplodingKitten, DrawPileIndex.Value);
            Game.AdvanceTurn();
        }
    }
}