// 使用 DI token 隔离运行时抽象和具体实现，方便后续替换存储或工具执行器。
export const RUNTIME_REPOSITORY = Symbol('RUNTIME_REPOSITORY');
export const TOOL_EXECUTOR = Symbol('TOOL_EXECUTOR');
