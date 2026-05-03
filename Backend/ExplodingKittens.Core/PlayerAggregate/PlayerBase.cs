using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.PlayerAggregate.Contracts;

namespace ExplodingKittens.Core.PlayerAggregate;

/// <inheritdoc cref="IPlayer"/>
internal class PlayerBase : IPlayer
{
    private Guid _id;
    private string _name;
    private DateOnly _birthDate;

    private readonly IHand _hand;
    private readonly List<Card> _futureCards = new();

    protected PlayerBase(Guid id, string name, DateOnly birthDate)
    {
        _id = id;
        _name = name;
        _birthDate = birthDate;

        _hand = new Hand();
    }

    public Guid Id => _id;

    public string Name => _name;

    public DateOnly BirthDate => _birthDate;

    public IHand Hand => _hand;

    public bool HasExplodingKitten => _hand.Cards.Contains(Card.ExplodingKitten);

    public bool Eliminated => false;

    public IReadOnlyList<Card> FutureCards
    {
        get => _futureCards;
        set
        {
            _futureCards.Clear();
            if (value != null)
            {
                _futureCards.AddRange(value);
            }
        }
    }
}