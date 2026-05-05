using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;

namespace ExplodingKittens.Core.ActionAggregate;

internal class StealRandomCardAction : ActionBase
{
    public StealRandomCardAction(IGame game, Guid playerId, IReadOnlyList<Card> cards, Guid targetPlayerId)
        : base(game, playerId, cards, true, null, targetPlayerId)
    {
    }

    protected override void Execute()
    {
        if (TargetPlayerId.HasValue)
        {
            var targetPlayer = Game.GetPlayerById(TargetPlayerId.Value);
            var initiator = Game.GetPlayerById(PlayerId);
            var card = targetPlayer.Hand.PickRandomCard();
            if (card.HasValue)
            {
                initiator.Hand.InsertCard(card.Value);
            }
        }
    }
}