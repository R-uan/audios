using Microsoft.AspNetCore.Diagnostics;

namespace AudioArchive.Shared
{
  public class GlobalExceptionHandler : IExceptionHandler
  {
    public async ValueTask<bool> TryHandleAsync(HttpContext ctx, Exception ex, CancellationToken cancellationToken) {
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
          Trace = ex.Message,
          ctx.Request.Path
        }, cancellationToken);
      }
      return true;
    }
  }
}
