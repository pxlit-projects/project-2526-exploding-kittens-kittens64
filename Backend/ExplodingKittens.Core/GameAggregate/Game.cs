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
    }
    public Guid Id => _id;
    public IPlayer[] Players => _players.ToArray();

    public Guid PlayerToPlayId => _currentPlayerId;

    public IList<Card> DiscardPile { get; } = new List<Card>();

    public ICardDeck DrawPile => _drawPile;

    public int PendingDraws { get; set; } = 1;
    public IAction? PendingAction => null;
    public bool HasEnded => false;
    public IPlayer GetPlayerById(Guid playerId)
        => Players.First(p => p.Id == playerId);

    public void DrawCard(Guid playerId)
        => throw new NotImplementedException();

    public void PlayAction(Guid playerId, IReadOnlyList<Card> cards, Guid? targetPlayerId, Card? targetCard, int? drawPileIndex)
        => throw new NotImplementedException();

    public void NopePendingAction(Guid playerId)
        => throw new NotImplementedException();

    public void ConfirmNotNopingPendingAction(Guid playerId)
        => throw new NotImplementedException();

    public void SelectCardToGiveAsAFavor(Guid playerId, Card card)
        => throw new NotImplementedException();

    public void AdvanceTurn()
        => throw new NotImplementedException();
}