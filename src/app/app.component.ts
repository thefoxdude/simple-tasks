import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Task, Columns } from './objects/task';
import { Observable } from 'rxjs';
import { AuthenticationService } from './services/AuthenticationService.service';


@Component({
   selector: 'app-root',
   templateUrl: './app.component.html',
   styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
   title = 'simple-task';
   tasks: Task[];
   collection: AngularFirestoreCollection<Task>;
   objects$: Observable<Task[]>;
   email: string;
   password: string;
   userId: string;
   newTask: Task;
   columns = Columns;
   todayTasks: Task[];
   tomorrowTasks: Task[];
   thisWeekTasks: Task[];

   constructor(private db: AngularFirestore, private authenticationService: AuthenticationService) {
      this.newTask = new Task();
      if (this.authenticationService.isLoggedIn()) {
         let user = JSON.parse(localStorage.getItem('user'));
         console.log(user);
         this.userId = user.uid;
         this.getTasks();
      } else {
         this.userId = null;
      }
      // this.authenticationService.SignIn(this.email, this.password).then(userId => {
      //    this.userId = <string> userId;
      //    this.getTasks();
      // }, error => {
      //    console.log("We didn't make it: ", error);
      // });
   }

   ngAfterViewInit() {
      if (this.userId == null) {
         (<HTMLElement> document.getElementById("loginModal")).style.display = 'block';
      }
   }

   signUp() {
      this.authenticationService.SignUp(this.email, this.password).then(userId => {
         this.userId = <string> userId;
         this.getTasks();
      }, error => {
         console.log("We didn't make it: ", error);
      });
   }
      
   signIn() {
      this.authenticationService.SignIn(this.email, this.password).then(userId => {
         this.userId = <string> userId;
         this.getTasks();
      }, error => {
         console.log("We didn't make it: ", error);
      });
   }
      
   signOut() {
      this.authenticationService.SignOut();
   }

   getTasks() {
      this.collection = this.db.collection("tasks", tasks => tasks.where('userID', '==', this.userId));
      this.objects$ = this.collection.valueChanges();
      let today = new Date();
      this.objects$.subscribe(tasks => {
         this.tasks = tasks;
         for (let task of this.tasks) {
            let taskDate = task.createdDate.toDate();
            let diff = today.valueOf() - taskDate.valueOf();
            console.log(today);
            console.log(taskDate);
            let diffDays = Math.floor(diff / (1000 * 3600 * 24)); 
            console.log(diffDays);
            if (diffDays > 0) {
               if (task.column == "Tomorrow") {
                  task.createdDate = today;
                  task.column = "Today";
               } else if (task.column == "Today") {
                  console.log('Here: ' + task.taskName);
                  task.bgColor = 'yellow';
                  task.color = 'black';
                  if (diffDays > 1) {
                     task.bgColor = 'red';
                     task.color = 'white';
                  }
               } else if (task.column = "This Week") {

               }
            }
         }
         this.tomorrowTasks = tasks.filter(x => x.column == Columns.Tomorrow);
         this.todayTasks = tasks.filter(x => x.column == Columns.Today);
         this.thisWeekTasks = tasks.filter(x => x.column == Columns.ThisWeek);
      });
   }

   selectTask(taskId: string) {
      this.newTask = this.tasks.find(x => x.id == taskId);
      this.openModal('taskModal');
   }

   createNewTask() {
      this.newTask.createdDate = new Date();
      this.newTask.userId = this.userId;
      this.tasks.push(this.newTask);
      this.newTask = new Task();
      this.closeModal('taskModal');
   }

   async saveToDatabase() {
      console.log(this.newTask);
      if (this.userId) {
         this.newTask.createdDate = new Date();
         this.newTask.userId = this.userId;
         
         let result = await this.db.collection('tasks').add({
            taskName: this.newTask.taskName,
            createdDate: this.newTask.createdDate,
            details: this.newTask.details,
            userID: this.newTask.userId,
            completed: this.newTask.completed,
            column: this.newTask.column
         });
         console.log('Added document with ID: ', result.id);
         this.newTask = new Task();
         this.closeModal('taskModal');
      } else {
         console.log('You are not logged in');
      }
      
   }

   stopBubble(event: Event) {
      event.stopPropagation();
   }

   openModal(modalName: string) {
      (<HTMLElement> document.getElementById(modalName)).style.display = 'block';
   }

   closeModal(modalName: string) {
      this.newTask = new Task();
      (<HTMLElement> document.getElementById(modalName)).style.display = 'none';
   }
}
