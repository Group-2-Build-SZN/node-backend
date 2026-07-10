import { createApp } from "@/app";
import { env } from "@/config/env.config";
import { testConnection } from "@/config/database.config";

async function bootstrap() {
  await testConnection();

  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
  });
}

bootstrap();
