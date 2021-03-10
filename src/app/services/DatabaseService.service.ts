import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFirestoreCollection } from '@angular/fire/firestore/public_api';
import { Observable } from 'rxjs';
import { Task } from '../objects/task';

@Injectable({
   providedIn: 'root'
})
export class DatabaseService {
   collection: AngularFirestoreCollection<Task>;
   objects$: Observable<Task[]>;
   tasks: Task[];

   constructor(private db: AngularFirestore) { }


   getTasks(userId: string): Observable<Task[]> {
      console.log(userId);
      this.collection = this.db.collection("tasks", tasks => tasks.where('userID', '==', userId));
      this.objects$ = this.collection.valueChanges({idField: 'id'});
      return this.objects$;
   }

   async updateTask(task: Task) {
      console.log('updated');
      // this.db.collection('tasks').doc(task.id).set({
      //    taskName: task.taskName,
      //    details: task.details,
      //    updatedDate: task.updatedDate,
      //    completed: task.completed,
      //    column: task.column
      // }, {merge: true});
   }

   async saveNewTask(task: Task) {
      let result = await this.db.collection('tasks').add({
         taskName: task.taskName,
         createdDate: task.createdDate,
         details: task.details,
         userID: task.userId,
         completed: task.completed,
         column: task.column
      });
      console.log('Added document with ID: ', result.id);
   }
}
