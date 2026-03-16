import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportTicket } from './entities/support-ticket.entity';

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(SupportTicket)
    private ticketRepository: Repository<SupportTicket>,
  ) {}

  async create(userId: number, data: {
    subject: string;
    description: string;
    priority: TicketPriority;
    category: string;
  }) {
    const ticket = this.ticketRepository.create({
      ...data,
      userId,
      status: TicketStatus.OPEN,
    });
    return this.ticketRepository.save(ticket);
  }

  async findAll(userId: number, options: { page?: number; limit?: number; status?: string } = {}) {
    const { page = 1, limit = 20, status } = options;
    
    const where: any = { userId };
    if (status) where.status = status;

    const [tickets, total] = await this.ticketRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: tickets,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number, userId: number) {
    const ticket = await this.ticketRepository.findOne({
      where: { id, userId },
    });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    return ticket;
  }

  async update(id: number, userId: number, data: Partial<SupportTicket>) {
    const ticket = await this.findOne(id, userId);
    Object.assign(ticket, data);
    return this.ticketRepository.save(ticket);
  }

  async close(id: number, userId: number) {
    const ticket = await this.findOne(id, userId);
    ticket.status = TicketStatus.CLOSED;
    return this.ticketRepository.save(ticket);
  }
}
