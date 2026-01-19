using AudioArchive.Database;
using AudioArchive.Middlewares;
using AudioArchive.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddScoped<IAudioService, AudioService>();

builder.Services.AddDbContext<AudioDatabaseContext>(options => {
  var connectionString = builder.Configuration.GetConnectionString("PostgresDb1");
  options.UseNpgsql(connectionString);
});

builder.Services.AddProblemDetails();
var app = builder.Build();
app.UseExceptionHandler();

app.UseCors(options => { options.AllowAnyOrigin(); });
app.UseHttpsRedirection();
app.MapControllers();

app.Run();
