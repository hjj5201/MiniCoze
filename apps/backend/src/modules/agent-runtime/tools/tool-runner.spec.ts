import { Test, TestingModule } from '@nestjs/testing';
import { PluginRegistryService } from '../../plugin/plugin.registry';
import { ToolRunner } from './tool-runner';

describe('ToolRunner', () => {
  let runner: ToolRunner;
  let pluginRegistry: {
    executeTool: jest.Mock;
  };

  beforeEach(async () => {
    pluginRegistry = {
      executeTool: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToolRunner,
        {
          provide: PluginRegistryService,
          useValue: pluginRegistry,
        },
      ],
    }).compile();

    runner = module.get(ToolRunner);
  });

  it('delegates tool execution to plugin registry', async () => {
    pluginRegistry.executeTool.mockResolvedValue('{"ok":true}');

    const result = await runner.execute({
      id: 'tool-call-id',
      type: 'function',
      function: {
        name: 'echo_text',
        arguments: '{"text":"hello"}',
      },
    });

    expect(pluginRegistry.executeTool).toHaveBeenCalledWith('echo_text', {
      text: 'hello',
    });
    expect(result).toEqual({
      toolCallId: 'tool-call-id',
      output: '{"ok":true}',
    });
  });

  it('returns structured error payload when tool execution fails', async () => {
    pluginRegistry.executeTool.mockRejectedValue(new Error('tool failed'));

    const result = await runner.execute({
      id: 'tool-call-id',
      type: 'function',
      function: {
        name: 'missing_tool',
        arguments: '{}',
      },
    });

    expect(result).toEqual({
      toolCallId: 'tool-call-id',
      output: JSON.stringify({
        error: 'tool failed',
      }),
    });
  });
});
