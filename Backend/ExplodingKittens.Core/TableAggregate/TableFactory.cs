using ExplodingKittens.Core.PlayerAggregate.Contracts;
using ExplodingKittens.Core.TableAggregate.Contracts;
using ExplodingKittens.Core.UserAggregate;

namespace ExplodingKittens.Core.TableAggregate;

/// <inheritdoc cref="ITableFactory"/>
internal class TableFactory : ITableFactory
{
    public TableFactory(IGamePlayStrategy gamePlayStrategy)
    {
    }

    public ITable CreateNewForUser(User user, ITablePreferences preferences)
    {
        Guid tableId = Guid.NewGuid();
        Table table = new Table(tableId, preferences);
        table.Join(user);
        return table;
    }
}