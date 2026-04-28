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
        Guid id = Guid.NewGuid();
        Table table = new Table(id, preferences);
        table.Join(user);
        return table;
    }
}