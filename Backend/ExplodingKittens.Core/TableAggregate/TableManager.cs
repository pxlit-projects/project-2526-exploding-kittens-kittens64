using ExplodingKittens.Core.GameAggregate.Contracts;
using ExplodingKittens.Core.TableAggregate.Contracts;
using ExplodingKittens.Core.UserAggregate;
using System.Reflection.Emit;

namespace ExplodingKittens.Core.TableAggregate;

/// <inheritdoc cref="ITableManager"/>
internal class TableManager : ITableManager
{
    private readonly ITableRepository _tableRepository;
    private readonly ITableFactory _tableFactory;
    private readonly IGameRepository _gameRepository;
    private readonly IGameFactory _gameFactory;

    public TableManager(
        ITableRepository tableRepository,
        ITableFactory tableFactory,
        IGameRepository gameRepository,
        IGameFactory gameFactory)
    {
        _tableRepository = tableRepository;
        _tableFactory = tableFactory;
        _gameRepository = gameRepository;
        _gameFactory = gameFactory;
    }

    public ITable CreateTable(User user, ITablePreferences preferences)
    {
        
        ITable table = _tableFactory.CreateNewForUser(user, preferences);
        _tableRepository.Add(table);
        return table;
    }

    public ITable JoinTable(Guid tableId, User user)
    {
        ITable currentTable = _tableRepository.Get(tableId);
        currentTable.Join(user);

      
        _tableRepository.Add(currentTable);

        return currentTable;
    }

    public void LeaveTable(Guid tableId, User user)
    {
        ITable currentTable = _tableRepository.Get(tableId);
        currentTable.Leave(user.Id);

        if(currentTable.SeatedPlayers.Count == 0)
        {
            _tableRepository.Remove(tableId);
            // verwijdert van het lijst tables die in 
            // de tableRepository zitten
        }
    }

    public IGame StartGameForTable(Guid tableId)
    {
        throw new NotImplementedException();
    }
}