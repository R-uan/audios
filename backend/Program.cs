using AudioArchive.Components;
using AudioArchive.Extensions;
using AudioArchive.Shared;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDatabase(builder.Configuration);
builder.Services.AddApi();
builder.Services.AddPanel();

var staticFileProvider = builder.Configuration.GetValue<string>("StaticFiles") ??
  throw new Exception("No static files path found.");

var app = builder.Build();
var fileProvider = new PhysicalFileProvider(staticFileProvider);
var contentTypeProvider = new FileExtensionContentTypeProvider();
app.UseMiddleware<CachingMiddleware>();
app.UseStaticFiles();

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

// Comment this if you have a backup
// using var scope = app.Services.CreateScope();
// var db = scope.ServiceProvider.GetRequiredService<AudioDatabaseContext>();
// db.Database.Migrate();

app.UseExceptionHandler();
app.UseCors("AllowAll");
app.UseHttpsRedirection();
app.UseAntiforgery();
app.MapControllers();

app.MapRazorComponents<App>()
  .AddInteractiveServerRenderMode();

app.Run();
