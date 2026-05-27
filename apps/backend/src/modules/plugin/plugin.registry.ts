import {
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  Optional,
} from '@nestjs/common';
import { PluginType } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { ToolDefinition } from '../../shared/types/agent';
import { BUILTIN_PLUGINS } from './plugin.constants';
import { BuiltinPlugin } from './interfaces/builtin-plugin.interface';

@Injectable()
export class PluginRegistryService implements OnModuleInit {
  private readonly logger = new Logger(PluginRegistryService.name);
  private readonly plugins = new Map<string, BuiltinPlugin>();
  private readonly toolToPlugin = new Map<string, BuiltinPlugin>();

  constructor(
    private readonly prisma: PrismaService,
    @Optional()
    @Inject(BUILTIN_PLUGINS)
    private readonly builtinPlugins: BuiltinPlugin[] = [],
  ) {}

  async onModuleInit() {
    for (const plugin of this.builtinPlugins) {
      this.register(plugin);
    }

    await this.syncBuiltinsToDatabase();
  }

  hasPlugin(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }

  listBuiltinPlugins(): BuiltinPlugin[] {
    return [...this.plugins.values()];
  }

  getToolDefinitions(pluginId: string): ToolDefinition[] {
    return this.plugins.get(pluginId)?.getTools() ?? [];
  }

  async executeTool(
    toolName: string,
    args: Record<string, unknown>,
  ): Promise<string> {
    const plugin = this.toolToPlugin.get(toolName);
    if (!plugin) {
      throw new Error(`Tool not registered: ${toolName}`);
    }

    return plugin.execute(toolName, args);
  }

  private register(plugin: BuiltinPlugin) {
    this.plugins.set(plugin.id, plugin);

    for (const tool of plugin.getTools()) {
      this.toolToPlugin.set(tool.function.name, plugin);
    }
  }

  private async syncBuiltinsToDatabase() {
    if (!this.builtinPlugins.length) {
      return;
    }

    for (const plugin of this.builtinPlugins) {
      await this.prisma.plugin.upsert({
        where: {
          id: plugin.id,
        },
        update: {
          type: PluginType.BUILTIN,
          name: plugin.name,
          description: plugin.description,
        },
        create: {
          id: plugin.id,
          type: PluginType.BUILTIN,
          name: plugin.name,
          description: plugin.description,
        },
      });
    }

    this.logger.log(
      `Synchronized ${this.builtinPlugins.length} builtin plugins`,
    );
  }
}
