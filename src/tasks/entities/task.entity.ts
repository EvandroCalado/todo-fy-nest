export class TaskEntity {
  // @PrimaryGeneratedColumn('uuid')
  id: number;

  // @Column()
  title: string;

  // @Column({ default: false })
  isCompleted: boolean;

  // @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' })
  // user: User;

  // @CreateDateColumn()
  createdAt: Date;

  // @UpdateDateColumn()
  updatedAt: Date;
}
