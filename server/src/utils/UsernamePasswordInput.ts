import {
  Field,
  InputType
} from "type-graphql";

// Object types we return, input types we use for arguments

@InputType()
export class UsernamePasswordInput {
  @Field()
  username: string;

  @Field()
  password: string;

  @Field()
  email: string;
}
