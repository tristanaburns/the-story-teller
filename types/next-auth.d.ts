/**
 * Extension for NextAuth Session type
 * 
 * Extends the Session interface from next-auth to include additional properties
 * used in our application, such as user roles.
 */

import 'next-auth';
import { DefaultSession } from "next-auth";

declare module 'next-auth' {
  /**
   * Returned by useSession, getSession and received as a prop on the SessionProvider React Context
   */
  interface Session {
    user: {
      /** The user's database ID */
      id: string;
      /** The user's roles array for authorization */
      roles?: string[];
    } & DefaultSession["user"];
  }
}