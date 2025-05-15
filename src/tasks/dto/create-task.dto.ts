import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  readonly title: string;

  @IsNotEmpty()
  @IsUUID()
  readonly userId: string;
}
