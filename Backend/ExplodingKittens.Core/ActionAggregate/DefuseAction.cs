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

            // Defuse uit hand halen en op de aflegstapel plaatsen
            player.Hand.PickSpecificCard(Card.Defuse);
            Game.DiscardPile.Add(Card.Defuse);

            // Exploding Kitten uit hand halen en terug in de trekstapel plaatsen
            player.Hand.PickSpecificCard(Card.ExplodingKitten);

            var maxIndex = Game.DrawPile.CardCount;
            if (DrawPileIndex.Value < 0 || DrawPileIndex.Value > maxIndex)
                throw new InvalidOperationException("Invalid draw pile index.");

            Game.DrawPile.InsertCard(Card.ExplodingKitten, DrawPileIndex.Value);

            Game.PendingDraws = 0;
            Game.AdvanceTurn();
        }
    }
}