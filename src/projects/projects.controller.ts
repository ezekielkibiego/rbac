import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @Roles('Admin', 'Project Manager')
  @UseGuards(RolesGuard)
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  @Roles('Admin', 'Project Manager', 'Engineer')
  @UseGuards(RolesGuard)
  findOne(@Param('id') id: number) {
    return this.projectsService.findOne(id);
  }

  @Post()
  @Roles('Admin')
  @UseGuards(RolesGuard)
  create(@Body() createProjectDto: any) {
    return this.projectsService.create(createProjectDto);
  }

  @Delete(':id')
  @Roles('Admin')
  @UseGuards(RolesGuard)
  delete(@Param('id') id: number) {
    return this.projectsService.delete(id);
  }
}
