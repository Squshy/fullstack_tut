import { Query, Resolver } from "type-graphql";

@Resolver()
export class HelloResolver {
  // uppercase in graphql
  @Query(() => String)
  hello() {
    return "wudup world"
  }
}