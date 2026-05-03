using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.PlayerAggregate.Contracts;

namespace ExplodingKittens.Core.PlayerAggregate;

internal class Hand : IHand
{
    private readonly List<Card> _cards = new();

    public IReadOnlyList<Card> Cards => _cards;

    public void InsertCard(Card card)
    {
        _cards.Add(card);
        _cards.Sort((a, b) => ((int)a).CompareTo((int)b));
    }

    public bool Contains(Card card)
        => _cards.Contains(card);

    public Card? PickSpecificCard(Card card)
    {
        if (!_cards.Contains(card)) return null;
        _cards.Remove(card);
        return card;
    }

    public Card? PickRandomCard()
    {
        if (_cards.Count == 0) return null;

        var rnd = new Random();
        int index = rnd.Next(_cards.Count);

        var card = _cards[index];
        _cards.RemoveAt(index);
        return card;
    }
}