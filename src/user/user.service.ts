import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return await this.userRepository.create(
      new User({
        id: ' ',
        email: createUserDto.email,
        mainId: createUserDto.mainId,
        createdAt: new Date(),
      }),
    );
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }
    return user;
  }

  async findOneByEmail(email: string) {
    const user = await this.userRepository.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email "${email}" not found`);
    }
    return user;
  }

  async findOneByMainId(mainId: string) {
    const user = await this.userRepository.findOneByMainId(mainId);
    if (!user) {
      throw new NotFoundException(`User with mainId "${mainId}" not found`);
    }
    return user;
  }

  // async update(id: string, updateUserDto: UpdateUserDto) {
  //   // Ensure the user exists before updating
  //   await this.findOne(id);
  //   const user = new User({
  //     id,
  //     ...updateUserDto,
  //     updatedAt: new Date(),
  //   });
  //   return this.userRepository.update(user);
  // }

  async remove(id: string) {
    // This is a hard delete — not usually recommended unless necessary
    await this.findOne(id);
    return this.userRepository.remove(id);
  }

  async softDelete(id: string) {
    await this.findOne(id);
    return this.userRepository.softDelete(id);
  }

  async restore(id: string) {
    await this.findOne(id);
    return this.userRepository.restore(id);
  }
}
