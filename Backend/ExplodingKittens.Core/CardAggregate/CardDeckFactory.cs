using ExplodingKittens.Core.CardAggregate.Contracts;

namespace ExplodingKittens.Core.CardAggregate;

/// <inheritdoc cref="ICardDeckFactory"/>
internal class CardDeckFactory : ICardDeckFactory
{
    public ICardDeck CreateStandardDeckWithoutExplodingKittens(int numberOfPlayers)
    {
        var cards = new List<Card>();

        Add(cards, Card.Attack, 4);
        Add(cards, Card.Favor, 4);
        Add(cards, Card.Skip, 4);
        Add(cards, Card.Shuffle, 4);
        Add(cards, Card.Nope, 5);
        Add(cards, Card.BeardCat, 4);
        Add(cards, Card.Cattermelon, 4);
        Add(cards, Card.HairyPotatoCat, 4);
        Add(cards, Card.RainbowRalphingCat, 4);
        Add(cards, Card.TacoCat, 4);
        Add(cards, Card.SeeTheFuture, 5);

        int defuseCount = numberOfPlayers <= 4 ? 2 : 1;
        Add(cards, Card.Defuse, defuseCount);

        return new CardDeck(cards);
    }
    private void Add(List<Card> cards, Card card, int count)
    {
        for (int i = 0; i < count; i++)
        {
            cards.Add(card);
        }
    }
}