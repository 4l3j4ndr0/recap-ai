import { defineStore } from "pinia";
//@ts-ignore ;
import { LocalStorage } from "quasar";
import { signOut, fetchAuthSession, getCurrentUser } from "@aws-amplify/auth";
export const useUserStore = defineStore("user", {
  state: () => ({
    user: null as any,
    token: null as any,
    email: "" as string,
    userId: "" as string,
  }),
  actions: {
    async currentSession() {
      try {
        let token: any = (await fetchAuthSession()).tokens ?? {};

        if (token && token.idToken) {
          LocalStorage.set("token", {
            id_token: token.idToken.toString(),
          });
          this.setToken({
            id_token: token.idToken.toString(),
          });

          const { userId, signInDetails } = await getCurrentUser();
          this.email = signInDetails?.loginId || "";
          this.userId = userId;
        }

        return token;
      } catch (err: any) {
        console.log(err);
      }
    },
    async logOut() {
      try {
        await signOut({ global: true });
        LocalStorage.clear();
        return true;
      } catch (error) {
        console.log("error signing out: ", error);
        return error;
      }
    },
    setToken(token: any) {
      this.token = token;
    },
  },
});
