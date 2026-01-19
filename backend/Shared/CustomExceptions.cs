namespace AudioArchive.Shared {
  public class NotFoundException<T>(string target) :
  Exception($"{typeof(T).Name} {target} was not found.") {
    public string Target { get; } = target;
    public string Type { get; } = typeof(T).Name;
  }
}
