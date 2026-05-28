export enum ErrorCode {
  // 请求成功。
  Success = 0,

  // 通用业务错误，用于没有更具体错误码的业务异常。
  BusinessError = 10000,

  // 注册时用户邮箱或账号已存在。
  UserAlreadyExists = 10001,

  // 登录凭证错误，例如邮箱或密码不正确。
  InvalidCredentials = 10002,

  // 请求参数错误，例如 DTO 校验失败。
  BadRequest = 40000,

  // 未认证，例如未登录、Token 缺失或 Token 失效。
  Unauthorized = 40100,

  // 已认证但没有权限访问目标资源。
  Forbidden = 40300,

  // 请求的资源不存在。
  NotFound = 40400,

  // 服务内部错误，用于未预期异常。
  InternalServerError = 50000,

  // AI 模型调用失败。
  AiModelError = 60001,

  // AI 配置缺失或错误。
  AiConfigError = 60002,
}
