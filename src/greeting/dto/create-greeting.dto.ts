import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateGreetingDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  message!: string;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}
