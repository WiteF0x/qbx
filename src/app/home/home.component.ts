import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';

import { User } from '@app/_models';
import { UserService, AuthenticationService } from '@app/_services';

class Task {
    title: string;
    is_canceled: boolean = false;
    displayable: boolean = true;
  
    constructor(title: string, private component) {
      this.title = title;
    }
  
    get display_title() {
      let filter_by = this.component.filter_by;
      var highlighted_title = this.title;
  
      if (filter_by !== "") {
        let title = this.title;
        let title_lower = title.toLowerCase();
        if (title_lower.includes(filter_by)) {
          let filter_len = filter_by.length;
          let title_len = title.length;
  
          let start_idx = title_lower.indexOf(filter_by);
          let end_idx = start_idx + filter_len;
  
          let start = title.substr(0, start_idx);
          let middle = title.substr(start_idx, filter_len);
          let end = title.substr(end_idx, title_len);
          highlighted_title = start + "<b>" + middle + "</b>" + end;
        }
      }
  
      if (this.is_canceled) {
        highlighted_title = "<s>" + highlighted_title + "</s>"
      }
  
      return highlighted_title;
    }
  
    swapCancel() {
      if (this.is_canceled) {
        this.is_canceled = false;
      } else {
        this.is_canceled = true;
      }
    }
  
    setDisplay() {
      // handles the logic whether the task should be displayed or not.
      let filter_by = this.component.filter_by;
      if (filter_by !== "") {
        let title = this.title;
        let title_lower = title.toLowerCase();
        if (title_lower.includes(filter_by)) {
          this.displayable = true;
        } else {
          this.displayable = false;
        }
      } else {
        this.displayable = true;
      }
    }
  }


@Component({ templateUrl: 'home.component.html' })
export class HomeComponent implements OnInit, OnDestroy {
    currentUser: User;
    currentUserSubscription: Subscription;
    users: User[] = [];

    tasks: Array<Task> = [
        new Task("Made test task for CubeX", this),
        new Task("Send it", this),
        new Task("Come to them in Mon", this),
      ];
      filter_by: string = "";

  clearToDo() {
    let do_delete = confirm("Are you sure to delete all tasks?");
    if (do_delete) {
      this.tasks.splice(0);
    }
  }

  addTask(input) {
    let value = input.value;
    input.value = "";
    this.tasks.push(
      new Task(value, this)
    );
  }

  cancelTask(idx: number) {
    this.tasks[idx].swapCancel();
  }

  deleteTask(idx: number) {
    let do_delete = confirm("Are you sure to delete the task?");
    if (do_delete) {
      this.tasks.splice(idx, 1);
    }
  }

  editTask(idx: number) {
    let title = this.tasks[idx].title;
    let result = prompt("Edit Task Title", title);
    if (result !== null && result !== "") {
      this.tasks[idx].title = result;
      this.setTaskDisplays();
    }
  }

  private setTaskDisplays() {
    for (let task of this.tasks) {
      task.setDisplay();
    }
  }

  addFilter(filter_input) {
    let filter_by: string = filter_input.value;
    filter_by = filter_by.toLowerCase();
    this.filter_by = filter_by;
    this.setTaskDisplays();
  }

  clearFilter(filterInput) {
    filterInput.value = "";
    this.filter_by = "";
    this.setTaskDisplays();
  }



    constructor(
        private authenticationService: AuthenticationService,
        private userService: UserService
    ) {
        this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
            this.currentUser = user;
        });
    }

    ngOnInit() {
        this.loadAllUsers();
    }

    ngOnDestroy() {
        // unsubscribe to ensure no memory leaks
        this.currentUserSubscription.unsubscribe();
    }

    deleteUser(id: number) {
        this.userService.delete(id).pipe(first()).subscribe(() => {
            this.loadAllUsers()
        });
    }

    private loadAllUsers() {
        this.userService.getAll().pipe(first()).subscribe(users => {
            this.users = users;
        });
    }
}