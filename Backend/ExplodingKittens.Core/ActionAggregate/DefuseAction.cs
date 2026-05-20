using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;

namespace ExplodingKittens.Core.ActionAggregate;

internal class DefuseAction : ActionBase
{
    public DefuseAction(IGame game, Guid playerId, IReadOnlyList<Card> cards, int? drawPileIndex)
        : base(game, playerId, cards, false, Card.ExplodingKitten, null, drawPileIndex)
    {
    }

    protected override void Execute()
    {
        if (TargetCard == Card.ExplodingKitten && DrawPileIndex.HasValue)
        {
            var player = Game.GetPlayerById(PlayerId);
            // verwijdert exploding kitten van de hand
            player.Hand.PickSpecificCard(Card.ExplodingKitten);

            // je steekt terug in de draw pile, de positie van de kaart beslis jezelf
            Game.DrawPile.InsertCard(Card.ExplodingKitten, DrawPileIndex.Value);

            Game.PendingDraws = 0;

            Game.AdvanceTurn();
        }
    }
}