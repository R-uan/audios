using AudioArchive.Services;

namespace AudioArchive.Shared
{
  public class CachingMiddleware(ICachingService caching) : IMiddleware
  {
    public async Task InvokeAsync(HttpContext context, RequestDelegate next) {
      await next(context);
      if (context.Response.StatusCode >= 200 && context.Response.StatusCode < 300) {
        switch (context.Request.Method) {
          case "PUT":
          case "POST":
          case "PATCH":
          case "DELETE":
            string cacheGroup;
            var path = context.Request.Path.ToString();

            if (path.Contains("api/artist")) cacheGroup = "artist";
            else if (path.Contains("api/audios")) cacheGroup = "audio";
            else if (path.Contains("api/tags")) cacheGroup = "tag";
            else break;

            await caching.DeleteGroupAsync(cacheGroup);
            break;
        }
      }
    }
  }
}
