using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;

namespace ExplodingKittens.Core.ActionAggregate;

internal class StealSpecificCardAction : ActionBase
{
    public StealSpecificCardAction(IGame game, Guid playerId, IReadOnlyList<Card> cards, Card targetCard, Guid targetPlayerId)
        : base(game, playerId, cards, true, targetCard, targetPlayerId)
    {
    }

    protected override void Execute()
    {
        if (TargetPlayerId.HasValue && TargetCard.HasValue)
        {
            var targetPlayer = Game.GetPlayerById(TargetPlayerId.Value);
            var initiator = Game.GetPlayerById(PlayerId);
            var card = targetPlayer.Hand.PickSpecificCard(TargetCard.Value);
            if (card.HasValue)
            {
                initiator.Hand.InsertCard(card.Value);
            }
        }
    }
}