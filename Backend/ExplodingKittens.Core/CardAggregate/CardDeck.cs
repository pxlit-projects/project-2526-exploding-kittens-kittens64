using ExplodingKittens.Core.CardAggregate.Contracts;

namespace ExplodingKittens.Core.CardAggregate;

/// <inheritdoc cref="ICardDeck"/>
internal class CardDeck : ICardDeck
{
    private readonly List<Card> _cards;
    /// <summary>
    /// Creates the deck
    /// </summary>
    /// <param name="cards">The first card is the card on top, the last card is the bottom card</param>
    public CardDeck(IList<Card> cards)
    {
        _cards = new List<Card>(cards);
    }
    public int CardCount => _cards.Count;

    public void InsertCard(Card card, int positionFromTop = 0)
    {
        if (positionFromTop < 0 || positionFromTop > _cards.Count)
        {
            throw new ArgumentOutOfRangeException(nameof(positionFromTop));
        }

        _cards.Insert(positionFromTop, card);
    }

    public void Shuffle()
    {
        var rng = new Random();
        for (int i = _cards.Count - 1; i > 0; i--)
        {
            int j = rng.Next(i + 1);
            (_cards[i], _cards[j]) = (_cards[j], _cards[i]);
        }
    }

    public Card DrawTopCard()
    {
        if (_cards.Count == 0)
        {
            throw new InvalidOperationException("Deck is empty.");
        }

        var topCard = _cards[0];
        _cards.RemoveAt(0);
        return topCard;
    }

    public IReadOnlyList<Card> PeekTopCards(int numberOfCards)
    {
        if (numberOfCards < 0 || numberOfCards > _cards.Count)
        {
            throw new ArgumentOutOfRangeException(nameof(numberOfCards));
        }

        return _cards.Take(numberOfCards).ToList();
    }
}   