import { Module } from '@nestjs/common';
import { WorkspaceModule } from '../workspace/workspace.module';
import { BUILTIN_PLUGINS } from './plugin.constants';
import { PluginController } from './plugin.controller';
import { PluginRegistryService } from './plugin.registry';
import { PluginService } from './plugin.service';
import { EchoPlugin } from './plugins/echo.plugin';
import { TimePlugin } from './plugins/time.plugin';

@Module({
  imports: [WorkspaceModule],
  controllers: [PluginController],
  providers: [
    PluginService,
    PluginRegistryService,
    TimePlugin,
    EchoPlugin,
    {
      provide: BUILTIN_PLUGINS,
      useFactory: (timePlugin: TimePlugin, echoPlugin: EchoPlugin) => [
        timePlugin,
        echoPlugin,
      ],
      inject: [TimePlugin, EchoPlugin],
    },
  ],
  exports: [PluginService, PluginRegistryService],
})
export class PluginModule {}
