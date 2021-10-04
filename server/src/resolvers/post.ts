import { Post } from "../entities/Post";
import { Arg, Int, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  async posts(): Promise<Post[]> {
    return Post.find();
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int) _id: number): Promise<Post | undefined> {
    return Post.findOne(_id);
  }

  @Mutation(() => Post)
  async createPost(@Arg("title") title: string): Promise<Post> {
    return Post.create({ title }).save();
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") _id: number,
    @Arg("title", () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOne(_id);
    if (!post) {
      return null;
    }
    if (typeof title !== "undefined") {
      post.title = title;
      Post.update({ _id }, { title });
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg("id") _id: number): Promise<boolean> {
    await Post.delete(_id);
    return true;
  }
}
