namespace AudioArchive.Extensions
{
  public static class PanelExtensions
  {
    public static IServiceCollection AddPanel(this IServiceCollection services) {
      services.AddRazorComponents()
        .AddInteractiveServerComponents();

      return services;
    }
  }
}
