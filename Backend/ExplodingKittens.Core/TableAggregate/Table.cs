using ExplodingKittens.Core.PlayerAggregate.Contracts;
using ExplodingKittens.Core.TableAggregate.Contracts;
using ExplodingKittens.Core.UserAggregate;
using System.Numerics;
using System.Security.Cryptography.X509Certificates;

namespace ExplodingKittens.Core.TableAggregate;

/// <inheritdoc cref="ITable"/>
internal class Table
{
    public ITablePreferences preferences { get; }
    public Guid Id { get; }
    public IReadOnlyList<IPlayer> SeatedPlayers => _seatedPlayers;
    public bool HasAvailableSeat => _seatedPlayers.Count < preferences.NumberOfPlayers;

    public Guid GameID { get; set; }

    private readonly List<IPlayer> _seatedPlayers = new List<IPlayer>();

      
    internal Table(Guid id, ITablePreferences preferences)
    {
        Id = id;
        Preferences = preferences;
    }

    public void Join(User user)
    {
        // create a player from the user and add to the list
        _seatedPlayers.Add(new Player(user));
    }

    public void Leave(Guid userId)
    {
        // find and remove the player
        var player = _seatedPlayers.FirstOrDefault(p => p.Id == userId);
        if (player != null)
            _seatedPlayers.Remove(player);
    }

    public void LetArtificialPlayersJoin(IGamePlayStrategy gamePlayStrategy)
    {
        throw new NotImplementedException(); // EXTRA - not needed for now
    }
}


