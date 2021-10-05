import { Post } from "../entities/Post";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";
import { getConnection } from "typeorm";
import { Updoot } from "../entities/Updoot";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    let message = root.text.slice(0, 50);
    if (root.text.length > 50) return message + "...";
    return message;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const isUpdoot = value !== -1;
    const realValue = isUpdoot ? 1 : -1;
    const { userId } = req.session;

    // await Updoot.insert({
    //   userId,
    //   postId,
    //   value: realValue,
    // });

    // if one fails they both fail
    getConnection().query(
      `
    START TRANSACTION;

    insert into updoot ("userId", "postId", value)
    values (${userId}, ${postId}, ${realValue});

    update post 
    set points = points + ${realValue}
    where _id = ${postId};

    COMMIT;
    `
    );

    return true;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string
  ): Promise<PaginatedPosts> {
    // cap at 50 if they try to give us more than 50
    const realLimit = Math.min(50, limit);
    const hasMoreLimit = realLimit + 1;

    const replacements: any[] = [hasMoreLimit];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const posts = await getConnection().query(
      `
      select p.*, 
      json_build_object(
        '_id', u._id,
        'username', u.username,
        'email', u.email
      ) creator      
      from post p
      inner join "user" u on u._id = p."creatorId"
      ${cursor ? `where p."createdAt" < $2` : ""}
      order by p."createdAt" DESC
      limit $1
    `,
      replacements
    );

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === hasMoreLimit,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int) _id: number): Promise<Post | undefined> {
    return Post.findOne(_id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({ ...input, creatorId: req.session.userId }).save();
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
