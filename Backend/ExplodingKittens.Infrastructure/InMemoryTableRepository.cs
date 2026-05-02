using ExplodingKittens.Core.TableAggregate.Contracts;
using ExplodingKittens.Core.Util;
using ExplodingKittens.Infrastructure.Util;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace ExplodingKittens.Infrastructure;

/// <inheritdoc cref="ITableRepository"/>
internal class InMemoryTableRepository : ITableRepository
{
    private readonly ExpiringDictionary<Guid, ITable> _tableDictionary;

    private static int _instanceCount = 0;



    public InMemoryTableRepository()
    {
       
        _instanceCount++;
       

        _tableDictionary = new ExpiringDictionary<Guid, ITable>(TimeSpan.FromMinutes(15));

    
    }


    public void Add(ITable table)
    {
        _tableDictionary.AddOrReplace(table.Id, table);
    }

    public ITable Get(Guid tableId)
    {
        if (_tableDictionary.TryGetValue(tableId, out ITable? table))
        {
            return table!;
        }
        throw new DataNotFoundException();
    }

    public void Remove(Guid tableId)
    {
        _tableDictionary.TryRemove(tableId, out ITable? _);
    }


    //TODO: loop over all tables (user the Values property of _tableDictionary)
    //and check if those tables have the same preferences and have seats available.
    //Put the tables that have the same preferences and have seats available in a list and return that list.


    public IList<ITable> FindTablesWithAvailableSeats(ITablePreferences preferences)
    {
        var tablesFound = new List<ITable>();

        foreach (var table in _tableDictionary.Values)
        {
        
            bool sameMaxPlayers = table.Preferences.NumberOfPlayers == preferences.NumberOfPlayers;
            bool sameArtificial = table.Preferences.NumberOfArtificialPlayers == preferences.NumberOfArtificialPlayers;

         
            if (sameMaxPlayers && sameArtificial && table.HasAvailableSeat)
            {
                tablesFound.Add(table);
            }
        }

        return tablesFound;
    }