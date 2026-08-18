using AudioArchive.Services;
using AudioArchive.Shared;

namespace AudioArchive.Extensions
{
  public static class ApiExtensions
  {
    public static IServiceCollection AddApi(this IServiceCollection services) {
      services.AddOpenApi();
      services.AddControllers();
      services.AddProblemDetails();

      services.AddScoped<IAudioService, AudioService>();
      services.AddSingleton<ICachingService, CachingService>();
      services.AddScoped<IArtistService, ArtistService>();
      services.AddScoped<ITagService, TagService>();
      services.AddExceptionHandler<GlobalExceptionHandler>();
      services.AddTransient<CachingMiddleware>();

      services.AddCors(options => {
        options.AddPolicy("AllowAll", policy => {
          policy.AllowAnyOrigin()
                .AllowAnyMethod()
                .AllowAnyHeader();
        });
      });

      return services;
    }
  }
}
