using Microsoft.AspNetCore.SignalR;

namespace ExplodingKittens.Api.Hubs
{
    public class ChatHub : Hub
    {
        public async Task SendMessage(Guid id,Guid playerId, string message)
        {
            await Clients.Group(id.ToString()).SendAsync("ReceiveMessage", playerId.ToString(), message);
        }
        public async Task JoinGame(Guid id) {
            await Groups.AddToGroupAsync(Context.ConnectionId , id.ToString());
        }
        public async Task SendEmoji(Guid id, Guid playerId , string message) {
            await Clients.Group(id.ToString()).SendAsync("ReceiveEmoji", playerId.ToString(), message);
        }
    }
}