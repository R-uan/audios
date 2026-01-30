namespace AudioArchive.Shared {
  public class NotFoundException(string field, string target) :
  Exception($"{field} ID was not found: {target}.") {
    public string Target { get; } = target;
  }
}
