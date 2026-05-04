using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;

namespace ExplodingKittens.Core.ActionAggregate;

internal abstract class ActionBase
{
    protected IGame _game;
    protected Guid _playerId;
    protected IReadOnlyList<Card> _cards;
    protected bool _canBeNoped;
    protected Card? _targetCard;
    protected Guid? _targetPlayerId;
    protected int? _drawPileIndex;

    protected ActionBase(IGame game, Guid playerId, IReadOnlyList<Card> cards, bool canBeNoped)
    {
        _game = game;
        _playerId = playerId;
        _cards = cards;
        _canBeNoped = canBeNoped;
    }

    protected ActionBase(IGame game, Guid playerId, IReadOnlyList<Card> cards, bool canBeNoped, Card? targetCard, Guid? targetPlayerId, int? drawPileIndex)
        : this(game, playerId, cards, canBeNoped)
    {
        _targetCard = targetCard;
        _targetPlayerId = targetPlayerId;
        _drawPileIndex = drawPileIndex;
    }

    public abstract void Execute();
}