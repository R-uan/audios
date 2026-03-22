using AudioArchive.Shared;
using StackExchange.Redis;
using AudioArchive.Database;
using AudioArchive.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.StaticFiles;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddProblemDetails();
// Services
builder.Services.AddScoped<IAudioService, AudioService>();
builder.Services.AddScoped<ICachingService, CachingService>();

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

builder.Services.AddDbContext<AudioDatabaseContext>(options => {
  var connectionString = builder.Configuration.GetConnectionString("PostgresDb1");
  options.UseNpgsql(connectionString);
});

builder.Services.AddSingleton<IConnectionMultiplexer>(sp => {
  var connectionString = builder.Configuration.GetConnectionString("RedisDatabase")
   ?? throw new MissingFieldException("Redis database connection string could not be found");
  var configuration = ConfigurationOptions.Parse(connectionString);
  return ConnectionMultiplexer.Connect(configuration);
});

var staticFileProvider = builder.Configuration.GetValue<string>("StaticFiles") ??
  throw new Exception("No static files path found.");

builder.Services.AddCors(options => {
  options.AddPolicy("AllowAll", policy => {
    policy.AllowAnyOrigin()
          .AllowAnyMethod()
          .AllowAnyHeader();
  });
});

var app = builder.Build();
var fileProvider = new PhysicalFileProvider(staticFileProvider);
var contentTypeProvider = new FileExtensionContentTypeProvider();

contentTypeProvider.Mappings[".mp3"] = "audio/mpeg";
contentTypeProvider.Mappings[".flac"] = "audio/flac";
contentTypeProvider.Mappings[".wav"] = "audio/wav";
contentTypeProvider.Mappings[".ogg"] = "audio/ogg";
contentTypeProvider.Mappings[".m4a"] = "audio/mp4";

app.UseStaticFiles(new StaticFileOptions {
  FileProvider = fileProvider,
  RequestPath = "/media/audio",
  ContentTypeProvider = contentTypeProvider,
});

app.UseDirectoryBrowser(new DirectoryBrowserOptions {
  FileProvider = fileProvider,
  RequestPath = "/media/audio"
});

app.UseExceptionHandler();
app.UseCors("AllowAll");
app.UseHttpsRedirection();
app.MapControllers();

app.Run();
