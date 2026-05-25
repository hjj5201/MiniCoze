import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, WorkspaceRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ErrorCode } from '../../common/constants/error-code';
import { BusinessException } from '../../common/exceptions/business.exception';
import { PrismaService } from '../../database/prisma.service';
import { JwtPayload } from '../../shared/types/current-user.type';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponse } from './types/auth-response.type';

@Injectable()
export class AuthService {
  private readonly saltRounds = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const passwordHash = await bcrypt.hash(
      registerDto.password,
      this.saltRounds,
    );

    try {
      const user = await this.prisma.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            username: registerDto.username,
            email: registerDto.email,
            passwordHash,
          },
        });

        const workspace = await tx.workspace.create({
          data: {
            name: '我的工作空间',
            description: '默认工作空间',
            ownerId: createdUser.id,
          },
        });

        await tx.workspaceMember.create({
          data: {
            workspaceId: workspace.id,
            userId: createdUser.id,
            role: WorkspaceRole.OWNER,
          },
        });

        return createdUser;
      });

      return this.buildAuthResponse(user);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new BusinessException(
          '邮箱已被注册',
          ErrorCode.UserAlreadyExists,
          HttpStatus.CONFLICT,
        );
      }

      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: loginDto.email,
      },
    });

    if (!user) {
      throw new BusinessException(
        '邮箱或密码错误',
        ErrorCode.InvalidCredentials,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new BusinessException(
        '邮箱或密码错误',
        ErrorCode.InvalidCredentials,
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.buildAuthResponse(user);
  }

  getProfile(userId: string) {
    return this.userService.findCurrentUser(userId);
  }

  private buildAuthResponse(user: Prisma.UserGetPayload<object>): AuthResponse {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      tokenType: 'Bearer',
      user: this.userService.toUserResponse(user),
    };
  }

  private isUniqueConstraintError(error: unknown) {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }
}
