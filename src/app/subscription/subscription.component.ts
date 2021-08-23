import { Component, OnInit } from '@angular/core';


interface Monthly {
  id: string;
  name: string;
  children?: Monthly[]
}

interface Annual {
  id: string;
  name: string;
  children?: Annual[]
}

@Component({
    selector: 'app-subscription',
    templateUrl: './subscription.component.html',
    styleUrls: ['./subscription.component.sass']
})
export class SubscriptionComponent implements OnInit {

  // TREE_DATA: Monthly[] = [
  //     {
  //         name: 'Pro1',
  //         id: 'Pro1'
  //     },
  //     {
  //         name: 'Pro2',
  //         id: 'Pro2'
  //     },
  //     {
  //         name: 'Pro3',
  //         id: 'Pro3'
  //     },
  //     {
  //         name: 'Pro4',
  //         id: 'Pro4'
  //     },

  // ]

  constructor() { }

  ngOnInit(): void {
  }

}
