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
        if (Game.PendingDraws <= 1)
        {
            Game.PendingDraws = 0;
            Game.AdvanceTurn(); // BUG fix: wanneer een speler een shuffle card speelt
                                // krijgt hij een extra turn, tenzij de andere speler nope kaart gebruikt
        }
       
    }
}