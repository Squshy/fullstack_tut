import { User } from "../entities/User";
import { MyContext } from "../types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import argon2 from "argon2";
import { EntityManager } from "@mikro-orm/postgresql";

// Object types we return, input types we use for arguments

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;

  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { em, req }: MyContext): Promise<User | null> {
    // you are not logged in
    if (!req.session.userId) {
      return null;
    }
    const user = await em.findOne(User, { _id: req.session.userId });
    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "length must be greater than 2",
          },
        ],
      };
    }
    if (options.password.length <= 4) {
      return {
        errors: [
          {
            field: "password",
            message: "length must be greater than 4",
          },
        ],
      };
    }

    const hashedPass = await argon2.hash(options.password);
    let user;
    try {
      console.log("TRYING");
      const result = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          username: options.username,
          password: hashedPass,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning("*"); // return all fields
      user = result[0];
      console.log("user:", user);
      // await em.persistAndFlush(user);
    } catch (err) {
      if (err.code === "23505") {
        // duplicate username
        return {
          errors: [
            {
              field: "username",
              message: "username already exists",
            },
          ],
        };
      }
      console.error("message:", err);
    }
    console.log("DONE TRYING");

    req.session.userId = user._id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username });
    if (!user) {
      return {
        errors: [{ field: "username", message: "username does not exist" }],
      };
    }

    const valid = await argon2.verify(user.password, options.password);

    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrect password",
          },
        ],
      };
    }

    req.session.userId = user._id;

    return { user };
  }
}
