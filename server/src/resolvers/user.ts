import { User } from "../entities/User";
import { MyContext } from "../types";
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import argon2 from "argon2";
import { EntityManager } from "@mikro-orm/postgresql";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "../utils/UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";
import { validatePassword } from "../utils/validatePassword";
import { getConnection } from "typeorm";

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
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("password") password: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    const validPass = validatePassword(password);
    if (validPass) return { errors: validPass };

    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId)
      return {
        errors: [
          {
            field: "token",
            message: "token expired",
          },
        ],
      };

    const userIdNum = parseInt(userId);
    const user = await User.findOne(userIdNum);

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exists",
          },
        ],
      };
    }

    await User.update(
      { _id: userIdNum },
      { password: await argon2.hash(password) }
    );

    redis.del(key);

    // login user after change password
    req.session.userId = user._id;

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      // email not in DB
      return true;
    }

    const token = v4();

    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user._id,
      "ex",
      1000 * 60 * 60 * 24 * 3
    ); // 3 days

    sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}">Reset Password</a>`
    );

    return true;
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    // you are not logged in
    if (!req.session.userId) {
      return null;
    }
    return User.findOne(req.session.userId);
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }

    const hashedPass = await argon2.hash(options.password);
    let user;
    try {
      console.log("TRYING");

      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: options.username,
          password: hashedPass,
          email: options.email,
        })
        .returning("*")
        .execute();
      user = result.raw;
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
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOrEmail.includes("@")
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
    );
    if (!user) {
      return {
        errors: [
          { field: "usernameOrEmail", message: "username does not exist" },
        ],
      };
    }

    const valid = await argon2.verify(user.password, password);

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

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        res.clearCookie(COOKIE_NAME);
        resolve(true);
      })
    );
  }
}
