import { createThirdwebClient } from "thirdweb";
import { THIRDWEB_CLIENT_ID } from "./config/constants";

export const client = createThirdwebClient({
  clientId: THIRDWEB_CLIENT_ID,
});
