// This needs to be called from somewhere.
// That place just so happens to be src/models/user.ts

import { connect } from "mongoose";
import { env } from "./env";

connect(env.DB_URL);

export {};
