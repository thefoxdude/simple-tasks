import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFirestoreCollection } from '@angular/fire/firestore/public_api';
import { Observable } from 'rxjs';
import { Task } from '../objects/task';
import { User } from '../objects/user';

@Injectable({
   providedIn: 'root'
})
export class DatabaseService {
   collection: AngularFirestoreCollection<Task>;
   objects$: Observable<Task[]>;
   collectionUsers: AngularFirestoreCollection<User>;
   objectsUsers$: Observable<User[]>;
   tasks: Task[];

   constructor(private db: AngularFirestore) { }


   getTasks(userId: string): Observable<Task[]> {
      console.log(userId);
      this.collection = this.db.collection("tasks", tasks => tasks.where('userID', '==', userId));
      this.objects$ = this.collection.valueChanges({idField: 'id'});
      return this.objects$;
   }

   getUser(userId: string): Observable<User[]> {
      console.log(userId);
      this.collectionUsers = this.db.collection("users", user => user.where('userID', '==', userId));
      this.objectsUsers$ = this.collectionUsers.valueChanges();
      return this.objectsUsers$;
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

   async saveNewUser(userID: string, username: string) {
      let result = await this.db.collection('users').add({
         userID: userID,
         username: username
      });
      console.log('Added user with username: ', result.id);
   }
   
}
