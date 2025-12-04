import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats') // La URL será /dashboard/stats
  getStats() {
    return this.dashboardService.getAdminStats();
  }
}
