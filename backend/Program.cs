using AudioCatalog.Database;
using AudioCatalog.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddScoped<IAudioService, AudioService>();
builder.Services.AddDbContext<AudioDatabaseContext>(options => {
  var connectionString = builder.Configuration.GetConnectionString("PostgresDb1");
  options.UseNpgsql(connectionString);
});


var app = builder.Build();

if (app.Environment.IsDevelopment()) {
  app.MapOpenApi();
}

app.UseHttpsRedirection();
app.MapControllers();
app.Run();
