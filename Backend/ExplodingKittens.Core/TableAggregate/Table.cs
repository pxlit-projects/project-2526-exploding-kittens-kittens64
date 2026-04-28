using ExplodingKittens.Core.PlayerAggregate.Contracts;
using ExplodingKittens.Core.TableAggregate.Contracts;
using ExplodingKittens.Core.UserAggregate;

namespace ExplodingKittens.Core.TableAggregate;

/// <inheritdoc cref="ITable"/>
internal class Table : ITable
{
    private Guid _id;
    private ITablePreferences _preferences;
    internal Table(Guid id, ITablePreferences preferences)
    {
        _id = id;
        _preferences = preferences;
    }

    public Guid Id => _id;

    public ITablePreferences Preferences => _preferences;

    public IReadOnlyList<IPlayer> SeatedPlayers => throw new NotImplementedException();

    public bool HasAvailableSeat => throw new NotImplementedException();

    public Guid GameId { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }

    public void Join(User user)
    {
        throw new NotImplementedException();
    }

    public void Leave(Guid userId)
    {
        throw new NotImplementedException();
    }

    public void LetArtificialPlayersJoin(IGamePlayStrategy gamePlayStrategy)
    {
        throw new NotImplementedException();
    }
}