using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;

namespace ExplodingKittens.Core.ActionAggregate;

internal class FavorAction : ActionBase
{
    public FavorAction(IGame game, Guid playerId, Guid targetPlayerId)
        : this(game, playerId, new List<Card> { Card.Favor }, targetPlayerId)
    {
    }

    public FavorAction(IGame game, Guid playerId, IReadOnlyList<Card> cards, Guid targetPlayerId)
        : base(game, playerId, cards, true, null, targetPlayerId)
    {
    }

    protected override void Execute()
    {
        if (TargetCard.HasValue && TargetPlayerId.HasValue)
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