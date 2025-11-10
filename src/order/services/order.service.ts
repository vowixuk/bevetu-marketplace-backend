/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../repositories/order.repository';
import { Order } from '../entities/order.entity';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';

type PublicOrder = Omit<
  Order,
  'buyerId' | 'sellerId' | 'eventRecords' | 'items' | 'carrierId'
>;

type PaginationResponse = {
  orders: PublicOrder[];
  currentPage: number; // current page of this return
  limit: number; // no of record in this return
  totalRecords: number; // Total number record in the database
  totalPages: number; // Total page
  start: number; // This return start from x record.
  end: number; // This return end to y record.
  next: string | null; // url of next page
  prev: string | null; // url of previous page
};

@Injectable()
export class OrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  private pagination(
    orders: Order[],
    total: number,
    page: number,
    limit: number,
    orderBy: 'desc' | 'asc',
    baseApiEndpoint: string,
  ): PaginationResponse {
    const skip = (page - 1) * limit;
    const publicOrders: PublicOrder[] = orders.map(
      ({
        buyerId,
        eventRecords,
        items,
        carrierId,
        // addressId,
        ...publicData
      }) => publicData,
    );

    const totalRecords = total;
    const totalPages = Math.ceil(total / limit);

    const start = skip + 1;
    const end = Math.min(skip + limit, totalRecords);

    const next =
      end < totalRecords
        ? `${baseApiEndpoint}?page=${page + 1}&limit=${limit}`
        : null;

    const prev =
      page > 1 ? `${baseApiEndpoint}?page=${page - 1}&limit=${limit}` : null;

    return {
      orders: publicOrders,
      currentPage: page,
      limit,
      totalPages,
      totalRecords,
      start,
      end,
      next,
      prev,
    };
  }

  /**
   * Order can only be created by buyer
   */
  async buyerCreateOrder(buyerId: string, dto: CreateOrderDto): Promise<Order> {
    console.log(dto,"<< dto")
    
    const order = new Order({
      ...dto,
      id: '',
      buyerId,
      items: [],
      eventRecords: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.orderRepository.create(order);
  }

  async buyerFindAllIfOwned(
    buyerId: string,
    page: number = 1,
    limit: number = 10,
    orderBy: 'desc' | 'asc' = 'desc',
  ): Promise<PaginationResponse> {
    const { orders, total } = await this.orderRepository.buyerFindAllIfOwned(
      buyerId,
      {
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      },
    );
    return this.pagination(
      orders,
      total,
      page,
      limit,
      orderBy,
      `${process.env.BASE_URL}/v1/products`,
    );
  }

  async buyerFindOneIfOwned(
    orderId: string,
    buyerId: string,
  ): Promise<Omit<Order, 'buyerId' | 'sellerId'>> {
    const order = await this.orderRepository.buyerFindOneIfOwned(
      orderId,
      buyerId,
    );

    const {
      buyerId: bId,

      ...publicData
    } = order;

    return publicData;
  }

  // async sellerFindAllIfOwned(
  //   sellerId: string,
  //   page: number = 1,
  //   limit: number = 10,
  //   orderBy: 'desc' | 'asc' = 'desc',
  // ): Promise<PaginationResponse> {
  //   const { orders, total } = await this.orderRepository.sellerFindAllIfOwned(
  //     sellerId,
  //     {
  //       skip: (page - 1) * limit,
  //       take: limit,
  //       orderBy,
  //     },
  //   );

  //   return this.pagination(
  //     orders,
  //     total,
  //     page,
  //     limit,
  //     orderBy,
  //     `${process.env.BASE_URL}/v1/products`,
  //   );
  // }

  // async shopFindAllIfOwned(
  //   shopId: string,
  //   sellerId: string,
  //   page: number = 1,
  //   limit: number = 10,
  //   orderBy: 'desc' | 'asc' = 'desc',
  // ): Promise<PaginationResponse> {
  //   const { orders, total } = await this.orderRepository.shopFindAllIfOwned(
  //     shopId,
  //     sellerId,
  //     {
  //       skip: (page - 1) * limit,
  //       take: limit,
  //       orderBy,
  //     },
  //   );

  //   return this.pagination(
  //     orders,
  //     total,
  //     page,
  //     limit,
  //     orderBy,
  //     `${process.env.BASE_URL}/v1/products`,
  //   );
  // }

  // async sellerFindOneIfOwned(
  //   orderId: string,
  //   sellerId: string,
  // ): Promise<Omit<Order, 'buyerId' | 'sellerId'>> {
  //   const order = await this.orderRepository.sellerFindOneIfOwned(
  //     orderId,
  //     sellerId,
  //   );

  //   const { buyerId: bId, sellerId: sId, ...publicData } = order;

  //   return publicData;
  // }

  /**
   * ⚠️ Warning: Do NOT expose this update method publicly.
   * It does NOT verify whether the buyer or seller actually owns the order.
   * Intended for internal use only.
   */
  async update(orderId: string, updateDto: UpdateOrderDto): Promise<Order> {
    const order = await this.orderRepository.findOne(orderId);
    return this.orderRepository.update(orderId, {
      ...order,
      ...updateDto,
    });
  }

  /**
   * ⚠️ Warning: Do NOT expose this update method publicly.
   * It does NOT verify whether the buyer or seller actually owns the order.
   * Intended for internal use only.
   */
  async fineOne(orderId: string): Promise<Order> {
    return await this.orderRepository.findOne(orderId);
  }

  /**
   * ⚠️ Warning: Do NOT expose this update method publicly.
   * It does NOT verify whether the buyer or seller actually owns the order.
   * Intended for internal use only.
   */
  async fineByBuyerId(buyerId: string): Promise<Order[]> {
    return await this.orderRepository.findByBuyerId(buyerId);
  }

  /**
   * ⚠️ Warning: TESTING USE ONLY
   * Do NOT expose this update method publicly.
   * It donly be used in testing for remove testing record
   */
  async remove(orderId: string) {
    await this.orderRepository.remove(orderId);
  }
}
