export class Task {
   taskName: string;
   createdDate: any;
   completed: boolean = false;
   column: string;
   userId: string;
   details: string;
   id: string;
   bgColor: string = "white";
   color: string = "black";
   dueDate: any;
   updatedDate: any;
}

export enum Columns {
   Today = "Today",
   Tomorrow = "Tomorrow",
   ThisWeek = "This Week"
}