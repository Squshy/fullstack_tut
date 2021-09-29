import { withUrqlClient } from "next-urql";
import { NavBar } from "../components/NavBar";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  const [{ data }] = usePostsQuery();

  return (
    <>
      <NavBar></NavBar>
      <div>Wuddup</div>
      <br />
      {data && data.posts.map((p) => <div key={p._id}>{p.title}</div>)}
    </>
  );
};
export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
