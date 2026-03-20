using AudioArchive.Shared;
using Microsoft.AspNetCore.Diagnostics;

namespace AudioArchive.Middlewares
{
  public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> _logger) : IExceptionHandler
  {
    public async ValueTask<bool> TryHandleAsync(HttpContext ctx, Exception ex, CancellationToken cancellationToken) {
      _logger.LogError(ex, ex.Message);
      if (ex is APIException apiEx) {
        ctx.Response.StatusCode = apiEx.StatusCode;
        await ctx.Response.WriteAsJsonAsync(new {
          apiEx.StatusCode,
          apiEx.Message,
          ctx.Request.Path
        }, cancellationToken);
      } else {
        ctx.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await ctx.Response.WriteAsJsonAsync(new {
          StatusCode = StatusCodes.Status500InternalServerError,
          Message = "An unexpected exception has occurred.",
          ctx.Request.Path
        }, cancellationToken);
      }
      return true;
    }
  }
}
