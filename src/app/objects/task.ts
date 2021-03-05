export class Task {
   taskName: string;
   createdDate: Date;
   completed: boolean = false;
   column: string;
   userId: string;
   details: string;
   id: string;
}

export enum Columns {
   Today = "Today",
   Tomorrow = "Tomorrow",
   ThisWeek = "This Week"
}