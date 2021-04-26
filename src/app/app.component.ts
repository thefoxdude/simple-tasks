import { Component, AfterViewInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Task, Columns } from './objects/task';
import { Observable } from 'rxjs';
import { AuthenticationService } from './services/AuthenticationService.service';
import * as clone from 'clone';
import { DatabaseService } from './services/DatabaseService.service';
import { PwaService } from './services/PwaService';



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
   username: string;
   signingUp: boolean;
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
   touchStartCompleted: boolean;
   buildNo: number;
   item: any;
   timerID: any;
   counter: any;
   errorMessages: string[];

   pressHoldEvent: any;
   pressHoldDuration: any;
   
   

   constructor(private db: AngularFirestore, 
               private authenticationService: AuthenticationService,
               private dbService: DatabaseService,) {
      this.currentTask = new Task();
      this.showCompleted = true;
      this.signingUp = false;
      if (this.authenticationService.isLoggedIn()) {
         let user = JSON.parse(localStorage.getItem('user'));
         // console.log(user);
         this.userId = user.uid;
         this.getUsername(this.userId);
         this.username = user.username;
         this.getTasks();
      } else {
         this.userId = null;
      }
      this.buildNo = 6;
      this.errorMessages = [];
   }

   ngAfterViewInit() {
      if (this.userId == null) {
         (<HTMLElement> document.getElementById("loginModal")).style.display = 'block';
      }
      this.item = document.querySelector("#item");
      this.counter = 0;

      this.pressHoldEvent = new CustomEvent("pressHold");

    // Increase or decreae value to adjust how long
    // one should keep pressing down before the pressHold
    // event fires
      this.pressHoldDuration = 50;
      // this.item.addEventListener("mousedown", this.pressingDown, false);
      // this.item.addEventListener("mouseup", this.notPressingDown, false);
      // this.item.addEventListener("mouseleave", this.notPressingDown, false);

      // this.item.addEventListener("touchstart", this.pressingDown, false);
      // this.item.addEventListener("touchend", this.notPressingDown, false);

      // // Listening for our custom pressHold event
      // this.item.addEventListener("pressHold", this.doSomething, false);
   }

   getUsername(userId: string) {
      this.dbService.getUser(userId).subscribe(username => {
         console.log("Username object: " + username);
         if (username.length > 0) {
            this.username = username[0].username;
         }
      });
   }

   signUp() {
      this.authenticationService.SignUp(this.email, this.password, this.username).then(userId => {
         this.userId = <string> userId;
         this.getUsername(this.userId);
         this.getTasks();
      }, error => {
         console.log("We didn't make it: ", error);
      });
   }
      
   signIn() {
      this.authenticationService.SignIn(this.email, this.password).then(userId => {
         this.userId = <string> userId;
         this.getUsername(this.userId);
         this.getTasks();
      }, error => {
         this.showError(error);
         console.log("We didn't make it: ", error);
      });
   }

   showError(error: Error) {
      let email = <HTMLInputElement> document.getElementById('email');
      let password = <HTMLInputElement> document.getElementById('password');
      if (this.email == null || this.password == null) {
         this.flashItem(email);
         this.errorMessages.push('Email is required\n');
         if (this.password == null) {
            this.flashItem(password);
            this.errorMessages.push('Password is required\n');
         }
      } else {
         if (error.toString().includes('email')) {
            this.flashItem(email);
            this.errorMessages.push('Email is incorrect\n');
         } else if (error.toString().includes('password')) {
            this.flashItem(password);
            this.errorMessages.push('Password is incorrect\n');
         }
      }
   }
      
   signOut() {
      this.authenticationService.SignOut();
   }

   showSignUp() {
      this.signingUp = !this.signingUp;
   }

   getTasks() {
      this.objects$ = this.dbService.getTasks(this.userId);
      this.objects$.subscribe(tasks => {
         // console.log(tasks);
         this.tasks = tasks;
         this.updateTasks();
         console.log(this.tasks);
         this.totalTomorrowTasks = this.tasks.filter(x => x.column == Columns.Tomorrow);
         this.totalTodayTasks = this.tasks.filter(x => x.column == Columns.Today).sort(a => {return a.createdDate ? -1 : 1});
         this.totalThisWeekTasks = this.tasks.filter(x => x.column == Columns.ThisWeek).sort(a => {return a.createdDate ? -1 : 1});
         if (!this.showCompleted) {
            this.tomorrowTasks = this.totalTomorrowTasks.filter(x => !x.completed);
            this.todayTasks = this.totalTodayTasks.filter(x => !x.completed);
            this.thisWeekTasks = this.totalThisWeekTasks.filter(x => !x.completed);
         } else {
            this.tomorrowTasks = this.totalTomorrowTasks;
            this.todayTasks = this.totalTodayTasks;
            this.thisWeekTasks = this.totalThisWeekTasks;
         }
         this.tomorrowTasks = this.tomorrowTasks.sort(a => {return a.createdDate ? -1 : 1});
         this.todayTasks = this.todayTasks.sort(a => {return a.createdDate ? -1 : 1});
         this.thisWeekTasks = this.thisWeekTasks.sort(a => {return a.createdDate ? -1 : 1});
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
      if (!this.currentTask.selected) {
         this.originalTask = clone<Task>(this.currentTask);
         console.log(this.currentTask);
         this.openModal('taskModal', '');
      }
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
            this.dbService.saveNewTask(this.currentTask);
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
      console.log('updated');
      task.updatedDate = new Date();
      this.db.collection('tasks').doc(task.id).set({
         taskName: task.taskName,
         details: task.details,
         updatedDate: task.updatedDate,
         completed: task.completed,
         column: task.column
      }, {merge: true});
      this.closeModal('taskModal');
   }

   async deleteTask(task: Task) {
      this.db.collection('tasks').doc(task.id).delete();
      console.log("deleted");
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
      this.currentTask = new Task();
      (<HTMLElement> document.getElementById(modalName)).style.display = 'none';
   }

   getTouches(evt) {
      return evt.touches ||             // browser API
             evt.originalEvent.touches; // jQuery
   } 

   handleTouchStart(evt: any, task: Task) {
      const firstTouch = this.getTouches(evt)[0];
      this.xDown = firstTouch.clientX;
      this.yDown = firstTouch.clientY;
      this.touchStartCompleted =  task.completed;
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
            if ( xDiff < 0) {
               /* right swipe */
               evt.target.parentNode.style.right = xDiff + 'px';
               if (xDiff < -50) {
                  if (!task.completed && !evt.target.parentNode.previousSibling.firstChild.classList.contains('fox-check') && !this.touchStartCompleted) {
                     evt.target.parentNode.previousSibling.firstChild.classList = 'fa fa-check w3-left fox-check';
                  } else if (task.completed && !evt.target.parentNode.previousSibling.firstChild.classList.contains('fox-delete') && this.touchStartCompleted) {
                     evt.target.parentNode.previousSibling.firstChild.classList = 'fa fa-times-circle w3-left fox-delete';
                  }
                  evt.target.parentNode.previousSibling.style.display = 'block';
                  evt.target.parentNode.previousSibling.style.opacity = -.01 * xDiff;
               }
               if (xDiff < -100) {
                  if (!evt.target.parentNode.classList.contains('fox-green') && !this.touchStartCompleted) {
                     this.completeTask(task, evt, true);
                  }
               }
               if (xDiff < - 150) {
                  if (!evt.target.parentNode.classList.contains('fox-delete') && this.touchStartCompleted) {
                     evt.target.parentNode.classList = 'w3-container draggable-card w3-rest fox-red';
                     task.toDelete = true;
                  }
               }
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
         } else if (task.completed && !this.touchStartCompleted) {
            task.bgColor = '#39998E';
            task.color = 'white';
            this.updateTask(task);
         } else if (task.completed && this.touchStartCompleted && task.toDelete) {
            task.bgColor = '#b9300e';
            task.color = 'white';
            evt.target.parentNode.previousSibling.style.display = 'none';
            evt.target.parentNode.parentNode.classList += ' hidden';
            this.timeout(1500).then(() => {
               this.deleteTask(task);
            });
         } else if (task.completed && this.touchStartCompleted) {
            evt.target.parentNode.previousSibling.firstChild.classList = 'fa fa-check w3-left fox-check';
         }
         this.xDown = null;
         this.yDown = null;
      }
   }

   timeout(ms: number): Promise<unknown> { //pass a time in milliseconds to this function
      return new Promise(resolve => setTimeout(resolve, ms));
   }

   clickCheck(task: Task, evt: any) {
      if (!task.completed) {
         this.completeTask(task, evt, false);
      } else {
         this.uncompleteTask(task, evt.target);
      }
   }

   completeTask(task: Task, evt: any, mobile: boolean) {
      task.completed = true;
      if (mobile) {
         evt.target.parentNode.className += ' fox-green';
      } else {
         evt.target.parentNode.parentNode.className += ' fox-green';
         this.updateTask(task);
      }
   }

   clickDelete(task: Task, evt: any) {
      task.bgColor = '#b9300e';
      task.color = 'white';
      // evt.target.parentNode.previousSibling.style.display = 'none';
      evt.target.parentNode.parentNode.classList += ' hidden';
      this.timeout(1500).then(() => {
         this.deleteTask(task);
      });
   }

   uncompleteTask(task: Task, targetCheck: any) {
      task.completed = false;
      task.bgColor = '#e4e1d8';
      task.color = 'black';
      task.updatedDate = new Date();
      this.updateTask(task);
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

   logout() {
      console.log("logout");
      this.authenticationService.SignOut();
      this.tasks = [];
      this.userId = null;
   }

   pressingDown(e, task: Task) {
      // Start the timer
      this.startTimer(e, task);
      e.preventDefault();

      console.log("Pressing!");
   }

   notPressingDown(e) {
      // Stop the timer
      cancelAnimationFrame(this.timerID);
      this.counter = 0;

      console.log("Not pressing!");
    }

    //
    // Runs at 60fps when you are pressing down
    //
   startTimer(e, task: Task) {
      console.log("Timer tick!");

      const handler = () => {
         if (this.counter < this.pressHoldDuration) {
            this.timerID = window.requestAnimationFrame(handler);
            this.counter++;
            console.log("inside loop");
         } else {
            console.log("Press threshold reached!");
            e.target.parentNode.parentNode.classList += ' wiggle';
            task.selected = true;
            this.item.dispatchEvent(this.pressHoldEvent);
         }
      }
      window.requestAnimationFrame(handler);
   }

   doSomething(e) {
      console.log("pressHold event fired!");
   }

   async flashItem(item: HTMLInputElement) {
      item.className = 'w3-input w3-border w3-margin-bottom';
      setTimeout(function() {
         item.className += ' fox-flash-red';
      }, 1);
      await this.delay(2000);
      this.errorMessages = [];
   }

   // installPwa(): void {
   //    Pwa.promptEvent.prompt();
   // }

   async delay(ms: number) {
      return new Promise( resolve => setTimeout(resolve, ms) );
  }

  showHelp() {
     console.log("here");
     this.openModal('helpModal', '');
  }
}
