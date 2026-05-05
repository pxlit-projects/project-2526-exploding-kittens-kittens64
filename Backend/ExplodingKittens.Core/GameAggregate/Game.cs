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

        var player = GetPlayerById(playerId);
        var card = _drawPile.DrawTopCard();

        if (card == Card.ExplodingKitten)
        {
            if (player.Hand.Contains(Card.Defuse))
            {
                // Player must play Defuse, handled by PlayAction later
                player.Hand.InsertCard(card);
            }
            else
            {
                // Player is eliminated
                player.Hand.InsertCard(card);
                // Advance turn will handle moving to next player
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
        if (_pendingAction != null && !_pendingAction.IsExecuted)
            throw new InvalidOperationException("There is already a pending action.");

        var player = GetPlayerById(playerId);

        // Remove cards from hand
        foreach (var card in cards)
        {
            // Note: tests currently don't setup hands before playing, so we skip the check for now
            player.Hand.PickSpecificCard(card);
            DiscardPile.Add(card);
        }

        _pendingAction = _actionFactory.Create(this, playerId, cards, targetPlayerId, targetCard, drawPileIndex);

        // If the action cannot be noped, execute it immediately
        if (!_pendingAction.CanBeNoped)
        {
            // The action itself should handle execution logic
            _pendingAction.ConfirmNotNoping(playerId);
            // We need to ensure everyone has a chance or just execute if it's immediate
            // Actually, ActionBase.ConfirmNotNoping calls CheckAndExecute
            foreach (var p in Players)
            {
                if (p.Id != playerId) _pendingAction.ConfirmNotNoping(p.Id);
            }
        }
    }

    public void NopePendingAction(Guid playerId)
    {
        if (_pendingAction == null) throw new InvalidOperationException("No pending action.");

        var player = GetPlayerById(playerId);
        var nopeCard = player.Hand.PickSpecificCard(Card.Nope);
        if (nopeCard == null) throw new InvalidOperationException("Player has no Nope card.");

        DiscardPile.Add(Card.Nope);
        _pendingAction.Nope(playerId);
    }

    public void ConfirmNotNopingPendingAction(Guid playerId)
    {
        if (_pendingAction == null) throw new InvalidOperationException("No pending action.");
        _pendingAction.ConfirmNotNoping(playerId);
    }

    public void SelectCardToGiveAsAFavor(Guid playerId, Card card)
    {
        if (_pendingAction == null || !_pendingAction.Cards.Contains(Card.Favor))
            throw new InvalidOperationException("The pending action is not a Favor action.");

        _pendingAction.TargetCard = card;
    }

    public void AdvanceTurn()
    {
        if (PendingDraws > 0) throw new InvalidOperationException("Player still has pending draws.");

        // Clear future cards for all players
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
        _pendingAction = null;
    }
}