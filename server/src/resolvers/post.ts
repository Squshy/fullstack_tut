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
import { User } from "../entities/User";

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

  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(post.creator_id);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() { updootLoader, req }: MyContext
  ) {
    const userId = req.session.userId;
    if (!userId) return null;
    const updoot = await updootLoader.load({
      postId: post._id,
      userId: userId,
    });
    return updoot ? updoot.value : null;
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
    const updoot = await Updoot.findOne({ where: { postId, userId } });

    // user has voted on the post previosuly
    // and they chaning vote
    if (updoot && updoot.value !== realValue) {
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
            update updoot
            set value = $1
            where "postId" = $2 and "userId" = $3
        `,
          [realValue, postId, userId]
        );

        await tm.query(
          `
            update post 
            set points = points + $1
            where _id = $2
        `,
          [realValue * 2, postId]
        );
      });
    } else if (!updoot) {
      // has not voted
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
            insert into updoot ("userId", "postId", value)
            values ($1, $2, $3)
        `,
          [userId, postId, realValue]
        );

        await tm.query(
          `
            update post 
            set points = points + $1
            where _id = $2
        `,
          [realValue, postId]
        );
      });
    }
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
      select p.*
      from post p
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
  post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({ ...input, creator_id: req.session.userId }).save();
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("id", () => Int) _id: number,
    @Arg("title", { nullable: true }) title: string,
    @Arg("text", { nullable: true }) text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const post = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('_id = :_id and "creator_id" = :creator_id', {
        _id,
        creator_id: req.session.userId,
      })
      .returning("*")
      .execute();

    return post.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    // NON CASCADING
    // const post = await Post.findOne(id);
    // if (!post) return false;
    // if (post.creator_id !== req.session.userId) {
    //   throw new Error("not authorized");
    // }

    // await Updoot.delete({ postId: id });
    // await Post.delete({ _id: id, creator_id: req.session.userId });

    await Post.delete({ _id: id, creator_id: req.session.userId });
    return true;
  }
}
