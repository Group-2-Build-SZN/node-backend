import { createServer } from "node:http";
import { createApp } from "@/app";
import { env } from "@/config/env.config";
import { testConnection } from "@/config/database.config";
import { initSocket } from "@/lib/socket";

async function bootstrap() {
  await testConnection();

  const app = createApp();
  const httpServer = createServer(app);
  initSocket(httpServer);

  httpServer.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
  });
}

bootstrap();
