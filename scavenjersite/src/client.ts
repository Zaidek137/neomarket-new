import { createThirdwebClient } from "thirdweb";
import { THIRDWEB_CLIENT_ID, THIRDWEB_SECRET_KEY } from "./config/constants";

export const client = createThirdwebClient({
    clientId: THIRDWEB_CLIENT_ID,
    secretKey: THIRDWEB_SECRET_KEY,
}); 