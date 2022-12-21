// dotenv must be loaded as first
import "./lib/_loadDotEnv";
//
import { config } from "./lib/config";

console.log(config);

/**
 * {
 *   OUTPUT:
 *   // from userConfig.ts
 *   email: 'email@email.email',
 *   // from userConfig.ts - overridden by production
 *   password: 'myPassword',
 *
 *   // from .env parsed inside FullConfig
 *   days: { numbers: [ 7, 8, 9 ] },
 *
 *   //  created in  inside FullConfig
 *   url: 'localhost?email=email@email.email&pass=productionPassword'
 * }
 */
