using ExplodingKittens.Core.ActionAggregate.Contracts;
using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;

namespace ExplodingKittens.Core.ActionAggregate;

internal abstract class ActionBase : IAction
{
    private readonly Dictionary<Guid, NopeDecision> _playerNopeDecisions = new();

    protected IGame Game { get; }

    public Guid PlayerId { get; }
    public IReadOnlyList<Card> Cards { get; }
    public bool CanBeNoped { get; }
    public Guid? TargetPlayerId { get; }
    public Card? TargetCard { get; set; }
    public int? DrawPileIndex { get; }

    public bool IsExecuted { get; protected set; }

    public IReadOnlyDictionary<Guid, NopeDecision> PlayerNopeDecisions => _playerNopeDecisions;

    private int _nopeChainCount = 0;

    public bool IsNoped => _nopeChainCount % 2 == 1;

    protected ActionBase(IGame game, Guid playerId, IReadOnlyList<Card> cards, bool canBeNoped, Card? targetCard = null, Guid? targetPlayerId = null, int? drawPileIndex = null)
    {
        Game = game;
        PlayerId = playerId;
        Cards = cards;
        CanBeNoped = canBeNoped;
        TargetCard = targetCard;
        TargetPlayerId = targetPlayerId;
        DrawPileIndex = drawPileIndex;

        foreach (var player in Game.Players.Where(p => !p.Eliminated))
        {
            if (player.Id == PlayerId)
            {
                _playerNopeDecisions[player.Id] = NopeDecision.NotNoping;
            }
            else if (player.Hand.Contains(Card.Nope))
            {
                _playerNopeDecisions[player.Id] = NopeDecision.NotDecided;
            }
            else
            {
                _playerNopeDecisions[player.Id] = NopeDecision.NotNoping;
            }
        }
    }


    public void Nope(Guid nopingPlayerId)
    {
        if (IsExecuted) return;

        _nopeChainCount++;
        _playerNopeDecisions[nopingPlayerId] = NopeDecision.Nope;

        foreach (var player in Game.Players.Where(p => p.Id != nopingPlayerId))
        {
            if (player.Hand.Contains(Card.Nope))
                _playerNopeDecisions[player.Id] = NopeDecision.NotDecided;
            else
                _playerNopeDecisions[player.Id] = NopeDecision.NotNoping;
        }

        if (!Game.Players.First(p => p.Id == PlayerId).Hand.Contains(Card.Nope))
        {
            _playerNopeDecisions[PlayerId] = NopeDecision.NotNoping;
        }
    }

    public void ConfirmNotNoping(Guid notNopingPlayerId)
    {
        if (IsExecuted) return;
        _playerNopeDecisions[notNopingPlayerId] = NopeDecision.NotNoping;
        CheckAndExecute();
    }

    private void CheckAndExecute()
    {
        if (IsExecuted) return;

        bool everyoneDecided = Game.Players.Where(p => !p.Eliminated).All(player => _playerNopeDecisions[player.Id] != NopeDecision.NotDecided);

        if (everyoneDecided)
        {
            if (!IsNoped)
            {
                if (Cards.Contains(Card.Favor) && !TargetCard.HasValue) return;
                Execute();
            }
            IsExecuted = true;
        }
    }

    protected abstract void Execute();
}