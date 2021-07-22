import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';


interface AccountSetting {
  id: string;
  name: string;
  children?: AccountSetting[];
}

interface ExampleFlatNode {
  expandable: boolean;
  id: string;
  name: string;
  level: number;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.sass']
})
export class SettingsComponent implements OnInit {

  private _transformer = (node: AccountSetting, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      id: node.id,
      name: node.name,
      level: level,
    };
  }

  mode: string = 'osef'

  treeControl = new FlatTreeControl<ExampleFlatNode>(
      node => node.level, node => node.expandable);

  treeFlattener = new MatTreeFlattener(
      this._transformer, node => node.level, node => node.expandable, node => node.children);

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  TREE_DATA: AccountSetting[] = [
    {
      name: 'Compte', 
      id: 'account',
      children: [
        {id: 'profil', name: 'Profil'},
        {id: 'preferences', name: 'Préférence'},
        {id: 'security', name: 'Supprimer le compte'},
      ]
    }, {
      name: 'Abonnement',
      id: 'abonnement',
      children: [
        {id: 'accounttype', name: 'Type de compte'}, 
        {id: 'money', name: 'Solde du compte'},
        {id: 'history', name: 'Historique des achats'},
      ]
    },{
      name: 'Sécurité',
      id: 'security',
      children: [
        {id: 'editpwd', name: 'Changer le mot de passe'},
        {id: 'editmail', name: "Changer l'adresse mail"},
        {id: '2fa', name: 'Authentification à deux facteurs'},
      ]
    },
  ];

  constructor() {
    this.dataSource.data = this.TREE_DATA;
  }

  ngOnInit(): void {
  }

}

