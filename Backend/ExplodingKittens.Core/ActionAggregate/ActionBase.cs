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

    public bool IsNoped => _playerNopeDecisions.Values.Count(d => d == NopeDecision.Nope) % 2 == 1;

    protected ActionBase(IGame game, Guid playerId, IReadOnlyList<Card> cards, bool canBeNoped, Card? targetCard = null, Guid? targetPlayerId = null, int? drawPileIndex = null)
    {
        Game = game;
        PlayerId = playerId;
        Cards = cards;
        CanBeNoped = canBeNoped;
        TargetCard = targetCard;
        TargetPlayerId = targetPlayerId;
        DrawPileIndex = drawPileIndex;

        foreach (var player in Game.Players)
        {
            _playerNopeDecisions[player.Id] = player.Id == PlayerId ? NopeDecision.NotNoping : NopeDecision.NotDecided;
        }
    }

    public void Nope(Guid nopingPlayerId)
    {
        if (IsExecuted) return;

        var currentDecision = _playerNopeDecisions[nopingPlayerId];
        _playerNopeDecisions[nopingPlayerId] = currentDecision == NopeDecision.Nope ? NopeDecision.NotNoping : NopeDecision.Nope;

        foreach (var playerId in _playerNopeDecisions.Keys.Where(id => id != nopingPlayerId))
        {
            _playerNopeDecisions[playerId] = NopeDecision.NotDecided;
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

        bool everyoneDecided = Game.Players.All(player => _playerNopeDecisions[player.Id] != NopeDecision.NotDecided);

        if (everyoneDecided)
        {
            if (!IsNoped)
            {
                // als action een taget card nodig heeft, wacht hij
                if (Cards.Contains(Card.Favor) && !TargetCard.HasValue) return;
                // NOTE: de lege return waarde dient om de methode te stoppen. (zoals break in python)
                Execute();
               
            }
            IsExecuted = true;
        }
    }

    protected abstract void Execute();
}