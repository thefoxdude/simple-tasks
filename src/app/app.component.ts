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
      
      this.objects$.subscribe(tasks => {
         this.tasks = tasks;
         this.updateTasks();
         this.tomorrowTasks = tasks.filter(x => x.column == Columns.Tomorrow);
         this.todayTasks = tasks.filter(x => x.column == Columns.Today);
         this.thisWeekTasks = tasks.filter(x => x.column == Columns.ThisWeek);
      });
   }

   updateTasks() {
      let today = new Date();
      for (let task of this.tasks) {
         let taskDate = task.createdDate.toDate();
         let diff = today.valueOf() - taskDate.valueOf();
         let diffDays = Math.floor(diff / (1000 * 3600 * 24)); 
         console.log(diffDays);
         console.log(task.taskName + ' ' + task.column);
         if (diffDays > 0) {
            if (task.column == "Tomorrow") {
               task.createdDate = today;
               task.column = "Today";
            } else if (task.column == "Today") {
               console.log('Here: ' + task.taskName);
               task.bgColor = '#FFDC7C';
               task.color = 'black';
               if (diffDays > 1) {
                  task.bgColor = '#DA674A';
                  task.color = 'white';
               }
            } else if (task.column = "This Week") {

            }
         }
      }
   }

   selectTask(taskId: string) {
      this.newTask = this.tasks.find(x => x.id == taskId);
      this.openModal('taskModal', '');
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

   onSwipe(event: Event) {
      const x = Math.abs(event.deltaX) > 40 ? (event.deltaX > 0 ? "Right" : "Left") : ""; 
      const y = Math.abs(event.deltaY) > 40 ? (event.deltaY > 0 ? "Down" : "Up") : ""; 
      this.direction += `You swiped in <b> ${x} ${y} </b> direction <hr>`;
   }

   openModal(modalName: string, column: string) {
      if (modalName == "taskModal" && this.newTask.id == null) {
         this.newTask.column = column;
      }
      (<HTMLElement> document.getElementById(modalName)).style.display = 'block';
      
   }

   closeModal(modalName: string) {
      this.newTask = new Task();
      (<HTMLElement> document.getElementById(modalName)).style.display = 'none';
   }
}
