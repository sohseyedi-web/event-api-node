import { Server, Socket } from 'socket.io';
import { TicketModel } from '../models/ticket';
import { Types } from 'mongoose';

interface ISocketUser {
  userId: string;
  role: 'USER' | 'OWNER' | 'SUPPORT';
}

export const ticketSocketHandler = (io: Server) => {
  const ticketNamespace = io.of('/tickets');

  ticketNamespace.on('connection', (socket: Socket) => {
    console.log('🔌 New connection to tickets namespace');

    socket.on('registerUser', (data: ISocketUser) => {
      socket.data.user = data;
      socket.join(data.userId);
      console.log(`📌 Registered: ${data.role} | ${data.userId}`);
    });

    socket.on('joinTicket', (ticketId: string) => {
      socket.join(ticketId);
      console.log(`📂 Joined ticket room: ${ticketId}`);
    });

    socket.on('sendMessage', async ({ ticketId, message }) => {
      const user = socket.data.user as ISocketUser;
      if (!user) return;

      const ticket = await TicketModel.findById(ticketId);
      if (!ticket) return;

      ticket.messages.push({
        sender: new Types.ObjectId(user.userId),
        message,
      });

      if (user.role === 'SUPPORT' && !ticket.support) {
        ticket.support = new Types.ObjectId(user.userId);
      }

      if (user.role === 'SUPPORT' && !ticket.support) {
        ticket.support = new Types.ObjectId(user.userId);
      }

      await ticket.save();

      ticketNamespace.to(ticketId).emit('newMessage', {
        sender: user.userId,
        role: user.role,
        message,
        sentAt: new Date(),
      });

      if (user.role !== 'SUPPORT' && ticket.support) {
        ticketNamespace.to(ticket.support.toString()).emit('newTicketMessage', {
          ticketId,
          message,
        });
      }

      if (user.role === 'SUPPORT') {
        ticketNamespace.to(ticket.owner.toString()).emit('newTicketMessage', {
          ticketId,
          message,
        });
      }
    });
  });
};
