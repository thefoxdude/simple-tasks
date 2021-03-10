import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Task, Columns } from './objects/task';
import { Observable } from 'rxjs';
import { AuthenticationService } from './services/AuthenticationService.service';
declare var $: any;
import * as clone from 'clone';


@Component({
   selector: 'app-root',
   templateUrl: './app.component.html',
   styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
   title = 'simple-task';
   tasks: Task[];
   collection: AngularFirestoreCollection<Task>;
   objects$: Observable<Task[]>;
   email: string;
   password: string;
   userId: string;
   currentTask: Task;
   columns = Columns;
   todayTasks: Task[];
   totalTodayTasks: Task[];
   tomorrowTasks: Task[];
   totalTomorrowTasks: Task[];
   thisWeekTasks: Task[];
   totalThisWeekTasks: Task[];
   direction = "";
   originalTask: Task;
   xDown = null;
   yDown = null;
   showCompleted: boolean;
   

   constructor(private db: AngularFirestore, private authenticationService: AuthenticationService) {
      this.currentTask = new Task();
      this.showCompleted = false;
      if (this.authenticationService.isLoggedIn()) {
         let user = JSON.parse(localStorage.getItem('user'));
         // console.log(user);
         this.userId = user.uid;
         this.getTasks();
      } else {
         this.userId = null;
      }
   }

   ngOnInit() {
      // $(".draggable-cards").draggable({containment: "parent"});
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
      this.objects$ = this.collection.valueChanges({idField: 'id'});
      
      this.objects$.subscribe(tasks => {
         // console.log(tasks);
         this.tasks = tasks;
         this.updateTasks();
         this.totalTomorrowTasks = tasks.filter(x => x.column == Columns.Tomorrow).sort(a => {return a.completed ? 1 : -1});
         this.tomorrowTasks = this.totalTomorrowTasks.filter(x => !x.completed);
         this.totalTodayTasks = tasks.filter(x => x.column == Columns.Today).sort(a => {return a.completed ? 1 : -1});;
         this.todayTasks = this.totalTodayTasks.filter(x => !x.completed);
         this.totalThisWeekTasks = tasks.filter(x => x.column == Columns.ThisWeek).sort(a => {return a.completed ? 1 : -1});;
         this.thisWeekTasks = this.totalThisWeekTasks.filter(x => !x.completed);
         let cards = <HTMLCollectionOf<HTMLElement>> document.getElementsByClassName('draggable-cards');
         
         for (let i = 0; i < cards.length; i++) {
            // cards[i].draggable({containment: "parent"});
         }
      });
   }

   updateTasks() {
      let today = new Date();
      for (let task of this.tasks) {
         let taskDate = task.createdDate.toDate();
         if (task.updatedDate != null) {
            taskDate = task.updatedDate.toDate();
         }
         let diff = today.valueOf() - taskDate.valueOf();
         let diffDays = Math.floor(diff / (1000 * 3600 * 24)); 
         // console.log(diffDays);
         // console.log(task.taskName + ' ' + task.column);
         if (diffDays > 0) {
            if (task.column == "Tomorrow") {
               task.column = "Today";
               task.updatedDate = today;
               this.updateTask(task);
            } else if (task.column == "Today") {
               // console.log('Here: ' + task.taskName);
               task.bgColor = '#FFDC7C';
               task.color = 'black';
               if (diffDays > 1) {
                  task.bgColor = '#DA674A';
                  task.color = 'white';
               }
            } else if (task.column = "This Week") {
               if (diffDays > 2) {
                  task.bgColor = '#FFDC7C';
                  task.color = 'black';
               }
               if (diffDays > 5) {
                  task.bgColor = '#DA674A';
                  task.color = 'white';
               }
            }
         }
         if (task.completed) {
            task.bgColor = '#39998E';
            task.color = 'white';
         }
      }
   }

   selectTask(taskId: string) {
      console.log(taskId);
      this.currentTask = this.tasks.find(x => x.id == taskId);
      this.originalTask = clone<Task>(this.currentTask);
      console.log(this.currentTask);
      this.openModal('taskModal', '');
   }

   createcurrentTask() {
      this.currentTask.createdDate = new Date();
      this.currentTask.userId = this.userId;
      this.tasks.push(this.currentTask);
      this.currentTask = new Task();
      this.closeModal('taskModal');
   }

   async saveToDatabase() {
      console.log(this.currentTask);
      if (this.userId) {
         if (this.currentTask.id == null) {
            this.currentTask.createdDate = new Date();
            this.currentTask.userId = this.userId;
            
            let result = await this.db.collection('tasks').add({
               taskName: this.currentTask.taskName,
               createdDate: this.currentTask.createdDate,
               details: this.currentTask.details,
               userID: this.currentTask.userId,
               completed: this.currentTask.completed,
               column: this.currentTask.column
            });
            console.log('Added document with ID: ', result.id);
            this.currentTask = new Task();
            this.closeModal('taskModal');
         } else {
            console.log("updated");
            this.updateTask(this.currentTask);
         }
      } else {
         console.log('You are not logged in');
      }
      
   }

   async updateTask(task: Task) {
      let today = new Date();
      this.db.collection('tasks').doc(task.id).set({
         taskName: task.taskName,
         details: task.details,
         updatedDate: task.updatedDate,
         completed: task.completed,
         column: task.column
      }, {merge: true})
   }

   stopBubble(event: Event) {
      event.stopPropagation();
   }

   openModal(modalName: string, column: string) {
      if (modalName == "taskModal" && this.currentTask.id == null) {
         this.currentTask.column = column;
      }
      (<HTMLElement> document.getElementById(modalName)).style.display = 'block';
      
   }

   closeModal(modalName: string) {
      if (modalName == 'taskModal') {

      }
      this.currentTask = new Task();
      (<HTMLElement> document.getElementById(modalName)).style.display = 'none';
   }

   getTouches(evt) {
      return evt.touches ||             // browser API
             evt.originalEvent.touches; // jQuery
   } 

   handleTouchStart(evt) {
      const firstTouch = this.getTouches(evt)[0];
      this.xDown = firstTouch.clientX;
      this.yDown = firstTouch.clientY;
      this.stopBubble(evt);
   };
  
   handleTouchMove(evt: any, task: Task) {
      if (task.id != null) {
         this.stopBubble(evt);
  
         let xUp = evt.touches[0].clientX;
         let yUp = evt.touches[0].clientY;
   
         let xDiff = this.xDown - xUp;
         let yDiff = this.yDown - yUp;
         console.log(xDiff);
         if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
            if ( xDiff < 0 && !task.completed) {
               /* right swipe */
               evt.target.parentNode.style.right = xDiff + 'px';
               if (xDiff < -50) {
                  evt.target.parentNode.previousSibling.style.display = 'block';
                  evt.target.parentNode.previousSibling.style.opacity = -.01 * xDiff;
               }
               if (xDiff < -100) {
                  if (!evt.target.parentNode.classList.contains('fox-green')) {
                     evt.target.parentNode.className += ' fox-green';
                     task.completed = true;
                     console.log(task);
                  }
               }
            } else {
               console.log("left swipe");
            }
         }
      }
   };

   handleTouchEnd(evt: any, task: Task) {
      if (task.id != null) {
         console.log("ended");
         evt.target.parentNode.style.right = '0px';
         if (!task.completed) {
            evt.target.parentNode.previousSibling.style.display = 'none';
         } else if (task.completed) {
            task.bgColor = '#39998E';
            task.color = 'white';
            this.updateTask(task);
         }
         this.xDown = null;
         this.yDown = null;
      }
   }

   uncompleteTask(task: Task, targetCheck: any) {
      task.completed = false;
      task.bgColor = '#e4e1d8';
      task.color = 'black';
      targetCheck.parentNode.style.display = 'none';
      targetCheck.parentNode.nextSibling.classList = 'w3-container draggable-card w3-rest';
   }

   changeShow() {
      console.log(this.showCompleted);
      if (!this.showCompleted) {
         this.todayTasks = this.totalTodayTasks;
         this.tomorrowTasks = this.totalTomorrowTasks;
         this.thisWeekTasks = this.totalThisWeekTasks;
      } else {
         this.tomorrowTasks = this.totalTomorrowTasks.filter(x => !x.completed);
         this.todayTasks = this.totalTodayTasks.filter(x => !x.completed);
         this.thisWeekTasks = this.totalThisWeekTasks.filter(x => !x.completed);
      }
   }
}
