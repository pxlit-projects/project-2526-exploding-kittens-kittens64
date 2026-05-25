using ExplodingKittens.Core.ActionAggregate;
using ExplodingKittens.Core.ActionAggregate.Contracts;
using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.CardAggregate.Contracts;
using ExplodingKittens.Core.GameAggregate.Contracts;
using ExplodingKittens.Core.PlayerAggregate.Contracts;

namespace ExplodingKittens.Core.GameAggregate;

/// <inheritdoc cref="IGame"/>
internal class Game : IGame
{
    private readonly Guid _id;
    private readonly List<IPlayer> _players;
    private readonly ICardDeck _drawPile;
    private readonly IActionFactory _actionFactory;

    private Guid _currentPlayerId;
    private IAction? _pendingAction;

    /// <summary>
    /// Creates a new game. Does not deal cards or set first player; use <see cref="IGameFactory"/> for full setup.
    /// </summary>
    public Game(Guid id, IPlayer[] players, ICardDeck drawPile, Guid startingPlayerId, IActionFactory actionFactory)
    {
        _id = id;
        _players = players.ToList();
        _drawPile = drawPile;
        _currentPlayerId = startingPlayerId;
        _actionFactory = actionFactory;
        PendingDraws = 1;
    }

    public Guid Id => _id;
    public IPlayer[] Players => _players.ToArray();

    public Guid PlayerToPlayId => _currentPlayerId;

    public IList<Card> DiscardPile { get; } = new List<Card>();

    public ICardDeck DrawPile => _drawPile;

    public int PendingDraws { get; set; }

    public IAction? PendingAction => _pendingAction;

    public bool HasEnded => _players.Count(p => !p.Eliminated) <= 1;

    public IPlayer GetPlayerById(Guid playerId)
        => Players.First(p => p.Id == playerId);

    public void DrawCard(Guid playerId)
    {
        if (playerId != _currentPlayerId)
            throw new InvalidOperationException("It's not your turn.");
        if (_pendingAction != null && !_pendingAction.IsExecuted)
            throw new InvalidOperationException("There is a pending action.");

        _pendingAction = null;

        var player = GetPlayerById(playerId);
        var card = _drawPile.DrawTopCard();

        if (card == Card.ExplodingKitten)
        {
            if (player.Hand.Contains(Card.Defuse))
            {


                player.Hand.InsertCard(card);
                PendingDraws--;
                _pendingAction = new DefuseAction(this, playerId, new[] { Card.Defuse }, null);
            }
            else
            {
               player.Hand.InsertCard(card);
               (player as PlayerAggregate.PlayerBase)!.Eliminated = true;

                PendingDraws = 0;
                AdvanceTurn();
            }
        }
        else
        {
            player.Hand.InsertCard(card);
            PendingDraws--;
            if (PendingDraws == 0)
            {
                AdvanceTurn();
            }
        }
    }

    public void PlayAction(Guid playerId, IReadOnlyList<Card> cards, Guid? targetPlayerId, Card? targetCard, int? drawPileIndex)
    {
        if (playerId != _currentPlayerId && !cards.All(c => c == Card.Nope))
            throw new InvalidOperationException("It's not your turn (unless you play a Nope).");
        if (_pendingAction != null && !_pendingAction.IsExecuted && !_pendingAction.Cards.Contains(Card.Defuse))
            throw new InvalidOperationException("There is already a pending action.");

        if (_pendingAction != null && _pendingAction.Cards.Contains(Card.Defuse) && !_pendingAction.IsExecuted)
        {
            _pendingAction = _actionFactory.Create(this, playerId, new[] { Card.Defuse }, null, Card.ExplodingKitten, drawPileIndex);
            foreach (var p in Players)
            {
                _pendingAction.ConfirmNotNoping(p.Id);
            }
            return;
        }

        var player = GetPlayerById(playerId);

        foreach (var card in cards)
        {
            player.Hand.PickSpecificCard(card);
            DiscardPile.Add(card);
        }

        _pendingAction = _actionFactory.Create(this, playerId, cards, targetPlayerId, targetCard, drawPileIndex);

        if (!_pendingAction.CanBeNoped)
        {
            foreach (var p in Players)
                _pendingAction.ConfirmNotNoping(p.Id);
        }
    }

    private void AutoConfirmPlayersWithoutNopeCards()
    {
        if (_pendingAction == null || _pendingAction.IsExecuted) return;

        foreach (var p in Players)
        {
            if (_pendingAction.IsExecuted) break;
            if (_pendingAction.PlayerNopeDecisions.TryGetValue(p.Id, out var decision)
                && decision == NopeDecision.NotDecided
                && !p.Hand.Contains(Card.Nope))
            {
                _pendingAction.ConfirmNotNoping(p.Id);
            }
        }
    }
    public void ConfirmNotNopingPendingAction(Guid playerId)
    {
        if (_pendingAction == null) throw new InvalidOperationException("No pending action.");
        _pendingAction.ConfirmNotNoping(playerId);

        if (_pendingAction.IsExecuted) return;

        foreach (var p in Players)
        {
            if (_pendingAction.IsExecuted) break;
            if (_pendingAction.PlayerNopeDecisions.TryGetValue(p.Id, out var decision)
                && decision == NopeDecision.NotDecided
                && !p.Hand.Contains(Card.Nope)
                && p.Id != _pendingAction.PlayerId)
            {
                _pendingAction.ConfirmNotNoping(p.Id);
            }
        }
        AutoConfirmPlayersWithoutNopeCards();

    }

    public void NopePendingAction(Guid playerId)
    {
        if (_pendingAction == null) throw new InvalidOperationException("No pending action.");

        var player = GetPlayerById(playerId);
        _pendingAction.Nope(playerId);

        var nopeCard = player.Hand.PickSpecificCard(Card.Nope);
        if (nopeCard == null) throw new InvalidOperationException("Player has no Nope card.");

        DiscardPile.Add(Card.Nope);

        if (_pendingAction.IsExecuted) return;

        foreach (var p in Players)
        {
            if (_pendingAction.IsExecuted) break;
            if (_pendingAction.PlayerNopeDecisions.TryGetValue(p.Id, out var decision)
                && decision == NopeDecision.NotDecided
                && !p.Hand.Contains(Card.Nope)
                && p.Id != _pendingAction.PlayerId)
            {
                _pendingAction.ConfirmNotNoping(p.Id);
            }
        }
        AutoConfirmPlayersWithoutNopeCards();
    }

    public void SelectCardToGiveAsAFavor(Guid playerId, Card card)
    {
        if (_pendingAction == null || !_pendingAction.Cards.Contains(Card.Favor))
            throw new InvalidOperationException("The pending action is not a Favor action.");

        _pendingAction.TargetCard = card;
        _pendingAction.ConfirmNotNoping(playerId);
    }

    public void AdvanceTurn()
    {
        if (PendingDraws > 0) throw new InvalidOperationException("Player still has pending draws.");

        foreach (var player in _players)
        {
            player.FutureCards = new List<Card>();
        }

        var activePlayers = _players.Where(p => !p.Eliminated).ToList();
        if (activePlayers.Count <= 1) return;

        int currentIndex = activePlayers.FindIndex(p => p.Id == _currentPlayerId);
        int nextIndex = (currentIndex + 1) % activePlayers.Count;
        _currentPlayerId = activePlayers[nextIndex].Id;
        PendingDraws = 1;
        //_pendingAction = null;  //voorlopig laten, probeer de game integration te fixen
    }

}

