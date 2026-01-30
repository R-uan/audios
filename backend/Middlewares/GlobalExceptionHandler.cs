using AudioArchive.Shared;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace AudioArchive.Middlewares {
  public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> _logger) : IExceptionHandler {
    public async ValueTask<bool> TryHandleAsync(HttpContext ctx, Exception ex, CancellationToken cancellationToken) {
      _logger.LogDebug("Unexpected exception: {Message}", ex.Message);
      ctx.Response.StatusCode = 500;

      var problemDetails = new ProblemDetails {
        Title = "An unexpected error has occurred.",
        Status = StatusCodes.Status500InternalServerError,
        Instance = ctx.Request.Path
      };

      if (ex is NotFoundException) {
        problemDetails = new ProblemDetails {
          Status = StatusCodes.Status404NotFound,
          Detail = ex.Message,
          Instance = ctx.Request.Path
        };
      }

      await ctx.Response.WriteAsJsonAsync(problemDetails, cancellationToken);
      return true;
    }
  }
}
