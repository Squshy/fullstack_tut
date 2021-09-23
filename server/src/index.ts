import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import mikroConfig from "./mikro-orm.config";

const main = async () => {
  const orm = await MikroORM.init(mikroConfig);
  // run mgirations before anything else
  await orm.getMigrator().up();
  // this does nothing with the DB atm
  // const post = orm.em.create(Post, {title: 'My first post :)'})
  // await orm.em.persistAndFlush(post);

  // get all posts
  const posts = await orm.em.find(Post, {});
  console.log(posts)
};

main();