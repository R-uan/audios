declare module "bun" {
  interface Env {
    PORT: string;
    MEDIA_URL: string;
    API_URL: string;
  }
}
