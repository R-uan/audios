using AudioArchive.Database;
using AudioArchive.Middlewares;
using AudioArchive.Services;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

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


builder.Services.AddCors(options => {
  options.AddPolicy("AllowAll", policy => {
    policy.AllowAnyOrigin()
          .AllowAnyMethod()
          .AllowAnyHeader();
  });
});

var app = builder.Build();

app.UseExceptionHandler();
app.UseCors("AllowAll");
app.UseHttpsRedirection();
app.MapControllers();

app.Run();
