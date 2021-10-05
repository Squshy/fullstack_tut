import { useRouter } from "next/router";
import { useEffect } from "react";
import { useMeQuery } from "../generated/graphql";

export const useIsAuth = () => {
  const [{ data, fetching }] = useMeQuery();
  const router = useRouter();
  useEffect(() => {
    // if we are not loading and we do not have a user
    // send to login page
    if (!fetching && !data?.me) {
      // where to go after u login
      router.replace("/login?next=" + router.pathname);
    }
  }, [fetching, data, router]);
};
