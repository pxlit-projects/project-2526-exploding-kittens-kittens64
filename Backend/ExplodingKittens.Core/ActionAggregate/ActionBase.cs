using ExplodingKittens.Core.ActionAggregate.Contracts;
using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;

namespace ExplodingKittens.Core.ActionAggregate;

internal abstract class ActionBase : IAction
{
    protected IGame _game;
    private readonly Dictionary<Guid, NopeDecision> _playerNopeDecisions = new();

    public Guid PlayerId { get; }
    public IReadOnlyList<Card> Cards { get; }
    public bool CanBeNoped { get; }
    public Guid? TargetPlayerId { get; }
    public Card? TargetCard { get; set; }
    public int? DrawPileIndex { get; }
    public bool IsExecuted { get; protected set; }

    public IReadOnlyDictionary<Guid, NopeDecision> PlayerNopeDecisions => _playerNopeDecisions;

    public bool IsNoped => _playerNopeDecisions.Values.Count(d => d == NopeDecision.Nope) % 2 == 1;

    protected ActionBase(IGame game, Guid playerId, IReadOnlyList<Card> cards, bool canBeNoped)
    {
        _game = game;
        PlayerId = playerId;
        Cards = cards;
        CanBeNoped = canBeNoped;

        foreach (var player in game.Players)
        {
            if (player.Id != playerId)
                _playerNopeDecisions[player.Id] = NopeDecision.NotDecided;
        }
    }

    protected ActionBase(IGame game, Guid playerId, IReadOnlyList<Card> cards, bool canBeNoped, Card? targetCard, Guid? targetPlayerId, int? drawPileIndex)
        : this(game, playerId, cards, canBeNoped)
    {
        TargetCard = targetCard;
        TargetPlayerId = targetPlayerId;
        DrawPileIndex = drawPileIndex;
    }

    public void Nope(Guid nopingPlayerId)
    {
        bool currentlyNoped = IsNoped;
        foreach (var key in _playerNopeDecisions.Keys.ToList())
            _playerNopeDecisions[key] = NopeDecision.NotDecided;

        _playerNopeDecisions[nopingPlayerId] = currentlyNoped ? NopeDecision.NotNoping : NopeDecision.Nope;
    }

    public void ConfirmNotNoping(Guid notNopingPlayerId)
    {
        _playerNopeDecisions[notNopingPlayerId] = NopeDecision.NotNoping;
    }

    public abstract void Execute();
}