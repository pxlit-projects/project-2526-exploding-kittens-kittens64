using ExplodingKittens.Core.PlayerAggregate;
using ExplodingKittens.Core.PlayerAggregate.Contracts;
using ExplodingKittens.Core.TableAggregate.Contracts;
using ExplodingKittens.Core.UserAggregate;
using System.Numerics;
using System.Security.Cryptography.X509Certificates;

namespace ExplodingKittens.Core.TableAggregate;

/// <inheritdoc cref="ITable"/>
internal class Table : ITable
{
    public ITablePreferences Preferences { get; }
    public Guid Id { get; }
    public IReadOnlyList<IPlayer> SeatedPlayers => _seatedPlayers;
    public bool HasAvailableSeat => _seatedPlayers.Count < Preferences.NumberOfPlayers;

    public Guid GameId { get; set; }

    private readonly List<IPlayer> _seatedPlayers = new List<IPlayer>();


    internal Table(Guid id, ITablePreferences preferences)
    {
        Id = id;
        Preferences = preferences;
        GameId = Guid.Empty;
    }

    public void Join(User user)
    {
        if (!HasAvailableSeat)
        {
            throw new InvalidOperationException("De table is vol");
        }

        if (_seatedPlayers.Any(persone => persone.Id == user.Id))
        {
            throw new InvalidOperationException("Speler zit al in de Table");
        }

        _seatedPlayers.Add(new HumanPlayer(user.Id, user.UserName, user.BirthDate));
    }

    public void Leave(Guid userId)
    {
        var player = _seatedPlayers.FirstOrDefault(persone => persone.Id == userId);
        if (player == null)
        {
            throw new InvalidOperationException("Speler niet gevonden in de Table ");
        }
        _seatedPlayers.Remove(player);

    }


    public void LetArtificialPlayersJoin(IGamePlayStrategy gamePlayStrategy)
    {
        throw new NotImplementedException(); // EXTRA 
    }
}


