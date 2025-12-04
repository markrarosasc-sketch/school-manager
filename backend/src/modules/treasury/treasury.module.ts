import { Module } from '@nestjs/common';
import { TreasuryService } from './treasury.service';
import { TreasuryController } from './treasury.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [TreasuryController],
  providers: [TreasuryService, PrismaService],
})
export class TreasuryModule {}
