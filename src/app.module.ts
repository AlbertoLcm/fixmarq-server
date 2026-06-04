import { Module } from '@nestjs/common';
import { BudgestsModule } from './budgests/budgests.module';
import { PrismaModule } from './prisma.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { ItemsModule } from './items/items.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    BudgestsModule,
    PrismaModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ItemsModule,
    PaymentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
